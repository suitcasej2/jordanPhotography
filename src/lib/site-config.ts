export const siteConfig = {
  photographerName: "Jordan",
  legalName: "Jordan Hodges",
  tagline: "Documentary Photography",
  headline: "Quiet frames from lived-in moments.",
  supportingLine:
    "Elopements, workshops, and dinner parties in Barcelona and beyond — photographed with patience, delivered with care.",
  location: {
    city: "Barcelona",
    region: "Catalonia",
    country: "Spain",
    countryCode: "ES",
    // Barcelona city centre — used for LocalBusiness / geo schema.
    latitude: 41.3874,
    longitude: 2.1686,
    areaServed: [
      "Barcelona",
      "Catalonia",
      "Costa Brava",
      "Sitges",
      "Girona",
      "Spain",
      "Europe",
    ],
  },
  services: [
    {
      slug: "elopement-photography",
      name: "Elopement photography",
      shortName: "Elopements",
      description:
        "Intimate elopement photography in Barcelona, the Catalan countryside, and the Costa Brava — for couples who want the day to feel like theirs, not a production.",
    },
    {
      slug: "event-photography",
      name: "Event photography",
      shortName: "Events",
      description:
        "Documentary event photography in Barcelona — launches, brand gatherings, community nights, and private celebrations covered with a quiet, editorial eye.",
    },
    {
      slug: "dinner-party-photography",
      name: "Dinner party photography",
      shortName: "Dinner parties",
      description:
        "Long-table dinner parties and supper clubs in Barcelona, photographed as they happen — hands, candlelight, conversation, the room warming up.",
    },
    {
      slug: "workshop-photography",
      name: "Workshop photography",
      shortName: "Workshops",
      description:
        "Documentary coverage of workshops, retreats, and creative residencies in Barcelona and across Spain — process, participants, and place.",
    },
  ] as const,
  keywords: [
    "Barcelona photographer",
    "photographer in Barcelona",
    "elopement photographer Barcelona",
    "Barcelona elopement photography",
    "event photographer Barcelona",
    "Barcelona event photography",
    "dinner party photographer Barcelona",
    "supper club photographer Barcelona",
    "workshop photographer Barcelona",
    "retreat photographer Spain",
    "documentary photographer Barcelona",
    "editorial photographer Barcelona",
    "Costa Brava elopement photographer",
    "Catalonia wedding photographer",
  ],
  about: {
    eyebrow: "About",
    title: "Looking for what already feels true.",
    body: [
      "I'm a documentary photographer based in Barcelona, working across Catalonia and wherever the work leads. I photograph gatherings, craft, and the in-between — the gestures people make when they forget the camera is there.",
      "Available for elopements, events, dinner parties, workshops, and editorial commissions. Long tables, small ceremonies, quiet rooms — this is where I like to work.",
    ],
  },
  work: {
    eyebrow: "Selected work",
    title: "Recent frames",
    subtitle:
      "A sample from recent documentary sessions — elopements, dinner parties, and workshops in Barcelona and beyond.",
  },
  bookingHeadline: "Available for bookings",
  bookingMessage:
    "Elopements, events, dinner parties, and workshops in Barcelona, across Spain, and abroad — reach out to discuss your project.",
  phone: "+34 711 01 29 97",
  instagram: {
    handle: "@soundsbyjali",
    url: "https://www.instagram.com/soundsbyjali/",
  },
  seo: {
    // Displayed in the browser tab / SERP.
    homeTitle:
      "Jordan — Barcelona Documentary Photographer | Elopements, Events, Dinner Parties, Workshops",
    // Under 160 characters, front-loads location + services.
    homeDescription:
      "Documentary photographer in Barcelona, Spain. Elopements, dinner parties, private events, and workshops — photographed with a quiet, editorial eye.",
    // Used as <title> template on child routes (e.g. galleries).
    titleTemplate: "%s — Jordan | Barcelona Documentary Photographer",
    defaultTitle: "Jordan — Barcelona Documentary Photographer",
    siteName: "Jordan — Barcelona Documentary Photography",
  },
};

export const portfolioImages = {
  hero: {
    src: "/portfolio/hero.webp",
    alt: "Hands writing in a notebook during a craft workshop in Barcelona",
    width: 1920,
    height: 1080,
  },
  about: {
    src: "/portfolio/about.webp",
    alt: "Workshop participants gathered in a sunlit Barcelona courtyard",
    width: 1400,
    height: 788,
  },
  work: [
    {
      src: "/portfolio/work-01.webp",
      alt: "Handmade botanical study booklet held against a painted wall — documentary workshop coverage in Barcelona",
      width: 1200,
      height: 800,
      span: "wide" as const,
    },
    {
      src: "/portfolio/work-02.webp",
      alt: "Documentary detail from a natural dye workshop in Barcelona",
      width: 1200,
      height: 800,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-03.webp",
      alt: "Participants working together at a workshop table",
      width: 1200,
      height: 675,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-04.webp",
      alt: "Participant marking plant and fiber charts at a workshop table",
      width: 1200,
      height: 675,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-05.webp",
      alt: "Outdoor long-table gathering photographed as an event in Barcelona",
      width: 1200,
      height: 675,
      span: "wide" as const,
    },
    {
      src: "/portfolio/work-06.webp",
      alt: "Quiet documentary frame from a private dinner party",
      width: 1200,
      height: 675,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-07.webp",
      alt: "Close documentary detail of workshop materials",
      width: 1200,
      height: 800,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-08.webp",
      alt: "Group conversation during a workshop afternoon in Barcelona",
      width: 1200,
      height: 675,
      span: "normal" as const,
    },
    {
      src: "/portfolio/work-09.webp",
      alt: "Process moment from a documentary photography session in Barcelona",
      width: 1200,
      height: 675,
      span: "wide" as const,
    },
    {
      src: "/portfolio/work-10.webp",
      alt: "Craft materials arranged on a workshop table — documentary photography",
      width: 1200,
      height: 800,
      span: "normal" as const,
    },
  ],
};
