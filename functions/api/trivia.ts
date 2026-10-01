// Cloudflare Pages Function for secure Gemini API calls
// This runs on Cloudflare's edge, keeping the API key secure

import { PagesFunction, Env } from '../types';
import { GEMINI_MODEL, OPENAI_MODEL } from '../constants';
import { sendErrorAlert } from '../errorNotifier';

interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

interface MultipleQuestionsResponse {
  questions: TriviaQuestion[];
}


const geminiMultipleQuestionsSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      description: "An array of trivia questions about Rush.",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The trivia question about the band Rush."
          },
          correctAnswer: {
            type: "string",
            description: "The single correct answer to the question."
          },
          incorrectAnswers: {
            type: "array",
            description: "An array of exactly three plausible but incorrect answers.",
            items: {
              type: "string",
            }
          },
        },
        required: ['question', 'correctAnswer', 'incorrectAnswers']
      }
    },
  },
  required: ['questions']
};

// OpenAI Structured Outputs REQUIRES additionalProperties: false on every object
const openAiMultipleQuestionsSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      description: "An array of trivia questions about Rush.",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The trivia question about the band Rush."
          },
          correctAnswer: {
            type: "string",
            description: "The single correct answer to the question."
          },
          incorrectAnswers: {
            type: "array",
            description: "An array of exactly three plausible but incorrect answers.",
            items: {
              type: "string",
            }
          },
        },
        required: ['question', 'correctAnswer', 'incorrectAnswers'],
        additionalProperties: false
      }
    },
  },
  required: ['questions'],
  additionalProperties: false
};

// Verified Rush facts extracted from extensive web research across gear, composition,
// history, awards, artwork, and deep lore. Embedded at build time so Cloudflare Pages
// Functions can reference them without filesystem access.
const RUSH_FACTS_REFERENCE = `
VERIFIED RUSH FACT SHEET — use this as a strict factual truth baseline.

=== CORE BAND & ALBUM FACTS ===
1. Chronological Studio Album Release Years: Rush (1974), Fly by Night (1975), Caress of Steel (1975), 2112 (1976), A Farewell to Kings (1977), Hemispheres (1978), Permanent Waves (1980), Moving Pictures (1981), Signals (1982), Grace Under Pressure (1984), Power Windows (1985), Hold Your Fire (1987), Presto (1989), Roll the Bones (1991), Counterparts (1993), Test for Echo (1996), Vapor Trails (2002), Feedback (2004), Snakes & Arrows (2007), Clockwork Angels (2012).
2. Power Windows was released in 1985 (NOT 1991). Roll the Bones was released in 1991 (NOT 1985).
3. Clockwork Angels (2012) is Rush's final studio album — debuted #1 in Canada and #2 on the U.S. Billboard 200.
4. Moving Pictures (1981) is Rush's best-selling U.S. album — certified 5x Multi-Platinum by the RIAA.
5. "Time Stand Still" is from HOLD YOUR FIRE (1987). Aimee Mann provided backing vocals. It is NOT from Presto, Roll the Bones, Counterparts, or Test for Echo.
6. Vapor Trails (2002) has zero synthesizers — a deliberate return to raw, guitar-driven sound.

=== 2026 TOUR ===
7. The 2026 "Fifty Something" tour features Geddy Lee, Alex Lifeson, and Anika Nilles (drums).
8. The tour kicks off June 7, 2026, at The Kia Forum in Los Angeles, CA.
9. Anika Nilles was born May 29, 1983, in Aschaffenburg, Germany. She earned a degree from the Popakademie Baden-Württemberg and became head of the drums department there.
10. Anika Nilles gained recognition through viral YouTube videos ("Wild Boy" 2013, "Alter Ego" 2014). She toured with Jeff Beck for 60+ shows in 2022. Released Pikalar (2017), For a Colorful Soul (2020), Opuntia EP (2022), and False Truth (2025) with her band Nevell.

=== PRE-PEART ERA & BAND FORMATION ===
11. Rush's earliest names: The Projection (1968), then "Rush" was suggested by John Rutsey's brother Bill just before their first gig in early September 1968 (traditionally cited as September 18, with verified Friday show dates September 6 and 13) at The Coff-In in North York, Ontario.
12. The original bassist at the first gig was Jeff Jones, who left after one show. Geddy Lee replaced him for the second show.
13. John Rutsey (co-founder, drums) played on the debut album Rush (1974). He left due to Type 1 diabetes and disagreements about musical direction. He died May 11, 2008, at age 55.
14. Neil Peart's audition was in late July 1974. He arrived in a Ford Pinto with his drums in garbage bags. He officially joined July 29, 1974 — Geddy Lee's 21st birthday.
15. During Geddy's 4-month exile from the band in 1969, Alex and John renamed the band Hadrian and recruited Joe Perna and Lindy Young. Geddy formed his own band called Ogilvie (later renamed Judd).
16. The debut album's Moon Records pressing had the logo in red; Mercury Records' reprint had a printer ink error that turned it hot pink/magenta.

=== CHART PERFORMANCE & AWARDS ===
17. Rush NEVER had a #1 album on the US Billboard 200. Their peak was #2, achieved twice: Counterparts (1993, blocked by Pearl Jam's Vs.) and Clockwork Angels (2012, blocked by Usher's Looking 4 Myself).
18. Billboard 200 peaks: Rush #105, Fly by Night #113, Caress of Steel #148, 2112 #61, A Farewell to Kings #33, Hemispheres #47, Permanent Waves #4, Moving Pictures #3, Signals #10, Grace Under Pressure #10, Power Windows #10, Hold Your Fire #13, Presto #16, Roll the Bones #3, Counterparts #2, Test for Echo #5, Vapor Trails #6, Feedback #19, Snakes & Arrows #3, Clockwork Angels #2.
19. RIAA: 2112 is 3x Multi-Platinum. Chronicles compilation is 2x Multi-Platinum. Rush ranks 3rd among rock bands for most consecutive Gold/Platinum albums (behind Beatles and Rolling Stones).
20. Rush received 7 Grammy nominations and ZERO wins. All 7 were for Best Rock Instrumental (YYZ, Where's My Thing?, Leave That Thing Alone, O Baterista, Malignant Narcissism, Hope) except the 7th — Best Long Form Music Video for Beyond the Lighted Stage (2011).
21. Rock and Roll Hall of Fame: Inducted April 18, 2013. Dave Grohl and Taylor Hawkins (Foo Fighters) inducted them. Alex Lifeson delivered his legendary "Blah Blah Blah" speech. Rush won the Hall's first-ever fan vote.
22. Canadian Music Hall of Fame: 1994. Order of Canada: 1996. Canada's Walk of Fame: 1999. Governor General's Performing Arts Award: 2012.

=== PRODUCERS ===
23. Terry Brown produced 8 studio albums: Fly by Night through Signals (1975–1982) — he engineered and remixed the 1974 debut (credited as produced by Rush). Called the "fourth member." "Broon's Bane" was Alex's tribute.
24. Steve Lillywhite was initially hired for Grace Under Pressure (1984) but pulled out for Simple Minds. Peter Henderson replaced him.
25. Peter Collins produced Power Windows (1985), Hold Your Fire (1987), Counterparts (1993), Test for Echo (1996).
26. Rupert Hine produced Presto (1989) and Roll the Bones (1991).
27. Nick Raskulinecz produced Snakes & Arrows (2007) and Clockwork Angels (2012). His air-drumming nickname "Booujzhe" is credited in album notes.
28. Vapor Trails (2002) was co-produced by Rush and Paul Northfield — eschewing an outside commercial producer to protect their fragile emotional state during reunion.

=== RECORDING STUDIOS ===
29. Le Studio (Morin-Heights, Quebec) — recorded 7 albums: Permanent Waves, Moving Pictures, Signals, Grace Under Pressure, Presto, Roll the Bones, Counterparts.
30. Rockfield Studios (Wales) — A Farewell to Kings (1977) and Hemispheres (1978). For "Xanadu," Terry Brown ran mic cables outside at dawn to capture real birdsong.
31. The Manor (Oxfordshire, England) & AIR Studios (Montserrat) — Power Windows (1985) and Hold Your Fire (1987).
32. Allaire Studios (Catskill Mountains, NY) — Snakes & Arrows (2007). Blackbird Studio (Nashville) and Revolution Recording (Toronto) — Clockwork Angels (2012).

=== GEDDY LEE'S BASS GUITARS ===
33. Rickenbacker 4001 (1973 Jetglo): Main bass on Fly by Night through Signals (1975–1982). Used Rick-O-Sound stereo output routing bridge pickup into overdriven guitar amps and neck pickup into clean Ampeg SVT.
34. 1972 Fender Jazz Bass (black, maple neck): Used on Moving Pictures (1981) for "Tom Sawyer," "YYZ," "Limelight." After shelving it during the synth era, Kevin "The Caveman" Shirley insisted Geddy resurrect it for Counterparts (1993). It remained his primary bass through Clockwork Angels (2012) and inspired his Fender signature model.
35. Steinberger L2 (headless, carbon graphite): Primary bass on Grace Under Pressure (1984).
36. Wal basses: Used on Power Windows (1985), Hold Your Fire (1987), Presto (1989), Roll the Bones (1991). Producer Peter Collins brought the first Wal to the Power Windows sessions. A custom 5-string Wal Mk2 was built for Hold Your Fire, used specifically on "Lock and Key."
37. Jaco Pastorius Tribute Fretless Jazz Bass: Used exclusively on "Malignant Narcissism" (Snakes & Arrows, 2007). Raskulinecz overheard Geddy noodling on it during vocal breaks and demanded they cut a track.

=== GEDDY LEE'S KEYBOARDS & SYNTHESIZERS ===
38. Minimoog Model D: Used 2112 through Moving Pictures. The scorching synth solo in "Tom Sawyer" was performed on the Minimoog.
39. Oberheim OB-X: The famous menacing filter sweep opening of "Tom Sawyer" (Moving Pictures, 1981) was created on the OB-X in Unison mode.
40. Oberheim OB-Xa: The anthemic opening chord sequence of "Subdivisions" (Signals, 1982).
41. Roland Jupiter-8: Used on Signals, Grace Under Pressure, Power Windows. "Countdown" and "Red Sector A" featured Jupiter-8 prominently.
42. PPG Wave 2.2/2.3: Defined the icy, crystalline digital textures of Grace Under Pressure and Power Windows.
43. Moog Taurus I Bass Pedals: Used from A Farewell to Kings through Signals. Both Geddy AND Alex owned sets — they provided sub-bass drones while hands were on guitars/keyboards.
44. Roland TR-808: Geddy programmed the rhythm track for "The Weapon" (Signals) on a TR-808 drum machine. Neil Peart spent days learning to replicate it acoustically.
45. E-mu Emulator II: Used on Power Windows and Hold Your Fire for sampled choir, horn, and percussion sounds.

=== ALEX LIFESON'S GUITARS ===
46. Gibson ES-355 (1976, Alpine White): Main guitar from A Farewell to Kings through Moving Pictures. Gibson released a signature Alex Lifeson ES-355 in 2008.
47. The "Hentor Sportscaster": Modified Stratocaster used on Moving Pictures, Signals, Grace Under Pressure. Named after misreading producer Peter Henderson's cursive handwriting as "Peter Hentor." Had a Bill Lawrence L-500 humbucker, Shark maple neck, and one of the earliest Floyd Rose locking tremolos. Used for the "Limelight" guitar solo.
48. PRS CE 24 & Custom 24: Used from the Presto tour through Test for Echo (1990–1996).
49. Gibson Alex Lifeson Les Paul Axcess: Used from Time Machine tour through R40 (2010–2015). Featured a Graph Tech Ghost piezo system for acoustic simulation.
50. Gibson EDS-1275 Double-Neck (6/12-String): Purchased for "Xanadu" — combined with Geddy's Rickenbacker 4080/12, creating their legendary "four-neck" live performance.

=== NEIL PEART'S DRUM KITS ===
51. Slingerland "Chromey" Kit: Used Fly by Night through All the World's a Stage (1975–1976), purchased from Long & McQuade with a Mercury advance after joining (the $750 figure was the price of his teenage Rogers kit).
52. "Old Faithful" Snare: A 5.5x14 Slingerland Artist Model purchased secondhand for $60 in 1977 during the 2112 tour. Used on every studio album and tour from A Farewell to Kings (1977) through Counterparts (1993) — 17 years.
53. Tama era: Neil used Slingerland "Blakrome" on A Farewell to Kings and Hemispheres. He switched to Tama Superstar in 1979: custom Rosewood finish for Permanent Waves and Moving Pictures; Candy Apple Red (Artstar prototype) for Signals, Grace Under Pressure, and Power Windows.
54. The 360-degree rotating drum riser debuted on the Grace Under Pressure tour (1984). Front side: full acoustic kit. Back side: Simmons SDS-V electronic pads, later Roland V-Drums and malletKAT.
55. In 1995, Peart studied with jazz guru Freddie Gruber, overhauled his technique, and switched from Tama to Drum Workshop (DW).
56. R40 tour kits: DW built two kits from a single 1,500-year-old Romanian River Oak log preserved under silt in the Olt River.
57. Sabian Paragon cymbals: Neil co-designed the series with Sabian (launched 2004 for the R30 tour) after officially switching from Zildjian in 2004.
58. Signature drumsticks: Pro-Mark 747 Japanese Shira Kashi White Oak, played butt-end forward with his left hand for added rimshot power.

=== LYRICAL & LITERARY INSPIRATIONS ===
59. "Xanadu" adapts Samuel Taylor Coleridge's 1797 poem "Kubla Khan."
60. "The Camera Eye" borrows its title from John Dos Passos' U.S.A. trilogy. "The Big Money" was also inspired by Dos Passos' third book of that trilogy.
61. "Red Barchetta" adapts Richard S. Foster's sci-fi story "A Nice Morning Drive" from Road & Track magazine (Nov 1973).
62. "Tom Sawyer" was co-written with Max Webster lyricist Pye Dubois — a modern subversion of Mark Twain's character.
63. "Bravado" (Roll the Bones) quotes John Barth's novel The Tidewater Tales: "We will pay the price, but we will not count the cost."
64. "Rivendell" (Fly by Night) references Tolkien. "The Necromancer" (Caress of Steel) draws from Tolkien's Sauron mythology.
65. The spaceship in "Cygnus X-1" is named Rocinante, after Don Quixote's horse from Cervantes.
66. "The Body Electric" draws from Walt Whitman's poem "I Sing the Body Electric" and Ray Bradbury's sci-fi collection.
67. "Losing It" (Signals) references Ernest Hemingway's suicide and his novel For Whom the Bell Tolls.

=== SONG STRUCTURES & COMPOSITION ===
68. "La Villa Strangiato" has 12 subtitled movements including "A Lerxst in Wonderland," "Monsters!" (quoting Raymond Scott's 1937 "Powerhouse" from Looney Tunes — Rush voluntarily paid Scott's estate), and "Danforth and Pape" (a Toronto intersection).
69. "2112" has 7 movements: Overture, The Temples of Syrinx, Discovery, Presentation, Oracle: The Dream, Soliloquy, Grand Finale.
70. "The Fountain of Lamneth" (Caress of Steel) has 6 parts. "Didacts and Narpets" — "Narpets" is an anagram of "Parents."
71. The "Fear" tetralogy was written in REVERSE order: Part III "Witch Hunt" (1981), Part II "The Weapon" (1982), Part I "The Enemy Within" (1984), Part IV "Freeze" (2002).
72. The "Gangster of Boats" trilogy is an inside joke — "Where's My Thing?" (1991) was officially subtitled "Part IV, 'Gangster of Boats' Trilogy" because a trilogy cannot have 4 parts, and Parts I–III were never written ("Leave That Thing Alone" carries no official subtitle on Counterparts).

=== TIME SIGNATURES ===
73. "Subdivisions" intro: 7/8 time. "YYZ" intro: 5/4 time spelling Toronto airport Morse code (Y-Y-Z). "Tom Sawyer" instrumental section: 7/8. "Freewill" verses: cycle between 6/4 and 7/4 (13/4 pattern).
74. "Jacob's Ladder" cycles between 5/4 and 6/4 (felt as 11/4). "Limelight" verses alternate 4/4 and 3/4 bars (7/4 feel). "La Villa Strangiato" shifts through 4/4, 7/8, 9/8, 5/8, 6/8, and 12/8.
75. "Natural Science" Part II "Hyperspace": 7/8. "The Trees" bridge: 5/4. "Kid Gloves" verses: 5/4 (felt as 10/8, 3+3+2+2). "Time Stand Still" intro and instrumental break: 7/4.

=== GUEST MUSICIANS ===
76. Hugh Syme: Rush's first guest musician, played ARP synthesizer on "2112: Overture," Mellotron on "Tears" (2112), piano on "Different Strings" (Permanent Waves), and synth on "Witch Hunt" (Moving Pictures).
77. Ben Mink: Played the electric violin solo on "Losing It" (Signals) — the only guest instrumental soloist of the synth era, and performed it live on the R40 tour.
78. Aimee Mann: Provided co-lead/backing vocals on "Time Stand Still" (Hold Your Fire) and appeared in its music video — Rush's first featured outside vocalist.
79. Mark Dailey (Toronto Citytv anchor): Provided the spoken-word vocal on "Subdivisions."
80. Terry Brown: Spoke the narrator voice on "Cygnus X-1 Book I" prologue.
81. Andy Richards: Additional keyboards on Power Windows and Hold Your Fire. Anne Dudley (Art of Noise) arranged strings on "Manhattan Project" at Abbey Road Studios.
82. Andrew Jackman arranged the choir on "Marathon" (Power Windows) and conducted The William Fairey Engineering Brass Band on Hold Your Fire.
83. Jason Sniderman played piano on "The Garden" (Clockwork Angels). David Campbell arranged strings for the Clockwork Angels String Ensemble.

=== RECORDING LORE ===
84. "Witch Hunt" (Moving Pictures): The mob sounds were recorded outside Le Studio on a freezing winter night — band and crew drank scotch and shouted into the blizzard.
85. "YYZ" opens with Morse code for Toronto Pearson Airport (Y-Y-Z) played on antique brass crotales.
86. The Hemispheres vocal crisis: The band composed all backing tracks in keys that strained Geddy's range to near damage. This led to a permanent rule to verify vocal keys before tracking.
87. Moving Pictures was one of rock's earliest hybrid digital masters (SPARS code ADD), recorded on 2-inch analog tape and mixed down to a Sony PCM-1610 digital two-track.
88. The Vapor Trails (2002) mastering by Howie Weinberg was a "Loudness War" poster child — severe digital clipping. David Bottrill remixed the entire album from scratch, released as Vapor Trails Remixed (Oct 1, 2013).
89. "Stick It Out" (Counterparts) was the first Rush track recorded with BOTH guitar and bass in Drop-D tuning (Alex had previously used Drop-D guitar on "Between the Wheels" while Geddy remained in standard tuning).
90. "Roll the Bones" rap was Geddy Lee's voice pitch-shifted down via Eventide H3000 Ultra-Harmonizer.
91. "The Necromancer" narrator voice is Neil Peart's voice slowed down and pitch-shifted.
92. Geddy's stage appliances (1996–2015): Maytag clothes dryers, vending machines, Henhouse rotisserie chicken ovens (Snakes & Arrows tour roasted real rubber chickens), and the steampunk "Gedcalibur" sausage stuffer (Time Machine tour).

=== ALBUM ART & HUGH SYME ===
93. Hugh Syme's first Rush cover was Caress of Steel (1975). The only studio albums NOT designed by Syme: Rush (1974, by Paul Weldon) and Fly by Night (1975, painted by Eraldo Carugati — who later painted the 4 KISS solo album covers).
94. The Starman logo was co-created by Hugh Syme and Neil Peart for 2112. Bobby King modeled the naked human figure. The red star represents the Solar Federation; the naked man represents the individual.
95. Moving Pictures cover: Photographed at the Ontario Legislative Building, Queen's Park, Toronto. Paintings being moved include "Dogs Playing Poker" and Joan of Arc (modeled by photographer Deborah Samuel).
96. Signals back cover: Blueprint features "Warren Cromartie Secondary School" (named after the Expos player) and plots spelling band nicknames Dirk, Lerxst, and Pratt.
97. Permanent Waves: Originally featured the "Dewey Defeats Truman" headline — Chicago Tribune threatened legal action, forcing alteration. Coca-Cola also objected to their logo placement, replaced by band members' surnames.
98. Exit... Stage Left cover contains visual references to ALL eight previous studio albums (owl, Starman, puppet king, brain hemispheres, movers, Paula Turnbull, etc.). Named after Snagglepuss's catchphrase.
99. Hold Your Fire gatefold: Juggler played by actor Stanley Brock. Street scene was a 5-foot miniature model. Clock displays 9:12 (21:12 in military time). Wet street effect: sandpaper sprayed with mineral spirits.
100. Clockwork Angels: Clock hands at 9:12 = 21:12 (honoring 2112) and September 12 (Neil Peart's birthday). Each of the 12 songs has an assigned alchemical symbol. Kevin J. Anderson co-wrote the companion novel.
101. Hugh Syme won 4 Juno Awards for Rush album graphics: Moving Pictures (1982), Power Windows (1986), Presto (1990), Roll the Bones (1992).

=== TOURS & MILESTONES ===
102. The Caress of Steel tour was nicknamed the "Down the Tubes Tour" due to poor ticket sales.
103. The Test for Echo tour (1996) introduced the "An Evening with Rush" no-opening-act format, used for all subsequent tours.
104. R40 final show: August 1, 2015, The Forum, Inglewood (Los Angeles). For the first and only time in 41 years, Neil Peart walked to center stage and bowed with Geddy and Alex together.
105. Neil Peart died January 7, 2020, in Santa Monica, CA, at age 67, from glioblastoma. He was diagnosed in August 2016 and kept it secret for 3.5 years.
106. Geddy Lee's memoir "My Effin' Life" (2023) revealed his parents were Polish Jewish Holocaust survivors, the origin of his name ("Geddy" from his mother's accent pronouncing "Gary"), and candid accounts of 1970s–80s drug use.
107. Alex Lifeson's side projects: Victor (1996, Atlantic Records, featuring Les Claypool on "The Big Dance") and Envy of None (2022, with Andy Curran and Maiah Wynne). He also guested on Porcupine Tree's "Anesthetize" (2007).
108. Notable opening acts for Rush: Def Leppard (1980, Permanent Waves tour), Iron Maiden (1981, Moving Pictures tour, with Paul Di'Anno), Primus (1991 and 1994), Mr. Big (1990), Marillion (1986, Power Windows tour, plus select 1983–84 dates), Cheap Trick (co-bills in 1977).
109. Rush in Rio (2003): 40,000 fans at Maracanã Stadium. São Paulo drew 60,000 — largest single headline crowd. SARSstock (July 30, 2003): 450,000–500,000 attendees at Downsview Park, Toronto.
110. Clockwork Angels tour (2012–2013): Only classic-era tour featuring guest musicians (8-piece string ensemble) on stage throughout.

=== FEEDBACK EP COVERS (2004) ===
111. The 8 covers: "Summertime Blues" (Eddie Cochran), "Heart Full of Soul" (The Yardbirds), "For What It's Worth" (Buffalo Springfield), "The Seeker" (The Who), "Mr. Soul" (Buffalo Springfield/Neil Young), "Seven and Seven Is" (Love), "Shapes of Things" (The Yardbirds), "Crossroads" (Robert Johnson/Cream).
`;

// System-level instruction — no user input is interpolated into this prompt.
// The only variable (count) is a server-validated integer (1–10), so prompt
// injection is not possible through this path.
// Topic categories used to randomize the prompt focus on each call.
// A random subset is selected and emphasized so the LLM produces different
// questions even when the rest of the prompt is identical.
const TOPIC_CATEGORIES = [
  '1970s Hard Rock & Prog Era (Rush, Fly By Night, Caress of Steel, 2112, A Farewell to Kings, Hemispheres, Permanent Waves)',
  '1980s Synth & Digital Era (Moving Pictures, Signals, Grace Under Pressure, Power Windows, Hold Your Fire, Presto)',
  '1990s Hard Rock & Alt Era (Roll the Bones, Counterparts, Test for Echo)',
  '2000s–2010s Late Studio Era (Vapor Trails, Feedback, Snakes & Arrows, Clockwork Angels)',
  'Live albums, tour history, opening acts, and stage props (e.g. dryers, rotisserie chickens, Gedcalibur)',
  'Guitars, bass rigs, and pedal setups (Rickenbacker 4001 stereo routing, Wal Mk1/Mk2 5-string, Hentor Sportscaster, PRS, Gibson ES-355, Taurus pedals)',
  'Keyboards, modular synthesizers, and drum machines (Minimoog, Oberheim OB-X / OB-Xa, Roland Jupiter-8, PPG Wave, TR-808, Emulator II)',
  'Neil Peart drum kits, snare lore (Old Faithful Slingerland Artist model), 360-degree rotating riser, Sabian Paragons, Romanian River Oak',
  'Recording studios and engineering (Le Studio Morin-Heights, Rockfield Studios Wales, The Manor, digital mixdowns, Vapor Trails loudness war & 2013 remix)',
  'Producers and engineers (Terry Brown, Peter Collins, Rupert Hine, Peter Henderson, Nick Raskulinecz, David Bottrill, Kevin Shirley)',
  'Song structures, suite movement subtitles, and anagrams (e.g. La Villa Strangiato movements, The Fountain of Lamneth, Fear tetralogy reverse chronology)',
  'Time signatures, polyrhythms, and harmonic theory (e.g. 7/8 in Subdivisions/Tom Sawyer, 5/4 in YYZ, 11/4 in Jacob\'s Ladder, the F#7add11 Lifeson chord)',
  'Literary influences, poetry, and philosophy (Samuel Taylor Coleridge, John Dos Passos, John Barth, Richard S. Foster, Ernest Hemingway, Ayn Rand)',
  'Album cover art, typography, and Hugh Syme Easter eggs (Starman origins, Permanent Waves headline controversy, Signals Warren Cromartie blueprint, Clockwork Angels alchemical symbols)',
  'Billboard chart peaks, RIAA multi-platinum counts, Grammy nomination history (7 nominations, 0 wins), and Rock Hall induction ceremony details',
  'Pre-Peart band history, formation, John Rutsey, Moon Records red-to-pink ink error, and early gig lore',
  'Guest musicians, arrangers, and vocal cameos (Ben Mink, Aimee Mann, Mark Dailey, Hugh Syme, Anne Dudley, Andrew Jackman, Clockwork Angels String Ensemble)',
  'The 2026 Fifty Something tour, setlist design, and Anika Nilles history and credentials',
];

type DifficultyLevel = 'easy' | 'medium' | 'hard';

const DIFFICULTY_INSTRUCTIONS: Record<DifficultyLevel, string> = {
  easy: `DIFFICULTY LEVEL: EASY ("Working Man" tier - Solid Rock & Rush Fan)
- NOTE: This is NOT "pop culture kindergarten." Do NOT ask insulting questions like "Who was the drummer?" or "What country are they from?"
- Focus on well-known classic radio hits and fan-staple tracks ("Tom Sawyer", "Subdivisions", "The Spirit of Radio", "Limelight", "Closer to the Heart", "Fly by Night", "Working Man", "Freewill", "Red Barchetta", "Time Stand Still").
- Cover album release sequencing, major album titles, prominent themes (Ayn Rand connection to 2112, CFNY inspiration for Spirit of Radio), Rock Hall induction year (2013), and basic tour/band milestones.
- Distractors must be believable classic rock or Rush alternatives (e.g., real Rush songs or adjacent 70s/80s prog bands), requiring genuine familiarity with Rush's catalog.`,

  medium: `DIFFICULTY LEVEL: MEDIUM ("Subdivisions" tier - Dedicated Rush Fan & Album Connoisseur)
- Focus on deep album tracks, non-single favorites, and album production details (e.g., "Natural Science", "The Camera Eye", "The Trees", "Red Sector A", "Bravado", "Far Cry", "La Villa Strangiato", "Jacob's Ladder").
- Cover producers (Terry Brown vs. Peter Collins vs. Rupert Hine vs. Nick Raskulinecz), recording locations (Le Studio in Quebec, Rockfield Studios in Wales), guest performers (Ben Mink's electric violin, Mark Dailey's voiceover, Aimee Mann on Hold Your Fire), and literary influences (Coleridge on Xanadu, Dos Passos on Camera Eye/Big Money, Richard Foster on Red Barchetta).
- Cover tour history (opening acts like Maiden or Def Leppard, R40 farewell, Anika Nilles' background for the 2026 tour), and chart positions (never hitting #1 on Billboard 200).
- Distractors must be plausible Rush songs, albums, producers, or dates from the same respective era that test true album-listening fans.`,

  hard: `DIFFICULTY LEVEL: HARD ("The Professor" tier - Elite Rush Scholars, Musicians & Historians)
- DEMAND EXTREME DEPTH: This tier must challenge even 30-year veteran Rush scholars and musicians. Avoid standard trivia that any casual Google search quickly returns.
- Deep Musicianship, Time Signatures & Composition:
  - Exact time signatures, alternating meter cycles, and polyrhythms (e.g., 7/8 Oberheim OB-Xa in "Subdivisions", 5/4 crotales Morse code in "YYZ", 6/4 to 7/4 in "Freewill", 10/8 in "Kid Gloves", 7/4 intro in "Time Stand Still", 11/4 in "Jacob's Ladder", 13/16 turnaround bar in "Tom Sawyer").
  - The "Alex Lifeson chord" voicing (F#7add11 with open B and E strings).
  - Specific multi-part suite movement titles (e.g., specific subtitles within "La Villa Strangiato", "The Fountain of Lamneth", or the reverse chronological release of the "Fear" series).
- Hyper-Specific Gear & Instrument Lore:
  - Specific basses per album/track: Rickenbacker 4001 with Rick-O-Sound stereo split; 1972 Fender Jazz pawn-shop find revived on Counterparts; Wal Mk1/Mk2 5-string on "Lock and Key"; Steinberger L2 on Grace Under Pressure; Jaco Pastorius fretless on "Malignant Narcissism".
  - Specific synthesizers per song: Minimoog solo on "Tom Sawyer", Oberheim OB-X opening sweep, Roland Jupiter-8 on "Red Sector A", TR-808 rhythm on "The Weapon", PPG Wave 2.2/2.3 digital textures.
  - Alex Lifeson's Hentor Sportscaster (origin of "Hentor the Barbarian" from Peter Henderson, Bill Lawrence L-500 pickup, Floyd Rose tremolo), Gibson EDS-1275 / Rickenbacker 4080 dual double-neck setup on "Xanadu", Les Paul Axcess with Graph Tech piezo.
  - Neil Peart kit minutiae: "Old Faithful" 1977 Slingerland Artist snare used for 17 years (A Farewell to Kings through Counterparts); Rosewood finish Tama on Permanent Waves/Moving Pictures vs Candy Apple Red on Signals; rotating 360-degree riser debut on 1984 GUP tour; DW Timbre-Matched Romanian River Oak kits for R40; transition to traditional grip with Freddie Gruber in 1995; Sabian Paragon line design.
- Deep Production, Studio & Artwork Lore:
  - Specific engineering details: Hybrid digital mixdown to Sony PCM-1610 on Moving Pictures (ADD); Vapor Trails 2002 digital clipping loudness war and David Bottrill's 2013 remix; Rupert Hine & Stephen W. Tayler's lean bass mix on Presto.
  - Hugh Syme artwork secrets: Caress of Steel sepia printer error; Moving Pictures Queen's Park models (Deborah Samuel, Kelly Jay, Bobby King); Permanent Waves Chicago Tribune "Dewey Defeats Truman" and Coca-Cola billboard controversies; Signals Warren Cromartie blueprint and member nicknames (Dirk, Lerxst, Pratt); Hold Your Fire Stanley Brock juggler and 9:12 / 21:12 clock; Clockwork Angels alchemical symbols.
  - Early history: Pre-Rush names (The Projection), Bill Rutsey coining the name "Rush", John Rutsey's debut lyric crisis, Neil Peart's Ford Pinto audition on Geddy's 21st birthday (July 29, 1974), Moon Records 3,500-copy run.
  - Grammy record: Exactly 7 nominations, 0 wins, all Best Rock Instrumental except the 2011 documentary.
- Distractors: Every incorrect answer must be a meticulously crafted, genuine Rush deep-lore element from adjacent tracks/albums/gear to prevent process of elimination.`
};

/**
 * Randomly shuffle an array (Fisher-Yates) and return the first `n` items.
 */
function pickRandom<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function buildTriviaPrompt(count: number, difficulty: DifficultyLevel = 'easy'): string {
  // Pick a random subset of topic categories to emphasize in this batch.
  // This ensures the prompt itself differs across calls, producing varied questions.
  const emphasizedTopics = pickRandom(TOPIC_CATEGORIES, 4 + Math.floor(Math.random() * 4));
  const topicList = emphasizedTopics.map((t, i) => `${i + 1}. ${t}`).join('\n');

  // A random seed value embedded in the prompt to further discourage deterministic output.
  const seed = Math.floor(Math.random() * 1_000_000);

  return [
    `Generate exactly ${count} different, highly diverse multiple-choice trivia questions about the Canadian progressive rock band Rush.`,
    '',
    DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.easy,
    '',
    `RANDOMIZATION SEED: ${seed}`,
    'Use this seed as creative inspiration to vary your question selection. Do NOT reuse questions from previous requests.',
    '',
    'BROAD CATALOG & ERA DIVERSITY:',
    'Generate questions spanning the broader universe of Rush\'s 40+ year history. Do NOT limit questions to a single era or a small handful of popular songs.',
    '',
    `FOR THIS BATCH, emphasize (but do not limit to) these randomly selected topic areas:`,
    topicList,
    '',
    'You may also draw from ANY other area of Rush\'s history not listed above.',
    '',
    'QUESTION VARIETY & NO REPETITION:',
    `- Ensure all ${count} questions in this batch cover completely different topics, albums, or band members.`,
    '- Avoid over-using repetitive tropes (e.g., asking only about Ayn Rand, Ben Mink, or album certifications). Provide a fresh, creative mix.',
    '- Aim for high-quality, engaging questions that reward fan knowledge while remaining 100% verifiably accurate.',
    '',
    'FACTUAL ACCURACY GUARDRAIL:',
    'Below is a VERIFIED RUSH FACT SHEET. This sheet serves as a strict factual truth baseline to prevent hallucinations or incorrect claims.',
    '- You are encouraged and expected to draw questions from the broader universe of Rush history BEYOND this list.',
    '- However, IF a question touches any topic mentioned in the fact sheet, your correct answer MUST strictly comply with and NOT contradict the fact sheet.',
    '- Never invent, speculate, or rely on rumored, unconfirmed, or false information.',
    '',
    RUSH_FACTS_REFERENCE,
    '',
    'IMPORTANT formatting rules:',
    '- Do NOT mention "the fact sheet", "according to reference", or similar metadata in any question or answer text. Present all questions as standalone trivia.',
    '- The question text MUST NOT contain or reveal the correct answer. For example, do NOT write "The 1985 album Power Windows was released in what year?" when the answer is "1985" — the answer is already in the question! Rephrase to hide the answer (e.g., "In what year was the album Power Windows released?").',
    '- For each question:',
    '  - Provide one correct answer in the "correctAnswer" field that is verifiably true.',
    '  - Provide exactly three plausible, distinct, but incorrect answers in the "incorrectAnswers" array.',
    '  - The correct answer MUST NOT appear in the "incorrectAnswers" array.',
    '  - Ensure all 4 options are distinct.',
  ].join('\n');
}

async function callGemini(apiKey: string, count: number = 5, difficulty: DifficultyLevel = 'easy'): Promise<TriviaQuestion[]> {
  const prompt = buildTriviaPrompt(count, difficulty);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: geminiMultipleQuestionsSchema,
        temperature: 0.3,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const jsonString = data.candidates[0].content.parts[0].text;
  const parsedData = JSON.parse(jsonString) as MultipleQuestionsResponse;

  if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length !== count) {
    throw new Error(`API returned invalid number of questions. Expected ${count}, got ${parsedData.questions?.length || 0}`);
  }

  // Validate each question
  for (const question of parsedData.questions) {
    if (question.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
    }
  }

  return parsedData.questions;
}

async function callOpenAI(apiKey: string, count: number = 5, difficulty: DifficultyLevel = 'easy'): Promise<TriviaQuestion[]> {
  const prompt = buildTriviaPrompt(count, difficulty);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and expert Rush trivia generation assistant. Draw from the broader universe of Rush history while strictly honoring the verified fact sheet for accurate details. Provide diverse, creative, and factually flawless trivia.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "trivia_questions",
          strict: true,
          schema: openAiMultipleQuestionsSchema
        }
      },
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const jsonString = data.choices[0].message.content;
  const parsedData = JSON.parse(jsonString) as MultipleQuestionsResponse;

  if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length !== count) {
    throw new Error(`API returned invalid number of questions. Expected ${count}, got ${parsedData.questions?.length || 0}`);
  }

  // Validate each question
  for (const question of parsedData.questions) {
    if (question.incorrectAnswers.length !== 3) {
      throw new Error("API returned an invalid number of incorrect answers for one of the questions.");
    }
  }

  return parsedData.questions;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // CORS headers — restrict browser access to the production domain (not a server-side abuse control)

  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let useOpenAI = false;

  try {
    useOpenAI = context.env.USE_OPENAI === 'true';
    const apiKey = useOpenAI ? context.env.OPENAI_API_KEY : context.env.GEMINI_API_KEY;

    if (useOpenAI) {
      console.log(`☁️ [Cloudflare Pages] Processing request with OpenAI (${OPENAI_MODEL})`);
    } else {
      console.log(`☁️ [Cloudflare Pages] Processing request with Google Gemini (${GEMINI_MODEL})`);
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: `${useOpenAI ? 'OPENAI' : 'GEMINI'}_API_KEY not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // ── Input validation ──────────────────────────────────────────────
    const request = context.request;

    // Verify Content-Type
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Reject oversized payloads (max 1 KB for a simple { count: N } body)
    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLength > 1024) {
      return new Response(JSON.stringify({ error: 'Request body too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Validate body shape
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Request body must be a JSON object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { count: rawCount, difficulty: rawDifficulty } = body as { count?: unknown; difficulty?: unknown };
    const count = typeof rawCount === 'number' ? Math.floor(rawCount) : 5;

    // Validate count range
    if (count < 1 || count > 10) {
      return new Response(JSON.stringify({ error: 'Count must be between 1 and 10' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Validate difficulty
    const validDifficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    const difficulty: DifficultyLevel = typeof rawDifficulty === 'string' && validDifficulties.includes(rawDifficulty as DifficultyLevel)
      ? (rawDifficulty as DifficultyLevel)
      : 'easy';

    // ── Generate questions ────────────────────────────────────────────
    const questions = useOpenAI
      ? await callOpenAI(apiKey, count, difficulty)
      : await callGemini(apiKey, count, difficulty);

    return new Response(JSON.stringify({ questions }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating trivia questions:', errorMessage);

    // Fire-and-forget email alert — does not block the response
    context.waitUntil(
      sendErrorAlert(context.env, {
        endpoint: '/api/trivia',
        provider: useOpenAI ? `OpenAI (${OPENAI_MODEL})` : `Gemini (${GEMINI_MODEL})`,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
    );

    return new Response(JSON.stringify({
      error: 'Failed to generate trivia questions',
      details: errorMessage,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

// Handle CORS preflight requests
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = ['https://rush2026.fyi', 'https://www.rush2026.fyi'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};