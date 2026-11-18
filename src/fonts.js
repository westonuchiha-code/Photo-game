// Sign fonts (SIL OFL Google fonts, bundled in assets/fonts by tools/get_fonts.py).
// main.js awaits `fontsReady` before building the world, so every canvas sign can use them.
// Use the F names in ctx.font, e.g. `ctx.font = \`64px ${F.condensed}\``, and fitText() to keep
// lettering inside its sign with even margins.
const FILES = [
  ['Bebas Neue', 'bebas-neue.woff2'], ['Archivo Black', 'archivo-black.woff2'], ['Bungee', 'bungee.woff2'],
  ['Shrikhand', 'shrikhand.woff2'], ['Righteous', 'righteous.woff2'], ['Permanent Marker', 'permanent-marker.woff2'],
  ['Caveat', 'caveat-bold.woff2', '700'], ['VT323', 'vt323.woff2'], ['Oswald', 'oswald-semibold.woff2', '600'],
  ['Roboto Condensed', 'roboto-condensed.woff2'], ['Cinzel', 'cinzel-bold.woff2', '700'], ['Pacifico', 'pacifico.woff2'],
  ['Alfa Slab One', 'alfa-slab-one.woff2'], ['Fredoka', 'fredoka-semibold.woff2', '600'], ['Black Ops One', 'black-ops-one.woff2'],
  ['Yuji Syuku', 'yuji-syuku.woff2'], ['Zen Antique', 'zen-antique.woff2'],
];
export const F = {
  condensed: '"Bebas Neue", "Oswald", sans-serif',       // tall shop / transit signage
  heavy: '"Archivo Black", sans-serif',                    // bold retail headers
  retro: '"Bungee", sans-serif',                           // retro shop fronts
  bubbly: '"Shrikhand", serif',                            // food brand logos
  seventies: '"Righteous", sans-serif',                    // old TV / radio shop
  marker: '"Permanent Marker", cursive',                   // hand-lettered paste-ups
  hand: '"Caveat", cursive',                               // handwriting notes
  led: '"VT323", monospace',                               // LED / LCD displays
  label: '"Oswald", sans-serif',                           // stickers, tags, headers
  small: '"Roboto Condensed", sans-serif',                 // fine print
  engraved: '"Cinzel", serif',                             // carved stone
  script: '"Pacifico", cursive',                           // welcome signs
  slab: '"Alfa Slab One", serif',                          // heavy-equipment decals
  rounded: '"Fredoka", sans-serif',                        // friendly / kids
  stencil: '"Black Ops One", sans-serif',                  // stencilled warnings
  brush: '"Yuji Syuku", serif',                            // Japanese brush lettering
  antique: '"Zen Antique", serif',                         // Japanese printed signs
};
export const fontsReady = Promise.all(FILES.map(([fam, file, weight]) => {
  const f = new FontFace(fam, `url(assets/fonts/${file})`, { weight: weight || '400' });
  return f.load().then((ff) => document.fonts.add(ff)).catch(() => null);
}));

// Draw text centred on (x, y) at the largest size <= size that fits maxW (letter-spacing in px optional).
export function fitText(c, text, x, y, maxW, size, family, { weight = '', spacing = 0, stroke = 0, align = 'center' } = {}) {
  let s = size;
  for (; s > 6; s -= 1) {
    c.font = `${weight} ${s}px ${family}`;
    const w = c.measureText(text).width + spacing * (text.length - 1);
    if (w <= maxW) break;
  }
  c.textAlign = align; c.textBaseline = 'middle';
  if ('letterSpacing' in c) c.letterSpacing = `${spacing}px`;
  if (stroke) c.strokeText(text, x, y);
  c.fillText(text, x, y);
  if ('letterSpacing' in c) c.letterSpacing = '0px';
  return s;
}
