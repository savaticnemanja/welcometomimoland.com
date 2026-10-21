
import type { ReactNode } from "react";
import type { IconName } from "@/components/icons";
import type { ImageName } from "@/components/img";

export const site = {
  email: "partnerships@welcometomimoland.com",
  vidika: "https://vidika.co",
  instagram: "https://instagram.com/welcometomimoland",
  bookUrl:
    "https://www.amazon.co.uk/Mimoland-Flying-Fairy-Jasna-Dragojevic-ebook/dp/B0F8MY1FF5",
  youtube: "https://www.youtube.com/@welcometomimoland" as string | null,
  linkedin: "https://www.linkedin.com/company/welcome-to-mimoland/" as string | null,
  imdb: "https://www.imdb.com/title/tt44123873/" as string | null,
  filmUrl: "https://youtu.be/JfTf3TRLYTU" as string | null,
  filmEmbedId: "JfTf3TRLYTU" as string | null,
  filmTitle: "Mimoland: The First Flight",
  heroVideo: "hero-loop" as string | null,
  deckUrl: null as string | null,
  // The contact handler, served from the same origin by the host nginx
  // (see deploy/). Set to null and the form degrades to a mailto: link
  // instead, which is what it did before the handler existed.
  formEndpoint: "/api/contact" as string | null,
} as const;

export const enquiryTypes = [
  "Airline partnership",
  "Investment",
  "Production & broadcast",
  "Brand & licensing",
  "Education & experiences",
  "Press",
  "General enquiry",
] as const;

// `as const` so a door's `enquiry` below has to name an option that exists —
// a typo there would otherwise leave the select silently untouched.
export type EnquiryType = (typeof enquiryTypes)[number];

export const navLinks = [
  { href: "#origins", label: "Origins" },
  { href: "#world", label: "The World" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#partners", label: "Partner" },
  { href: "#impact", label: "Impact" },
  { href: "#ip", label: "Slate" },
  { href: "#vision", label: "Vision" },
  { href: "#team", label: "Team" },
];

const festivals = {
  berlin: "https://berlinindiefilmfestival.com/winners/2026/6",
  londonAiShorts: "https://londonaishorts.com/#awards",
  prompt: "https://promptfilmfest.com/index.html",
  aiCinemaLondon: "https://aicinemalondon.com/",
  auguri: "https://augurifestival.com/officialselectionjuly2026",
};

// Every credit below is from the same festival year, so the hero states it
// once above the row instead of on each one.
export const laurelsYear = "2026";

export const laurels = [
  {
    kind: "Winner",
    title: "Berlin Indie Film Festival",
    body: "Best Family Friendly Film",
    href: festivals.berlin,
  },
  {
    kind: "Winner",
    title: "London AI Shorts",
    body: "Best AI Director",
    href: festivals.londonAiShorts,
  },
  {
    kind: "Winner",
    title: "AI Indie Cinema London",
    body: "Best Short",
    href: festivals.aiCinemaLondon,
  },
  {
    kind: "Winner",
    title: "AI Indie Cinema London",
    body: "Best Screenplay",
    href: festivals.aiCinemaLondon,
  },
  {
    kind: "Official Selection",
    title: "Prompt Film Festival Toronto",
    body: "Official Screening",
    href: festivals.prompt,
  },
  {
    kind: "Official Selection",
    title: "Auguri Film Festival Italy",
    body: "Best AI Film",
    href: festivals.auguri,
  },
];

export const opportunityStats = [
  { num: "5.2B", lab: "passengers forecast to fly in 2026", src: "IATA forecast" },
  {
    num: "25–30%",
    lab: "of adults experience flight anxiety",
    src: "Phobia Aero, Fear of Flying Statistics 2026",
  },
  {
    num: "2 Years",
    lab: "of real-world testing in the air",
    src: "Mimoland early development",
  },
];

export const phases: { k: string; h: string; p: string }[] = [
  {
    k: "Pre-Flight",
    h: "Step into the Fairytale",
    p: "The Mimoland book and home activities spark excitement before the journey. Airport storytelling and play zones transform waiting time into part of the adventure.",
  },
  {
    k: "In-Flight",
    h: "The Story Takes Flight",
    p: "Princess Stewardesses create an engaging, child-friendly onboard experience. Edutainment activity packs build confidence. AR pillow companions bring the story to life in the skies.",
  },
  {
    k: "Post-Flight",
    h: "The Adventure Continues",
    p: "Family shows, workshops and digital experiences extend the connection beyond landing. They keep the joy of flying alive long after the flight ends.",
  },
];

export const characters: {
  name: string;
  lead?: boolean;
  image: ImageName;
  alt: string;
  objectPosition?: string;
  p: string;
  videoUrl?: string;
}[] = [
  {
    name: "Mimo Guide",
    lead: true,
    image: "char-mimo",
    videoUrl: "https://www.youtube.com/watch?v=w5XpjLRzyPI&list=PLeNWnpZtCvlA",
    alt: "Mimo, a small blue sky-fairy with a star on its chest, floating in golden cloud light",
    objectPosition: "center 35%",
    p: "The soul of Mimoland — every child’s first companion through its world of kindness, courage and wonder.",
  },
  {
    name: "Fairie",
    image: "char-the-fairie",
    videoUrl: "https://www.youtube.com/watch?v=lhggoVz5iN0&list=PLeNWnpZtCvlA&index=2",
    alt: "Fairie, a Princess Stewardess in a winged cabin-crew uniform",
    p: "Princess Stewardess — caring heart of the skies, helping every child feel safe and welcome.",
  },
  {
    name: "Miri",
    image: "char-miri",
    videoUrl: "https://www.youtube.com/watch?v=YdZVJ-HYxmg&list=PLeNWnpZtCvlA&index=3",
    alt: "Miri, a five-year-old girl with curly hair and a lilac jacket, mid-flight",
    objectPosition: "center 30%",
    p: "Five-year-old explorer — endlessly curious, seeing every journey through eyes of wonder and discovery.",
  },
  {
    name: "Luc",
    image: "char-luc",
    videoUrl: "https://www.youtube.com/watch?v=82xJClI6_Qc&list=PLeNWnpZtCvlA&index=4",
    alt: "Luc, a boy in a mustard jacket with a backpack, flying beside his sister",
    objectPosition: "center 25%",
    p: "Protective older brother — loyal and brave, always there when it matters most.",
  },
  {
    name: "ZuZu",
    image: "char-zuzu",
    videoUrl: "https://www.youtube.com/watch?v=ryDKJefBP_A&list=PLeNWnpZtCvlA&index=5",
    alt: "ZuZu, a shy creature peering out from behind a cloud",
    p: "Unexpected friend — discovering that even fear can become a source of courage and growth.",
  },
  {
    name: "Mimos",
    image: "char-the-mimos",
    alt: "A group of Mimo companions in different colours, gathered together above the clouds",
    objectPosition: "center 26%",
    p: "Children of the World — a joyful community united by friendship, diversity and belonging.",
  },
];

export const pillars: { dot: string; icon: IconName; h: string; p: string }[] = [
  {
    dot: "var(--peri)",
    icon: "aviation",
    h: "Aviation",
    p: "In-flight edutainment, branded programmes, airport experiences, loyalty integration.",
  },
  {
    dot: "var(--blossom)",
    icon: "entertainment",
    h: "Entertainment",
    p: "Animation, AR content, gamified experiences, digital character companions, shows and live theatre.",
  },
  {
    dot: "var(--gold)",
    icon: "education",
    h: "Education",
    p: "Aviation camps, interactive workshops, values-based learning, school programmes.",
  },
  {
    dot: "var(--lilac)",
    icon: "publishing",
    h: "Publishing",
    p: "Children’s books, activity books, Mimocards, illustrated story collections.",
  },
  {
    dot: "var(--mint)",
    icon: "merchandising",
    h: "Merchandising",
    p: "Character pillows, toys and collectables, travel kits, gift packs, licensed products.",
  },
  {
    dot: "var(--sunset)",
    icon: "hospitality",
    h: "Hospitality",
    p: "Family lounges, themed spaces, immersive experiences, destination partnerships.",
  },
];

export const doors: {
  bar: string;
  ink: string;
  icon: IconName;
  dk: string;
  h: string;
  p: string;
  link: string;
  enquiry: EnquiryType;
}[] = [
  {
    bar: "var(--peri)",
    ink: "var(--peri-ink)",
    icon: "airlines",
    dk: "For Airlines",
    h: "A guest experience that builds loyalty",
    p: "A structured, engaging programme that eases anxiety and earns lasting affection from families — pre-flight, in-flight and beyond.",
    link: "Explore the airline programme",
    enquiry: "Airline partnership",
  },
  {
    bar: "var(--gold)",
    ink: "var(--gold-ink)",
    icon: "investors",
    dk: "For Investors",
    h: "A scalable, IP-backed model",
    p: "Cross-industry monetisation across aviation, entertainment, education, publishing, merchandising and hospitality, built for sustainable growth and lasting IP value.",
    link: "Request the investor deck",
    enquiry: "Investment",
  },
  {
    bar: "var(--blossom)",
    ink: "var(--blossom-ink)",
    icon: "production",
    dk: "For Production & Broadcast",
    h: "A storyworld ready to expand",
    p: "An award-winning pilot, an animated-series screenplay and a storyworld built for expansion, ready to grow into a global family franchise.",
    link: "Talk about production",
    enquiry: "Production & broadcast",
  },
  {
    bar: "var(--lilac)",
    ink: "var(--lilac-ink)",
    icon: "licensing",
    dk: "For Brands & Licensing",
    h: "A world children want to hold",
    p: "Licensing across collectible pillows, toys, travel kits and gift packs — beloved characters with retail already proven at airports.",
    link: "Discuss licensing",
    enquiry: "Brand & licensing",
  },
];

export const communityStats = [
  { num: "1,000+", lab: "children engaged" },
  { num: "500+", lab: "families reached" },
  { num: "17", lab: "Sky Missions Edutainment Programme" },
];

export const communityImages: {
  span: "feature" | null;
  image: ImageName;
  alt: string;
}[] = [
  {
    span: "feature",
    image: "community-hall-gathering",
    alt: "Children creating Mimo pillows at a community workshop for gifting to loved ones",
  },
  {
    span: null,
    image: "community-library-session",
    alt: "A class seated on a library floor for a storytelling session",
  },
  {
    span: null,
    image: "community-pillow-gift",
    alt: "A child receiving a Mimo pillow at a workshop",
  },
  {
    span: null,
    image: "community-pillow-group",
    alt: "A school group holding up their Mimo pillows",
  },
  {
    span: null,
    image: "community-classroom-gifts",
    alt: "Children sharing their wish pillows created with wishes for their community",
  },
  {
    span: null,
    image: "community-book-circle",
    alt: "Children reading the Mimoland book together",
  },
  {
    span: null,
    image: "community-fairy-reading",
    alt: "Children sharing their Mimoland drawings and stories",
  },
  {
    span: "feature",
    image: "community-theatre-cast",
    alt: "The cast of a Mimoland theatre performance on stage in costume",
  },
  {
    span: null,
    image: "community-theatre-scene",
    alt: "A scene from a Mimoland theatre performance",
  },
  {
    span: null,
    image: "community-book-group",
    alt: "Children with their copies of the Mimoland book",
  },
];

export const originsDraftNote: string | null = null;

export const recognition: {
  icon: IconName | "laurel";
  name: string;
  note: string;
  href: string;
}[] = [
  {
    icon: "laurel",
    name: "Berlin Indie Film Festival",
    note: "Winner · Best Family Friendly Film",
    href: festivals.berlin,
  },
  {
    icon: "laurel",
    name: "London AI Shorts",
    note: "Winner · Best AI Director",
    href: festivals.londonAiShorts,
  },
  {
    icon: "laurel",
    name: "AI Indie Cinema London",
    note: "Winner · Best Short",
    href: festivals.aiCinemaLondon,
  },
  {
    icon: "laurel",
    name: "AI Indie Cinema London",
    note: "Winner · Best Screenplay",
    href: festivals.aiCinemaLondon,
  },
  {
    icon: "laurel",
    name: "Prompt Film Festival Toronto",
    note: "Official Selection · Official Screening",
    href: festivals.prompt,
  },
  {
    icon: "laurel",
    name: "Auguri Film Festival Italy",
    note: "Official Selection · Best AI Film",
    href: festivals.auguri,
  },
  {
    icon: "network",
    name: "Impact Hub",
    note: "Top 7 Balkan Startups 2021",
    href: "https://rs.linkedin.com/in/milicaradulovic",
  },
  {
    icon: "books",
    name: "National Library of Serbia",
    note: "National Library Catalogue",
    href: "https://plus.cobiss.net/cobiss/sr/sr/search/cobib?q=Mimoland+by+the+Flying+Fairy",
  },
  {
    icon: "institution",
    name: "Chamber of Commerce & Industry",
    note: "EXPO 2020 · Dubai",
    href: "https://expo2020.pks.rs/mimoland/",
  },
  {
    icon: "institution",
    name: "Municipality of Mionica",
    note: "4-Month Pilot Programme",
    href: "https://www.mionica.rs/news/1804-predstavljena-knjiga-za-decu-mlade-spisateljice-jasne-dragojevic",
  },
  {
    icon: "retail",
    name: "Dufry & Hudson",
    note: "Belgrade Airport Retail",
    href: "https://bonitet.com/uspesne-price-welcome-to-mimoland/",
  },
  {
    icon: "retail",
    name: "Delfi Knjižare",
    note: "Mimoland Book Retail",
    href: "https://delfi.rs/knjige/129696-slikovnica–mimoland-by-the-flying-fairy-knjiga-delfi-knjizare.html",
  },
];

export const media: {
  name: string;
  href: string;
  kind: "news" | "tv";
  title?: string;
}[] = [
  {
    name: "RTS",
    kind: "news",
    href: "https://www.rts.rs/lat/vesti/srbija-danas/3376478/bez-straha-od-letenja-kroz-modernu-bajku.html",
  },
  {
    name: "Bonitet",
    kind: "news",
    href: "https://bonitet.com/uspesne-price-welcome-to-mimoland/",
  },
  {
    name: "Sve o novcu",
    kind: "news",
    href: "https://sveonovcu.rs/jasna-je-bila-leteca-dadilja-a-onda-je-osmislila-koncept-dobrodosli-u-mimoland/",
  },
  {
    name: "RTS Znanje imanje",
    href: "https://www.youtube.com/watch?v=f_YsdBAN3GY",
    kind: "tv",
    title: "Bringing Smiles to Mionica",
  },
  {
    name: "Pink Svitanje",
    href: "https://www.youtube.com/watch?v=3h_Osy3P478",
    kind: "tv",
    title: "Television interview",
  },
  {
    name: "RTS Srbija danas",
    href: "https://www.rts.rs/lat/vesti/srbija-danas/4691378/knjige-za-osnovce-u-brdsko-planinskim-selima.html",
    kind: "tv",
    title: "Books for schoolchildren in mountain villages",
  },
];

export const mediaKinds: { kind: "news" | "tv"; label: string; icon: IconName }[] = [
  { kind: "news", label: "News", icon: "news" },
  { kind: "tv", label: "TV", icon: "tv" },
];

export type Stage = "dev" | "test" | "ready" | "active" | "pub";

export const ipSlate: { t: string; stage: Stage; label: string }[] = [
  { t: "Mimoland by the Flying Fairy — Foundational Book", stage: "pub", label: "Published" },
  { t: "Original Soundtrack & Audio", stage: "active", label: "Active" },
  { t: "Interactive Co-Play Theatre", stage: "active", label: "Active" },
  { t: "SEL & Peace Education Workshop Programme", stage: "active", label: "Active" },
  { t: "SEL Training for Airline Personnel", stage: "ready", label: "Launch Ready" },
  { t: "Collectible Character Pillow Collection", stage: "ready", label: "Launch Ready" },
  { t: "Airport Gift & Souvenir Packs", stage: "ready", label: "Launch Ready" },
  { t: "Edutainment Merchandise Line", stage: "ready", label: "Launch Ready" },
  { t: "In-Flight Edutainment Kits", stage: "test", label: "Testing" },
  { t: "Augmented Reality Character Activation", stage: "test", label: "Testing" },
  { t: "17 Sky Missions — Interactive Activity Book", stage: "dev", label: "In Development" },
  { t: "Animated Series Screenplay", stage: "dev", label: "In Development" },
];

export const team: {
  name: string;
  role: string;
  image: ImageName | null;
  bio: ReactNode;
}[] = [
  {
    name: "Jasna Dragojević",
    role: "Founder & Creator",
    image: "team-jasna-dragojevic",
    bio: (
      <>
        Creator of the Mimoland universe, author of its foundational book{" "}
        <em>Mimoland by the Flying Fairy</em> and <em>17 Sky Missions</em>, and
        producer of <em>Mimoland: The First Flight</em>.
      </>
    ),
  },
  {
    name: "Jimmy Woolley",
    role: "Director & Screenwriter",
    image: "team-jimmy-woolley",
    bio: (
      <>
        Director and screenwriter of <em>Mimoland: The First Flight</em>; known
        for award-winning filmmaking and original UK television formats watched
        by millions.
      </>
    ),
  },
  {
    name: "Stefan Iriarte",
    role: "Production Partner",
    image: "team-stefan-iriarte",
    bio: (
      <>
        Producer on <em>Mimoland: The First Flight</em>; experienced in primetime
        television production and large-scale entertainment formats.
      </>
    ),
  },
  {
    name: "Harold Underdown",
    role: "Publishing Strategist",
    image: "team-harold-underdown",
    bio: (
      <>
        Editor of the Mimoland foundational book and <em>17 Sky Missions</em>;
        respected authority in children’s publishing and story development.
      </>
    ),
  },
  {
    name: "Marjana Perišić",
    role: "Pedagogical Lead",
    image: "team-marjana-perisic",
    bio: (
      <>
        Educator and pedagogue for Mimoland; regarded for her expertise in early
        childhood development and social-emotional learning.
      </>
    ),
  },
  {
    name: "Marcie Colleen",
    role: "Education Editor",
    image: "team-marcie-colleen",
    bio: (
      <>
        Edutainment content adviser for <em>17 Sky Missions</em>; acclaimed
        children’s author and educator advancing learning through story and play.
      </>
    ),
  },
  {
    name: "Ana Grigorjev",
    role: "Illustration Artist",
    image: "team-ana-grigorjev",
    bio: (
      <>
        Illustrator of the Mimoland foundational book; award-winning artist
        recognised for children’s book illustration published internationally.
      </>
    ),
  },
  {
    name: "Sofija Trujić",
    role: "Graphic Designer",
    image: "team-sofija-trujic",
    bio: (
      <>
        Graphic designer across Mimoland’s presentation materials; emerging
        creative and premium member of the Serbian Association of Graphic
        Designers.
      </>
    ),
  },
];
