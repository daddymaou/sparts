/**
 * Static site data for Spare Parts.
 * Keep this file free of side effects — pure data only.
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} kind
 * @property {string} description
 * @property {string} story
 * @property {string[]} stack
 * @property {string} image
 * @property {string|null} video
 * @property {string} href
 * @property {string} tilt
 *
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} tag
 * @property {string} date
 * @property {string} publishedAt
 * @property {string} body
 *
 * @typedef {Object} Photo
 * @property {string} file
 * @property {string} alt
 */

/** Base path for all media — change in one place. */
const PHOTOS_BASE = "assets/media/photos/";
const VIDEOS_BASE = "assets/media/video/";

/** @type {Project[]} */
export const projects = [
  {
    id: "queue-party",
    title: "Queue Party",
    kind: "small tool",
    description:
      "A tiny visual queue for teams that have more tasks than patience. It started as a Saturday sketch.",
    story:
      "The first version lost messages whenever the browser sneezed. We learned to separate what the interface says from what the state actually knows. Still small. Much less haunted.",
    stack: ["javascript", "local storage"],
    image: PHOTOS_BASE + "whiteboard.webp",
    video: null,
    href: "#",
    tilt: "-2deg",
  },
  {
    id: "yaba-weather",
    title: "Yaba Weather",
    kind: "side project",
    description:
      "A weather page with enough neighbourhood context to make the forecast feel less like a spreadsheet.",
    story:
      "The useful bit was not the temperature. It was admitting that ‘rain later’ can mean five very different things depending on whether you are walking, driving, or trying to dry laundry.",
    stack: ["fetch", "css", "maps"],
    image: PHOTOS_BASE + "street-light.webp",
    video: VIDEOS_BASE + "moving-city.mp4",
    href: "#",
    tilt: "2deg",
  },
  {
    id: "pantry-list",
    title: "The Pantry List",
    kind: "prototype",
    description:
      "A shared grocery list for a flat where everyone remembers the pepper and nobody remembers the detergent.",
    story:
      "We built it from a phone hotspot during a power cut. The sync model was very optimistic. The argument about who finished the suya was less solvable.",
    stack: ["pwa", "indexeddb"],
    image: PHOTOS_BASE + "shared-table.webp",
    video: null,
    href: "#",
    tilt: "-1deg",
  },
  {
    id: "briefly",
    title: "Briefly",
    kind: "experiment",
    description:
      "A calmer way to turn a long voice note into a short list of things someone can actually do.",
    story:
      "The first button had five words on it. We removed four. That was the entire product lesson for the week.",
    stack: ["web audio", "prototype"],
    image: PHOTOS_BASE + "late-deploy.webp",
    video: null,
    href: "#",
    tilt: "1deg",
  },
];

/** @type {Note[]} */
export const notes = [
  {
    id: "deploy-hard-part",
    title: "The deploy was not the hard part",
    tag: "shipping",
    date: "last Friday",
    publishedAt: "2025-03-14",
    body: "Deploying is easy until the thing is real enough for another human to depend on it. Then every small assumption starts knocking on the door.",
  },
  {
    id: "data-bundles",
    title: "Data bundles are a product requirement",
    tag: "web",
    date: "after a hotspot",
    publishedAt: "2025-03-07",
    body: "A page can be beautiful and still be rude. If it burns through somebody’s bundle before the useful bit appears, we have made the wrong trade.",
  },
  {
    id: "group-chat-knows",
    title: "What the group chat knows",
    tag: "people",
    date: "between replies",
    publishedAt: "2025-02-28",
    body: "The best documentation in a small team is often a sentence somebody types while trying to help. The second best is copying that sentence into the actual repo.",
  },
  {
    id: "bug-is-a-story",
    title: "A bug is a little story",
    tag: "debugging",
    date: "with coffee",
    publishedAt: "2025-02-21",
    body: "Every bug has a plot. There is a setup, a bad assumption, and usually one line that looked too innocent to question. Debugging is reading the story backwards.",
  },
  {
    id: "building-during-nepa",
    title: "On building during NEPA",
    tag: "real life",
    date: "generator hour",
    publishedAt: "2025-02-14",
    body: "The generator is not a metaphor. It is loud, it is expensive, and it has opinions about your video call. It also teaches you to save your work before the dramatic bit.",
  },
  {
    id: "button-can-wait",
    title: "The button can wait",
    tag: "design",
    date: "from the margin",
    publishedAt: "2025-02-07",
    body: "We like adding buttons because they feel like progress. Sometimes the honest interface is a note that says: this part is still being figured out.",
  },
];

/**
 * Real tags only. The UI prepends "all" itself.
 * @type {string[]}
 */
export const tags = [
  "shipping",
  "web",
  "people",
  "debugging",
  "real life",
  "design",
];

/** @type {Photo[]} */
export const photos = [
  { file: PHOTOS_BASE + "desk-laptop.webp",   alt: "Desk with a laptop and one stubborn tab open" },
  { file: PHOTOS_BASE + "blue-screen.webp",   alt: "Blue light from a screen on a small task" },
  { file: PHOTOS_BASE + "shared-table.webp",  alt: "People gathered around a shared work table" },
  { file: PHOTOS_BASE + "team-room.webp",     alt: "A room where ideas start moving" },
  { file: PHOTOS_BASE + "street-light.webp",  alt: "City street lights at dusk" },
  { file: PHOTOS_BASE + "city-motion.webp",   alt: "Blurred city motion at street level" },
  { file: PHOTOS_BASE + "office-window.webp", alt: "A quiet corner beside an office window" },
  { file: PHOTOS_BASE + "hands-keyboard.webp",alt: "Hands on a keyboard, working the actual problem" },
  { file: PHOTOS_BASE + "late-deploy.webp",   alt: "Friday deploy face" },
  { file: PHOTOS_BASE + "code-sprint.webp",   alt: "One more commit before the day ends" },
  { file: PHOTOS_BASE + "whiteboard.webp",    alt: "A whiteboard covered in the good messy bit" },
  { file: PHOTOS_BASE + "laptop-notes.webp",  alt: "Paper notes beside a working laptop" },
  { file: PHOTOS_BASE + "desk-plant.webp",    alt: "A small desk plant waiting patiently" },
  { file: PHOTOS_BASE + "bright-office.webp", alt: "A borrowed table during a useful hour" },
  { file: PHOTOS_BASE + "coffee-code.webp",   alt: "Coffee and code on a desk" },
  { file: PHOTOS_BASE + "workshop.webp",      alt: "Making space before making things" },
  { file: PHOTOS_BASE + "night-road.webp",    alt: "An empty road after the traffic clears" },
  { file: PHOTOS_BASE + "night-desk.webp",    alt: "A desk lit late at night" },
  { file: PHOTOS_BASE + "headphones.webp",    alt: "Headphones on, deep in focus" },
  { file: PHOTOS_BASE + "phone-hotspot.webp", alt: "A phone acting as a hotspot beside a laptop" },
];

/** @type {string[]} */
export const excuses = [
  "The build saw the rain and decided to become a puddle.",
  "It worked on my machine. My machine has since left the country.",
  "NEPA cut the light exactly when the CSS started behaving.",
  "The API is shy. It returns only when nobody is watching.",
  "The hotspot has entered a period of personal reflection.",
  "A semicolon looked at me funny and I lost the afternoon.",
  "The test passed because it has not met production yet.",
  "The laptop fan is now a small helicopter.",
  "We deployed on Friday. This is between us.",
  "The database is thinking about what it wants to be.",
  "The bug is not fixed, it is simply hiding behind the modal.",
  "The router has chosen a new spiritual path.",
  "The browser cached a version from before I knew better.",
  "I renamed the variable and forgot to rename the thought.",
  "The build is fine. The build is also lying.",
  "Someone unplugged the thing that was making the thing work.",
  "The network took one look at the payload and went to buy bread.",
  "The feature is waiting for a meeting to explain itself.",
  "I fixed one bug and three cousins arrived.",
  "The logs are speaking in tongues.",
  "A package update entered the repo without knocking.",
  "The staging environment has stage fright.",
  "The pull request is emotionally unavailable.",
  "The laptop is running on fumes and vibes.",
  "There is a typo in a config file. It owns the whole system.",
  "The screen is dark but the fans are still employed.",
  "The code is correct. The requirements have changed shape.",
  "The server is up. The server has no idea why.",
  "I opened DevTools and the problem got shy.",
  "The queue is moving, just at the speed of Lagos traffic.",
];

/**
 * Flat list of bug labels for the lab toy.
 * Kept as strings because the UI only needs labels.
 * @type {string[]}
 */
export const bugs = [
  "mysterious 500",
  "tiny spacing issue",
  "forgotten loading state",
  "one angry webhook",
  "silent form failure",
  "misaligned modal",
  "flaky test",
  "stale cache",
];