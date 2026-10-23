// Everything on the Art page. The index (app/art/page.tsx) and each piece's
// page (app/art/[slug]/page.tsx) read from this list.
//
// Pieces run from public/works/<slug>/index.html inside a frame. To add one:
//   1. Put its files in public/works/<slug>/ (libraries go in public/works/_lib/).
//   2. Add a thumbnail at public/art/thumbs/<slug>.webp (about 1200px wide).
//   3. Add an entry below.
//
// The `note` paragraphs are drafts describing what each piece does. Rewrite
// them in your own voice: what you were after, how it works, what's next.

export type SeriesId = 'portraits' | 'decks';

export interface Artwork {
  slug: string;
  title: string;
  year: number;
  /** Materials, the way a wall label lists them. */
  medium: string;
  /** How a visitor interacts with it. */
  input: string;
  /** One line for the index. */
  summary: string;
  /** A few short paragraphs for the piece's page. */
  note: string[];
  status: 'work' | 'in-progress';
  series?: SeriesId;
  /** Where the live piece is served from; omit if there is nothing to run yet. */
  src?: string;
  /** Pieces laid out as long pages scroll inside their frame. */
  scrolls?: boolean;
  /** Shown under the frame, e.g. "move your cursor". */
  hint?: string;
}

export const SERIES: Record<SeriesId, { title: string; blurb: string }> = {
  portraits: { title: 'Portraits', blurb: 'Self-portraits drawn by code' },
  decks: { title: 'Decks', blurb: 'Two worlds painted as playing cards' },
};

export const artworks: Artwork[] = [
  {
    slug: 'all-eyes-on-you',
    title: 'All Eyes On You',
    year: 2026,
    medium: 'JavaScript, WebGL2',
    input: 'cursor · camera',
    summary: 'A wall of eyes that follow you, lose interest, and fall asleep.',
    note: [
      'A wall of up to 340 eyes around one large eye. Each has its own iris and skin tone, and each keeps its own attention: it darts, blinks, follows whoever is in front of it, gets bored, looks away, and eventually falls asleep.',
      'It is built for a webcam, so that in a room the eyes track the faces in front of them. In the browser it follows your cursor instead.',
      'Next: the camera version as an installation.',
    ],
    status: 'work',
    src: '/works/all-eyes-on-you/index.html',
    hint: 'move your cursor',
  },
  {
    slug: 'self-portrait',
    title: 'Self Portrait',
    year: 2026,
    medium: 'JavaScript, Canvas',
    input: 'click to redraw',
    summary: 'A marker portrait after Picasso and Miró; every redraw wobbles differently.',
    note: [
      'A marker drawing after Picasso and Miró: a blue dome, an orange face, and a cigarette whose smoke curls up into a broken pink star.',
      'Every line is drawn with a little jitter, so each redraw is a slightly different hand drawing the same face.',
    ],
    status: 'work',
    series: 'portraits',
    src: '/works/self-portrait/index.html',
    hint: 'press redraw',
  },
  {
    slug: 'self-portrait-traced',
    title: 'Self Portrait, Traced',
    year: 2026,
    medium: 'JavaScript, Canvas, traced vectors',
    input: 'click to draw',
    summary: 'The same few marks, rearranged into a new face every time.',
    note: [
      'The marks of a self-portrait, traced as vectors and rearranged into a new face each time it is drawn. Two styles: Marker, after Picasso and Miró, and Planes, in layered chisel markers.',
      'Every portrait you draw is kept in a small archive on the wall beside the frame, in your own browser.',
    ],
    status: 'work',
    series: 'portraits',
    src: '/works/self-portrait-traced/index.html',
    scrolls: true,
    hint: 'draw a new portrait',
  },
  {
    slug: 'never-sleeps',
    title: 'Never Sleeps',
    year: 2026,
    medium: 'JavaScript, three.js, 54 painted cards',
    input: 'click · drag · keyboard',
    summary: 'New York as a deck of cards, across four boroughs, by day and by night.',
    note: [
      'A deck of 54 painted cards about New York: four boroughs, by day and by night, laid on a dark table.',
      'Spread the deck, pick up a card to look at it closely, flip it, shuffle, or let it play a guided tour. The sound is synthesised live in the browser.',
    ],
    status: 'work',
    series: 'decks',
    src: '/works/never-sleeps/index.html',
    hint: 'click the deck to spread it',
  },
  {
    slug: 'almanac',
    title: 'Almanac',
    year: 2026,
    medium: 'JavaScript, three.js, 54 painted cards',
    input: 'click · drag · keyboard',
    summary: 'A year as a deck of cards: 52 weeks, four seasons.',
    note: [
      'The sister deck to Never Sleeps: a year painted as 52 weeks across four seasons, plus the jokers.',
      'Same table and same gestures. Spread it, pick a week, turn it over.',
    ],
    status: 'work',
    series: 'decks',
    src: '/works/almanac/index.html',
    hint: 'click the deck to spread it',
  },

  // ---- in progress ------------------------------------------------------------
  {
    slug: 'butterflies',
    title: 'Butterflies',
    year: 2026,
    medium: 'Projection mapping, camera',
    input: 'your hand',
    summary: 'Projected butterflies that land on your hand when you hold it up to the wall.',
    note: ['A demo video is coming soon.'],
    status: 'in-progress',
  },
  {
    slug: 'residual-stream-studies',
    title: 'Studies for a light sculpture',
    year: 2026,
    medium: 'JavaScript, Canvas, simulated activations',
    input: 'sliders · text',
    summary: 'Sketches toward a sculpture lit from inside by a language model’s residual stream.',
    note: [
      'Seven interactive studies of simulated language-model activations: static grids, watercolour glazes, a loom, rivers, clouds, a coherence cliff and growth rings.',
      'They are sketches toward a light sculpture: you talk to a model, and the emotions read from its residual stream light up different parts of the sculpture from inside, with the lights mixing where they meet.',
    ],
    status: 'in-progress',
    src: '/works/residual-stream-studies/index.html',
    scrolls: true,
    hint: 'scroll through the studies',
  },
  {
    slug: 'checkpoints',
    title: 'Checkpoints',
    year: 2026,
    medium: 'JavaScript, p5.js',
    input: 'watch · (camera and voice in a room)',
    summary: 'A face made of network nodes that grows up through training.',
    note: [
      'A face made of 117 network nodes that grows up through training stages (babbling, induction, alignment, deprecation) with live loss and entropy readouts.',
      'In a room it sees you through a camera and answers what you say in a voice that matches its age. Here it lives a simulated two-minute lifetime.',
      'Still an open question: how best to show a model growing up.',
    ],
    status: 'in-progress',
    src: '/works/checkpoints/index.html',
  },
];

export const works = () => artworks.filter(a => a.status === 'work');
export const inProgress = () => artworks.filter(a => a.status === 'in-progress');
export const bySeries = (id: SeriesId) => works().filter(a => a.series === id);
export const getArtwork = (slug: string) => artworks.find(a => a.slug === slug);
export const thumbFor = (slug: string) => `/art/thumbs/${slug}.webp`;
/** Pieces with something to run get their own page. */
export const hasPage = (a: Artwork) => Boolean(a.src);
