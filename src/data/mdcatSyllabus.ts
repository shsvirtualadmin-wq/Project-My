export interface MDCATChapter {
  id: string;
  name: string;
  subtopics: string;
  isHighYield?: boolean;
}

export function parseSubtopics(subtopicsStr: string): string[] {
  if (!subtopicsStr) return [];
  const parts: string[] = [];
  let current = '';
  let parenCount = 0;
  for (let i = 0; i < subtopicsStr.length; i++) {
    const char = subtopicsStr[i];
    if (char === '(') parenCount++;
    else if (char === ')') parenCount--;

    if (char === ',' && parenCount === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export interface MDCATSubjectConfig {
  id: string;
  name: string;
  mcqCount: number;
  weightagePercent: number;
  iconName: string;
  badgeColor: string;
  accentColor: string;
  description: string;
  chapters: MDCATChapter[];
}

export const MDCAT_SUBJECTS: MDCATSubjectConfig[] = [
  {
    id: 'biology',
    name: 'Biology',
    mcqCount: 81,
    weightagePercent: 45,
    iconName: 'Dna',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accentColor: 'from-emerald-500 to-teal-700',
    description: 'Human Physiology, Cell Biology, Genetics, Bioenergetics & Diversity of Life',
    chapters: [
      {
        id: 'bio-1',
        name: 'Bio Molecules',
        subtopics: 'Carbohydrates, lipids, proteins & amino acids, nucleic acids, conjugated molecules'
      },
      {
        id: 'bio-2',
        name: 'Cell Structure and Function',
        subtopics: 'Plasma membrane (fluid mosaic model), mitochondria & chloroplasts, ER, Golgi apparatus, ribosomes, lysosomes & peroxisomes, cytoskeleton, nucleus',
        isHighYield: true
      },
      {
        id: 'bio-3',
        name: 'Enzymes',
        subtopics: 'Active site & specificity, lock-and-key vs induced fit, factors affecting activity, inhibition (competitive/non-competitive), cofactors & coenzymes'
      },
      {
        id: 'bio-4',
        name: 'Cell Division',
        subtopics: 'Cell cycle phases, mitosis stages, meiosis I & II, crossing over, cancer & uncontrolled division'
      },
      {
        id: 'bio-5',
        name: 'Diversity Among Animals',
        subtopics: 'Phylum classification (Porifera to Chordata), body symmetry & coelom, acoelomate vs coelomate, key invertebrate features'
      },
      {
        id: 'bio-6',
        name: 'Life Processes in Animals and Plants',
        subtopics: 'Nutrition modes, human digestive system, plant nutrition, photosynthesis (light & dark reactions), stomatal regulation'
      },
      {
        id: 'bio-7',
        name: 'Bioenergetics',
        subtopics: 'Glycolysis, Krebs cycle, electron transport chain, ATP yield, photosynthesis light reactions, Calvin cycle',
        isHighYield: true
      },
      {
        id: 'bio-8',
        name: 'Transport',
        subtopics: 'Heart structure & cardiac cycle, blood vessels, blood composition, lymphatic system, plant xylem & phloem'
      },
      {
        id: 'bio-9',
        name: 'Homeostasis',
        subtopics: 'Kidney structure & nephron, osmoregulation, thermoregulation, excretion in plants, negative feedback'
      },
      {
        id: 'bio-10',
        name: 'Gaseous Exchange',
        subtopics: 'Respiratory tract, alveoli & gas exchange, hemoglobin & oxygen transport, Bohr effect, plant gas exchange'
      },
      {
        id: 'bio-11',
        name: 'Coordination and Control',
        subtopics: 'Neurons & nerve impulse, synapse & neurotransmitters, CNS vs PNS, endocrine glands & hormones, plant hormones (auxins, gibberellins)',
        isHighYield: true
      },
      {
        id: 'bio-12',
        name: 'Support and Movement',
        subtopics: 'Skeletal system, joints, muscle types & contraction, sliding filament theory, bone disorders'
      },
      {
        id: 'bio-13',
        name: 'Reproduction',
        subtopics: 'Male & female reproductive systems, gametogenesis, menstrual cycle, fertilization & implantation, plant reproduction (flowers)',
        isHighYield: true
      },
      {
        id: 'bio-14',
        name: 'Genetics',
        subtopics: "Mendel's laws, Punnett squares, sex linkage, co-dominance & incomplete dominance, DNA replication, mutations",
        isHighYield: true
      },
      {
        id: 'bio-15',
        name: 'Biotechnology',
        subtopics: 'Recombinant DNA, PCR, gel electrophoresis, genetic engineering applications, cloning'
      },
      {
        id: 'bio-16',
        name: 'Evolution',
        subtopics: "Darwin's theory, natural selection, Lamarckism, evidence for evolution, Hardy-Weinberg principle"
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    mcqCount: 45,
    weightagePercent: 25,
    iconName: 'FlaskConical',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accentColor: 'from-amber-500 to-orange-700',
    description: 'Physical, Inorganic, and Comprehensive Organic Chemistry Mechanisms',
    chapters: [
      {
        id: 'chem-1',
        name: 'Fundamental Concepts of Chemistry',
        subtopics: "Mole concept, Avogadro's number, empirical & molecular formulas, stoichiometry, limiting reagent"
      },
      {
        id: 'chem-2',
        name: 'Atomic Structure',
        subtopics: "Bohr's model, quantum numbers, electronic configuration, Aufbau/Hund/Pauli principles, photoelectric effect"
      },
      {
        id: 'chem-3',
        name: 'Gases',
        subtopics: "Boyle's, Charles's & Avogadro's laws, ideal gas equation, kinetic theory, real gas deviations, Graham's law"
      },
      {
        id: 'chem-4',
        name: 'Liquids and Solids',
        subtopics: 'Vapor pressure, boiling & melting points, crystal lattices, allotropy, hydrogen bonding'
      },
      {
        id: 'chem-5',
        name: 'Chemical Energetics',
        subtopics: "Enthalpy, Hess's law, bond energy, endo- vs exothermic reactions, Born-Haber cycle"
      },
      {
        id: 'chem-6',
        name: 'Chemical Equilibrium',
        subtopics: "Kc & Kp, Le Chatelier's principle, reaction quotient Q, common-ion effect, buffer solutions",
        isHighYield: true
      },
      {
        id: 'chem-7',
        name: 'Electrochemistry',
        subtopics: "Galvanic vs electrolytic cells, standard electrode potential, Nernst equation, Faraday's laws, corrosion"
      },
      {
        id: 'chem-8',
        name: 'Chemical Kinetics',
        subtopics: 'Rate law & order of reaction, activation energy, Arrhenius equation, catalysis, half-life',
        isHighYield: true
      },
      {
        id: 'chem-9',
        name: 'Solutions and Colligative Properties',
        subtopics: "Molarity, molality, Raoult's law, boiling point elevation, freezing point depression, osmotic pressure"
      },
      {
        id: 'chem-10',
        name: 'Acids, Bases and Salts',
        subtopics: 'Brønsted-Lowry & Lewis theories, pH & pOH calculations, Ka & Kb, salt hydrolysis, indicators'
      },
      {
        id: 'chem-11',
        name: 's-Block and p-Block Elements',
        subtopics: 'Group I & II periodic properties, halogens, noble gases, group trends, industrial isolation'
      },
      {
        id: 'chem-12',
        name: 'Transition Elements',
        subtopics: 'd-Block electron configurations, variable oxidation states, coordination compounds, complex ion shapes, color of ions'
      },
      {
        id: 'chem-13',
        name: 'Fundamental Principles of Organic Chemistry',
        subtopics: 'Functional groups, IUPAC nomenclature, structural & stereoisomerism, reaction mechanisms, inductive & resonance effects',
        isHighYield: true
      },
      {
        id: 'chem-14',
        name: 'Hydrocarbons',
        subtopics: "Alkanes (free radical substitution), alkenes (electrophilic addition), alkynes, benzene & aromatics, Markovnikov's rule",
        isHighYield: true
      },
      {
        id: 'chem-15',
        name: 'Alkyl Halides',
        subtopics: 'SN1 vs SN2 nucleophilic substitutions, E1 vs E2 eliminations, Grignard reagents, Williamson synthesis, Wurtz reaction',
        isHighYield: true
      },
      {
        id: 'chem-16',
        name: 'Alcohols and Phenols',
        subtopics: 'Preparation methods, oxidation reactions, Lucas test, phenol acidity, esterification reactions',
        isHighYield: true
      },
      {
        id: 'chem-17',
        name: 'Aldehydes and Ketones',
        subtopics: "Nucleophilic addition reactions, Tollens' & Fehling's tests, aldol condensation, Cannizzaro reaction, reduction",
        isHighYield: true
      },
      {
        id: 'chem-18',
        name: 'Carboxylic Acids',
        subtopics: 'Acid strength factors, esterification, decarboxylation, acid derivatives, soap & saponification',
        isHighYield: true
      },
      {
        id: 'chem-19',
        name: 'Amino Acids and Proteins',
        subtopics: 'Zwitterions, isoelectric point, peptide bonds, protein structure levels (1°-4°), denaturation'
      },
      {
        id: 'chem-20',
        name: 'Macromolecules and Environmental Chemistry',
        subtopics: 'Addition & condensation polymers, carbohydrates, air & water pollution, greenhouse gases, acid rain'
      }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    mcqCount: 36,
    weightagePercent: 20,
    iconName: 'Zap',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    accentColor: 'from-cyan-500 to-blue-700',
    description: 'Mechanics, Electromagnetism, Waves, Thermodynamics & Quantum Physics',
    chapters: [
      {
        id: 'phy-1',
        name: 'Measurements',
        subtopics: 'SI units, significant figures, errors & uncertainty estimation, dimensional analysis, vernier & micrometer'
      },
      {
        id: 'phy-2',
        name: 'Scalars and Vectors',
        subtopics: 'Vector addition & resolution, scalar dot product, vector cross product, unit vectors, static equilibrium'
      },
      {
        id: 'phy-3',
        name: 'Motion and Force',
        subtopics: "Kinematic equations, Newton's laws of motion, friction, projectile motion trajectories, momentum & impulse",
        isHighYield: true
      },
      {
        id: 'phy-4',
        name: 'Work, Energy and Power',
        subtopics: 'Work-energy theorem, conservation of mechanical energy, conservative forces, power, system efficiency',
        isHighYield: true
      },
      {
        id: 'phy-5',
        name: 'Circular Motion',
        subtopics: 'Angular velocity, centripetal acceleration & force, banking of roads, orbital speed, moment of inertia'
      },
      {
        id: 'phy-6',
        name: 'Fluid Dynamics',
        subtopics: "Equation of continuity, Bernoulli's principle, viscosity, Stokes' law, terminal velocity derivation"
      },
      {
        id: 'phy-7',
        name: 'Oscillations',
        subtopics: 'Simple harmonic motion equations, period & frequency, simple pendulum, spring oscillation, resonance'
      },
      {
        id: 'phy-8',
        name: 'Waves',
        subtopics: 'Transverse vs longitudinal waves, wave equation, Doppler effect shift, standing waves in organ pipes, beats'
      },
      {
        id: 'phy-9',
        name: 'Thermodynamics',
        subtopics: 'Laws of thermodynamics, heat & internal energy, specific heat capacities, Carnot engine efficiency, entropy'
      },
      {
        id: 'phy-10',
        name: 'Electrostatics',
        subtopics: "Coulomb's law, electric field intensity, electric potential, Gauss's law applications, parallel-plate capacitors"
      },
      {
        id: 'phy-11',
        name: 'Current Electricity',
        subtopics: "Ohm's law, Kirchhoff's laws (KVL & KCL), series & parallel circuits, EMF vs terminal voltage, Wheatstone bridge"
      },
      {
        id: 'phy-12',
        name: 'Electromagnetism',
        subtopics: "Magnetic fields, magnetic force on moving charge/wire, Ampère's law, solenoids & toroids, Lorentz force",
        isHighYield: true
      },
      {
        id: 'phy-13',
        name: 'Electromagnetic Induction',
        subtopics: "Faraday's law, Lenz's law, self & mutual induction coefficients, AC generators & step-up/step-down transformers"
      },
      {
        id: 'phy-14',
        name: 'Electronics',
        subtopics: 'P-N junction diode, rectifiers (half & full wave), transistors (NPN & PNP), fundamental & universal logic gates'
      },
      {
        id: 'phy-15',
        name: 'Dawn of Modern Physics',
        subtopics: 'Photoelectric effect & work function, Compton scattering, de Broglie wavelength, Heisenberg uncertainty principle',
        isHighYield: true
      },
      {
        id: 'phy-16',
        name: 'Nuclear Physics',
        subtopics: 'Radioactive decay law (alpha/beta/gamma), half-life equations, nuclear fission & fusion reactions, binding energy curve'
      }
    ]
  },
  {
    id: 'english',
    name: 'English',
    mcqCount: 9,
    weightagePercent: 5,
    iconName: 'BookOpen',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    accentColor: 'from-purple-500 to-indigo-700',
    description: 'PMDC High-Yield Vocabulary, Complex Grammar & Analytical Comprehension',
    chapters: [
      {
        id: 'eng-1',
        name: 'Vocabulary',
        subtopics: 'Synonyms & antonyms, Latin/Greek roots, prefixes & suffixes, word usage in context, confusable pairs'
      },
      {
        id: 'eng-2',
        name: 'Grammar',
        subtopics: 'Tenses, subject-verb agreement rules, articles & prepositions, modal verbs, conditional clauses'
      },
      {
        id: 'eng-3',
        name: 'Sentence Completion',
        subtopics: 'Contextual clues, logical sentence flow, vocabulary in context, transition words, tone matching'
      },
      {
        id: 'eng-4',
        name: 'Comprehension',
        subtopics: 'Main idea extraction, logical inferences, author tone & perspective, passage details'
      },
      {
        id: 'eng-5',
        name: 'Analogy',
        subtopics: 'Word relationships, cause & effect pairs, part-to-whole relationships, synonym/antonym analogies'
      },
      {
        id: 'eng-6',
        name: 'Sentence Structure',
        subtopics: 'Sentence fragments, run-on sentences, parallel structure, misplaced & dangling modifiers'
      }
    ]
  },
  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning',
    mcqCount: 9,
    weightagePercent: 5,
    iconName: 'Brain',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    accentColor: 'from-rose-500 to-red-700',
    description: 'Critical Thinking, Deductive Syllogisms & Spatial/Pattern Problem Solving',
    chapters: [
      {
        id: 'lr-1',
        name: 'Critical Thinking',
        subtopics: 'Argument structure evaluation, underlying assumptions, strengthening/weakening arguments, logical flaws'
      },
      {
        id: 'lr-2',
        name: 'Letter and Symbol Series',
        subtopics: 'Alphabetic pattern sequences, numeric progression series, symbolic patterns, rule deductions'
      },
      {
        id: 'lr-3',
        name: 'Logical Deduction',
        subtopics: 'Categorical syllogisms, all/some/no logical statements, Venn diagram derivations, valid vs invalid conclusions'
      },
      {
        id: 'lr-4',
        name: 'Logical Problems',
        subtopics: 'Seating arrangements, blood relation trees, compass direction sense, coding-decoding puzzles'
      },
      {
        id: 'lr-5',
        name: 'Course of Action',
        subtopics: 'Problem scenario analysis, practical & effective solution selection, necessary vs unnecessary actions'
      },
      {
        id: 'lr-6',
        name: 'Cause and Effect',
        subtopics: 'Determining principal causes, evaluating direct effects, independent events vs common cause patterns'
      }
    ]
  }
];

export function getMDCATSubjectById(id: string): MDCATSubjectConfig | undefined {
  return MDCAT_SUBJECTS.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
}
