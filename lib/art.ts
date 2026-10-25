// Everything in the art section. The index (app/art/page.tsx), the Works menu,
// and each piece's page (app/art/[slug]/page.tsx) read from this list.
//
// Pieces run from public/works/<slug>/index.html inside a frame. To add one:
//   1. Put its files in public/works/<slug>/ (libraries go in public/works/_lib/).
//   2. Optionally add a still at public/art/thumbs/<slug>.webp (about 1200px wide).
//   3. Add an entry below.
//
// Texts marked DRAFT were written from what each piece does; rewrite them in
// your own voice.

// DRAFT: the introduction at the top of /art. Say what you are working with
// right now and what you are experimenting with.
export const ART_INTRO = {
  text: 'I make interactive pieces with code. Most of them live in the browser, built with JavaScript, WebGL, canvas, and three.js. Away from the screen I work with projectors and cameras, so that a piece can see the people standing in front of it. Lately I have been using what happens inside language models, their residual streams and activations, as material for light, colour, and movement.',
  workingIn: 'JavaScript · WebGL · three.js · canvas · projectors · cameras',
  experimenting: 'language-model internals as light, colour, and movement',
};

export type ArtKind =
  | 'portrait'   // the Self Portrait: a new portrait drawn for every visit
  | 'live'       // a finished piece that runs live in a frame
  | 'experiment'; // unfinished on purpose: video, images, notes

export interface Artwork {
  slug: string;
  title: string;
  year: number;
  kind: ArtKind;
  /** Materials, the way a wall label lists them. */
  medium: string;
  /** How a visitor interacts with it. */
  input: string;
  /** One line for the index and the Works menu. */
  summary: string;
  /** The text on the piece's own page, as paragraphs. Use `## ` for a subheading. */
  text: string[];
  /** Where the live piece is served from, if there is something to run. */
  src?: string;
  /** Shown under the frame, e.g. "move your cursor". */
  hint?: string;
  /** Frame shape on the piece's page. */
  frame?: 'wide' | 'tall' | 'screen';
}

export const artworks: Artwork[] = [
  {
    slug: 'self-portrait',
    title: 'Self Portrait',
    year: 2026,
    kind: 'portrait',
    medium: 'Marker and ink on paper, traced and redrawn in JavaScript',
    input: 'refresh for another',
    summary: 'A portrait of me that is drawn new for every visit and never repeats.',
    // DRAFT
    text: [
      'A marker drawing of me, after Picasso and Miró: a dome, a face, eyes, brows, hair, and a cigarette whose smoke curls away. I traced its marks, and the code rearranges them: colours, tilt, gaze, brows, hair, and smoke all change.',
      'Every visit draws a new portrait, including mine. There are 4,294,967,296 of them, and only one is the original drawing. Nothing is saved: the face you are looking at now exists only for you, and it is gone when you refresh.',
      'That is the point. There is no single version of me to show you, only a self that keeps being redrawn: many sides, none of them final, all of them me.',
    ],
    src: '/works/portrait/index.html',
  },
  {
    slug: 'all-eyes-on-you',
    title: 'All Eyes On You',
    year: 2026,
    kind: 'live',
    medium: 'JavaScript, WebGL2',
    input: 'cursor · camera',
    summary: 'A wall of eyes that notice you, follow you, lose interest, and fall asleep.',
    // DRAFT
    text: [
      'We are watched all the time, by cameras, by feeds, and by models that learn from what we do, but we almost never see the watcher. All Eyes On You makes the watching visible, and a little absurd: a crowd of eyes that notices you, follows you, and then, like any audience, loses interest.',
      'Being seen here is not permanent. Attention drifts, gets bored, and falls asleep, and the piece asks what it feels like to be the thing being looked at.',
      '## How the eyes think',
      'The wall holds up to 340 eyes around one large eye, each with its own iris and skin tone. Every eye keeps its own attention: it darts between points (saccades), blinks, settles on whoever is in front of it, and, if nothing new happens, gets bored, looks away, and eventually closes. Move suddenly and they wake up again.',
      'It is rendered in WebGL2, with the attention of each eye simulated separately so the crowd never moves in lockstep.',
      '## The camera version',
      'It was made for a webcam: in a room, the eyes track the faces of the people standing in front of the screen. In the browser they follow your cursor instead.',
    ],
    src: '/works/all-eyes-on-you/index.html',
    hint: 'move your cursor',
    frame: 'wide',
  },
  {
    slug: 'never-sleeps',
    title: 'Never Sleeps',
    year: 2026,
    kind: 'live',
    medium: 'JavaScript, three.js, 54 painted cards',
    input: 'click · drag · keyboard',
    summary: 'New York as a deck of cards: four boroughs, by day and by night.',
    // DRAFT
    text: [
      'A deck of 54 painted cards about New York: four boroughs, by day and by night, laid on a dark table.',
      'Spread the deck, pick up a card to look at it closely, flip it, shuffle, or let it play a guided tour. The sound is synthesised live in the browser.',
    ],
    src: '/works/never-sleeps/index.html',
    hint: 'click the deck to spread it',
    frame: 'screen',
  },
  {
    slug: 'almanac',
    title: 'Almanac',
    year: 2026,
    kind: 'live',
    medium: 'JavaScript, three.js, 54 painted cards',
    input: 'click · drag · keyboard',
    summary: 'A year as a deck of cards: 52 weeks, four seasons.',
    // DRAFT
    text: [
      'The sister deck to Never Sleeps: a year painted as 52 weeks across four seasons, plus the jokers.',
      'Same table and same gestures. Spread it, pick a week, turn it over.',
    ],
    src: '/works/almanac/index.html',
    hint: 'click the deck to spread it',
    frame: 'screen',
  },

  // ---- experiments: placeholders until the media and notes are added --------
  {
    slug: 'butterflies',
    title: 'Butterflies',
    year: 2026,
    kind: 'experiment',
    medium: 'Projection mapping, camera',
    input: 'your hand',
    summary: 'Projected butterflies that land on your hand when you hold it up to the wall.',
    text: [],
  },
  {
    slug: 'light-sculpture',
    title: 'A sculpture lit from inside',
    year: 2026,
    kind: 'experiment',
    medium: 'Language model, light, simulated activations',
    input: 'talk to it',
    summary: 'A model’s emotions, read from its residual stream, lighting up a sculpture from inside.',
    text: [],
    src: '/works/residual-stream-studies/index.html',
    hint: 'the studies: scroll through them',
  },
  {
    slug: 'checkpoints',
    title: 'Checkpoints',
    year: 2026,
    kind: 'experiment',
    medium: 'JavaScript, p5.js',
    input: 'camera and voice in a room',
    summary: 'A face made of network nodes that grows up through training.',
    text: [],
    src: '/works/checkpoints/index.html',
    hint: 'a simulated lifetime',
  },
];

export const works = () => artworks.filter(a => a.kind !== 'experiment');
export const experiments = () => artworks.filter(a => a.kind === 'experiment');
export const getArtwork = (slug: string) => artworks.find(a => a.slug === slug);
export const thumbFor = (slug: string) => `/art/thumbs/${slug}.webp`;

/** The next piece in reading order, for "next →" at the bottom of each page. */
export function nextArtwork(slug: string) {
  const i = artworks.findIndex(a => a.slug === slug);
  return artworks[(i + 1) % artworks.length];
}
