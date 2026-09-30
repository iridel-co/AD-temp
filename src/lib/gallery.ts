/**
 * Past events / successful workshops — the Gallery parent grid and each event's
 * child page.
 *
 * TODO: all events below are representative and reuse real client-event photo
 * sets as stand-ins (kept out of `public/images/mascot/` and `hero/` — this
 * page never reuses a photo that also appears in a hero section or as
 * Adrian's own portrait/cutout). Replace with the client's real event names,
 * dates, descriptions and photo sets as they are sourced. `reflections` copy
 * is placeholder scene-setting written in Adrian's voice — swap for his real
 * notes on each event once available.
 */

export type GalleryPhoto = {
  src: string
  alt: string
  /** Crop ratio for the floating photo wall — defaults to "3/2" (landscape)
   *  when omitted. */
  aspect?: "3/2" | "4/5"
}

export type GalleryReflection = {
  eyebrow: string
  body: string
}

export type GalleryEvent = {
  slug: string
  name: string
  /** Display date. */
  date: string
  /** Year, for the filter. */
  year: number
  location: string
  blurb: string
  /** Card + hero image. */
  cover: string
  /** Event page's floating photo wall. */
  photos: GalleryPhoto[]
  /** Adrian's own notes on the event — paired one-per-hero-photo in the
   *  floating wall's empty margins. */
  reflections: GalleryReflection[]
  /** Optional related upcoming workshop slug. */
  relatedWorkshop?: string
}

export const GALLERY_EVENTS: GalleryEvent[] = [
  {
    slug: "exceptional-salesmanship-manila-2025",
    name: "Exceptional Salesmanship — Manila",
    date: "March 2025",
    year: 2025,
    location: "Makati City",
    blurb:
      "A full house of agents and account managers spent the day rebuilding how they open, qualify and close. The energy in the room carried straight through the afternoon.",
    cover: "/images/gallery/exceptional-salesmanship-manila-2025/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-1.jpg",
        alt: "Adrian pointing to a slide while speaking on stage",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-2.jpg",
        alt: "Adrian addressing the room, microphone in hand",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-3.jpg",
        alt: "Adrian on stage with a colorful screen behind him",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-4.jpg",
        alt: "Adrian addressing a packed conference room",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-5.jpg",
        alt: "Adrian waving to the audience from the stage",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-6.jpg",
        alt: "Adrian mid-gesture, flip chart in the background",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-7.jpg",
        alt: "Adrian speaking beside a whiteboard and screen",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-8.jpg",
        alt: "Adrian on stage with a quote projected behind him",
      },
      {
        src: "/images/gallery/exceptional-salesmanship-manila-2025/photo-9.jpg",
        alt: "Adrian on stage with his image on the screen behind him",
      },
    ],
    reflections: [
      {
        eyebrow: "The Room",
        body: "I remember walking in before the doors even opened and hearing the room already buzzing — every seat was taken ten minutes early. That's when I knew this one was going to hit different. By the time I picked up the mic, nobody needed convincing that today mattered.",
      },
      {
        eyebrow: "March 2025",
        body: "We ran three tracks back to back that day in Makati, and I kept crossing paths with reps between sessions who were already trying out lines from the morning block. That kind of hallway energy is the whole reason I still do these in person instead of over a call.",
      },
      {
        eyebrow: "Small Groups",
        body: "The breakout pods are always my favorite part to watch. Seeing a rep who couldn't get through a cold open at 9am running it clean by 2pm — coached by three peers, not by me — is the whole point of the format, and it never stops being satisfying.",
      },
      {
        eyebrow: "The Close",
        body: "A few of them messaged me weeks later to say the qualifying framework we rebuilt that afternoon was already showing up in their numbers. That's the only metric that's ever actually mattered to me coming out of a room like this one.",
      },
    ],
    relatedWorkshop: "exceptional-salesmanship",
  },
  {
    slug: "leadership-intensive-cebu-2025",
    name: "Leadership Intensive — Cebu",
    date: "June 2025",
    year: 2025,
    location: "Cebu City",
    blurb:
      "Emerging leaders from a dozen companies worked through the accountability conversation and left with a 90-day plan they wrote themselves.",
    cover: "/images/gallery/evercare/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/evercare/photo-1.jpg",
        alt: "Participants seated in discussion groups during the leadership session",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/evercare/photo-2.jpg",
        alt: "A participant presenting to the room during a breakout exercise",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/evercare/photo-3.jpg",
        alt: "Team leads working through a leadership exercise together",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/evercare/photo-4.jpg",
        alt: "Adrian facilitating a small-group conversation",
      },
      {
        src: "/images/gallery/evercare/photo-5.jpg",
        alt: "The room during a full-group discussion",
      },
      {
        src: "/images/gallery/evercare/photo-6.jpg",
        alt: "Participants comparing notes on their 90-day plans",
      },
    ],
    reflections: [
      {
        eyebrow: "Cebu, June 2025",
        body: "Leadership Intensive always draws a smaller, more intense room, and this Cebu run was no different — a dozen companies, a handful of tables, and by afternoon nobody was performing for me anymore, just working through their own accountability conversations out loud.",
      },
    ],
    relatedWorkshop: "exceptional-leadership",
  },
  {
    slug: "building-winning-cultures-2025",
    name: "Building Winning Cultures",
    date: "November 2025",
    year: 2025,
    location: "Cebu City",
    blurb:
      "A sold-out session on the rituals that compound into a high-performing team — one of the most requested repeat topics of the year.",
    cover: "/images/gallery/primaryhomes/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/primaryhomes/photo-1.jpg",
        alt: "A packed room during the culture workshop",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/primaryhomes/photo-2.jpg",
        alt: "Adrian leading a discussion on team rituals",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/primaryhomes/photo-3.jpg",
        alt: "A team working through a culture-mapping exercise",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/primaryhomes/photo-4.jpg",
        alt: "Participants sharing their team's rituals with the room",
      },
      {
        src: "/images/gallery/primaryhomes/photo-5.jpg",
        alt: "The group mid-exercise, standing and engaged",
      },
      {
        src: "/images/gallery/primaryhomes/photo-6.jpg",
        alt: "A close-up of a team's whiteboard output",
      },
    ],
    reflections: [
      {
        eyebrow: "A Repeat Request",
        body: "Building Winning Cultures keeps getting asked for again and again, and every time I'm a little surprised by how different each room makes it — this one leaned hard into rituals over rules, which is exactly the conversation I was hoping we'd land on by the end of the day.",
      },
    ],
  },
  {
    slug: "keynote-hr-summit-2024",
    name: "Keynote — National HR Summit",
    date: "September 2024",
    year: 2024,
    location: "Pasay City",
    blurb:
      "Adrian opened the summit with a keynote on building winning cultures to an audience of several hundred HR and L&D leaders.",
    cover: "/images/gallery/sunlife/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/sunlife/photo-1.jpg",
        alt: "Adrian delivering the opening keynote to a large audience",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/sunlife/photo-2.jpg",
        alt: "A wide shot of the summit's main hall",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/sunlife/photo-3.jpg",
        alt: "HR and L&D leaders seated for the keynote",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/sunlife/photo-4.jpg",
        alt: "Adrian on stage with the summit's branding behind him",
      },
      {
        src: "/images/gallery/sunlife/photo-5.jpg",
        alt: "The audience during a keynote applause moment",
      },
      {
        src: "/images/gallery/sunlife/photo-6.jpg",
        alt: "Attendees networking after the keynote",
      },
    ],
    reflections: [
      {
        eyebrow: "The Big Room",
        body: "Keynoting the National HR Summit is a different kind of nervous — a few hundred HR and L&D leaders who've heard every framework going. I opened with the culture keynote instead of the usual warmup, and the room leaned in almost immediately, which told me it was the right call.",
      },
    ],
  },
  {
    slug: "train-the-trainer-2024",
    name: "Train the Trainer + Coach the Coaches",
    date: "May 2024",
    year: 2024,
    location: "Mandaue City",
    blurb:
      "An intensive for in-house facilitators — how to design a session that changes behaviour, not just the mood in the room.",
    cover: "/images/gallery/axa/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/axa/photo-1.jpg",
        alt: "In-house facilitators practicing a session opener",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-2.jpg",
        alt: "Adrian coaching a facilitator through their delivery",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-3.jpg",
        alt: "A facilitator presenting to peers for feedback",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-4.jpg",
        alt: "Small groups workshopping session design",
      },
      {
        src: "/images/gallery/axa/photo-5.jpg",
        alt: "The room mid-exercise during the intensive",
      },
      {
        src: "/images/gallery/axa/photo-6.jpg",
        alt: "Facilitators giving each other live feedback",
      },
    ],
    reflections: [
      {
        eyebrow: "Coaching the Coaches",
        body: "Train the Trainer is the hardest room I run, because I'm not just teaching content, I'm teaching people how to teach it. Mandaue's group pushed back on almost every framework I gave them, which is exactly what I want from a room full of facilitators — it means they'll make it their own.",
      },
    ],
  },
  {
    slug: "personal-branding-workshop-2024",
    name: "Corporate Imaging & Personal Branding",
    date: "February 2024",
    year: 2024,
    location: "Makati City",
    blurb:
      "Client-facing professionals worked on the signal they send before they say a word — presence, positioning and consistency.",
    cover: "/images/gallery/axa/photo-10.jpg",
    photos: [
      {
        src: "/images/gallery/axa/photo-10.jpg",
        alt: "Client-facing professionals during the branding session",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-11.jpg",
        alt: "A participant practicing their presence on camera",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-12.jpg",
        alt: "Adrian giving feedback on a participant's presentation",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/axa/photo-13.jpg",
        alt: "Pairs practicing first-impression exercises",
      },
      {
        src: "/images/gallery/axa/photo-14.jpg",
        alt: "The room reviewing positioning exercises together",
      },
      {
        src: "/images/gallery/axa/photo-15.jpg",
        alt: "A participant sharing their personal brand statement",
      },
    ],
    reflections: [
      {
        eyebrow: "Before They Speak",
        body: "Corporate Imaging always starts a little awkward — nobody loves talking about how they come across — but by the second exercise the room stops being self-conscious and starts being genuinely curious about the signal they're actually sending before they say a word.",
      },
    ],
  },
  {
    slug: "compelling-communications-2023",
    name: "Effective & Compelling Communications",
    date: "October 2023",
    year: 2023,
    location: "Cebu City",
    blurb:
      "A room of managers rebuilt how they brief, persuade and give feedback — tighter openings, cleaner asks, and far fewer meetings that end without a decision.",
    cover: "/images/gallery/dueksaminc/photo-1.jpg",
    photos: [
      {
        src: "/images/gallery/dueksaminc/photo-1.jpg",
        alt: "Managers practicing a briefing exercise",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/dueksaminc/photo-2.jpg",
        alt: "Adrian walking through a communications framework",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/dueksaminc/photo-3.jpg",
        alt: "A pair working through a feedback role-play",
        aspect: "4/5",
      },
      {
        src: "/images/gallery/dueksaminc/photo-4.jpg",
        alt: "The room taking notes during the session",
      },
      {
        src: "/images/gallery/dueksaminc/photo-5.jpg",
        alt: "A manager presenting a rebuilt meeting brief",
      },
      {
        src: "/images/gallery/dueksaminc/photo-6.jpg",
        alt: "Small groups debriefing after a role-play round",
      },
    ],
    reflections: [
      {
        eyebrow: "Fewer, Better Meetings",
        body: "Effective & Compelling Communications in Cebu turned into one of my favorite sessions that year — a room full of managers who left with tighter openings, cleaner asks, and, more importantly, a lot fewer meetings that end without anyone actually deciding anything.",
      },
    ],
  },
]

export function getGalleryEvent(slug: string): GalleryEvent | undefined {
  return GALLERY_EVENTS.find((e) => e.slug === slug)
}
