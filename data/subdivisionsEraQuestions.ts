import { TriviaQuestion, SubdivisionsEra } from '../types';

export type SpecificSubdivisionsEra = Exclude<SubdivisionsEra, 'all'>;

export const SUBDIVISIONS_ERA_QUESTIONS: Record<SpecificSubdivisionsEra, TriviaQuestion[]> = {
  'prog-70s': [
    {
      question: 'Which literary classic served as the direct thematic inspiration for Neil Peart\'s lyrics on "Xanadu"?',
      correctAnswer: '"Kubla Khan" by Samuel Taylor Coleridge',
      incorrectAnswers: [
        '"The Rime of the Ancient Mariner" by Samuel Taylor Coleridge',
        '"Paradise Lost" by John Milton',
        '"The Waste Land" by T.S. Eliot',
      ],
    },
    {
      question: 'Following the commercial disappointment of Caress of Steel, what self-deprecating nickname did the band give their late 1975 supporting tour?',
      correctAnswer: 'The "Down the Tubes" Tour',
      incorrectAnswers: [
        'The "Steel Wheels" Tour',
        'The "Going Downhill Fast" Tour',
        'The "Broke and Hungry" Tour',
      ],
    },
    {
      question: 'In the liner notes of 2112, whose "genius" is credited as inspiration for the title suite?',
      correctAnswer: 'Ayn Rand',
      incorrectAnswers: [
        'George Orwell',
        'Aldous Huxley',
        'Robert A. Heinlein',
      ],
    },
    {
      question: 'During the recording of A Farewell to Kings at Rockfield Studios in Wales, where did the band place microphones to capture ambient birdsong and outdoor acoustic guitar resonance?',
      correctAnswer: 'In an adjoining outdoor courtyard',
      incorrectAnswers: [
        'Inside a stone livestock barn',
        'Beside the nearby River Monnow',
        'On the studio farmhouse roof',
      ],
    },
    {
      question: 'Which multi-part epic on Hemispheres required weeks of exhausting vocal tracking because it was unintentionally recorded in an uncomfortably high key for Geddy Lee?',
      correctAnswer: '"Cygnus X-1 Book II: Hemispheres"',
      incorrectAnswers: [
        '"The Trees"',
        '"Circumstances"',
        '"La Villa Strangiato"',
      ],
    },
    {
      question: 'What auxiliary percussion instrument does Neil Peart play to provide rhythmic accents on "A Passage to Bangkok"?',
      correctAnswer: 'An orchestral wood block',
      incorrectAnswers: [
        'A tuned Chinese temple gong',
        'A pair of wooden castanets',
        'A set of brass bell trees',
      ],
    },
    {
      question: 'Which custom double-neck instrument did Alex Lifeson introduce during the A Farewell to Kings sessions and subsequent tour?',
      correctAnswer: 'Gibson EDS-1275 (6-string / 12-string)',
      incorrectAnswers: [
        'Rickenbacker 4080/12 (4-string Bass / 12-string)',
        'Gibson EDS-1275 (4-string Bass / 6-string)',
        'Ovation 12/6 Double Neck Acoustic',
      ],
    },
    {
      question: 'What French phrase is recited by Geddy Lee during the bridge of "Circumstances"?',
      correctAnswer: 'Plus ça change, plus c\'est la même chose',
      incorrectAnswers: [
        'C\'est la vie, mon cher ami',
        'Je ne sais quoi de la vérité',
        'Chacun à son goût, tout le monde',
      ],
    },
    {
      question: 'What tongue-in-cheek subtitle accompanies "La Villa Strangiato" on the original vinyl packaging of Hemispheres?',
      correctAnswer: '"An Exercise in Self-Indulgence"',
      incorrectAnswers: [
        '"A Journey into Nightmare"',
        '"Twelve Movements for Trio"',
        '"The Hall of the Mountain Jam"',
      ],
    },
    {
      question: 'On which track from Fly by Night did Neil Peart first draw lyrical inspiration from J.R.R. Tolkien\'s Middle-earth?',
      correctAnswer: '"Rivendell"',
      incorrectAnswers: [
        '"By-Tor & the Snow Dog"',
        '"In the End"',
        '"Best I Can"',
      ],
    },
    {
      question: 'Which multi-part track on Fly by Night marked Neil Peart\'s very first fantasy/mythological epic with Rush?',
      correctAnswer: '"By-Tor & the Snow Dog"',
      incorrectAnswers: [
        '"The Necromancer"',
        '"Rivendell"',
        '"In the End"',
      ],
    },
    {
      question: 'In the "Discovery" chapter of the 2112 suite, what object does the protagonist find hidden behind a waterfall in the caves?',
      correctAnswer: 'An ancient acoustic guitar',
      incorrectAnswers: [
        'A locked diary',
        'A telescope',
        'A radio receiver',
      ],
    },
    {
      question: 'In "Cygnus X-1 Book II: Hemispheres", what title is bestowed upon Cygnus when he resolves the eternal clash between Apollo and Dionysus?',
      correctAnswer: 'The God of Balance',
      incorrectAnswers: [
        'The Bringer of Peace',
        'The Master of the Spheres',
        'The Sovereign of Thought',
      ],
    },
  ],

  'synthesis-80s': [
    {
      question: 'The rhythm of the opening instrumental intro of "YYZ" spells out what specific pattern?',
      correctAnswer: 'The Morse code pattern -.-- -.-- --..',
      incorrectAnswers: [
        'The Morse code pattern .-. ..- ... ....',
        'The Morse code pattern -.-. .- -. .- -.. .-',
        'The Morse code pattern -.-- - --- .-.',
      ],
    },
    {
      question: 'Whose name was substituted onto the background billboard on revised pressings of Permanent Waves after the Chicago Tribune objected to their front-page headline?',
      correctAnswer: 'Ray Danniels',
      incorrectAnswers: [
        'Terry Brown',
        'Hugh Syme',
        'Peter Henderson',
      ],
    },
    {
      question: 'Which visual element on the front cover of Moving Pictures represents an emotional interpretation of the album\'s title?',
      correctAnswer: 'People openly weeping at the framed artwork',
      incorrectAnswers: [
        'An easel strapped to a speeding station wagon',
        'A marathon runner holding an oil painting',
        'A theater marquee showing a reel-to-reel film',
      ],
    },
    {
      question: 'Which historic NASA event was witnessed in person by the band and subsequently commemorated on the track "Countdown"?',
      correctAnswer: 'The STS-1 maiden launch of Space Shuttle Columbia',
      incorrectAnswers: [
        'The Apollo-Soyuz rendezvous mission',
        'The rollout of Space Shuttle Challenger',
        'The launch of Voyager 1 toward Saturn',
      ],
    },
    {
      question: 'What was the primary motivation behind the band parting ways with longtime producer Terry Brown ahead of recording Grace Under Pressure?',
      correctAnswer: 'A mutual desire to avoid creative stagnation and comfortable studio routines',
      incorrectAnswers: [
        'A major dispute over royalties and publishing rights with Anthem Records',
        'Terry Brown\'s objection to the use of synthesizers and ska rhythms',
        'Brown signing an exclusive long-term production contract with another band',
      ],
    },
    {
      question: 'Which English producer initially committed to produce Grace Under Pressure before abruptly pulling out just before sessions were scheduled to begin?',
      correctAnswer: 'Steve Lillywhite',
      incorrectAnswers: [
        'Trevor Horn',
        'Rupert Hine',
        'Roy Thomas Baker',
      ],
    },
    {
      question: 'Which hexagonal electronic drum kit did Neil Peart integrate into his rotating 360-degree drum rig beginning in 1984?',
      correctAnswer: 'Simmons SDS-V',
      incorrectAnswers: [
        'Roland V-Drums TD-10',
        'LinnDrum LM-2',
        'E-mu SP-12',
      ],
    },
    {
      question: 'In the technical credits on the back sleeve of Moving Pictures, what humorous label is given to Alex Lifeson\'s contributions alongside his standard guitar credits?',
      correctAnswer: '"Guitabulous"',
      incorrectAnswers: [
        '"The Lerxst Dimension"',
        '"Shred Extremist"',
        '"String Sorcery"',
      ],
    },
    {
      question: 'What specific community environment inspired Neil Peart\'s lyrics contrasting conformity with nonconformity on "Subdivisions"?',
      correctAnswer: 'Post-war Canadian suburban housing tracts',
      incorrectAnswers: [
        'Dense urban high-rises in downtown Toronto',
        'Factory towns and manufacturing corridors',
        'Rural farm communes in Ontario',
      ],
    },
    {
      question: 'Which analog synthesizer is responsible for the famous opening swept-filter chord heard on "Tom Sawyer"?',
      correctAnswer: 'Oberheim OB-X',
      incorrectAnswers: [
        'Yamaha DX7',
        'Roland Juno-60',
        'ARP Odyssey',
      ],
    },
    {
      question: 'The intro and title of "The Spirit of Radio" were inspired by which legendary, free-form Toronto FM radio station?',
      correctAnswer: 'CFNY-FM (102.1)',
      incorrectAnswers: [
        'CHUM-FM',
        'Q107',
        'CKLG',
      ],
    },
    {
      question: 'How many distinct literal meanings of the phrase "Moving Pictures" are depicted simultaneously on Hugh Syme\'s iconic album cover?',
      correctAnswer: 'Three',
      incorrectAnswers: [
        'Two',
        'Four',
        'Five',
      ],
    },
    {
      question: 'Who stepped in to co-produce Grace Under Pressure after longtime producer Terry Brown and the band parted ways?',
      correctAnswer: 'Peter Henderson',
      incorrectAnswers: [
        'Peter Collins',
        'Rupert Hine',
        'Terry Manning',
      ],
    },
  ],

  'synth-pop-80s-90s': [
    {
      question: 'Which guest musician provided prominent co-lead vocal harmonies on "Time Stand Still"?',
      correctAnswer: 'Aimee Mann',
      incorrectAnswers: [
        'Chrissie Hynde',
        'Kate Bush',
        'Ann Wilson',
      ],
    },
    {
      question: 'On which track from Power Windows did Rush record with a 25-piece string section arranged by Anne Dudley at Abbey Road Studios?',
      correctAnswer: '"Manhattan Project"',
      incorrectAnswers: [
        '"The Big Money"',
        '"Middletown Dreams"',
        '"Emotion Detector"',
      ],
    },
    {
      question: 'How was the distinct, low-pitched voice on the rap section of "Roll the Bones" produced in the studio?',
      correctAnswer: 'Geddy Lee recorded the vocal, and his track was pitch-shifted down',
      incorrectAnswers: [
        'A local Toronto hip-hop artist delivered the lines in studio',
        'Neil Peart spoke through an Eventide harmonizer set to a robotic vocoder',
        'Rupert Hine performed the vocal take through a toy megaphone',
      ],
    },
    {
      question: 'Which recurring visual element dominates the landscape on the album art of Presto?',
      correctAnswer: 'Hundreds of magician top hats with rabbits',
      incorrectAnswers: [
        'Skeletons throwing dice into clouds',
        'Mirrors reflecting floating playing cards',
        'Doves flying from steel birdcages',
      ],
    },
    {
      question: 'Which track from Presto marked the start of the band stepping back from dense synthesizers in favor of delicate, prominent acoustic guitars?',
      correctAnswer: '"The Pass"',
      incorrectAnswers: [
        '"Show Don\'t Tell"',
        '"Superconductor"',
        '"Red Tide"',
      ],
    },
    {
      question: 'What was the primary rhythmic foundation used by Neil Peart to compose the tribal pulse of "Scars"?',
      correctAnswer: 'A pattern played on acoustic African drums integrated with a sequencer',
      incorrectAnswers: [
        'Slamming studio doors sampled into an Akai rack unit',
        'Slapping the body of an unplugged acoustic double bass',
        'A layered drum machine track made from a modified LinnDrum',
      ],
    },
    {
      question: 'What major stage prop descended from the arena lighting grid during performances of "The Big Money" on the Hold Your Fire tour?',
      correctAnswer: 'Giant inflatable banners resembling oversized currency',
      incorrectAnswers: [
        'A mechanical golden bull',
        'A replica stock exchange ticker tape ribbon',
        'An oversized hollow dollar coin',
      ],
    },
    {
      question: 'Which British producer was enlisted for Power Windows and Hold Your Fire to act as an outside musical director and modernize their songwriting structures?',
      correctAnswer: 'Peter Collins',
      incorrectAnswers: [
        'Rupert Hine',
        'Chris Thomas',
        'Hugh Padgham',
      ],
    },
    {
      question: 'What do the three minimalist red spheres on the cover of Hold Your Fire represent?',
      correctAnswer: 'A juggler\'s balls, symbolizing the balance and interplay among the three band members',
      incorrectAnswers: [
        'The atomic sub-particles of nuclear fission',
        'The glowing remnants of an extinguished bonfire',
        'The three red stars from the Starman logo',
      ],
    },
    {
      question: 'Despite being cited by Alex Lifeson as one of his all-time favorite guitar solos, what unique distinction does "Emotion Detector" hold regarding Rush\'s live history?',
      correctAnswer: 'It was never performed live in concert on any tour',
      incorrectAnswers: [
        'It was only played during the encore of the opening night in St. John\'s',
        'It was retired after Geddy Lee refused to play the synthesizer line while singing',
        'It was only performed as a truncated acoustic duet with Alex and Geddy',
      ],
    },
    {
      question: 'Which classical choir provided the soaring background choral vocals on the Power Windows track "Marathon"?',
      correctAnswer: 'The Choir of the English National Opera',
      incorrectAnswers: [
        'The London Symphony Chorus',
        'The Royal Choral Society',
        'The Westminster Abbey Choir',
      ],
    },
    {
      question: 'What producer took over for Presto (1989) and Roll the Bones (1991), helping to scale back keyboard dominance in favor of lighter acoustic and electric guitars?',
      correctAnswer: 'Rupert Hine',
      incorrectAnswers: [
        'Hugh Padgham',
        'Trevor Horn',
        'Bob Rock',
      ],
    },
  ],

  'modern-rock': [
    {
      question: 'Prior to the recording of Test for Echo, with which legendary jazz instructor did Neil Peart study to fundamentally rebuild his drumming technique?',
      correctAnswer: 'Freddie Gruber',
      incorrectAnswers: [
        'Buddy Rich',
        'Joe Morello',
        'Jim Chapin',
      ],
    },
    {
      question: 'What creative constraint did the band impose upon themselves while tracking 2002\'s Vapor Trails?',
      correctAnswer: 'Keyboards and traditional synthesizers were completely banned',
      incorrectAnswers: [
        'Electric distortion pedals on guitars were banned',
        'Geddy was required to play all bass parts with a flatpick',
        'Neil was restricted to a four-piece kit with no cymbals',
      ],
    },
    {
      question: 'Producer Nick Raskulinecz was given which onomatopoeic nickname by the band during the Snakes & Arrows sessions?',
      correctAnswer: '"Booujzhe"',
      incorrectAnswers: [
        '"The Thumper"',
        '"Mad Max"',
        '"The Shredder"',
      ],
    },
    {
      question: 'To what time are the hands set on the alchemical clock featured on the cover of Clockwork Angels?',
      correctAnswer: '21:12',
      incorrectAnswers: [
        '10:01',
        '19:74',
        '07:05',
      ],
    },
    {
      question: 'Aside from a photograph of a nut and bolt, what technical diagram appears on the front cover of Counterparts?',
      correctAnswer: 'A schematic blueprint of a mortise and tenon joint',
      incorrectAnswers: [
        'An exploded view of a padlock and key',
        'A line drawing of intermeshing gears',
        'A cross-section diagram of an electrical wall socket',
      ],
    },
    {
      question: 'What was the title of the acoustic instrumental that Alex Lifeson composed on his home patio using an open D-A-D-A-A-D tuning?',
      correctAnswer: '"Hope"',
      incorrectAnswers: [
        '"The Main Monkey Business"',
        '"Malignant Narcissism"',
        '"Where\'s My Thing?"',
      ],
    },
    {
      question: 'Which track from the Clockwork Angels tour marked the very first time Rush performed on stage with an authentic touring string ensemble?',
      correctAnswer: '"Caravan"',
      incorrectAnswers: [
        '"Far Cry"',
        '"Workin\' Them Angels"',
        '"Armor and Sword"',
      ],
    },
    {
      question: 'On the energetic instrumental "Malignant Narcissism" (Snakes & Arrows), what specific bass did Geddy Lee use to achieve the song\'s distinctive slippery attack?',
      correctAnswer: 'A Fender Jaco Pastorius Signature fretless Jazz Bass',
      incorrectAnswers: [
        'A Wal Mk II fretless four-string',
        'An acoustic upright doghouse bass',
        'An NS Design electric upright double bass',
      ],
    },
    {
      question: 'Which bestselling science fiction author collaborated directly with Neil Peart to write the companion novelization of Clockwork Angels?',
      correctAnswer: 'Kevin J. Anderson',
      incorrectAnswers: [
        'Neal Stephenson',
        'Dan Simmons',
        'William Gibson',
      ],
    },
    {
      question: 'What subtle sound effect is heard at the very end of "The Garden," marking the final seconds of Rush\'s recorded studio output?',
      correctAnswer: 'A mechanical wind-up clock slowly ticking down',
      incorrectAnswers: [
        'A chime bell striking twenty-one times',
        'An airship valve releasing steam',
        'Neil Peart setting his drumsticks down on a snare',
      ],
    },
    {
      question: 'Which instrumental track from Counterparts was nominated for a Grammy Award for Best Rock Instrumental Performance in 1994?',
      correctAnswer: '"Leave That Thing Alone"',
      incorrectAnswers: [
        '"Where\'s My Thing?"',
        '"Limbo"',
        '"The Main Monkey Business"',
      ],
    },
  ],
};

/**
 * Helper to return a shuffled copy of the curated question pool for a given era.
 */
export function getShuffledCuratedEraQuestions(era: SubdivisionsEra): TriviaQuestion[] {
  const pool: TriviaQuestion[] =
    era === 'all'
      ? [
          ...SUBDIVISIONS_ERA_QUESTIONS['prog-70s'],
          ...SUBDIVISIONS_ERA_QUESTIONS['synthesis-80s'],
          ...SUBDIVISIONS_ERA_QUESTIONS['synth-pop-80s-90s'],
          ...SUBDIVISIONS_ERA_QUESTIONS['modern-rock'],
        ]
      : [...SUBDIVISIONS_ERA_QUESTIONS[era]];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
