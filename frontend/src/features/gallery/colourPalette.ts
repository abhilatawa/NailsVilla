/*
 * Polish shades shown in the Colour Palette booklet. These hex values describe nail
 * polish colours (content), not the site's brand palette — brand colours still live only
 * in styles/tokens.css. Shades are ordered lightest to deepest within each family.
 */

export interface Shade {
  name: string
  hex: string
}

export interface ColourFamily {
  name: string
  tagline: string
  description: string
  /** Metallic families get a foil sheen on their swatches. */
  finish?: 'metallic'
  shades: Shade[]
}

export const colourFamilies: ColourFamily[] = [
  {
    name: 'Reds',
    tagline: 'Classic, confident, always in season',
    description: 'From a bright poppy to a deep oxblood — the red that never goes out of style.',
    shades: [
      { name: 'Poppy', hex: '#e2393b' },
      { name: 'Scarlet', hex: '#d0202f' },
      { name: 'Cherry', hex: '#b3122e' },
      { name: 'Crimson', hex: '#9e1b32' },
      { name: 'Garnet', hex: '#7a1f2b' },
      { name: 'Oxblood', hex: '#5a1a22' },
    ],
  },
  {
    name: 'Pinks',
    tagline: 'Soft blush to bold fuchsia',
    description: 'Barely-there ballet pinks for every day, bubblegum and fuchsia when you want to be noticed.',
    shades: [
      { name: 'Ballet Slipper', hex: '#f4d3d8' },
      { name: 'Blush', hex: '#efb7c1' },
      { name: 'Rose Quartz', hex: '#e79aab' },
      { name: 'Bubblegum', hex: '#ef7fa6' },
      { name: 'Hot Pink', hex: '#e0457b' },
      { name: 'Fuchsia', hex: '#c21e6b' },
    ],
  },
  {
    name: 'Nudes',
    tagline: 'Matched to your skin tone',
    description: 'Clean, polished neutrals from porcelain to latte — we help you find the one that suits you.',
    shades: [
      { name: 'Porcelain', hex: '#f1e2d6' },
      { name: 'Shell', hex: '#ead0bf' },
      { name: 'Linen', hex: '#e4c9b6' },
      { name: 'Sand', hex: '#d9b99b' },
      { name: 'Almond', hex: '#cfa88a' },
      { name: 'Latte', hex: '#b88b6c' },
    ],
  },
  {
    name: 'Corals & Oranges',
    tagline: 'Warm and sun-kissed',
    description: 'Juicy peach, coral and tangerine for summer, burnt orange and terracotta for fall.',
    shades: [
      { name: 'Peach', hex: '#f6b894' },
      { name: 'Apricot', hex: '#f39c6b' },
      { name: 'Coral', hex: '#ef7a5e' },
      { name: 'Tangerine', hex: '#f0782f' },
      { name: 'Terracotta', hex: '#b5563f' },
      { name: 'Burnt Orange', hex: '#c85a1e' },
    ],
  },
  {
    name: 'Yellows',
    tagline: 'Butter, sunshine and honey',
    description: 'Pale butter for a soft pastel set through to golden mustard and honey for something richer.',
    shades: [
      { name: 'Butter', hex: '#f7e7a1' },
      { name: 'Lemon Chiffon', hex: '#f5e07a' },
      { name: 'Sunshine', hex: '#f6cf3b' },
      { name: 'Marigold', hex: '#eeb422' },
      { name: 'Mustard', hex: '#d4a017' },
      { name: 'Honey', hex: '#c8902a' },
    ],
  },
  {
    name: 'Greens',
    tagline: 'Fresh mint to deep forest',
    description: 'Mint and pistachio pastels, earthy sage and olive, and jewel-toned emerald and forest.',
    shades: [
      { name: 'Mint', hex: '#bfe3cf' },
      { name: 'Pistachio', hex: '#b5cf8a' },
      { name: 'Sage', hex: '#a8b89a' },
      { name: 'Olive', hex: '#6b7a3a' },
      { name: 'Emerald', hex: '#1f8a5b' },
      { name: 'Forest', hex: '#2f4f3a' },
    ],
  },
  {
    name: 'Blues',
    tagline: 'Powder sky to midnight navy',
    description: 'Airy powder and baby blues, bright cornflower and cobalt, and a teal and navy for depth.',
    shades: [
      { name: 'Powder Blue', hex: '#c9dcef' },
      { name: 'Baby Blue', hex: '#9cc3e6' },
      { name: 'Cornflower', hex: '#6a8fd6' },
      { name: 'Teal', hex: '#1f7a86' },
      { name: 'Cobalt', hex: '#1f4fbf' },
      { name: 'Navy', hex: '#1f2d56' },
    ],
  },
  {
    name: 'Purples',
    tagline: 'Lavender dreams to rich plum',
    description: 'Dreamy lavender and lilac, vivid orchid and violet, and moody plum and aubergine.',
    shades: [
      { name: 'Lavender', hex: '#d9c8ec' },
      { name: 'Lilac', hex: '#c3a6dc' },
      { name: 'Orchid', hex: '#b07cc6' },
      { name: 'Violet', hex: '#7f4bb0' },
      { name: 'Plum', hex: '#6a2d5f' },
      { name: 'Aubergine', hex: '#45243f' },
    ],
  },
  {
    name: 'Browns',
    tagline: 'Caramel, mocha and espresso',
    description: 'Cosy, grown-up browns — perfect on their own or under a chrome or tortoiseshell finish.',
    shades: [
      { name: 'Caramel', hex: '#a8734f' },
      { name: 'Cinnamon', hex: '#8e5431' },
      { name: 'Walnut', hex: '#7a5a45' },
      { name: 'Mocha', hex: '#6f4a3a' },
      { name: 'Chestnut', hex: '#5c3424' },
      { name: 'Espresso', hex: '#3e2a22' },
    ],
  },
  {
    name: 'Monochrome',
    tagline: 'Milky white to jet black',
    description: 'Crisp whites, soft greys and greige, and a true jet black — the backbone of French and graphic art.',
    shades: [
      { name: 'Milk', hex: '#f7f5f0' },
      { name: 'Cloud Grey', hex: '#d9d8d6' },
      { name: 'Greige', hex: '#b9ada1' },
      { name: 'Slate', hex: '#7c7f86' },
      { name: 'Charcoal', hex: '#3b3b3f' },
      { name: 'Jet Black', hex: '#121214' },
    ],
  },
  {
    name: 'Metallics',
    tagline: 'Pearl, chrome and foil',
    description: 'Light-catching pearl, champagne, silver and gold — worn solo or as an accent over any colour.',
    finish: 'metallic',
    shades: [
      { name: 'Pearl', hex: '#ece6dc' },
      { name: 'Champagne', hex: '#e2cfa8' },
      { name: 'Silver', hex: '#bfc3c8' },
      { name: 'Rose Gold', hex: '#c98f7a' },
      { name: 'Gold', hex: '#c9a24a' },
      { name: 'Bronze', hex: '#9c6b3c' },
    ],
  },
]
