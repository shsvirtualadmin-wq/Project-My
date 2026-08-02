import { BoardClass } from '../types';

export const CLASS_GROUPS: Record<BoardClass, string[]> = {
  9:  ["Medical", "Computer Science"],
  10: ["Medical", "Computer Science"],
  11: ["Pre-Medical", "Pre-Engineering", "ICS"],
  12: ["Pre-Medical", "Pre-Engineering", "ICS"],
  'MDCAT': ["MDCAT"],
  'TCAT': ["Pre-Engineering", "ICS Math-CS", "General Science Math-Stats", "Chemistry-CS-Math"]
};

/**
 * Returns the exact subject list for a given Class and Group combination.
 * Enforces strict subject requirements per class + group.
 */
export function getSubjectsForClassAndGroup(classNum: BoardClass, group: string): string[] {
  const normGroup = (group || '').trim().toLowerCase();

  if (classNum === 'TCAT' || normGroup === 'tcat') {
    return ["Mathematics", "Physics", "Chemistry", "Computer Science", "English"];
  }

  if (classNum === 'MDCAT' || normGroup === 'mdcat') {
    return ["Biology", "Chemistry", "Physics", "English"];
  }

  // Class 9
  if (classNum === 9) {
    if (normGroup.includes('computer') || normGroup === 'cs' || normGroup.includes('computer science')) {
      return ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Islamiat", "Pakistan Studies"];
    }
    // Medical (or default)
    return ["Biology", "Chemistry", "Physics", "Mathematics", "English", "Urdu", "Islamiat", "Pakistan Studies"];
  }

  // Class 10
  if (classNum === 10) {
    if (normGroup.includes('computer') || normGroup === 'cs' || normGroup.includes('computer science')) {
      return ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Islamiat", "Pakistan Studies"];
    }
    // Medical (or default)
    return ["Biology", "Chemistry", "Physics", "Mathematics", "English", "Urdu", "Islamiat", "Pakistan Studies"];
  }

  // Class 11
  if (classNum === 11) {
    if (normGroup.includes('engineering') || normGroup === 'pre-engineering') {
      return ["Mathematics", "Chemistry", "Physics", "English", "Urdu", "Islamiat"];
    }
    if (normGroup.includes('ics') || normGroup === 'computer science') {
      return ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Islamiat"];
    }
    // Pre-Medical (or default)
    return ["Biology", "Chemistry", "Physics", "English", "Urdu", "Islamiat"];
  }

  // Class 12
  if (classNum === 12) {
    if (normGroup.includes('engineering') || normGroup === 'pre-engineering') {
      return ["Mathematics", "Chemistry", "Physics", "English", "Urdu", "Islamiat"];
    }
    if (normGroup.includes('ics') || normGroup === 'computer science') {
      return ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Islamiat"];
    }
    // Pre-Medical (or default)
    return ["Biology", "Chemistry", "Physics", "English", "Urdu", "Islamiat"];
  }

  return ["Biology", "Chemistry", "Physics", "English", "Urdu", "Islamiat"];
}

export const MDCAT_SUBJECT_TOPICS: Record<string, string[]> = {
  "Biology": [
    "Cell Structure, Organelles & Membranes",
    "Biological Molecules & Macromolecules",
    "Enzymes & Reaction Kinetics",
    "Bioenergetics & Cellular Respiration",
    "Acellular Life & Virology",
    "Prokaryotes & Bacterial Genetics",
    "Diversity Among Plants & Animals",
    "Human Physiology & Cardiovascular System",
    "Digestion & Gas Exchange in Humans",
    "Homeostasis, Osmoregulation & Excretion",
    "Coordination & Control (Nervous & Endocrine)",
    "Support & Movement in Humans",
    "Human Reproduction & Development",
    "Genetics, Chromosomes & Inheritance",
    "Evolution & Natural Selection",
    "Biotechnology & DNA Technology"
  ],
  "Chemistry": [
    "Atomic Structure & Quantum Numbers",
    "States of Matter (Gases, Liquids, Solids)",
    "Chemical Bonding & Molecular Shapes",
    "Thermochemistry & Reaction Energetics",
    "Electrochemistry & Redox Reactions",
    "Chemical Equilibrium & Le Chatelier's Principle",
    "Reaction Kinetics & Catalysis",
    "Periods, Groups & Periodic Trends",
    "Transition Elements & Complex Compounds",
    "Fundamental Principles of Organic Chemistry",
    "Hydrocarbons (Alkanes, Alkenes, Alkynes, Benzene)",
    "Alkyl Halides & Nucleophilic Substitution",
    "Alcohols, Phenols & Ethers",
    "Aldehydes & Ketones",
    "Carboxylic Acids & Derivatives",
    "Macromolecules & Biochemistry"
  ],
  "Physics": [
    "Force and Motion & Momentum",
    "Work, Energy and Power",
    "Rotational & Circular Motion",
    "Waves, Oscillations & Simple Harmonic Motion",
    "Thermodynamics & Kinetic Theory of Gases",
    "Electrostatics & Coulomb's Law",
    "Current Electricity & Kirchhoff's Laws",
    "Electromagnetism & Magnetic Fields",
    "Electromagnetic Induction & AC Circuits",
    "Deformation of Solids & Electronics",
    "Atomic Spectra & Quantum Physics",
    "Nuclear Physics & Radioactivity"
  ],
  "English": [
    "PMDC High-Yield Vocabulary (Synonyms & Antonyms)",
    "Grammar, Tenses & Subject-Verb Agreement",
    "Sentence Correction & Error Spotting",
    "Articles, Prepositions & Conjunctions",
    "Punctuation & Capitalization Rules",
    "Active & Passive Voice Transformation",
    "Direct & Indirect Speech Conversion",
    "Reading Comprehension & Logical Deductions"
  ]
};

export function getSubjectTopicsForClass(sub: string, classNum?: BoardClass | string): string[] {
  if (classNum === 'MDCAT' || (typeof classNum === 'string' && classNum.toUpperCase() === 'MDCAT')) {
    return MDCAT_SUBJECT_TOPICS[sub] || SUBJECT_TOPICS[sub] || ['MDCAT PMDC Core Syllabus', 'MDCAT High Yield MCQs'];
  }
  return SUBJECT_TOPICS[sub] || ['General Practice', 'Core Concepts', 'Board High Yield'];
}

export const SUBJECT_TOPICS: Record<string, string[]> = {
  "Physics": [
    "Electrostatics & Electric Fields",
    "Current Electricity & Ohm's Law",
    "Electromagnetism & Magnetic Waves",
    "Waves, Oscillations & Simple Harmonic Motion",
    "Work, Energy, Power & Rotational Dynamics",
    "Optics & Light Wave Diffraction",
    "Nuclear Physics & Radioactivity",
    "Vectors & Equilibrium"
  ],
  "Chemistry": [
    "Atomic Structure & Quantum Mechanics",
    "Chemical Bonding & Hybridization",
    "Thermochemistry & Reaction Energetics",
    "Electrochemistry & Oxidation-Reduction",
    "Organic Reaction Mechanisms & Functional Groups",
    "Chemical Equilibrium & Le Chatelier's Principle",
    "Acids, Bases & pH Calculations",
    "States of Matter & Gas Laws"
  ],
  "Biology": [
    "Cell Structure, Organelles & Membranes",
    "Biological Molecules & Enzymes",
    "Genetics, Inheritance & DNA Replication",
    "Human Physiology & Cardiovascular System",
    "Plant Physiology & Photosynthesis",
    "Ecology, Ecosystems & Environment",
    "Bioenergetics & Respiration",
    "Immunology & Lymphatic System"
  ],
  "Mathematics": [
    "Calculus, Derivatives & Integrals",
    "Matrices, Determinants & System of Equations",
    "Trigonometry & Inverse Functions",
    "Complex Numbers & Quadratic Equations",
    "Vectors & 3D Analytic Geometry",
    "Sequences, Series & Mathematical Induction",
    "Permutations, Combinations & Probability",
    "Conic Sections & Straight Lines"
  ],
  "Computer Science": [
    "Data Structures & Queue/Stack/Tree Algorithms",
    "Object-Oriented Programming (OOP)",
    "Database Management Systems & SQL",
    "Computer Networks & Protocols",
    "Binary Systems, Logic Gates & Boolean Algebra",
    "Operating Systems & Process Management",
    "Algorithms & Time Complexity (Big O)"
  ],
  "English": [
    "Grammar & Sentence Correction",
    "Vocabulary, Synonyms & Antonyms",
    "Reading Comprehension & Inferences",
    "Idioms, Phrases & Prepositions",
    "Active & Passive Voice Transformation",
    "Analogies & Sentence Completion"
  ],
  "Urdu": [
    "Urdu Grammar & Qawaid",
    "Asnafe Adab (Ghazal, Nazm, Afsana)",
    "Vocabulary & Muhaware"
  ],
  "Pakistan Studies": [
    "Pakistan Movement & History (1857-1947)",
    "Constitutional Developments & Geography",
    "Economy, Culture & Foreign Policy"
  ],
  "Islamiat": [
    "Quranic Verses & Surah Key Themes",
    "Hadith & Sunnah Guidance",
    "Islamic History & Seerah of Prophet Muhammad (PBUH)"
  ],
  "Islamic Studies": [
    "Quranic Verses & Surah Key Themes",
    "Hadith & Sunnah Guidance",
    "Islamic History & Caliphate Era"
  ]
};
