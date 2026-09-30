import type { GalleryImage } from '@/types/gallery'

/*
 * Built-in portfolio shown on the Gallery page alongside anything published through
 * the gallery API. Photos live in /public/images/gallery and are sourced from Unsplash under
 * the Unsplash License (free for commercial use) — the Unsplash photo id is kept next
 * to each entry so the original can always be traced.
 */

export interface GalleryPhoto extends GalleryImage {
  width: number
  height: number
}

export const GALLERY_CATEGORIES = ['French & Classic', 'Nude & Minimal', 'Bold Art', 'Seasonal'] as const

function photo(
  slug: string,
  category: (typeof GALLERY_CATEGORIES)[number],
  altText: string,
  width: number,
  height: number,
): GalleryPhoto {
  return { id: `portfolio-${slug}`, url: `/images/gallery/${slug}.jpg`, category, altText, width, height }
}

export const portfolio = {
  classicFrenchDaisy: photo('classic-french-daisy', 'French & Classic', 'Classic French tips holding a daisy', 900, 1350), // 3AQ_VHXfjEg
  whiteTipsMonstera: photo('white-tips-monstera', 'French & Classic', 'Crisp white French tips on a monstera leaf', 900, 600), // CCFWTMnRWsE
  frenchGlitterAccent: photo('french-glitter-accent', 'French & Classic', 'Nude French set with glitter accent nails', 900, 675), // 0xj_lHj5NS0
  frenchLilacGlitter: photo('french-lilac-glitter', 'French & Classic', 'Almond French tips with lilac glitter', 900, 1600), // samx9TulLD0
  marbledLilacTips: photo('marbled-lilac-tips', 'French & Classic', 'Milky white almonds with marbled lilac tips', 900, 1600), // v3-AHQ63Wws
  softNudeSquare: photo('soft-nude-square', 'Nude & Minimal', 'Soft nude square manicure', 900, 600), // DtoWpHt2_d8
  sheerPinkAlmond: photo('sheer-pink-almond', 'Nude & Minimal', 'Sheer pink almond nails', 900, 1200), // hvqHtZqNMeI
  nudeGlossSquare: photo('nude-gloss-square', 'Nude & Minimal', 'High-gloss nude square nails', 900, 1436), // vtQHwU4F13s
  mochaChromeAlmond: photo('mocha-chrome-almond', 'Nude & Minimal', 'Mocha chrome almond nails', 900, 1350), // OIEU0eopPT4
  nudeMinimalArt: photo('nude-minimal-art', 'Nude & Minimal', 'Nude set with fine minimal line art', 900, 1350), // jDuY6Zk7EYk
  naturalOmbre: photo('natural-ombre', 'Nude & Minimal', 'Natural baby-boomer ombré nails', 900, 1350), // FkMeLeKaUEU
  stilettoStatement: photo('stiletto-statement', 'Bold Art', 'Long stiletto nails with hand-painted detail', 900, 1600), // 51-4BSipn7E
  abstractColourPop: photo('abstract-colour-pop', 'Bold Art', 'Abstract colour-pop nail art', 900, 1350), // jRXxNpA6d_k
  tortoiseshellNoir: photo('tortoiseshell-noir', 'Bold Art', 'Tortoiseshell and glossy black nails', 900, 1350), // tXwBDZS2JxQ
  navyGoldMarble: photo('navy-gold-marble', 'Bold Art', 'Navy, gold and white marble nail art', 900, 1125), // v9agFscJCIE
  cobaltFrenchAlmond: photo('cobalt-french-almond', 'Bold Art', 'Cobalt almonds with silver French tips', 900, 1600), // _jqRpNc96Kg
  blueOmbreSquare: photo('blue-ombre-square', 'Bold Art', 'Blue-to-white ombré square nails', 900, 1600), // olHWqqK7OVw
  winterForest: photo('winter-forest', 'Seasonal', 'Hand-painted winter forest nail art', 900, 700), // zZ6Y78ANoEI
  redLoveScript: photo('red-love-script', 'Seasonal', 'Red Valentine nails with hand-lettered “love”', 900, 600), // r-Ej0NQmFlQ
  heartsAndDots: photo('hearts-and-dots', 'Seasonal', 'White and pink hearts-and-dots nail art', 900, 1125), // qVZNmigGmFE
  mauveGlitterMix: photo('mauve-glitter-mix', 'Seasonal', 'Mauve, white and silver glitter mix', 900, 900), // Y14F-1vzVds
} satisfies Record<string, GalleryPhoto>

/** Display order for the gallery wall — alternates tall and wide shots so the columns stay balanced. */
export const portfolioPhotos: GalleryPhoto[] = [
  portfolio.classicFrenchDaisy,
  portfolio.abstractColourPop,
  portfolio.softNudeSquare,
  portfolio.navyGoldMarble,
  portfolio.winterForest,
  portfolio.mochaChromeAlmond,
  portfolio.tortoiseshellNoir,
  portfolio.whiteTipsMonstera,
  portfolio.heartsAndDots,
  portfolio.sheerPinkAlmond,
  portfolio.stilettoStatement,
  portfolio.redLoveScript,
  portfolio.marbledLilacTips,
  portfolio.nudeGlossSquare,
  portfolio.frenchGlitterAccent,
  portfolio.cobaltFrenchAlmond,
  portfolio.mauveGlitterMix,
  portfolio.nudeMinimalArt,
  portfolio.blueOmbreSquare,
  portfolio.frenchLilacGlitter,
  portfolio.naturalOmbre,
]

export interface LookbookDesign {
  name: string
  tagline: string
  description: string
  details: { label: string; value: string }[]
  photo: GalleryPhoto
  accentPhoto?: GalleryPhoto
}

/** The pages of the design lookbook, in reading order. */
export const lookbookDesigns: LookbookDesign[] = [
  {
    name: 'Classic French',
    tagline: 'The timeless clean line',
    description:
      'A soft sheer base finished with a crisp white smile line. Understated enough for every day, polished enough for the big ones — and it can be dressed up with a single glitter accent.',
    details: [
      { label: 'Shapes', value: 'Square, squoval, almond' },
      { label: 'Finish', value: 'High gloss' },
      { label: 'Twist', value: 'Glitter accent or micro-tip' },
    ],
    photo: portfolio.classicFrenchDaisy,
    accentPhoto: portfolio.frenchGlitterAccent,
  },
  {
    name: 'Soft Nude',
    tagline: 'Your nails, but better',
    description:
      'Sheer pinks and milky nudes matched to your skin tone for a healthy, quietly expensive look. The easiest set to wear and the hardest to get tired of.',
    details: [
      { label: 'Shapes', value: 'Short square, soft almond' },
      { label: 'Finish', value: 'Glossy or satin' },
      { label: 'Twist', value: 'Fine line or tiny dot art' },
    ],
    photo: portfolio.sheerPinkAlmond,
    accentPhoto: portfolio.nudeGlossSquare,
  },
  {
    name: 'Chrome & Glazed',
    tagline: 'A mirror-soft sheen',
    description:
      'Chrome powder buffed over a rich base for that glazed, pearly glow. Mocha, champagne and pearl tones catch the light without shouting.',
    details: [
      { label: 'Shapes', value: 'Almond, oval' },
      { label: 'Finish', value: 'Chrome / pearl' },
      { label: 'Twist', value: 'Chrome over nude or colour' },
    ],
    photo: portfolio.mochaChromeAlmond,
  },
  {
    name: 'Ombré & Gradient',
    tagline: 'Colour that melts',
    description:
      'Two shades blended seamlessly from cuticle to tip — from a barely-there baby-boomer fade to bold blues that drift into white.',
    details: [
      { label: 'Shapes', value: 'Square, coffin, almond' },
      { label: 'Finish', value: 'High gloss' },
      { label: 'Twist', value: 'Any two-tone pairing' },
    ],
    photo: portfolio.blueOmbreSquare,
    accentPhoto: portfolio.naturalOmbre,
  },
  {
    name: 'Tortoiseshell',
    tagline: 'Warm, layered, vintage',
    description:
      'Built up layer by layer in amber and espresso for real depth, then paired with glossy black for contrast. A cool-weather favourite.',
    details: [
      { label: 'Shapes', value: 'Short square, oval' },
      { label: 'Finish', value: 'Deep gloss' },
      { label: 'Twist', value: 'Mix with solid black or nude' },
    ],
    photo: portfolio.tortoiseshellNoir,
  },
  {
    name: 'Marble & Gold',
    tagline: 'Stone, veins and gilding',
    description:
      'Hand-veined marble effects finished with gold leaf or foil. Every nail comes out a little different, which is exactly the point.',
    details: [
      { label: 'Shapes', value: 'Almond, square' },
      { label: 'Finish', value: 'Gloss with metallic foil' },
      { label: 'Twist', value: 'Navy, lilac or classic white' },
    ],
    photo: portfolio.navyGoldMarble,
    accentPhoto: portfolio.marbledLilacTips,
  },
  {
    name: 'Abstract Art',
    tagline: 'Wearable little canvases',
    description:
      'Free-hand shapes, colour blocking and brush strokes — made to order around your favourite colours, your outfit or just your mood.',
    details: [
      { label: 'Shapes', value: 'Any — stiletto loves it' },
      { label: 'Finish', value: 'Gloss or matte' },
      { label: 'Twist', value: 'Accent nails or full set' },
    ],
    photo: portfolio.abstractColourPop,
    accentPhoto: portfolio.stilettoStatement,
  },
  {
    name: 'Hearts & Romance',
    tagline: 'Sweet, never too much',
    description:
      'Tiny hearts, polka dots and hand-lettered details in blush, cherry and white. Made for Valentine’s, anniversaries — or any day you feel like it.',
    details: [
      { label: 'Shapes', value: 'Almond, short square' },
      { label: 'Finish', value: 'High gloss' },
      { label: 'Twist', value: 'Lettering or a single accent' },
    ],
    photo: portfolio.heartsAndDots,
    accentPhoto: portfolio.redLoveScript,
  },
  {
    name: 'Seasonal Hand-Painted',
    tagline: 'Little scenes for every season',
    description:
      'Snowy forests, glittering winter mauves, autumn florals — painted by hand and changed with the seasons, so there is always something new to try.',
    details: [
      { label: 'Shapes', value: 'Square, oval' },
      { label: 'Finish', value: 'Gloss with glitter or matte' },
      { label: 'Twist', value: 'One feature nail per hand' },
    ],
    photo: portfolio.winterForest,
    accentPhoto: portfolio.mauveGlitterMix,
  },
]
