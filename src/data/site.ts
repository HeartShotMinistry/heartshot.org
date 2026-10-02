// Central place for site-wide facts and third-party endpoints.
// Update phone/address/hours/social links here — every page pulls from this one source.
export const site = {
  name: 'Heart Shot Ministry',
  tagline: 'A Heart for God is our Aim!',
  url: 'https://heartshot.org',
  phone: '678-492-1989',
  email: 'troy@heartshot.org',
  instagram: 'https://www.instagram.com/heartshotministry/',

  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Forms', href: '/forms/' },
    { label: 'Donate', href: '/donate/' },
    { label: 'Subscribe', href: '/subscribe/' },
    { label: 'Contact', href: '/contact/' },
  ],

  ranges: [
    {
      name: 'Davenport Range',
      address: ['Adventure Christian Community', '6509 Northwest Blvd.', 'Davenport, IA 52806'],
      hours: ['Mon & Tue: 6:30–8:30pm', 'Sat: 10:00am–12:00pm'],
    },
    {
      name: 'Kansas City Range',
      address: ['151st Street Church of Christ', '13875 W 151st Street', 'Olathe, KS 66062'],
      hours: ['First Sunday of every month: 6:30–8:30pm'],
    },
    {
      name: 'Base Camp 3D Range (Eldridge)',
      address: ['27580 95th Ave', 'Donahue, IA 52746'],
      hours: ['Open Memorial Day through Labor Day'],
      note: '20 targets winding through timber. Donation based (collection mailbox at the range entrance). Base Camp can accommodate groups who want outdoor archery, camping, etc. Please contact Troy Bendickson',
    },
  ],

  // A new indoor Eldridge location is expected Fall 2026 — update/remove this once it opens.
  eldridgeAnnouncement:
    'Our previous Eldridge Range is closed permanently. We’re getting close to announcing a new Eldridge space, opening Fall 2026.',

  donate: {
    venmo: 'https://account.venmo.com/u/heartshot',
    donorbox: 'https://donorbox.org/heart-shot-ministry-general-fund',
    ncf: 'https://secure.ncfgiving.com/GXDonateNow?id=a0U0H00000aLcILUA0',
    ncfInfo: 'https://www.ncfgiving.com/solutions/non-cash/',
    nonCashPdf: '/files/non-cash-giving.pdf',
    mailAddress: ['Heart Shot Ministry', '27580 95th Ave', 'Donahue, IA 52746'],
  },

  forms: {
    contactEndpoint: 'https://formspree.io/f/xkjnbvdr',
    // Subscribe form posts to /api/subscribe (worker/index.js), which calls the
    // Mailchimp API directly — list ID lives in wrangler.jsonc, API key is a
    // Cloudflare secret (not here). No client-facing endpoint needed.
  },
} as const;
