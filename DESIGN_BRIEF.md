# Spare Parts — design brief

## The idea

Spare Parts is a small dev collective that feels like a shared desk, not a company lobby. The name comes from the drawer with the cables, adapters and one mysterious screw that nobody is willing to throw away. That drawer is a better metaphor for creative software work than a row of glossy feature cards.

The site is a notebook that escaped onto the internet. Pages look like they have been taped, annotated, dragged sideways, and reopened after a power cut. The copy uses Nigerian dev-life details without turning them into a costume: NEPA, data bundles, danfo, hotspots, traffic, suya, group chats, Friday deploys.

## Shape language

No uniform card system. There are:

- wobbly clip-path paper edges;
- rough borders made from SVG turbulence and displacement;
- tape strips with imperfect rotations;
- puffy buttons and irregular sticker tags;
- torn-ish image frames and polaroids;
- margin notes in Gochi Hand;
- a seeded-feeling but stable rotation rhythm in CSS selectors.

The custom `mark.svg` is a hand-built envelope mark, and the route icons are inline SVG rather than an icon pack.

## Type

- Fuzzy Bubbles is the loud display voice.
- Gochi Hand is the margin-note and annotation voice.
- Nunito is the readable body face.
- Martian Mono is reserved for terminal output, labels and tiny navigation notes.

All font files are local under `/fonts`, with licenses listed in `fonts/LICENSES.md`.

## Color

Day uses notebook cream, biro blue, danfo yellow, clay red and a small pink sticky-note accent. Night is a dark desk with warm paper, blue ink and a yellow lamp accent. It is a separate palette rather than a simple inverted theme.

The backgrounds use authored graph-paper and ruled-paper SVG patterns, not gradients. The Nigeria doodle and danfo board are original procedural/hand-drawn treatments.

## The connecting path

`js/path.js` reads real card positions with `getBoundingClientRect()`, builds one cubic Bézier path, and uses SVG path length for the progress stroke and the tiny yellow danfo bus. It is rebuilt after resize and font readiness. On mobile it becomes a single rail. The same navigation vocabulary continues between documents with `@view-transition { navigation: auto; }`, with normal page navigation as the fallback.

## NEPA and low-data

NEPA mode is an optional, dismissible effect. It does not trap anyone: the switch, prompt and accessible generator button all work without a pointer. Low-data mode removes local video sources, leaves the poster, and displays a small saving estimate based on the actual shipped MP4 sizes.

## Why it should feel human

The site does not claim clients, metrics, testimonials or a giant team. Work cards are clearly editable from one content file. The jokes are specific and a little uneven. The useful information is allowed to sit beside the scribble.