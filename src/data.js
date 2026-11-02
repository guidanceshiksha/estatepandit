// Default site content. Everything here can be edited from /admin; saved edits override these values.
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`
// Photos from the project's own "home tour" folder (Dwarka renders), so nothing looks foreign.
const H = (name) => encodeURI(`/images/home tour/${name}`)

export const NEEDS = ['Buy', 'Sell', 'Rent', 'DDA plot / flat', 'Commercial plot', 'Land in L-Zone', 'Society membership (L-Zone)', 'Home loan', 'Legal help', 'Site visit', 'Consultation', 'Refer a client']
export const ICONS = ['pin', 'tag', 'eye', 'home', 'check', 'shield', 'phone', 'mail', 'building', 'key', 'badge', 'plot', 'clock', 'bank', 'gift', 'users', 'file']

const sectors = Array.from({ length: 29 }, (_, i) => `Sector ${i + 1}`)

const post = (slug, title, excerpt, category, readTime, date, image, body, sources, seoKeywords) => ({
  id: slug, slug, title, excerpt, body, category, readTime, date, image, seoTitle: '', seoDescription: '', seoKeywords, sources, published: true,
})

export const defaults = {
  site: {
    name: 'Pandit Estate',
    tagline: 'Your Trusted Dwarka Property Partner',
    heroEyebrow: 'Dwarka · Delhi NCR',
    heroTitle: 'PANDIT ESTATE\nYour Trusted Dwarka\nProperty Partner',
    heroSub: 'DDA flats, society flats, plots and rentals in Dwarka, with 25+ years of local experience.',
    heroSlides: ['/images/hero/hero-1.jpg', '/images/hero/hero-2.jpg', '/images/hero/hero-3.jpg', '/images/hero/hero-4.jpg'],
    dealsIn: ['DDA Flats', 'Society Flats', 'Commercial Plots', 'Land in L-Zone', 'DDA Plots', 'SFS Flats', 'L-Zone Membership'],
    propertyTypes: ['DDA Flat', 'SFS Flat', 'Society Flat', 'DDA Plot', 'Residential Plot', 'Commercial Plot', 'Land in L-Zone', 'Society Membership (L-Zone)', 'Apartment / Flat', 'Builder Floor', 'Independent House / Villa', 'Penthouse', 'Studio Apartment', 'Commercial Shop', 'Office Space', 'Showroom', 'Warehouse / Godown', 'PG / Co-living', 'Farmhouse'],
    budgets: ['Under ₹25 Lac', '₹25 – 50 Lac', '₹50 Lac – 1 Cr', '₹1 – 2 Cr', '₹2 – 5 Cr', '₹5 Cr+'],
    ownerName: 'Suresh Bhardwaj',
    phone: '+91 98110 93769',
    phone2: '+91 88517 91516',
    whatsapp: '919811093769',
    email: 'rk.panditestate@gmail.com',
    address: 'Plot No. 5, Sec-19, Dwarka, New Delhi – 110075 (Near Vardhman Crown Mall)',
    mapQuery: 'Plot 5, Sector 19, Dwarka, New Delhi 110075, near Vardhman Crown Mall',
    hours: 'Mon – Sat, 10 AM – 7 PM',
    officeImage: '/images/office.jpg',
    officeCaption: 'Our office, Sector 19, Dwarka',
    creditName: 'GIPSM Technology India Private Limited',
    creditUrl: 'https://www.gypsumtechnology.com',
    footerText: 'DDA plots and flats, society flats, SFS flats, commercial plots and land in L-Zone. Sale, purchase and renting in Dwarka.',
    facebook: '', instagram: '', youtube: '', linkedin: '',
  },
  seo: {
    title: 'Pandit Estate – DDA, Society & SFS Flats, Plots in Dwarka, New Delhi',
    description: 'Buy, sell or rent DDA flats, society flats, SFS flats, commercial plots and land in L-Zone in Dwarka, New Delhi. 25+ years of experience. Call Pandit Estate.',
    keywords: 'property in Dwarka, DDA flats Dwarka, society flats Dwarka, SFS flats, DDA plots, commercial plots Dwarka, land in L-Zone, L-Zone society membership, property dealer Dwarka',
    ogImage: '',
    siteUrl: '',
  },
  services: {
    title: 'Our Services',
    sub: 'From first viewing to final registration, under one roof.',
    items: [
      { title: 'Property Buying', line: 'Hand-picked flats, floors and plots in Dwarka with verified papers and fair pricing.', cta: 'Buy Property', need: 'Buy', icon: 'home', image: '/images/services/property-buying.jpg' },
      { title: 'Property Selling', line: 'Professional listing, photography and genuine buyers so your property sells at the best price.', cta: 'Sell Property', need: 'Sell', icon: 'tag', image: '/images/services/property-selling.jpg' },
      { title: 'Renting', line: 'Quality rentals for families, bachelors and professionals, ready to move in.', cta: 'Find a Rental', need: 'Rent', icon: 'key', image: '/images/services/renting.jpg' },
      { title: 'DDA & SFS Flats', line: 'DDA flats and SFS flats with clear papers, transfer help and fair pricing.', cta: 'Enquire Now', need: 'DDA plot / flat', icon: 'building', image: '/images/services/dda-sfs-flats.jpg' },
      { title: 'Commercial Plots', line: 'Commercial plots and shops in Dwarka for business owners and investors.', cta: 'Enquire Now', need: 'Commercial plot', icon: 'plot', image: '/images/services/commercial-plots.jpg' },
      { title: 'Land in L-Zone', line: 'Land and plots in L-Zone with title checks and documentation support.', cta: 'Enquire Now', need: 'Land in L-Zone', icon: 'pin', image: '/images/services/land-l-zone.jpg' },
      { title: 'Society Membership', line: 'Society membership in L-Zone, transfers and society flats handled end to end.', cta: 'Get Membership', need: 'Society membership (L-Zone)', icon: 'badge', image: '/images/services/society-membership.jpg' },
      { title: 'Legal Assistance', line: 'Title checks, sale deeds, registration and mutation handled by experts.', cta: 'Get Legal Help', need: 'Legal help', icon: 'shield', image: '/images/services/legal-assistance.jpg' },
      { title: 'Home Loan Help', line: 'We help you apply with leading banks and sort the paperwork.', cta: 'Check Eligibility', need: 'Home loan', icon: 'bank', image: '/images/services/home-loan.jpg' },
      { title: 'Site Visits', line: 'Free guided visits, scheduled around your time, to shortlisted properties.', cta: 'Book a Visit', need: 'Site visit', icon: 'check', image: '/images/services/site-visits.jpg' },
    ],
  },
  properties: {
    title: 'Featured Dwarka Properties',
    sub: 'Hand-picked properties across Dwarka, verified by our team.',
    items: [
      { price: '₹ 1.25 Cr', title: '3 BHK Society Flat', location: 'Sector 10, Dwarka', beds: 3, baths: 3, sqft: 1450, floor: '5th of 9', facing: 'East', furnishing: 'Semi-furnished', status: 'Ready to Move', tag: 'Verified', kind: 'sale', active: true, image: H('Moderin living room.jpg') },
      { price: '₹ 85 Lac', title: '2 BHK DDA Flat', location: 'Sector 12, Dwarka', beds: 2, baths: 2, sqft: 950, floor: '2nd of 4', facing: 'North', furnishing: 'Unfurnished', status: 'Ready to Move', tag: 'Hot Deal', kind: 'sale', active: true, image: H('modern kitchern.jpg') },
      { price: '₹ 2.4 Cr', title: '4 BHK Luxury Penthouse', location: 'Sector 22, Dwarka', beds: 4, baths: 4, sqft: 2600, floor: 'Top floor', facing: 'West', furnishing: 'Fully furnished', status: 'Ready to Move', tag: 'Premium', kind: 'sale', active: true, image: H('modern baclony.jpg') },
      { price: '₹ 65 Lac', title: '2 BHK SFS Flat', location: 'Sector 19, Dwarka', beds: 2, baths: 2, sqft: 880, floor: '3rd of 7', facing: 'East', furnishing: 'Semi-furnished', status: 'Under Construction', tag: 'New Launch', kind: 'sale', active: true, image: H('guest bedroom.jpg') },
      { price: '₹ 1.1 Cr', title: '3 BHK Independent Floor', location: 'Sector 7, Dwarka', beds: 3, baths: 3, sqft: 1600, floor: 'Ground', facing: 'North-East', furnishing: 'Semi-furnished', status: 'Ready to Move', tag: 'Verified', kind: 'sale', active: true, image: H('Modern dinig area.jpg') },
      { price: '₹ 45,000 / mo', title: '3 BHK for Rent', location: 'Sector 11, Dwarka', beds: 3, baths: 2, sqft: 1350, floor: '4th of 8', facing: 'South', furnishing: 'Fully furnished', status: 'Available Now', tag: 'For Rent', kind: 'rent', active: true, image: H('luxury master room.jpg') },
    ],
  },
  about: {
    eyebrow: 'About Us',
    heading: "Dwarka's Trusted Property Partner",
    lead: 'Led by Suresh Bhardwaj with 25+ years of experience in Dwarka. Buy, sell or rent with clear papers and honest advice.',
    ownerName: 'Suresh Bhardwaj',
    ownerRole: 'Founder, Pandit Estate',
    ownerPhoto: '/images/owner.jpg',
    expValue: '25+',
    expLabel: 'Years of Experience',
    tilesTitle: 'We deal in',
    tiles: [
      { icon: 'plot', title: 'DDA Plots', sub: '' },
      { icon: 'building', title: 'Society Flats', sub: '' },
      { icon: 'home', title: 'DDA Flats', sub: '' },
      { icon: 'key', title: 'SFS Flats', sub: '' },
      { icon: 'building', title: 'Commercial Plots', sub: '' },
      { icon: 'pin', title: 'Land', sub: 'in L-Zone' },
    ],
    points: ['Verified papers on every deal', 'Free site visits', 'Legal and home loan support', 'One advisor, start to finish'],
  },
  track: {
    title: 'Our Track Record',
    sub: 'Numbers that reflect the trust our clients place in us.',
    items: [
      { value: 1, prefix: '#', suffix: '', label: "Dwarka's No. 1 Real Estate", icon: 'badge' },
      { value: 8000, suffix: '+', label: 'Happy Clients', icon: 'users' },
      { value: 12000, suffix: '+', label: 'Properties Sold', icon: 'key' },
      { value: 25, suffix: '+', label: 'Years of Experience', icon: 'clock' },
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
      { icon: 'pin', title: 'Local Expertise', text: '25+ years in every Dwarka sector and society.' },
      { icon: 'tag', title: 'Best Price Guarantee', text: 'Fair market pricing, no hidden costs.' },
      { icon: 'eye', title: 'Transparent Deals', text: 'Clear papers, honest communication.' },
      { icon: 'home', title: 'Wide Range of Properties', text: 'Flats, plots, commercial plots and land.' },
      { icon: 'check', title: 'Hassle-free Process', text: 'We handle follow-ups and documents.' },
      { icon: 'shield', title: 'Legal Assistance', text: 'Verified titles and full paperwork support.' },
    ],
  },
  loans: {
    eyebrow: 'Home Loan Assistance',
    title: 'Home Loan Assistance for Your Dream Home',
    sub: 'We guide you through applying for a home loan with leading banks and help you get your papers ready.',
    cta: 'Check Loan Eligibility',
    bankTitle: 'Banks you can apply with',
    note: 'Loan approval, interest rates and terms are decided by each bank. Bank names and logos belong to their owners; Pandit Estate provides guidance only.',
    steps: [
      { icon: 'check', title: 'Check eligibility', text: 'Understand how much you can borrow.' },
      { icon: 'bank', title: 'Choose a bank', text: 'Compare options from leading banks.' },
      { icon: 'file', title: 'Prepare papers', text: 'Documents checked and organised for you.' },
      { icon: 'key', title: 'Complete the purchase', text: 'Guidance up to registration.' },
    ],
    banks: [
      { name: 'State Bank of India', full: '', logo: '/images/banks/sbi.svg' },
      { name: 'HDFC Bank', full: '', logo: '/images/banks/hdfc.svg' },
      { name: 'ICICI Bank', full: '', logo: '/images/banks/icici.svg' },
      { name: 'Axis Bank', full: '', logo: '/images/banks/axis.svg' },
      { name: 'Punjab National Bank', full: '', logo: '/images/banks/pnb.svg' },
      { name: 'Bank of Baroda', full: '', logo: '/images/banks/bob.png' },
      { name: 'Canara Bank', full: '', logo: '/images/banks/canara.svg' },
      { name: 'Union Bank of India', full: '', logo: '/images/banks/union.svg' },
    ],
  },
  referral: {
    eyebrow: 'Refer & Earn',
    title: 'Know Someone Looking for a Property? Earn a Reward.',
    sub: 'Share a genuine lead with us. When your referral buys, sells or rents through Pandit Estate, you receive a reward.',
    cta: 'Refer a Client',
    note: 'Reward is given once the referred deal is completed.',
    steps: [
      { icon: 'users', title: 'Share the lead', text: 'Send us the name and number of someone who wants to buy, sell or rent.' },
      { icon: 'key', title: 'We close the deal', text: 'Our team looks after the visits, papers and registration.' },
      { icon: 'gift', title: 'You get rewarded', text: 'A reward is paid to you when the deal is completed.' },
    ],
  },
  areas: {
    title: 'Areas We Serve',
    sub: 'Tap an area to get properties and prices there.',
    dwarkaTitle: 'Dwarka Sectors',
    items: ['Dwarka (All Sectors)', ...sectors],
    ncrTitle: 'Delhi NCR',
    ncr: ['Janakpuri', 'Uttam Nagar', 'Vikaspuri', 'Palam', 'Najafgarh', 'Vasant Kunj', 'Rohini', 'Gurugram', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad', 'Bahadurgarh'],
  },
  partners: {
    items: ['SAMSUNG', 'ABOSTON', 'DLF', 'GODREJ', 'M3M', 'ELDECO', 'EMAAR', 'TATA HOUSING'].map((name) => ({ name, logo: '' })),
  },
  faqs: {
    title: 'Frequently Asked Questions',
    sub: 'Simple answers to common questions.',
    siteTitle: 'Using This Website',
    generalTitle: 'About Buying & Renting',
    site: [
      { q: 'How do I ask about a property?', a: 'Tap Enquire Now on any property and share your name and number. We will call you.' },
      { q: 'Can I book a site visit here?', a: 'Yes. Tap Book Visit on a property and choose a date and time.' },
      { q: 'How do I search for a property?', a: 'Use the search box at the top. Pick the type, location and budget.' },
      { q: 'How can I reach you quickly?', a: 'Use the Call Now or WhatsApp buttons. We reply as soon as we can.' },
    ],
    general: [
      { q: 'Which areas do you cover?', a: 'All sectors of Dwarka and nearby places in Delhi NCR.' },
      { q: 'What kinds of property do you deal in?', a: 'DDA flats and plots, SFS flats, society flats, commercial plots, land in L-Zone and rentals.' },
      { q: 'Can you help me get a home loan?', a: 'Yes. We guide you on applying with leading banks and help with the paperwork.' },
      { q: 'Do you help with legal papers?', a: 'Yes. We help with title checks, registration and transfer.' },
    ],
  },
  blogs: {
    title: 'Dwarka News & Guides',
    sub: 'What is happening in Dwarka, explained simply, with sources.',
    items: [
      post('dwarka-property-2026-what-is-driving-demand', 'Dwarka Property in 2026: What Is Driving Demand for Homes',
        'Metro links, new DDA schemes and the Dwarka Expressway are shaping where buyers look this year.', 'Market News', '5 min read', '2026-11-01', '/images/blog/dwarka-property-2026.jpg',
        `If you have been following Dwarka property over the last few years, you will have noticed the same question in almost every conversation: is this still a good time to buy? The honest answer depends on the sector, the type of home and your plan for it. What we can do is lay out what is actually happening around Dwarka right now, using public sources, so you can decide with clear eyes.

## Metro and airport access keep Dwarka in demand

Dwarka's biggest strength is how easily you can get out of it. The Airport Express Line was extended from Dwarka Sector 21 to Yashobhoomi Dwarka Sector 25, and the Prime Minister inaugurated the stretch on 17 September 2023, according to the Prime Minister's Office. The Delhi Metro Rail Corporation (DMRC) says the ride between New Delhi and Yashobhoomi takes about 21 minutes. Dwarka Sector 21 also connects to the Blue Line, which is why homes close to that interchange get steady attention from working professionals.

## New DDA flats are back in the news

The Delhi Development Authority keeps bringing flats to the market through different schemes. Business Today reported that the second round of the Dwarka CSP scheme put 39 EWS flats up for e-auction at about ₹31.28 lakh each, with the first live session on 24 August 2026. Outlook Money reported that DDA's Premium Housing Scheme 2026 covered 582 flats across Delhi and that its timeline was extended. These are small numbers against the size of the market, but they show that DDA flats in Dwarka remain an active choice, especially for first-time buyers. Always check the DDA housing circulars page before you apply.

## What is happening next door

Many people mix up Dwarka in Delhi with the Dwarka Expressway, which runs through Gurugram. Anarock data reported by Outlook Money shows prices along the expressway rising about 135 percent since 2021, to roughly ₹14,180 per sq ft in the first half of 2026. That is a Gurugram story, but it has put the wider Dwarka corridor in the spotlight, and some of that interest naturally reaches Dwarka property in Delhi, which is already built, connected and lived in.

## How to read the market as a buyer

- **Compare sector to sector.** A flat near a metro station and a flat deep inside a sector can differ a lot in price and rent.
- **Check the paperwork first.** DDA, society and SFS flats each follow a different transfer process, so confirm the documents before paying a token amount.
- **Ask for recent deals.** Asking prices and closing prices are often different, and a local dealer who sees real deals will tell you the gap.
- **Think about the end use.** Self-use buyers and investors look for different things, from schools and parks to rental demand.

## Our view

Dwarka property is not a fast-flip market. It rewards patient buyers who pick the right sector and verify documents carefully. Tell us your budget and the kind of home you want, and we will share honest options and let you compare, with no pressure to decide. Prices and schemes change, so treat the figures above as a snapshot from the sources named and confirm current details before you act.`,
        [
          ['Prime Minister\'s Office: Airport Express Line extension to Yashobhoomi Dwarka Sector 25', 'https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-extension-of-airport-metro-express-line-station-from-dwarka-sector-21-to-yashobhoomi-dwarka-sector-25/'],
          ['Business Today: DDA Dwarka CSP housing scheme 2026', 'https://www.businesstoday.in/real-estate/story/dda-dwarka-csp-housing-scheme-2026-39-ews-flats-up-for-e-auction-at-rs31-lakh-each-check-location-550619-2026-08-22'],
          ['Outlook Money: DDA Premium Housing Scheme 2026 extended', 'https://www.outlookmoney.com/invest/dda-premium-housing-scheme-2026-extended-more-time-provided-to-aspiring-homebuyers'],
          ['Outlook Money: Dwarka Expressway prices up 135% since 2021', 'https://www.outlookmoney.com/invest/dwarka-expressway-turning-into-delhi-ncrs-new-residential-power-corridor-prices-up-135-per-cent-since-2021-says-report'],
          ['DDA housing circulars', 'https://dda.gov.in/housing/housing-circulars'],
        ], 'Dwarka property, Dwarka real estate 2026, DDA flats in Dwarka, Dwarka metro'),
      post('yashobhoomi-dwarka-airport-metro-home-buyers', 'Yashobhoomi and the Airport Metro: What It Means for Dwarka Home Buyers',
        'The Airport Express extension changed how Dwarka connects to the airport and the city centre.', 'Infrastructure', '4 min read', '2026-10-28', '/images/blog/yashobhoomi-airport-metro.jpg',
        `Few projects have changed daily travel in Dwarka as much as the Airport Express extension to Yashobhoomi. If you are thinking about buying or renting here, it is worth understanding what the line actually offers, and what it does not.

## What was built

The Prime Minister inaugurated the extension from Dwarka Sector 21 to Yashobhoomi Dwarka Sector 25 on 17 September 2023, as per the Prime Minister's Office. It is an underground section of about 1.88 km, and Yashobhoomi became the new terminus of the Airport Express Line. Wikipedia's station page notes that the station is around 17 metres deep and is linked to the convention complex through a long subway.

## Travel time to the city centre

According to the Delhi Metro Rail Corporation (DMRC), the journey between New Delhi and Yashobhoomi takes about 21 minutes. For people who work in central Delhi or travel often by air, that is a real advantage, and it is one reason buyers ask us about homes near Sector 21 and Sector 25.

## Why Dwarka Sector 21 matters

Dwarka Sector 21 is an interchange between the Blue Line and the Airport Express. In simple words, you can reach many parts of Delhi on the Blue Line and switch to the Airport Express for the airport and New Delhi. Homes within a short ride or walk of that interchange are easier to rent out, because tenants value quick access.

## What buyers should keep in mind

- **Do the commute yourself.** Travel the route at your usual office hour before you decide.
- **Check last-mile travel.** A station may be close on the map but still need a ride to your front door.
- **Look beyond one factor.** Metro access is one part of the picture, along with schools, hospitals, markets and the quality of the society.
- **Compare prices carefully.** A well-connected sector often costs more, so see whether the premium suits your budget.

## Our take

The extension has put Dwarka on the map for events, business travel and airport access, and that supports long-term interest in the area. It does not mean every flat will rise in value, since price still depends on the building, the floor, the paperwork and the demand in that particular sector. If you would like a sector-by-sector comparison, our team can walk you through real examples from recent deals.

Please confirm timings and services with DMRC before planning your travel.`,
        [
          ['Prime Minister\'s Office: Extension to Yashobhoomi Dwarka Sector 25', 'https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-extension-of-airport-metro-express-line-station-from-dwarka-sector-21-to-yashobhoomi-dwarka-sector-25/'],
          ['ThePrint: Airport Line extension to Yashobhoomi', 'https://theprint.in/india/airport-line-extension-till-yashobhoomi-dwarka-sector-25-to-open-on-sep-17-dmrc/1764267/'],
          ['Wikipedia: Yashobhoomi Dwarka Sector 25 metro station', 'https://en.wikipedia.org/wiki/Yashobhoomi_Dwarka_Sector_-_25_metro_station'],
          ['Housing.com: PM inaugurates Airport Express Line extension', 'https://housing.com/news/pm-inaugurates-dehi-airport-metro-express-line-extension'],
        ], 'Yashobhoomi, Yashobhoomi Dwarka, Airport Express metro Dwarka, Dwarka Sector 21 metro, Dwarka Sector 25'),
      post('dda-flats-in-dwarka-latest-scheme-updates', 'DDA Flats in Dwarka: Latest Scheme Updates and How to Prepare',
        'A plain-language look at recent DDA schemes that include Dwarka and what to check before you apply.', 'DDA Updates', '5 min read', '2026-10-24', '/images/blog/dda-flats-dwarka.jpg',
        `DDA flats in Dwarka have always had a loyal set of buyers. They come with the trust of a government agency, and many of them sit in well-planned sectors. If you are thinking about applying, here is a simple summary of what has been reported recently, and a short checklist to prepare.

## What was reported for 2026

Business Today reported that the Delhi Development Authority (DDA) held a second round of live e-auctions under its Dwarka Community Service Personnel (CSP) scheme. It listed 39 EWS flats at about ₹31.28 lakh each, with the first e-auction session on 24 August 2026. Bajaj Housing Finance's scheme guide mentions that these units are in Tower M, Sector 19B, Dwarka.

Outlook Money separately reported that the DDA Premium Housing Scheme 2026 covered 582 flats across Delhi and that applicants were given extra time. On its own housing circulars page, DDA also lists the Nagrik Awaas Yojana 2026 and changes to the Premium Housing Scheme. Not every scheme includes Dwarka, so read the brochure for each one.

## A simple checklist before you apply

- **Read the official brochure.** Eligibility, income limits and the application process are explained on the DDA website. Use that as your main reference, and treat blogs as a guide only.
- **Keep documents ready.** Identity and address proof, PAN, income papers and bank details are usually needed. Keep clear scans ready.
- **Plan the money.** Think about the earnest money, the payment schedule and any home loan you may need. Our team can help you talk to banks.
- **Visit the location.** See the tower, the floor, the surroundings and the distance from the metro before you bid.

## E-auction versus buying from an owner

An e-auction follows a fixed process and timeline. Buying a DDA flat from an owner on the resale market gives you more choice of sector and floor, and you can usually see the exact flat first, but the transfer paperwork needs careful handling. In both cases, the title and documents matter more than the price.

## How we can help

At Pandit Estate we help buyers compare DDA flats in Dwarka with society flats and SFS flats, check documents and understand the transfer steps. If you have a particular sector in mind, tell us and we will share what is available and what recent deals looked like. We always suggest that you confirm scheme dates, prices and eligibility on dda.gov.in before applying, because details change from time to time.`,
        [
          ['Business Today: DDA Dwarka CSP scheme 2026, 39 EWS flats e-auction', 'https://www.businesstoday.in/real-estate/story/dda-dwarka-csp-housing-scheme-2026-39-ews-flats-up-for-e-auction-at-rs31-lakh-each-check-location-550619-2026-08-22'],
          ['Outlook Money: DDA Premium Housing Scheme 2026', 'https://www.outlookmoney.com/invest/dda-premium-housing-scheme-2026-extended-more-time-provided-to-aspiring-homebuyers'],
          ['DDA: Housing circulars', 'https://dda.gov.in/housing/housing-circulars'],
          ['Housing.com: How to apply for DDA housing schemes', 'https://housing.com/news/apply-dda-housing-schemes/'],
        ], 'DDA flats, DDA flats in Dwarka, DDA housing scheme 2026, DDA e-auction, Dwarka DDA flats price'),
      post('dwarka-expressway-vs-dwarka-delhi', 'Dwarka Expressway vs Dwarka Delhi: Which One Fits Your Budget?',
        'The names sound alike but the two markets are very different. Here is how to compare them.', 'Buyer Guide', '5 min read', '2026-10-20', '/images/blog/dwarka-expressway.jpg',
        `We often meet buyers who ask about the Dwarka Expressway when they actually mean Dwarka in Delhi, or the other way round. The two are connected by name and by road, but they are different markets with different prices, so it helps to know the difference.

## Two places, one name

Dwarka in Delhi is an established sub-city with numbered sectors, metro stations, schools, markets and many DDA, society and SFS flats. The expressway is a road that links Dwarka with Gurugram, and the homes along it are mostly newer apartment projects in Gurugram. The Haryana section of about 19 km was inaugurated in March 2024, at a cost of around ₹4,100 crore according to Drishti IAS and Business Standard.

## What the numbers say

Anarock data reported by Outlook Money suggests that residential prices along the Dwarka Expressway rose about 135 percent between 2021 and the first half of 2026, from roughly ₹6,032 to ₹14,180 per sq ft. Other agencies report different figures, because each one uses a different sample. The safe takeaway is that the expressway corridor has become costlier, and buyers there are mostly looking at new projects.

## How the two compare for a buyer

- **Type of home.** Dwarka in Delhi offers ready flats and floors across many age groups. The expressway mostly offers new or under-construction apartments.
- **Ownership papers.** In Dwarka you will see DDA, society and SFS flats, and each has its own transfer process. In Gurugram, projects are usually registered under a developer.
- **Move-in time.** A ready flat in Delhi can be used right away, while an under-construction apartment needs patience.
- **Daily life.** Established sectors already have schools, hospitals and markets nearby, and the expressway area is still developing.

## A simple way to decide

Start from your budget and your timeline. If you want to move in soon and prefer a known neighbourhood, ready flats in Dwarka are worth a close look. If you are happy to wait and want a new project with modern amenities, the expressway side may suit you. Either way, check the paperwork, the builder's record and the exact location before paying anything.

## Talk to us

We deal mainly in Dwarka, so we can show you real options and recent deal prices here, and help you think through the trade-offs. If you are comparing both sides, share your budget and your must-haves and we will give you a clear and honest view.

Figures quoted above come from the sources listed below and may have changed, so please verify current prices before you decide.`,
        [
          ['Outlook Money: Dwarka Expressway prices up 135% since 2021 (Anarock)', 'https://www.outlookmoney.com/invest/dwarka-expressway-turning-into-delhi-ncrs-new-residential-power-corridor-prices-up-135-per-cent-since-2021-says-report'],
          ['Drishti IAS: PM inaugurates Dwarka Expressway in Haryana', 'https://www.drishtiias.com/state-pcs-current-affairs/pm-inaugurates-dwarka-expressway-in-haryana/print_manually'],
          ['Business Standard: Gurugram section of Dwarka Expressway', 'https://www.business-standard.com/india-news/pm-to-inaugurate-gurugram-section-of-dwarka-expressway-on-march-11-details-124030700789_1.html'],
        ], 'Dwarka Expressway, Dwarka Expressway price, Dwarka vs Gurugram, Dwarka Delhi flats'),
      post('society-membership-in-l-zone-what-to-check', 'Society Membership in L-Zone: What Buyers Should Check',
        'How society membership works and the simple checks that protect you before you pay.', 'Guide', '4 min read', '2026-10-15', '/images/blog/society-membership-l-zone.jpg',
        `Many people in Dwarka hear the phrase membership in L-Zone from a dealer and nod along, without being sure what it really means. Here is a plain explanation, and a few checks that can save you from trouble.

## What society membership means

In a cooperative group housing society, the right to a flat or plot is usually held through membership of that society. You become a member, you hold a share in the society, and your right to the property follows from that membership. When the property is sold, the buyer normally needs to be admitted as a member, and the society's records are updated.

## Why paperwork matters so much

Because the right is linked to membership, the papers decide everything. A good deal can become a problem if the membership records are unclear, if dues are pending or if the transfer steps are skipped. This is why experienced buyers ask to see the documents before they talk about price.

## Checks before you pay a token amount

- **Membership papers.** Ask for the share certificate and the membership records, and check that the seller's name matches.
- **Society records.** Confirm that the society's records are up to date and that no dues or disputes are pending.
- **Transfer rules.** Ask what the society and the authorities require for a transfer, and how long it usually takes.
- **Land and building status.** Check the status of the land or flat as per the relevant approvals.
- **Written agreement.** Make sure every promise is written in the agreement, and keep copies of all receipts.

## Land in L-Zone

Buyers also ask us about land and plots in L-Zone. The same rule applies: confirm the title, check the approvals and understand what can be built and what cannot. Rules can change, so always get the latest requirements confirmed in writing before you pay.

## How we help

Pandit Estate has handled society membership transfers in Dwarka for many years. We help you check documents, explain the steps in simple words and coordinate with the society and your legal adviser. If you are considering a society flat or a plot, talk to us before you pay a token amount, and we will help you check it properly.

This article is general information, not legal advice. For a specific property, please take advice from a qualified lawyer.`,
        [
          ['Delhi Development Authority: Housing', 'https://dda.gov.in/housing/housing-scheme'],
        ], 'society membership, society membership L-Zone, L-Zone land, society flats Dwarka, transfer of society membership'),
      post('home-loan-checklist-for-dwarka-buyers', 'Home Loan Checklist for Dwarka Buyers: Documents and Simple Tips',
        'Get your paperwork ready and avoid common delays when applying for a home loan.', 'Home Loan', '4 min read', '2026-10-10', '/images/blog/home-loan-checklist.jpg',
        `Most buyers in Dwarka take a home loan, and most delays happen for one simple reason: the papers are not ready. A little preparation makes the whole process smoother. Here is a practical checklist, written for first-time borrowers.

## Start with your budget

Before you look at flats, decide how much you can comfortably pay each month. Banks such as SBI, HDFC Bank, ICICI Bank, Axis Bank and Punjab National Bank look at your income, your existing loans and your credit history. Many of them have online tools where you can check an estimate. Treat the result as a guide, because the final decision is always with the bank.

## Documents you usually need

- **Identity and address proof.** Aadhaar, PAN and a recent address proof.
- **Income proof.** Salary slips and bank statements for salaried people, and income tax returns for the business owner.
- **Property papers.** Sale agreement, title documents and approvals for the flat or plot you plan to buy.
- **Photographs and forms.** Recent photographs and the filled application form.

## Tips that save time

- **Check your credit record first.** A clean record helps, and any errors are better fixed before you apply.
- **Do not apply to many banks at once.** Each application can leave a mark on your record, so compare first and apply to one or two.
- **Read the sanction letter carefully.** Understand the charges, the repayment period and what happens if you pay early.
- **Keep the property papers clean.** Banks look closely at the title, so a flat with clear papers moves faster.

## DDA, society and SFS flats

The papers differ by type of property. A DDA flat, a society flat and an SFS flat each have their own documents and transfer steps, and not every bank treats them the same way. Ask the bank early which documents it needs for your type of property, so there are no surprises on your home loan later.

## How Pandit Estate can help

We guide buyers on the documents, introduce you to leading banks and stay with you until the registration is done. We do not decide the loan, which is always the bank's decision, but we make the process easier to follow. Tell us your budget and the property you like, and we will explain the steps in simple words.

Rates, charges and eligibility rules change, so please check the latest details on each bank's official website.`,
        [
          ['State Bank of India', 'https://sbi.co.in'],
          ['HDFC Bank', 'https://www.hdfcbank.com'],
          ['Reserve Bank of India', 'https://www.rbi.org.in/'],
        ], 'home loan, home loan Dwarka, home loan documents, DDA flat loan, home loan checklist'),
    ],
  },
}
