/* ============================================================
   js/config.js — ALL copy & data for the invitation.
   Nothing in the scenes hardcodes text: everything reads from
   this file. Edit here to personalise the card.
   ============================================================ */
window.CONFIG = {

  meta: {
    pageTitle: {
      en: "Ashish & Sulochana — Wedding Invitation",
      te: "ఆశీష్ & సులోచన — వివాహ ఆహ్వానం"
    },
    monogram: "A & S",
    monogramSeal: "A&S"
  },

  /* Exactly two languages */
  languages: [
    { id: "en", label: "English", htmlLang: "en" },
    { id: "te", label: "తెలుగు", htmlLang: "te" }
  ],

  names: {
    en: {
      groomFull: "Ashish Kamada",
      brideFull: "Sulochana Rani",
      groomShort: "Ashish",
      brideShort: "Sulochana"
    },
    te: {
      groomFull: "ఆశీష్ కమాడ",
      brideFull: "సులోచన రాణి",
      groomShort: "ఆశీష్",
      brideShort: "సులోచన"
    }
  },

  /* ?name=Mary%20Aunty replaces the guest word */
  greeting: {
    en: { prefix: "Dear ", guest: "Guest" },
    te: { prefix: "ప్రియమైన ", guest: "అతిథి" }
  },

  date: {
    iso: "2026-11-19T10:00:00+05:30",
    line: {
      en: "Thursday · 19 November 2026",
      te: "గురువారం · 19 నవంబర్ 2026"
    }
  },

  church: {
    name: {
      en: "Saint Pauls Lutheran Church",
      te: "సెయింట్ పాల్స్ లూథరన్ చర్చి"
    },
    address: {
      en: "Christian Peta, Kovvur, East Godavari Dist.",
      te: "క్రిస్టియన్ పేట, కొవ్వూరు, తూర్పు గోదావరి జిల్లా"
    },
    time: {
      en: "10:00 AM",
      te: "ఉదయం 10:00"
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Saint+Pauls+Lutheran+Church+Christian+Peta+Kovvur",
    photo: "images/venue-church.svg"
  },

  reception: {
    name: {
      en: "Lunch at the Venue",
      te: "వివాహ వేదిక వద్ద విందు భోజనం"
    },
    address: {
      en: "Saint Pauls Lutheran Church, Christian Peta, Kovvur",
      te: "సెయింట్ పాల్స్ లూథరన్ చర్చి, క్రిస్టియన్ పేట, కొవ్వూరు"
    },
    time: {
      en: "From 12:00 PM onwards",
      te: "మధ్యాహ్నం 12:00 నుండి"
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Saint+Pauls+Lutheran+Church+Christian+Peta+Kovvur",
    photo: "images/venue-reception.svg"
  },

  photos: [
    {
      src: "images/photo-1.jpg",
      caption: {
        en: "Where it all began",
        te: "అంతా మొదలైన చోటు"
      }
    },
    {
      src: "images/photo-2.jpg",
      caption: {
        en: "The promise of a lifetime",
        te: "జీవితకాలపు మాట"
      }
    },
    {
      src: "images/photo-3.jpg",
      caption: {
        en: "Together, always",
        te: "ఎల్లప్పుడూ కలిసి"
      }
    }
  ],

  /* Scene 4 blessing verse (Scene 6 uses closing.verse) */
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

  /* Real details from the printed card (names kept in English script in both languages) */
  families: {
    groom: {
      label: { en: "Elder son of", te: "పెద్ద కుమారుడు" },
      parents: "Mr. Kamada Sanjeev Kumar (Late) & Mrs. Jayasree"
    },
    bride: {
      label: { en: "Youngest daughter of", te: "చిన్న కుమార్తె" },
      parents: "Mr. Yajjala Samuel Raju & Mrs. Mari Grace",
      place: { en: "Mallayyapeta, Rajahmundry", te: "మల్లయ్యపేట, రాజమండ్రి" }
    }
  },
  officiants: {
    label: { en: "Solemnization of Marriage by", te: "వివాహ నిర్వహణ" },
    list: [
      "Rev. G. Rajan Babu (Saint Pauls Lutheran Church, Kovvur)",
      "Bishop M. Mohan Rao (Christ's Care & Cure Ministries, Vizag)"
    ]
  },
  invitedBy: {
    label: { en: "Invited by", te: "ఆహ్వానించువారు" },
    list: [
      "Mr. Kamada Sanjeev Kumar (Late)", "Mrs. Jayasree", "Kamada Adarsh",
      "Mr. N. Naresh Kumar", "Mrs. Geeta Bindu", "N. Surya Mivaan"
    ]
  },

  /* Scene 6 closing: photo + the verse printed on the paper card */
  closing: {
    photo: "images/closing.jpg",
    verse: {
      ref: { en: "Psalm 118:23", te: "కీర్తనలు 118:23" },
      text: {
        en: "This is the LORD's doing; it is marvellous in our eyes.",
        te: "ఇది యెహోవావలన కలిగినది, ఇది మన కన్నులకు ఆశ్చర్యము."
      }
    }
  },
  musicSrc: "audio/music.mp3",

  /* files arrive later; a missing file must stay silent (no error) */
  /* voice narration intentionally not used */
  narration: { en: {}, te: {} },

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
      receptionLabel: { en: "LUNCH", te: "విందు భోజనం" },
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
        en: "With joy, we invite you to the wedding of Ashish & Sulochana:",
        te: "ఆనందంతో, ఆశీష్ & సులోచన వివాహానికి మిమ్మల్ని ఆహ్వానిస్తున్నాము:"
      },
      stub: { en: "Scene 6 — coming soon", te: "సన్నివేశం 6 — త్వరలో వస్తోంది" }
    }
  },

  /* every UI string */
  ui: {
    shared: {
      invited: "YOU ARE INVITED",
      openEnglish: "Open in English",
      openTelugu: "తెలుగులో తెరవండి",
      tapSeal: "Tap the seal to open",
      tapSealTe: "తెరవడానికి ముద్రను తాకండి",
      kindChoose1: "KINDLY CHOOSE",
      kindChoose2: "YOUR LANGUAGE",
      sealAria: "Tap the seal to open the invitation",
      monogramAria: "Monogram A and S"
    },
    en: {
      next: "Next",
      soundOnAria: "Mute sound",
      soundOffAria: "Unmute sound",
      togetherWith: "TOGETHER WITH THEIR FAMILIES",
      sceneLabels: ["Invitation envelope", "Names", "Photo story", "Blessing", "Ceremony and lunch", "Closing"],
      amp: "&"
    },
    te: {
      next: "తదుపరి",
      soundOnAria: "ధ్వనిని మ్యూట్ చేయి",
      soundOffAria: "ధ్వనిని ఆన్ చేయి",
      togetherWith: "ఇరు కుటుంబాల సమ్మతితో",
      sceneLabels: ["ఆహ్వాన కవరు", "వధూవరుల పేర్లు", "మా కథ", "ఆశీర్వాదం", "వివాహం మరియు విందు భోజనం", "ముగింపు"],
      amp: "&"
    }
  }
};
