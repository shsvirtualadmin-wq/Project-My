export interface TCATTopic {
  id: string;
  name: string;
  subtopics: string;
  isHighYield?: boolean;
}

export interface TCATSubjectConfig {
  id: string;
  name: string;
  iconName: string;
  mcqCount: number; // e.g. 30 or 10
  weightagePercent: number; // e.g. 30 or 10
  badgeColor: string;
  description: string;
  topics: TCATTopic[];
}

export interface TCATGroupCombination {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  subjects: string[]; // Subject names included in this combination
}

export const TCAT_GROUPS: TCATGroupCombination[] = [
  {
    id: 'pre-engineering',
    title: 'Pre-Engineering Group',
    subtitle: 'Math, Physics, Chemistry & English',
    badge: 'Standard Engineering',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'ics-physics',
    title: 'Pre-Engineering / CS (ICS Physics)',
    subtitle: 'Math, Physics, Computer Science & English',
    badge: 'CS & Software Track',
    subjects: ['Mathematics', 'Physics', 'Computer Science', 'English'],
  },
  {
    id: 'ics-stats',
    title: 'ICS Statistics Group',
    subtitle: 'Math, Statistics, Computer Science & English',
    badge: 'Data Science & Math',
    subjects: ['Mathematics', 'Statistics', 'Computer Science', 'English'],
  },
  {
    id: 'pre-medical',
    title: 'Pre-Medical to Engineering',
    subtitle: 'Biology, Physics, Chemistry & English',
    badge: 'Bio-Medical & Chem Engg',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'stats-physics',
    title: 'Statistics & Physics Group',
    subtitle: 'Math, Statistics, Physics & English',
    badge: 'Applied Physics & Stats',
    subjects: ['Mathematics', 'Statistics', 'Physics', 'English'],
  },
];

export const TCAT_SUBJECTS: TCATSubjectConfig[] = [
  {
    id: 'math',
    name: 'Mathematics',
    iconName: 'Calculator',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Calculus, Algebra, Trigonometry, Vectors & Analytic Geometry (FSc Part I & II)',
    topics: [
      {
        id: 'tcat-math-1',
        name: 'Number Systems & Sets',
        subtopics: 'Real & complex numbers, sets, functions, domain & range, mathematical induction',
        isHighYield: true,
      },
      {
        id: 'tcat-math-2',
        name: 'Algebra',
        subtopics: 'Quadratic equations, matrices & determinants, partial fractions, binomial theorem',
        isHighYield: true,
      },
      {
        id: 'tcat-math-3',
        name: 'Sequences & Series',
        subtopics: 'Arithmetic (AP), Geometric (GP), Harmonic (HP), infinite geometric series & convergence',
        isHighYield: false,
      },
      {
        id: 'tcat-math-4',
        name: 'Trigonometry',
        subtopics: 'Identities, inverse trig functions, solution of triangles, heights & distances',
        isHighYield: true,
      },
      {
        id: 'tcat-math-5',
        name: 'Coordinate Geometry',
        subtopics: 'Straight lines, circles, parabola, ellipse, hyperbola equations & properties',
        isHighYield: true,
      },
      {
        id: 'tcat-math-6',
        name: 'Differential Calculus',
        subtopics: 'Limits, continuity, differentiation techniques, maxima & minima, rates of change',
        isHighYield: true,
      },
      {
        id: 'tcat-math-7',
        name: 'Integral Calculus',
        subtopics: 'Definite & indefinite integration, substitution, integration by parts, area under curve',
        isHighYield: true,
      },
      {
        id: 'tcat-math-8',
        name: 'Vectors in 2D & 3D',
        subtopics: 'Vector addition, dot product, cross product, scalar & vector triple products',
        isHighYield: false,
      },
      {
        id: 'tcat-math-9',
        name: 'Statistics & Probability',
        subtopics: 'Measures of central tendency, dispersion, permutations, combinations & probability',
        isHighYield: false,
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    iconName: 'Zap',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Mechanics, Waves, Thermodynamics, Electromagnetism & Modern Physics',
    topics: [
      {
        id: 'tcat-phy-1',
        name: 'Measurements & Vectors',
        subtopics: 'SI units, dimensions, errors & uncertainties, scalar & vector resolution',
        isHighYield: false,
      },
      {
        id: 'tcat-phy-2',
        name: 'Kinematics & Dynamics',
        subtopics: "Newton's laws, friction, projectile motion, circular motion, momentum & impulse",
        isHighYield: true,
      },
      {
        id: 'tcat-phy-3',
        name: 'Work, Power & Energy',
        subtopics: 'Work-energy theorem, energy conservation, power, elastic & inelastic collisions',
        isHighYield: true,
      },
      {
        id: 'tcat-phy-4',
        name: 'Rotational Motion',
        subtopics: 'Torque, moment of inertia, angular momentum, rotational kinetic energy & equilibrium',
        isHighYield: false,
      },
      {
        id: 'tcat-phy-5',
        name: 'Gravitation',
        subtopics: "Newton's law of gravity, gravitational field, orbital speed, satellites & escape velocity",
        isHighYield: false,
      },
      {
        id: 'tcat-phy-6',
        name: 'Waves & Oscillations',
        subtopics: 'SHM, resonance, sound waves, Doppler effect, interference & standing waves',
        isHighYield: true,
      },
      {
        id: 'tcat-phy-7',
        name: 'Optics',
        subtopics: 'Reflection, refraction, lenses, diffraction, polarization, optical instruments',
        isHighYield: false,
      },
      {
        id: 'tcat-phy-8',
        name: 'Heat & Thermodynamics',
        subtopics: 'Kinetic theory of gases, first & second laws of thermodynamics, heat engines, entropy',
        isHighYield: true,
      },
      {
        id: 'tcat-phy-9',
        name: 'Electrostatics',
        subtopics: "Coulomb's law, electric field, potential, capacitors, dielectric constant & Gauss law",
        isHighYield: true,
      },
      {
        id: 'tcat-phy-10',
        name: 'Current Electricity',
        subtopics: "Ohm's law, Kirchhoff's laws, Wheatstone bridge, internal resistance, power & EMF",
        isHighYield: true,
      },
      {
        id: 'tcat-phy-11',
        name: 'Electromagnetism',
        subtopics: 'Magnetic fields, Ampere law, Faraday law, Lenz law, AC circuits & transformers',
        isHighYield: true,
      },
      {
        id: 'tcat-phy-12',
        name: 'Modern Physics',
        subtopics: 'Photoelectric effect, Compton effect, atomic spectra, X-rays, radioactivity & nuclear physics',
        isHighYield: true,
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    iconName: 'FlaskConical',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Physical, Inorganic & Organic Chemistry (FSc Part I & II)',
    topics: [
      {
        id: 'tcat-chem-1',
        name: 'Atomic Structure',
        subtopics: 'Bohr model, quantum numbers, electronic configuration, periodic trends',
        isHighYield: true,
      },
      {
        id: 'tcat-chem-2',
        name: 'Chemical Bonding',
        subtopics: 'Ionic, covalent & metallic bonds, VSEPR model, hybridization & molecular orbitals',
        isHighYield: true,
      },
      {
        id: 'tcat-chem-3',
        name: 'States of Matter',
        subtopics: 'Gas laws, ideal gas equation, kinetic molecular theory, liquids & solid crystals',
        isHighYield: false,
      },
      {
        id: 'tcat-chem-4',
        name: 'Energetics & Thermochemistry',
        subtopics: 'Enthalpy changes, Hess law, bond energies & calorimetry',
        isHighYield: false,
      },
      {
        id: 'tcat-chem-5',
        name: 'Chemical Equilibrium',
        subtopics: "Le Chatelier's principle, Kc & Kp, acid-base pH, buffer solutions & Ksp",
        isHighYield: true,
      },
      {
        id: 'tcat-chem-6',
        name: 'Reaction Kinetics',
        subtopics: 'Reaction rate, order of reaction, rate law, activation energy & catalysis',
        isHighYield: true,
      },
      {
        id: 'tcat-chem-7',
        name: 'Electrochemistry',
        subtopics: 'Redox reactions, galvanic & electrolytic cells, standard electrode potentials & Nernst equation',
        isHighYield: true,
      },
      {
        id: 'tcat-chem-8',
        name: 'Organic Chemistry',
        subtopics: 'Hydrocarbons, functional groups, substitution, addition & elimination reaction mechanisms',
        isHighYield: true,
      },
      {
        id: 'tcat-chem-9',
        name: 'Industrial & Environmental Chemistry',
        subtopics: 'Chemical industries, Solvay & Haber processes, atmospheric pollution & water treatment',
        isHighYield: false,
      },
      {
        id: 'tcat-chem-10',
        name: 's-, p-, d-Block Elements',
        subtopics: 'Periodicity, alkaline earth metals, halogens, transition metals & coordination complexes',
        isHighYield: false,
      },
    ],
  },
  {
    id: 'cs',
    name: 'Computer Science',
    iconName: 'Cpu',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    description: 'Fundamentals, C++ Programming, Data Structures, Logic Gates & Databases',
    topics: [
      {
        id: 'tcat-cs-1',
        name: 'Computer Fundamentals',
        subtopics: 'Hardware/software architecture, number systems (binary, hex), data representation',
        isHighYield: true,
      },
      {
        id: 'tcat-cs-2',
        name: 'Programming Fundamentals',
        subtopics: 'Variables, control structures, loops, arrays, functions, pointers & OOP concepts in C++',
        isHighYield: true,
      },
      {
        id: 'tcat-cs-3',
        name: 'Data Structures Basics',
        subtopics: 'Arrays, strings, stacks, queues, linked lists & search algorithms',
        isHighYield: true,
      },
      {
        id: 'tcat-cs-4',
        name: 'Boolean Algebra & Logic Gates',
        subtopics: 'AND, OR, NOT, NAND, NOR, XOR gates, truth tables & Boolean simplification',
        isHighYield: true,
      },
      {
        id: 'tcat-cs-5',
        name: 'Computer Networks & Internet',
        subtopics: 'Topologies, OSI 7-layer model, TCP/IP, routers, switches & network security',
        isHighYield: false,
      },
      {
        id: 'tcat-cs-6',
        name: 'Database Basics',
        subtopics: 'DBMS architecture, ER models, normalization & SQL basic queries',
        isHighYield: false,
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    iconName: 'Dna',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Cell Biology, Physiology, Genetics & Bioenergetics (Pre-Med track)',
    topics: [
      {
        id: 'tcat-bio-1',
        name: 'Cell Biology & Bioenergetics',
        subtopics: 'Cellular structures, enzymes, ATP synthesis, glycolysis, Krebs cycle & light reactions',
        isHighYield: true,
      },
      {
        id: 'tcat-bio-2',
        name: 'Biological Molecules',
        subtopics: 'Carbohydrates, lipids, proteins, enzymes & nucleic acid structure',
        isHighYield: true,
      },
      {
        id: 'tcat-bio-3',
        name: 'Human Physiology',
        subtopics: 'Circulatory, respiratory, digestive, excretory & nervous systems',
        isHighYield: true,
      },
      {
        id: 'tcat-bio-4',
        name: 'Genetics & Biotechnology',
        subtopics: 'Mendelian inheritance, DNA replication, gene expression & recombinant DNA technology',
        isHighYield: true,
      },
      {
        id: 'tcat-bio-5',
        name: 'Support & Movement',
        subtopics: 'Human skeleton, joints, sliding filament theory of muscle contraction',
        isHighYield: false,
      },
      {
        id: 'tcat-bio-6',
        name: 'Coordination & Control',
        subtopics: 'Action potential, nerve impulses, synaptic transmission & endocrine hormones',
        isHighYield: true,
      },
      {
        id: 'tcat-bio-7',
        name: 'Reproduction & Development',
        subtopics: 'Human gametogenesis, menstrual cycle, embryonic development stages',
        isHighYield: false,
      },
      {
        id: 'tcat-bio-8',
        name: 'Evolution & Ecology',
        subtopics: 'Darwinism, natural selection, ecosystem dynamics & biogeochemical cycles',
        isHighYield: false,
      },
    ],
  },
  {
    id: 'statistics',
    name: 'Statistics',
    iconName: 'BarChart2',
    mcqCount: 30,
    weightagePercent: 30,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Descriptive Stats, Probability, Sampling, Distributions & Regression',
    topics: [
      {
        id: 'tcat-stat-1',
        name: 'Descriptive Statistics',
        subtopics: 'Mean, median, mode, variance, standard deviation & quartile range',
        isHighYield: true,
      },
      {
        id: 'tcat-stat-2',
        name: 'Probability & Distributions',
        subtopics: 'Probability rules, conditional probability, Binomial, Poisson & Normal distributions',
        isHighYield: true,
      },
      {
        id: 'tcat-stat-3',
        name: 'Sampling & Estimation',
        subtopics: 'Random sampling, point estimation, interval estimation & standard error',
        isHighYield: false,
      },
      {
        id: 'tcat-stat-4',
        name: 'Hypothesis Testing',
        subtopics: 'Null & alternative hypotheses, Z-test, t-test & Chi-square test',
        isHighYield: true,
      },
      {
        id: 'tcat-stat-5',
        name: 'Correlation & Regression',
        subtopics: 'Pearson correlation coefficient, simple linear regression line & slope estimation',
        isHighYield: true,
      },
      {
        id: 'tcat-stat-6',
        name: 'Index Numbers & Time Series',
        subtopics: 'Price index formulas (Laspeyres, Paasche), moving averages & trend estimation',
        isHighYield: false,
      },
    ],
  },
  {
    id: 'english',
    name: 'English',
    iconName: 'BookOpen',
    mcqCount: 10,
    weightagePercent: 10,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Reading Comprehension & Contextual Vocabulary (10 MCQs / 40 Marks)',
    topics: [
      {
        id: 'tcat-eng-1',
        name: 'Reading Comprehension & Vocabulary',
        subtopics: 'Unseen comprehension passage MCQs testing main idea, inferences, tone & contextual vocabulary',
        isHighYield: true,
      },
    ],
  },
];

export function getTCATSubjectByName(name: string): TCATSubjectConfig | undefined {
  return TCAT_SUBJECTS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function getTCATGroupCombination(groupId: string): TCATGroupCombination {
  return TCAT_GROUPS.find((g) => g.id === groupId) || TCAT_GROUPS[0];
}
