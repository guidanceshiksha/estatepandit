// Default site content. Everything here can be edited from /admin; saved edits override these values.
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

export const NEEDS = ['Buy', 'Sell', 'Rent', 'DDA plot / flat', 'Society membership (L-Zone)', 'Legal help', 'Site visit', 'Consultation']
export const ICONS = ['pin', 'tag', 'eye', 'home', 'check', 'shield', 'phone', 'mail', 'building', 'key', 'badge', 'plot', 'clock']

const post = (slug, title, excerpt, category, readTime, date, image, body) => ({
  id: slug, slug, title, excerpt, body, category, readTime, date, image: u(image, 1000), seoTitle: '', seoDescription: '', published: true,
})

export const defaults = {
  site: {
    name: 'Pandit Estate',
    tagline: 'Your Trusted Dwarka Property Partner',
    heroEyebrow: 'Dwarka · Delhi NCR',
    heroTitle: 'PANDIT ESTATE – Your Trusted\nDwarka Property Partner',
    heroSub: 'DDA, society and SFS flats, plots and rentals in Dwarka.',
    heroSlides: ['1486406146926-c627a92ad1ab', '1545324418-cc1a3fa10c00', '1564013799919-ab600027ffc6', '1512917774080-9991f1c4c750'].map((i) => u(i, 1920)),
    dealsIn: ['DDA Plots', 'Society Flats', 'DDA Flats', 'SFS Flats', 'Society Membership in L-Zone'],
    propertyTypes: ['DDA Flat', 'SFS Flat', 'Society Flat', 'DDA Plot', 'Society Membership (L-Zone)', 'Apartment / Flat', 'Builder Floor', 'Independent House / Villa', 'Penthouse', 'Studio Apartment', 'Residential Plot', 'Commercial Shop', 'Office Space', 'Showroom', 'Warehouse / Godown', 'PG / Co-living', 'Farmhouse'],
    budgets: ['Under ₹25 Lac', '₹25 – 50 Lac', '₹50 Lac – 1 Cr', '₹1 – 2 Cr', '₹2 – 5 Cr', '₹5 Cr+'],
    ownerName: 'Suresh Pandit',
    phone: '+91 98110 93769',
    phone2: '+91 88517 91516',
    whatsapp: '919811093769',
    email: 'rk.panditestate@gmail.com',
    address: 'Plot No. 5, Sec-19, Dwarka, New Delhi – 110075 (Near Vardhman Crown Mall)',
    mapQuery: 'Plot 5, Sector 19, Dwarka, New Delhi 110075, near Vardhman Crown Mall',
    hours: 'Mon – Sat, 10 AM – 7 PM',
    footerText: 'DDA plots, society flats, DDA and SFS flats. Sale, purchase and renting in Dwarka.',
    facebook: '', instagram: '', youtube: '', linkedin: '',
  },
  seo: {
    title: 'Pandit Estate – DDA, Society & SFS Flats in Dwarka, New Delhi',
    description: 'Buy, sell or rent DDA flats, society flats, SFS flats and plots in Dwarka, New Delhi. Society membership in L-Zone. Call Pandit Estate for verified properties.',
    keywords: 'property in Dwarka, DDA flats Dwarka, society flats Dwarka, SFS flats, DDA plots, L-Zone society membership, property dealer Dwarka',
    ogImage: '',
    siteUrl: '',
  },
  services: {
    title: 'Our Services',
    sub: 'From first viewing to final registration, under one roof.',
    items: [
      { title: 'Property Buying', line: 'Hand-picked flats, floors and plots in Dwarka with verified papers and fair pricing.', cta: 'Buy Property', need: 'Buy', icon: 'home', image: u('1560518883-ce09059eeffa', 700) },
      { title: 'Property Selling', line: 'Professional listing, photography and genuine buyers so your property sells at the best price.', cta: 'Sell Property', need: 'Sell', icon: 'tag', image: u('1582407947304-fd86f028f716', 700) },
      { title: 'Renting', line: 'Quality rentals for families, bachelors and professionals, ready to move in.', cta: 'Find a Rental', need: 'Rent', icon: 'key', image: u('1554995207-c18c203602cb', 700) },
      { title: 'DDA Plots & Flats', line: 'DDA plots, DDA flats and SFS flats with clear papers and fair pricing.', cta: 'Enquire Now', need: 'DDA plot / flat', icon: 'plot', image: u('1486325212027-8081e485255e', 700) },
      { title: 'Legal Assistance', line: 'Title checks, sale deeds, registration and mutation handled by experts.', cta: 'Get Legal Help', need: 'Legal help', icon: 'shield', image: u('1450101499163-c8848c66ca85', 700) },
      { title: 'Site Visits', line: 'Free guided visits, scheduled around your time, to shortlisted properties.', cta: 'Book a Visit', need: 'Site visit', icon: 'pin', image: u('1568605114967-8130f3a36994', 700) },
      { title: 'Society Membership', line: 'Society membership in L-Zone, transfers and society flats handled end to end.', cta: 'Get Membership', need: 'Society membership (L-Zone)', icon: 'badge', image: u('1570129477492-45c003edd2be', 700) },
      { title: 'Consultation', line: 'Honest investment advice from local experts who know every Dwarka sector.', cta: 'Book Consultation', need: 'Consultation', icon: 'check', image: u('1521791136064-7986c2920216', 700) },
    ],
  },
  properties: {
    title: 'Featured Dwarka Properties',
    sub: 'Hand-picked properties across Dwarka, verified by our team.',
    items: [
      { price: '₹ 1.25 Cr', title: '3 BHK Society Flat', location: 'Sector 10, Dwarka', beds: 3, baths: 3, sqft: 1450, floor: '5th of 9', facing: 'East', furnishing: 'Semi-furnished', status: 'Ready to Move', tag: 'Verified', kind: 'sale', active: true, image: u('1545324418-cc1a3fa10c00') },
      { price: '₹ 85 Lac', title: '2 BHK DDA Flat', location: 'Sector 12, Dwarka', beds: 2, baths: 2, sqft: 950, floor: '2nd of 4', facing: 'North', furnishing: 'Unfurnished', status: 'Ready to Move', tag: 'Hot Deal', kind: 'sale', active: true, image: u('1560518883-ce09059eeffa') },
      { price: '₹ 2.4 Cr', title: '4 BHK Luxury Penthouse', location: 'Sector 22, Dwarka', beds: 4, baths: 4, sqft: 2600, floor: 'Top floor', facing: 'West', furnishing: 'Fully furnished', status: 'Ready to Move', tag: 'Premium', kind: 'sale', active: true, image: u('1564013799919-ab600027ffc6') },
      { price: '₹ 65 Lac', title: '2 BHK SFS Flat', location: 'Sector 19, Dwarka', beds: 2, baths: 2, sqft: 880, floor: '3rd of 7', facing: 'East', furnishing: 'Semi-furnished', status: 'Under Construction', tag: 'New Launch', kind: 'sale', active: true, image: u('1512917774080-9991f1c4c750') },
      { price: '₹ 1.1 Cr', title: '3 BHK Independent Floor', location: 'Sector 7, Dwarka', beds: 3, baths: 3, sqft: 1600, floor: 'Ground', facing: 'North-East', furnishing: 'Semi-furnished', status: 'Ready to Move', tag: 'Verified', kind: 'sale', active: true, image: u('1600585154340-be6161a56a0c') },
      { price: '₹ 45,000 / mo', title: '3 BHK for Rent', location: 'Sector 11, Dwarka', beds: 3, baths: 2, sqft: 1350, floor: '4th of 8', facing: 'South', furnishing: 'Fully furnished', status: 'Available Now', tag: 'For Rent', kind: 'rent', active: true, image: u('1480074568708-e7b720bb3f09') },
    ],
  },
  about: {
    eyebrow: 'About Us',
    heading: "Dwarka's Trusted Property Partner",
    lead: 'Led by Suresh Pandit. Buy, sell or rent with clear papers and honest advice.',
    ownerName: 'Suresh Pandit',
    ownerRole: 'Founder, Pandit Estate',
    ownerPhoto: u('1507003211169-0a1dd7228f2d'),
    badge1: '4.9 Google Rating',
    badge2: '3000+ Properties Sold',
    tilesTitle: 'We deal in',
    tiles: [
      { icon: 'plot', title: 'DDA Plots', sub: '' },
      { icon: 'building', title: 'Society Flats', sub: '' },
      { icon: 'home', title: 'DDA Flats', sub: '' },
      { icon: 'key', title: 'SFS Flats', sub: '' },
      { icon: 'badge', title: 'Society Membership', sub: 'L-Zone' },
    ],
    points: ['Verified papers on every deal', 'Free site visits', 'Legal and loan support', 'One advisor, start to finish'],
  },
  track: {
    title: 'Our Track Record',
    sub: 'Numbers that reflect the trust our clients place in us.',
    items: [
      { value: 100, suffix: '+', label: 'Completed Projects', icon: 'building' },
      { value: 1500, suffix: '+', label: 'Happy Clients', icon: 'check' },
      { value: 3000, suffix: '+', label: 'Properties Sold', icon: 'key' },
      { value: 1, suffix: '', label: "Dwarka's No. 1 Agency", icon: 'badge' },
    ],
  },
  reviews: {
    score: '4.9',
    count: '600+',
    url: 'https://www.google.com/search?q=Pandit+Estate+Dwarka+reviews',
    items: [
      { name: 'Rohit Sharma', when: '2 weeks ago', rating: 5, text: 'Transparent, quick and genuinely helpful. We found our Sector 10 flat in two weeks and the team handled everything.' },
      { name: 'Meena Aggarwal', when: '1 month ago', rating: 5, text: 'The legal team handled every document. Zero stress from the first visit to registration. Highly professional.' },
      { name: 'Amit Kaushik', when: '1 month ago', rating: 5, text: 'Sold my builder floor at an above-market price within a month. Honest advice and great follow-up throughout.' },
      { name: 'Neha Verma', when: '2 months ago', rating: 5, text: 'Great rental options and honest advice. They matched us with a furnished flat exactly in our budget.' },
      { name: 'Sandeep Yadav', when: '3 months ago', rating: 5, text: 'Very knowledgeable about every Dwarka sector. No pressure, just clear information. Would recommend to anyone.' },
      { name: 'Pooja Malhotra', when: '3 months ago', rating: 5, text: 'Smooth leasing experience for our office. The agreement and paperwork were sorted without any delay.' },
    ],
  },
  why: {
    title: 'Why Choose Us',
    sub: 'Six reasons Dwarka families come back to us.',
    scoreNote: 'Google rating from 600+ clients',
    items: [
      { icon: 'pin', title: 'Local Expertise', text: 'We know every Dwarka sector and society.' },
      { icon: 'tag', title: 'Best Price Guarantee', text: 'Fair market pricing, no hidden costs.' },
      { icon: 'eye', title: 'Transparent Deals', text: 'Clear papers, honest communication.' },
      { icon: 'home', title: 'Wide Range of Properties', text: 'DDA, society and SFS flats, plots, shops.' },
      { icon: 'check', title: 'Hassle-free Process', text: 'We handle follow-ups and documents.' },
      { icon: 'shield', title: 'Legal Assistance', text: 'Verified titles and full paperwork support.' },
    ],
  },
  areas: {
    title: 'Areas We Serve',
    sub: 'Tap an area to get properties and prices there.',
    items: ['Dwarka', 'Sector 19', 'Sector 10', 'Sector 11', 'Sector 12', 'Sector 16', 'Sector 22', 'Janakpuri', 'Vasant Kunj', 'Rohini', 'Uttam Nagar', 'Palam', 'Najafgarh', 'Gurugram', 'Noida'],
  },
  partners: {
    items: ['SAMSUNG', 'ABOSTON', 'DLF', 'GODREJ', 'M3M', 'ELDECO', 'EMAAR', 'TATA HOUSING'].map((name) => ({ name, logo: '' })),
  },
  faqs: {
    title: 'Frequently Asked Questions',
    sub: 'Quick answers to common questions.',
    siteTitle: 'About Our Website',
    generalTitle: 'Property Questions',
    site: [
      { q: 'How do I enquire about a property?', a: 'Tap Enquire Now on any card and share your name and number.' },
      { q: 'Are the listings verified?', a: 'Yes. Our team checks details and papers before listing.' },
      { q: 'How do I book a site visit?', a: 'Click Book Visit on a property and pick a date and time.' },
      { q: 'Is my phone number safe?', a: 'It is used only to contact you about your enquiry.' },
      { q: 'How soon will you call back?', a: 'Usually within 30 minutes during working hours.' },
    ],
    general: [
      { q: 'What documents are needed to buy a flat?', a: "ID and address proof, PAN and the seller's title documents." },
      { q: 'Do you charge for site visits?', a: 'No. Brokerage applies only when a deal closes.' },
      { q: 'Do you help with home loans?', a: 'Yes, we connect you with trusted banks and help with paperwork.' },
      { q: 'How long does a purchase take?', a: 'Usually 4–8 weeks from shortlisting to registration.' },
      { q: 'What is a DDA or SFS flat?', a: 'DDA flats are built by Delhi Development Authority; SFS are self-financing scheme flats.' },
    ],
  },
  blogs: {
    title: 'Latest Blog',
    sub: 'Market news, buying guides and local insights.',
    items: [
      post('market-trends-in-dwarka-2026', 'Market Trends in Dwarka 2026', 'Prices, demand and sectors to watch this year.', 'Market Insights', '5 min read', '2026-10-10', '1448630360428-65456885c650',
        'Dwarka remains one of the most sought-after sub-cities in Delhi NCR, with steady demand from families and working professionals.\n\n## What is driving demand\n\n- Good metro connectivity and road access\n- Wide choice of DDA, society and SFS flats\n- Schools, hospitals and markets close by\n\n## What to watch\n\nPrices differ a lot from sector to sector, so compare similar flats before you decide. Talk to a local dealer who sees actual deal prices, not just asking prices.'),
      post('first-time-buyer-checklist', 'First-time Buyer Checklist', 'What to verify before you sign a sale agreement.', 'Buying Guide', '4 min read', '2026-10-11', '1600596542815-ffad4c1539a9',
        'Buying your first home is exciting, but a few checks upfront save a lot of trouble later.\n\n## Before you pay\n\n- Verify the seller\'s identity and ownership papers\n- Check for pending dues, loans or disputes on the property\n- Confirm the exact area, floor and parking being sold\n\n## Before you sign\n\nRead the agreement fully, keep copies of every payment receipt, and complete registration at the sub-registrar office. If anything is unclear, ask before you sign.'),
      post('dda-flat-vs-society-flat', 'DDA Flat vs Society Flat', 'Ownership, paperwork and resale compared simply.', 'Guide', '6 min read', '2026-10-12', '1502672260266-1c1ef2d93688',
        'Both options are popular in Dwarka, but the paperwork and process differ.\n\n## DDA flats\n\nBuilt and allotted by the Delhi Development Authority. Ownership papers and transfer follow DDA rules.\n\n## Society flats\n\nBuilt by a cooperative group housing society. You hold a share and membership in the society, and transfer follows the society\'s procedure.\n\n## How to choose\n\nCompare price, location, paperwork and resale ease, and ask us to explain the transfer steps for the exact flat you like.'),
      post('society-membership-in-l-zone', 'What is Society Membership in L-Zone?', 'How it works and what to check before buying.', 'Guide', '5 min read', '2026-10-14', '1600585154340-be6161a56a0c',
        'In many group housing societies, the right to a plot or flat is held through society membership.\n\n## What to check\n\n- Membership papers and share certificate\n- Society records and any pending dues\n- Rules and charges for transfer\n\nBecause rules can change, always get the latest transfer requirements confirmed before paying a token amount.'),
      post('rent-vs-buy-in-delhi-ncr', 'Rent vs Buy in Delhi NCR', 'Decide with real numbers, not guesswork.', 'Investment', '6 min read', '2026-10-16', '1480074568708-e7b720bb3f09',
        'Renting gives flexibility; buying builds an asset. The right choice depends on your plans.\n\n## Questions to ask\n\n- How long will you stay in the city?\n- Can you manage the down payment and EMI comfortably?\n- What would the same money earn elsewhere?\n\nSit down with a simple comparison of rent, EMI, maintenance and expected stay before deciding.'),
      post('documents-needed-to-sell-your-flat', 'Documents Needed to Sell Your Flat', 'A short checklist to avoid last-minute delays.', 'Selling Guide', '3 min read', '2026-10-18', '1450101499163-c8848c66ca85',
        'Having papers ready makes a sale faster and builds buyer trust.\n\n## Keep these ready\n\n- Title or allotment documents and sale deed\n- Latest tax and maintenance receipts\n- Society or authority no-dues certificate\n- Your ID and address proof\n\nOur team can help check your documents before you list.'),
    ],
  },
}

export const dealTilesFallback = []
