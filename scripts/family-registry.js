/* =========================================================
   FAMILY REGISTRY
   Shared site-wide member data
========================================================= */

const FAMILY_REGISTRY = {
    categories: {
        "Ancestors": [
        "caesar",
        "julius",
        "julia",
        "atia",
        "octavian"
        ],
        "Wives": [
        "fulvia",
        "octavia",
        "cleopatra"
        ],
        "Children": [
        "iullus",
        "aemilia",
        "airiana",
        "antonia",
        "nerod",
        "helios",
        "galatea",
        "selene",
        "juba"
        ],
        "Grandchildren": [
        "alessandro",
        "jaiden",
        "aurelia",
        "kaleb",
        "filipa",
        "teriteqas",
        "damion",
        "gamila",
        "decimus",
        "gage",
        "zarek",
        "xal",
        "batresh",
        "amun"
        ],
        "Great Grandchildren": [
        "eben",
        "kierdyn",
        "blay",
        "nero",
        "sid",
        "claudius",
        "rose",
        "frederick",
        "lhiannon",
        "vincent",
        "josiah",
        "taurus"
        ],
        "Servus / Custo": [
        "tor",
        "quintus",
        "dane",
        "arnulf",
        "inanna",
        "zane",
        "talon",
        "kenny",
        "wilhelm",
        "miklos",
        "joak"
        ]
    },

    starredMembers: [
        "damion"
    ],

    spouses: [
        "aemilia",
        "nerod",
        "juba",
        "teriteqas",
        "decimus",
        "galatea",
        "amun",
        "lhiannon"
    ],

/* =========================================================
   FAMILY METADATA
========================================================= */

    members: {
        aemilia: {
            name: "Claudia 'Aemilia' Marcella Major",
            title: "Present Antonius Matriarch",
            status: "Living",
            residence: "Antonius Estate, Ilva",
            parent: "octavia",
            spouses: ["iullus"],
            children: ["alessandro", "jaiden", "aurelia"],
            role: "Keeper of the Lares and scolder of naughty children.",
            portrait: "images/portraits/aemilia.png",
            next: "airiana",
            previous: "iullus"
        },

        airiana: {
            name: "Antonia 'Airiana' Major",
            title: "Lady of Leisure",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "octavia",
	        spouses: [],
	        children: ["kaleb"],
	        role: "Traveler of the Empire and breaker of bal..er.. hearts.",
            portrait: "images/portraits/airiana.png",
            next: "antonia",
            previous: "aemilia"
        },

        alessandro: {
            name: "Alessandro Antonius",
            title: "Legatus of the Antonius armies",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "iullus",
	        spouses: [],
	        children: [],
	        role: "Commander of legions and enthusiast of legionaries.",
            portrait: "images/portraits/alessandro.png",
            next: "jaiden",
            previous: "juba",
        },

        amun: {
            name: "Amun Antonius",
            title: "Nobleman of Tyre",
	        status: "Living",
	        residence: "Alexandria, Egypt",
            parent: "",
	        spouses: ["batresh"],
	        children: [],
	        role: "Prince of Tyre and scholar of Pheonicia",
            portrait: "images/portraits/amun.png",
            next: "kierdyn",
            previous: "batresh",
        },

        antonia: {
            name: "Antonia Minor",
            title: "Lady of the People",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "octavia",
	        spouses: ["nerod"],
            spouseSides: {
                nerod: "right"
            },
	        children: ["filipa", "damion"],
	        role: "Shrewd political figure and cunning diplomat.",
            portrait: "images/portraits/antonia.png",
            next: "nerod",
            previous: "airiana",
        },

        atia: {
            name: "Atia Balba Caesonia",
            title: "Granddaughter of Caesar",
	        status: "Deceased",
	        residence: "Antonius Estate, Ilva",
            parent: "julia",
	        spouses: [],
	        children: ["octavia", "octavian"],
	        role: "A powerful Roman noble who always goes first.",
            portrait: "images/portraits/atia.png",
            next: "octavian",
            previous: "julia",
        },

        aurelia: {
            name: "Aurelia Antonius",
            title: "Daughter of Rome",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "iullus",
	        spouses: [],
	        children: ["kierdyn", "eben"],
	        role: "Devoted mother and lover of the arts.",
            portrait: "images/portraits/aurelia.png",
            next: "kaleb",
            previous: "jaiden",
        },

        batresh: {
            name: "Batresh Antonius",
            title: "Scholar of Alexandria",
	        status: "Living",
	        residence: "Caesarea, Mauritania",
            parent: "selene",
	        spouses: ["amun"],
            spouseSides: {
                amun: "right"
            },
	        children: [],
	        role: "Scholar of political sciences and adoring daughter.",
            portrait: "images/portraits/batresh.png",
            next: "amun",
            previous: "xal",
        },

        blay: {
            name: "Blay Antonius",
            title: "Son of Nubia",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "filipa",
	        spouses: [],
	        children: [],
	        role: "Prince of Nubia and enthusiastic lover of canines.",
            portrait: "images/portraits/blay.png",
            next: "nero",
            previous: "eben",
        },

        caesar: {
            name: "Gaius Julius Caesar",
            title: "Father of Rome",
	        status: "Deceased",
	        residence: "Rome, Italia",
            parent: "",
	        spouses: [],
	        children: ["julius", "julia"],
	        role: "The man who spawned the future of Rome.",
            portrait: "images/portraits/caesar.png",
            next: "julius",
            previous: "cleopatra",
        },

        claudius: {
            name: "Claudius Antonius Paullus",
            title: "Champion of Rome",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "damion",
	        spouses: [],
	        children: [],
	        role: "Gladiator, Racer and loving son.",
            portrait: "images/portraits/claudius.png",
            next: "rose",
            previous: "sid",
        },

        cleopatra: {
            name: "Cleopatra VII Philopator",
            title: "The last Ptolemaic Pharaoh of Egypt",
	        status: "Deceased",
	        residence: "Alexandria, Egypt",
            parent: "",
	        spouses: ["marcus"],
	        children: ["helios", "selene"],
	        role: "Daughter of Isis and beloved Queen.",
            portrait: "images/portraits/cleopatra.png",
            next: "caesar",
            previous: "fulvia",
        },

        damion: {
            name: "Damion Draco Antonius",
            title: "Pater Famiglia",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "antonia",
	        spouses: [],
	        children: ["nero", "sid", "claudius"],
	        role: "Head of the Antonius family and all around sweet boy.",
            portrait: "images/portraits/damion.png",
            next: "gamila",
            previous: "teriteqas",
        },

        decimus: {
            name: "Decimus Cosmas",
            title: "Gladius of Rome",
	        status: "Living",
	        residence: "Romae, Italia",
            parent: "",
	        spouses: ["gamila"],
	        children: ["rose", "frederick"],
	        role: "Roman legionaire and devoted husband.",
            portrait: "images/portraits/decimus.png",
            next: "gage",
            previous: "gamila",
        },

        eben: {
            name: "Eben Antonius Tenebrus",
            title: "Custos Sacrī Plutonis",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "aurelia",
	        spouses: [],
	        children: [],
	        role: "Flamen of Pluto and Bzzter of Vincent.",
            portrait: "images/portraits/eben.png",
            next: "blay",
            previous: "kierdyn",
        },

        filipa: {
            name: "Filipa Antonius",
            title: "Queen of Nubia & Renowned Architect",
	        status: "Living",
	        residence: "Across the Empire",
            parent: "antonia",
	        spouses: ["teriteqas"],
            spouseSides: {
                teriteqas: "right"
            },
	        children: ["blay"],
	        role: "Builder of Rome and drinker of HER wine.",
            portrait: "images/portraits/filipa.png",
            next: "teriteqas",
            previous: "kaleb",
        },

        frederick: {
            name: "Aulus Antonius Feradachus",
            title: "The Red Wolf of Brigantia",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "gamila",
	        spouses: ["lhiannon"],
            spouseSides: {
                lhiannon: "right"
            },
	        children: [],
	        role: "Bragantian warrior and lover of song.",
            portrait: "images/portraits/frederick.png",
            next: "lhiannon",
            previous: "rose",
        },

        fulvia: {
            name: "Fulvia",
            title: "Third wife of Marcus",
	        status: "Deceased",
	        residence: "Antonius Estate, Ilva",
            parent: "",
	        spouse: ["marcus"],
	        children: ["iullus"],
	        role: "Matriarch of the Antonius family.",
            portrait: "images/portraits/fulvia.png",
            next: "cleopatra",
            previous: "marcus",
        },

        gage: {
            name: "'Gage' Gaius Antonius Menelaus",
            title: "Praefectus classis of the Antonius fleet",
	        status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "helios",
	        spouses: [],
	        children: ["vincent"],
	        role: "A naval commander and good man who sails into your heart.",
            portrait: "images/portraits/gage.png",
            next: "zarek",
            previous: "decimus",
        },

        galatea: {
            name: "Galatea of Atropatene",
            title: "Daughter of Artavasdes I",
	        status: "Deceased",
	        residence: "Antonius Villa, Athens",
            parent: "",
	        spouses: ["helios"],
	        children: ["gamila", "gage"],
	        role: "A Princess of Persia, and lover of the sea.",
            portrait: "images/portraits/galatea.png",
            next: "selene",
            previous: "helios",
        },

        gamila: {
            name: "Gamila Antonius",
            title: "Daughter of the Sun",
	        status: "Living",
	        residence: "Around the world",
            parent: "helios",
	        spouses: ["decimus"],
            spouseSides: {
                decimus: "right"
            },
	        children: ["rose", "frederick"],
	        role: "A woman of the world and expert swordswoman.",
            portrait: "images/portraits/gamila.png",
            next: "decimus",
            previous: "damion",
        },

        helios: {
            name: "Alexander Helios",
            title: "Son of Egypt",
            status: "Deceased",
	        residence: "Rome, Italia",
            parent: "cleopatra",
            spouses: ["galatea"],
            spouseSides: {
                galatea: "right"
            },
	        children: ["gamila", "gage"],
            role: "Born of Isis and made the Sun.",
            portrait: "images/portraits/helios.png",
            next: "selene",
            previous: "nerod",
        },

        iullus: {
            name: "Iullus Antonius",
            title: "Son of the Lion",
            status: "Deceased",
	        residence: "Rome, Italia",
            parent: "fulvia",
            spouses: ["aemilia"],
            spouseSides: {
                aemilia: "left"
            },
	        children: ["alessandro", "jaiden", "aurelia"],
            role: "Expected heir and loving father.",
            portrait: "images/portraits/iullus.png",
            next: "aemilia",
            previous: "octavia",
        },

        jaiden: {
            name: "Jaiden Antonius",
            title: "Son of Rome",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "iullus",
            spouses: [],
	        children: [],
            role: "Quirky brother and artistic savant.",
            portrait: "images/portraits/jaiden.png",
            next: "aurelia",
            previous: "alessandro",
        },

        josiah: {
            name: "Josiah Antonius",
            title: "Son of Rome",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "zarek",
            spouses: [],
	        children: [],
            role: "Creatively inclined and aesthetic redesigner",
            portrait: "images/portraits/josiah.png",
            next: "taurus",
            previous: "vincent",
        },

        juba: {
            name: "Juba II",
            title: "King of Mauritania",
            status: "Living",
	        residence: "Caesarea, Mauritania",
            parent: "juba1",
            spouses: ["selene"],
	        children: ["zarek", "xal", "batresh"],
            role: "Scholarly poet and devoted family man.",
            portrait: "images/portraits/jubaII.png",
            next: "alessandro",
            previous: "selene",
        },

        julia: {
            name: "Julia Minor",
            title: "Daughter of Caesar",
	        status: "Deceased",
	        residence: "Rome, Italia",
            parent: "caesar",
	        spouses: [],
	        children: ["atia"],
	        role: "A dutiful daughter and fashion forward figure of Rome.",
            portrait: "images/portraits/julia.png",
            next: "atia",
            previous: "julius",
        },

        julius: {
            name: "Julius Caesar",
            title: "The man who would be Emperor of Rome",
	        status: "Deceased",
	        residence: "Rome, Italia",
            parent: "caesar",
	        spouses: [],
	        children: [],
	        role: "The greatest Roman in history.",
            portrait: "images/portraits/julius.png",
            next: "julia",
            previous: "caesar",
        },

        kaleb: {
            name: "Kaleb Antonius Jaymes",
            title: "Son of Liesure",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "airiana",
            spouses: [],
	        children: [],
            role: "A culinary delighter and evokative dancer.",
            portrait: "images/portraits/kaleb.png",
            next: "filipa",
            previous: "aurelia",
        },

        kierdyn: {
            name: "Kierdyn Antonius",
            title: "Son of Rome & Brother of Eben",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "aurelia",
            spouses: [],
	        children: [],
            role: "A dedicated medicus yet wayward heart.",
            portrait: "images/portraits/kierdyn.png",
            next: "eben",
            previous: "amun",
        },

        lhiannon: {
            name: "Lhiannon Antonius",
            title: "Daughter of Brigatane",
            status: "Deceased",
	        residence: "Antonius Estate, Ilva",
            parent: "",
            spouses: ["frederick"],
	        children: [],
            role: "A great beauty with a voice to make the gods weep",
            portrait: "images/portraits/lhiannon.png",
            next: "vincent",
            previous: "frederick",
        },

        marcus: {
            name: "Marcus Antonius",
            title: "Genesis of the Antonius family",
            status: "Deceased",
	        residence: "Rome, Italia",
            parent: "",
            spouses: ["fulvia", "octavia", "cleopatra"],
	        children: ["iullus", "airiana", "antonia", "helios", "selene"],
            role: "A co-ruler of Rome and eternal lover.",
            portrait: "images/portraits/marcus.png",
            next: "fulvia",
            previous: "joak",
        },

        nero: {
            name: "Nero Antonius",
            title: "Rector of the Roman Hippodrome",
            status: "Living",
	        residence: "Pompeii, Italia",
            parent: "damion",
            spouses: ["dante"],
	        children: [],
            role: "A lover of horses and beloved son.",
            portrait: "images/portraits/nero.png",
            next: "sid",
            previous: "blay",
        },

        nerod: {
            name: "Nero Claudius Drusus",
            title: "Son of Rome",
            status: "Deceased",
	        residence: "Rome, Italia",
            parent: "",
            spouses: ["antonia"],
	        children: ["filipa", "damion"],
            role: "A saavy poitician and avid attendee of the gymnasium.",
            portrait: "images/portraits/nerod.png",
            next: "helios",
            previous: "antonia",
        },

        octavia: {
            name: "Octavia the Younger",
	        title: "Matriarch of the Antonii",
	        status: "Deceased",
	        residence: "Antonius Estate, Ilva",
            parent: "atia",
	        spouses: ["marcus"],
	        children: ["airiana", "antonia"],
	        role: "Third wife of Marcus and adored mother to many Antonii.",
	        portrait: "images/portraits/octavia.png",
	        next: "iullus",
	        previous: "octavian",
        },

        octavian: {
            name: "Octavian 'Augustus' Caesar",
            title: "Emperor of the Roman Empire",
	        status: "Living",
	        residence: "Palatine Hill, Rome, Italia",
            parent: "atia",
	        spouses: [],
	        children: [],
	        role: "The man who rules Rome and all its people.",
            portrait: "images/portraits/octavian.png",
            next: "octavia",
            previous: "atia",
        },

        rose: {
            name: "AutumnRose Antonius",
            title: "The Heart that Endures",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "gamila",
            spouses: [],
	        children: [],
            role: "A quiet beauty yet a delightful hostess.",
            portrait: "images/portraits/rose.png",
            next: "frederick",
            previous: "claudius",
        },

        selene: {
            name: "Cleopatra Selene II",
            title: "Daughter of Isis & Queen of Mauritania",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "cleopatra",
            spouses: ["juba"],
            spouseSides: {
                juba: "right"
            },
	        children: ["zarek", "xal", "batresh"],
            role: "Her hair-'Money!' Her clothe-'Money!'...",
            portrait: "images/portraits/selene.png",
            next: "juba",
            previous: "galatea",
        },

        sid: {
            name: "Sidonius Antonius",
            title: "Son of Rome",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "damion",
            spouses: [],
	        children: [],
            role: "A Grecian trained philosopher and well traveled sight-seer.",
            portrait: "images/portraits/sidonius.png",
            next: "claudius",
            previous: "nero",
        },

        taurus: {
            name: "Taurus Antonius Crystalis",
            title: "The Albino Bull of Ilva",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "xal",
            spouses: [],
	        children: [],
            role: "A solitary myth and beloved son.",
            portrait: "images/portraits/taurus.png",
            next: "tor",
            previous: "josiah",
        },

        teriteqas: {
            name: "Teriteqas",
            title: "King of Nubia",
            status: "Living",
	        residence: "Nubia",
            parent: "",
            spouses: ["filipa"],
	        children: ["blay"],
            role: "An iron ruler with a 'stick' that might as well be iron.",
            portrait: "images/portraits/teriteqas.png",
            next: "damion",
            previous: "filipa",
        },

        vincent: {
            name: "Vincent Hawke Antonius",
            title: "Sporting Champion of Rome",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "gage",
            spouses: [],
	        children: [],
            role: "A chariot racer and gladiator.",
            portrait: "images/portraits/vincent.png",
            next: "josiah",
            previous: "lhiannon",
        },

        xal: {
            name: "Xal Antonius",
            title: "Procurator Metallorum & Procurator Famiglia",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "selene",
            spouses: [],
	        children: ["taurus"],
            role: "A genius with numbers and an adonis of the gymnasium.",
            portrait: "images/portraits/xal.png",
            next: "batresh",
            previous: "zarek",
        },

        zarek: {
            name: "Zarek Antonius",
            title: "Imperial Senator & Family Scribe",
            status: "Living",
	        residence: "Antonius Estate, Ilva",
            parent: "selene",
            spouses: [],
	        children: ["josiah"],
            role: "A fashion expert and lawmaker extraordinaire.",
            portrait: "images/portraits/zarek.png",
            next: "xal",
            previous: "gage",
        },

/* =========================================================
SERVUS/CUSTOS METADATA
========================================================= */

        arnulf:{
            name: "Arnulf",
            title: "Custos Antonius",
            portrait: "images/portraits/arnulf.png",
            next: "inanna",
            previous: "dane",
        },

        dane:{
            name: "Dane",
            title: "Custos Antonius",
            portrait: "images/portraits/dane.png",
            next: "arnulf",
            previous: "quintus",
        },

        inanna: {
            name: "Inanna",
            title: "Servus Antonius",
            portrait: "images/portraits/inanna.png",
            next: "zane",
            previous: "arnulf",
        },

        joak: {
            name: "Joak",
            title: "Servus Antonius",
            portrait: "images/portraits/joak.png",
            next: "marcus",
            previous: "miklos",
        },

        kenny: {
            name: "Kenneth",
            title: "Servus Antonius",
            portrait: "images/portraits/kenny.png",
            next: "wilhelm",
            previous: "talon",
        },

        miklos: {
            name: "Miklos",
            title: "Servus Antonius",
            portrait: "images/portraits/miklos.png",
            next: "joak",
            previous: "wilhelm",
        },

        quintus: {
            name: "Quintus",
            title: "Antonius Custos & Sporting Champion",
            portrait: "images/portraits/quintus.png",
            next: "dane",
            previous: "tor",
        },

        talon: {
            name: "Talon",
            title: "Servus Antonius",
            portrait: "images/portraits/talon.png",
            next: "kenny",
            previous: "zane",
        },

        tor: {
            name: "Tor",
            title: "Servus Antonius",
            portrait: "images/portraits/tor.png",
            next: "quintus",
            previous: "taurus",
        },

        wilhelm: {
            name: "Wilhelm",
            title: "Custos Antonius",
            portrait: "images/portraits/wilhelm.png",
            next: "miklos",
            previous: "kenny",
        },

        zane: {
            name: "Zane",
            title: "Servus Antonius",
            portrait: "images/portraits/zane.png",
            next: "talon",
            previous: "inanna",
        }
    }
};

/* =========================================================
   SHARED HELPERS
========================================================= */

function getCharacterFolder(id) {
  const servusList = FAMILY_REGISTRY.categories["Servus / Custo"] || [];
  return servusList.includes(id) ? "servus" : "family";
}