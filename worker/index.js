import md5 from 'blueimp-md5';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        return await handleSubscribe(request, env, url);
      } catch (err) {
        // Last-resort catch: without this, any unexpected failure here (a
        // missing secret, a Mailchimp outage, a bad request body) surfaces to
        // the visitor as Cloudflare's generic "Worker threw exception" page
        // instead of something diagnosable. console.error goes to this
        // Worker's Logs tab in the Cloudflare dashboard (or `wrangler tail`).
        console.error('subscribe handler failed:', err);
        return redirectWithError(url, 'mailchimp-error');
      }
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleSubscribe(request, env, url) {
  // Fails loudly (in the log, not to the visitor) if the secret isn't set on
  // *this* Worker — e.g. set via the dashboard on a differently-named project
  // than the one actually serving traffic.
  if (!env.MAILCHIMP_API_KEY) {
    console.error('MAILCHIMP_API_KEY is not set on this Worker.');
    return redirectWithError(url, 'mailchimp-error');
  }

  const form = await request.formData();
  const field = (name) => (form.get(name) || '').toString().trim();

  const email = field('EMAIL');
  const firstName = field('FNAME');
  const lastName = field('LNAME');
  const addr1 = field('ADDR1');
  const addr2 = field('ADDR2');
  const city = field('CITY');
  const state = field('STATE');
  const zip = field('ZIP');
  const phone = field('PHONE');

  // Matches the merge fields actually defined on this Mailchimp audience
  // (ADDRESS, FNAME, LNAME required; PHONE optional) — see /3.0/lists/{id}/merge-fields.
  if (!email || !firstName || !lastName || !addr1 || !city || !state || !zip) {
    return redirectWithError(url, 'missing-fields');
  }

  const dataCenter = env.MAILCHIMP_API_KEY.split('-').pop();
  const subscriberHash = md5(email.toLowerCase());

  const mailchimpResponse = await fetch(
    `https://${dataCenter}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${btoa(`anystring:${env.MAILCHIMP_API_KEY}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        // status_if_new (not status): sets status only when creating a new member,
        // and leaves an existing member's subscription status untouched on update —
        // avoids silently re-subscribing someone who'd previously opted out.
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          ADDRESS: { addr1, addr2, city, state, zip, country: 'US' },
          ...(phone ? { PHONE: phone } : {}),
        },
      }),
    }
  );

  if (!mailchimpResponse.ok) {
    // Log Mailchimp's own error body — e.g. a malformed merge field — instead
    // of just knowing *that* it failed.
    console.error('Mailchimp API error:', mailchimpResponse.status, await mailchimpResponse.text());
    return redirectWithError(url, 'mailchimp-error');
  }

  return Response.redirect(`${url.origin}/thank-you/`, 303);
}

function redirectWithError(url, reason) {
  return Response.redirect(`${url.origin}/subscribe/?error=${reason}`, 303);
}
