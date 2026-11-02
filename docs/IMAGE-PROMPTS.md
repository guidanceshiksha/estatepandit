# Pandit Estate: Image Prompts (AI image generator ke liye)

Har image ko neeche likhe **folder aur file name** se save karo. Website ye files apne aap utha legi
(file na ho to us jagah hara gradient dikhta hai). Property cards ki photos baad mein aapke details ke saath lagengi.

| Folder | Kitni | Size (px) | Ratio |
|---|---|---|---|
| `public/images/hero/` | 4 | 1920 × 1080 | 16:9 (landscape) |
| `public/images/services/` | 10 | 1200 × 900 | 4:3 |
| `public/images/blog/` | 6 | 1200 × 750 | 16:10 |

Format: **JPG**, har file 400 KB se chhoti (squoosh.app ya tinypng.com se compress kar lo).

## Har prompt ke saath ye STYLE BLOCK jod do (consistency ke liye)

> Photorealistic high-resolution photograph, natural light, premium real-estate look. Indian context: Dwarka (West Delhi) and Gurugram residential neighbourhoods, modern Indian high-rise society apartments and 4 to 8 storey DDA-style flats with balconies, Indian people, Delhi-NCR greenery (neem, gulmohar, palms). Clean, warm, aspirational. No text, no signboards, no logos, no watermark, no distorted hands or faces. Colour feel: fresh greens and warm daylight.

## 1. Hero (background slides) → `public/images/hero/`

Hero ke upar text aata hai, isliye **beech aur upar ka hissa shaant rakho** (khula aasmaan ya halka detail).

1. `hero-1.jpg`: Wide aerial view of a Dwarka-style residential sector at golden hour, tree-lined wide roads, green parks, mix of 4 to 8 storey DDA flats and modern 15 to 25 storey society towers, an elevated metro line in the distance, warm hazy sunlight, open sky in the upper third.
2. `hero-2.jpg`: Grand gated society entrance in Gurugram/Dwarka style, modern gate and security cabin, landscaped driveway with palm trees, tall premium towers behind, clear blue morning sky, a few residents walking, wide cinematic shot.
3. `hero-3.jpg`: Row of modern high-rise apartment towers in an Indian city at dusk, lit windows, glass balconies, soft blue-orange sky gradient, trees in the foreground, wide shot with calm sky on top.
4. `hero-4.jpg`: Beautiful society park and clubhouse in the evening, Indian families walking, children cycling, senior citizens on benches, apartment towers glowing in the background, warm and welcoming, wide shot.

## 2. Services (4:3) → `public/images/services/`

| File | Prompt (STYLE BLOCK ke saath) |
|---|---|
| `property-buying.jpg` | An Indian couple in their 30s smiling while receiving house keys from a property consultant inside a bright new apartment living room, balcony and towers visible through the window. |
| `property-selling.jpg` | An Indian property consultant and a senior homeowner shaking hands in a tidy living room, documents and a laptop on the table, friendly and trustworthy mood. |
| `renting.jpg` | A young Indian professional couple in a furnished 2 BHK living room with a few moving boxes, sofa, plants, big window with city view, happy move-in moment. |
| `dda-sfs-flats.jpg` | Front view of a well-kept 5 to 6 storey DDA-style residential block in Dwarka, cream and brick-red facade, balconies, green lawn and trees, clear blue sky, no cars blocking the building. |
| `commercial-plots.jpg` | A new commercial market complex under construction on a corner plot in West Delhi, a surveyor and an engineer reviewing a plan, wide road and shops in the background, daytime. |
| `land-l-zone.jpg` | An open residential plot with boundary pillars and a fresh green patch, a surveyor with a total-station instrument, apartment blocks on the horizon, soft afternoon light. |
| `society-membership.jpg` | A cooperative housing society office in Delhi, a society secretary handing a membership file to an Indian resident, framed apartment photo on the wall, apartments visible outside the window (no readable text on papers). |
| `legal-assistance.jpg` | An Indian lawyer in a formal setting reviewing property documents with a client, stamp papers and a pen on a wooden desk, bookshelf behind, serious yet reassuring mood (no readable text). |
| `home-loan.jpg` | A bank officer helping an Indian couple with home loan paperwork at a desk, laptop, calculator and a small house model on the table, friendly smiles (no bank logos, no readable text). |
| `site-visits.jpg` | An Indian property consultant showing an empty new flat to a family of four on the balcony, parents and two kids looking at the view of towers and trees, bright daylight. |

## 3. Blog covers (16:10) → `public/images/blog/`

| File | Prompt (STYLE BLOCK ke saath) |
|---|---|
| `dwarka-property-2026.jpg` | Skyline of Dwarka, New Delhi at sunrise: apartment towers, wide roads, green belts and a metro line, warm light, wide editorial shot. |
| `yashobhoomi-airport-metro.jpg` | A modern Delhi Airport Express style metro train arriving at a clean underground-looking station platform, glass doors, a few commuters with luggage, cool bright lighting (no logos, no readable signs). |
| `dda-flats-dwarka.jpg` | A row of DDA-style apartment blocks in a Dwarka sector with parked scooters, trees and a small park, residents walking, calm weekday morning. |
| `dwarka-expressway.jpg` | An elevated eight-lane expressway curving past modern Gurugram high-rise towers at golden hour, light traffic, wide aerial shot. |
| `society-membership-l-zone.jpg` | An Indian cooperative housing society gate and garden with a notice board (blank), a small group of residents talking, apartments in the background, friendly community feel. |
| `home-loan-checklist.jpg` | Top-down view of a desk with a house-shaped key chain, folder of documents, calculator, pen and a cup of tea, soft window light (no readable text). |

## 4. Agar AI se nahi banana: Google / free sites se

Search karte waqt ye words use karo, aur **sirf free-to-use** photos chuno (Unsplash, Pexels, Pixabay):

- `Dwarka Delhi apartments`, `Gurgaon high rise apartments`, `DDA flats Delhi`, `Indian society gate apartment`
- `Indian family new home keys`, `Indian bank officer home loan`, `Delhi metro train station`

Download ke baad naam upar ke table jaisa rakho aur sahi folder mein daalo.

## 5. Logo / Board / Banner ke liye prompts

**A. Text wala official logo (board ya banner ke liye)**

> Professional real-estate signboard logo, wordmark only, bold uppercase "PANDIT ESTATE" in a strong geometric sans-serif (like Poppins ExtraBold), deep forest green (#0a3b2a) letters with a thin red (#c1121f) underline bar, tagline "PROPERTY DEALERS & CONSULTANTS" in small spaced capitals, a simple roofline icon above the letters in red, clean white background, flat vector style, high contrast, readable from 50 metres, no gradients, no photos, no 3D, centered layout, 3:1 horizontal format.

**B. Poora signboard / flex banner (3:1)**

> Horizontal shop signboard design, 3:1, deep green background, large white text "PANDIT ESTATE", red ribbon with white text "SALE ✱ PURCHASE ✱ RENTING", below it a white line "DDA Plots · Society Flats · DDA Flats · SFS Flats · Commercial Plots · Land in L-Zone · Society Membership in L-Zone", bottom strip in white with large green phone numbers "+91 98110 93769 | +91 88517 91516" and small address "Plot No. 5, Sector 19, Dwarka, New Delhi 110075 (Near Vardhman Crown Mall)", owner name "Suresh Bhardwaj", clean flat vector layout, very legible, print-ready, no photos.

**C. Square logo (social media profile)**

> Square app-style logo, rounded green square, white bold letters "PE" with a red roofline above, flat vector, minimal.

Maine ek taiyaar text logo aur signboard bhi bana diya hai: `public/branding/` folder dekho.

## 6. Baad mein

Images folder mein daalne ke baad page refresh karo. Agar kisi image ka size ya crop theek na lage to file ka naam
bata dena, main crop adjust kar dunga.
