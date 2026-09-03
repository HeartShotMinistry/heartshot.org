import md5 from 'blueimp-md5';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      return handleSubscribe(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleSubscribe(request, env, url) {
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
    return redirectWithError(url, 'mailchimp-error');
  }

  return Response.redirect(`${url.origin}/thank-you/`, 303);
}

function redirectWithError(url, reason) {
  return Response.redirect(`${url.origin}/subscribe/?error=${reason}`, 303);
}
