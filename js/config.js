/* ============================================================
   js/config.js — ALL copy & data for the invitation.
   Nothing in the scenes hardcodes text: everything reads from
   this file. Edit here to personalise the card.
   ============================================================ */
window.CONFIG = {

  meta: {
    pageTitle: {
      en: "Ashish & Easter — Wedding Invitation",
      te: "ఆశీష్ & ఈస్టర్ — వివాహ ఆహ్వానం"
    },
    monogram: "A & E",
    monogramSeal: "A&E"
  },

  /* Exactly two languages */
  languages: [
    { id: "en", label: "English", htmlLang: "en" },
    { id: "te", label: "తెలుగు", htmlLang: "te" }
  ],

  names: {
    en: {
      groomFull: "Ashish Kamada",
      brideFull: "Easter Rani",
      groomShort: "Ashish",
      brideShort: "Easter"
    },
    te: {
      groomFull: "ఆశీష్ కమాడ",
      brideFull: "ఈస్టర్ రాణి",
      groomShort: "ఆశీష్",
      brideShort: "ఈస్టర్"
    }
  },

  /* ?name=Mary%20Aunty replaces the guest word */
  greeting: {
    en: { prefix: "Dear ", guest: "Guest" },
    te: { prefix: "ప్రియమైన ", guest: "అతిథి" }
  },

  date: {
    iso: "2026-12-12T10:30:00+05:30",
    line: {
      en: "Saturday · 12 December 2026",
      te: "శనివారం · 12 డిసెంబర్ 2026"
    }
  },

  church: {
    name: {
      en: "St. Alphonsa Church",
      te: "సెంట్ అల్ఫోన్సా చర్చి"
    },
    address: {
      en: "Church Road, Kothur Village",
      te: "చర్చి రోడ్, కోతూరు గ్రామం"
    },
    time: {
      en: "10:30 AM",
      te: "ఉదయం 10:30"
    },
    mapsUrl: "https://maps.google.com/?q=church",
    photo: "images/venue-church.svg"
  },

  reception: {
    name: {
      en: "Grand Celebration Hall",
      te: "గ్రాండ్ సెలబ్రేషన్ హాల్"
    },
    address: {
      en: "Main Road, Kothur Village",
      te: "మెయిన్ రోడ్, కోతూరు గ్రామం"
    },
    time: {
      en: "6:00 PM",
      te: "సాయంత్రం 6:00"
    },
    mapsUrl: "https://maps.google.com/?q=reception+hall",
    photo: "images/venue-reception.svg"
  },

  photos: [
    {
      src: "images/photo-1.svg",
      caption: {
        en: "Where it all began",
        te: "అంతా మొదలైన చోటు"
      }
    },
    {
      src: "images/photo-2.svg",
      caption: {
        en: "The promise of a lifetime",
        te: "జీవితకాలపు మాట"
      }
    },
    {
      src: "images/photo-3.svg",
      caption: {
        en: "Together, always",
        te: "ఎల్లప్పుడూ కలిసి"
      }
    }
  ],

  /* The ONLY Bible verse in the card */
  verse: {
    ref: {
      en: "Numbers 6:24–26",
      te: "సంఖ్యాకాండము 6:24–26"
    },
    text: {
      en: "The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.",
      te: "యెహోవా నిన్ను ఆశీర్వదించి నిన్ను కాపాడునుగాక; యెహోవా నీమీద తన సన్నిధిని ప్రకాశింపజేసి నిన్ను కరుణించునుగాక; యెహోవా నీమీద తన సన్నిధి కాంతి ఉదయింపజేసి నీకు సమాధానము కలుగజేయునుగాక."
    }
  },

  showJesusFigure: true,
  musicSrc: "audio/music.mp3",

  /* files arrive later; a missing file must stay silent (no error) */
  narration: {
    en: {
      scene1: "audio/en/scene1.mp3",
      scene2: "audio/en/scene2.mp3",
      scene3: "audio/en/scene3.mp3",
      scene4: "audio/en/scene4.mp3",
      scene5: "audio/en/scene5.mp3",
      scene6: "audio/en/scene6.mp3"
    },
    te: {
      scene1: "audio/te/scene1.mp3",
      scene2: "audio/te/scene2.mp3",
      scene3: "audio/te/scene3.mp3",
      scene4: "audio/te/scene4.mp3",
      scene5: "audio/te/scene5.mp3",
      scene6: "audio/te/scene6.mp3"
    }
  },

  /* per-scene data used by scenes 3–6 (built in later rounds) */
  scenes: {
    scene3: {
      heading: { en: "OUR STORY", te: "మా కథ" },
      stub: { en: "Scene 3 — coming soon", te: "సన్నివేశం 3 — త్వరలో వస్తోంది" }
    },
    scene4: {
      heading: { en: "GOD’S BLESSING", te: "దేవుని ఆశీర్వాదం" },
      stub: { en: "Scene 4 — coming soon", te: "సన్నివేశం 4 — త్వరలో వస్తోంది" }
    },
    scene5: {
      saveTheDate: { en: "SAVE THE DATE", te: "తేదీని గుర్తించుకోండి" },
      ceremonyLabel: { en: "HOLY MATRIMONY", te: "పరిశుద్ధ వివాహం" },
      receptionLabel: { en: "RECEPTION", te: "విందు వేడుక" },
      directions: { en: "Directions", te: "దారి చూపించు" },
      addToCalendar: { en: "Add to Calendar", te: "క్యాలెండర్‌కు జోడించు" },
      countdownTitle: { en: "COUNTING DOWN TO THE BIG DAY", te: "శుభ దినం కోసం లెక్క" },
      countdown: {
        days: { en: "Days", te: "రోజులు" },
        hours: { en: "Hours", te: "గంటలు" },
        minutes: { en: "Minutes", te: "నిమిషాలు" },
        seconds: { en: "Seconds", te: "సెకన్లు" }
      },
      stub: { en: "Scene 5 — coming soon", te: "సన్నివేశం 5 — త్వరలో వస్తోంది" }
    },
    scene6: {
      lookForward: {
        en: "We look forward to celebrating with you",
        te: "మీతో కలిసి జరుపుకోవడానికి ఎదురుచూస్తున్నాము"
      },
      withLove: { en: "With love,", te: "ప్రేమతో," },
      viewAgain: { en: "View again", te: "మళ్ళీ చూడండి" },
      share: { en: "Share", te: "పంచుకోండి" },
      shareText: {
        en: "With joy, we invite you to the wedding of Ashish & Easter:",
        te: "ఆనందంతో, ఆశీష్ & ఈస్టర్ వివాహానికి మిమ్మల్ని ఆహ్వానిస్తున్నాము:"
      },
      stub: { en: "Scene 6 — coming soon", te: "సన్నివేశం 6 — త్వరలో వస్తోంది" }
    }
  },

  /* every UI string */
  ui: {
    shared: {
      invited: "YOU ARE INVITED",
      tapSeal: "Tap the seal to open",
      tapSealTe: "తెరవడానికి ముద్రను తాకండి",
      kindChoose1: "KINDLY CHOOSE",
      kindChoose2: "YOUR LANGUAGE",
      sealAria: "Tap the seal to open the invitation",
      monogramAria: "Monogram A and E"
    },
    en: {
      next: "Next",
      soundOnAria: "Mute sound",
      soundOffAria: "Unmute sound",
      togetherWith: "TOGETHER WITH THEIR FAMILIES",
      amp: "&"
    },
    te: {
      next: "తదుపరి",
      soundOnAria: "ధ్వనిని మ్యూట్ చేయి",
      soundOffAria: "ధ్వనిని ఆన్ చేయి",
      togetherWith: "ఇరు కుటుంబాల సమ్మతితో",
      amp: "&"
    }
  }
};
