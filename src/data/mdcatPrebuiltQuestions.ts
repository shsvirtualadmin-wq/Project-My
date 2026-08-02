import { Question } from '../types';

function shuffleOptionsAndFixCorrect(q: Question): Question {
  const correctText = q.options[q.correct];
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  const newCorrectIndex = shuffledOptions.indexOf(correctText);
  return {
    ...q,
    options: shuffledOptions,
    correct: newCorrectIndex >= 0 ? newCorrectIndex : q.correct,
  };
}

export const MDCAT_PREBUILT_QUESTIONS: Record<string, Question[]> = {
  Biology: [
    {
      id: 'mdcat-bio-1',
      q: 'Which structural component of the fluid mosaic plasma membrane is primarily responsible for maintaining membrane fluidity at lower temperatures?',
      options: ['Cholesterol molecules', 'Glycoproteins', 'Integral protein channels', 'Phospholipid phosphate heads'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Cholesterol acts as a temperature buffer in animal cell membranes. At lower temperatures, it prevents phospholipids from packing tightly together, maintaining membrane fluidity.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-2',
      q: 'In competitive enzyme inhibition, how are the Vmax (maximum reaction velocity) and Km (Michaelis constant) affected?',
      options: ['Vmax remains unchanged, Km increases', 'Vmax decreases, Km remains unchanged', 'Both Vmax and Km decrease', 'Vmax increases, Km decreases'],
      correct: 0,
      topic: 'Enzymes',
      explain: 'In competitive inhibition, the inhibitor competes with substrate for the active site. Increasing substrate concentration overcomes inhibition, keeping Vmax constant, but requiring a higher substrate concentration to reach half-Vmax (hence Km increases).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-3',
      q: 'During non-cyclic photophosphorylation in light reactions of photosynthesis, what is the ultimate electron donor and terminal electron acceptor?',
      options: ['Water is the ultimate donor; NADP+ is the terminal acceptor', 'ATP is the ultimate donor; NADPH is the terminal acceptor', 'Photosystem I is donor; Photosystem II is acceptor', 'Carbon dioxide is donor; Glucose is acceptor'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'Water undergoes photolysis at Photosystem II to release electrons (donor), which pass through electron transport chains to reduce NADP+ into NADPH (terminal acceptor).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-4',
      q: 'Which phase of human cardiac cycle involves closure of the semilunar valves, producing the second heart sound ("dub")?',
      options: ['Ventricular Isovolumetric Relaxation', 'Ventricular Systole', 'Atrial Systole', 'Isovolumetric Contraction'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'The second heart sound ("dub") is caused by the sudden closure of the aortic and pulmonary semilunar valves at the beginning of ventricular diastole (relaxation) to prevent backflow into the ventricles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-5',
      q: 'During nerve impulse transmission, what triggers the exocytosis of neurotransmitter vesicles into the synaptic cleft?',
      options: ['Influx of Ca2+ ions into the presynaptic terminal', 'Efflux of K+ ions from the postsynaptic neuron', 'Influx of Na+ ions into the synaptic knob', 'Active transport of Cl- ions'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'When an action potential arrives at the presynaptic axon terminal, voltage-gated calcium channels open, causing Ca2+ influx. Ca2+ ions bind to synaptotagmin, initiating neurotransmitter vesicle fusion and exocytosis.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-6',
      q: 'In human females, at which stage of meiosis are primary oocytes arrested until puberty?',
      options: ['Prophase I (Diplotene stage)', 'Metaphase II', 'Anaphase I', 'Telophase II'],
      correct: 0,
      topic: 'Reproduction',
      explain: 'Oogenesis begins before birth; primary oocytes undergo meiosis I but remain suspended at Prophase I (specifically diplotene stage) until LH surge during puberty triggers completion.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-7',
      q: 'If a man with blood group A (heterozygous) marries a woman with blood group B (heterozygous), what is the probability of their offspring having blood group O?',
      options: ['25% (1/4)', '50% (1/2)', '75% (3/4)', '0%'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'Heterozygous Group A is (IA i) and Heterozygous Group B is (IB i). Cross: (IA i) × (IB i) → Genotypes: IAIB (AB), IAi (A), IBi (B), ii (O). Thus 1 in 4 (25%) will have blood group O.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-8',
      q: 'Which sliding filament protein binds calcium ions to uncover the myosin-binding sites on actin filaments during skeletal muscle contraction?',
      options: ['Troponin C', 'Tropomyosin', 'Myosin light chain', 'Titine'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'Calcium released from the sarcoplasmic reticulum binds to Troponin C. This induces a conformational shift in tropomyosin, pulling it away to expose actin active sites for myosin cross-bridge attachment.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-9',
      q: 'Which organelle contains hydrolytic enzymes that function optimally at an acidic pH around 5.0?',
      options: ['Lysosome', 'Peroxisome', 'Golgi apparatus', 'Smooth endoplasmic reticulum'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Lysosomes contain acid hydrolases that digest macromolecules. Proton pumps in the lysosomal membrane maintain an internal acidic pH (~5.0).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-10',
      q: 'Which bond stabilizes the alpha-helix secondary structure of proteins?',
      options: ['Hydrogen bonds between peptide backbone atoms', 'Disulfide bridges between cysteine residues', 'Ionic bonds between amino acid side chains', 'Hydrophobic interactions'],
      correct: 0,
      topic: 'Biological Molecules',
      explain: 'The alpha-helix secondary structure is stabilized by hydrogen bonds between the carbonyl oxygen (C=O) of one amino acid and the amide hydrogen (N-H) four residues ahead along the peptide backbone.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-11',
      q: 'In aerobic cellular respiration, what is the net yield of ATP produced per glucose molecule through substrate-level phosphorylation only?',
      options: ['4 ATP (2 in Glycolysis, 2 in Krebs Cycle)', '2 ATP', '32 ATP', '38 ATP'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'Substrate-level phosphorylation yields 2 net ATP during glycolysis and 2 ATP (or GTP) during the Krebs cycle, giving a net total of 4 ATP directly.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-12',
      q: 'Which hormone, produced by the corpus luteum, is essential for maintaining the thick uterine endometrium during early pregnancy?',
      options: ['Progesterone', 'Estrogen', 'Luteinizing Hormone (LH)', 'Follicle Stimulating Hormone (FSH)'],
      correct: 0,
      topic: 'Reproduction',
      explain: 'Progesterone maintains the secretory phase of the endometrium, preventing uterine contractions and menstruation during pregnancy.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-13',
      q: 'Which structure in a bacterial cell is responsible for horizontal gene transfer via conjugation?',
      options: ['Sex pilus (F-pilus)', 'Flagellum', 'Mesosome', 'Peptidoglycan cell wall'],
      correct: 0,
      topic: 'Prokaryotes and Microorganisms',
      explain: 'The sex pilus formed by donor (F+) bacteria attaches to recipient (F-) bacteria to form a conjugation bridge for plasmid DNA transfer.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-14',
      q: 'Which type of immunity is acquired by a newborn infant receiving antibodies through maternal colostrum?',
      options: ['Natural Passive Immunity', 'Natural Active Immunity', 'Artificial Passive Immunity', 'Artificial Active Immunity'],
      correct: 0,
      topic: 'Immunity',
      explain: 'Pre-formed maternal IgA antibodies passed to infants through breast milk/colostrum confer natural passive immunity without activating the infant’s immune response.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-15',
      q: 'What is the functional unit of the human kidney responsible for blood filtration and urine formation?',
      options: ['Nephron', 'Glomerulus', 'Loop of Henle', 'Renal pelvis'],
      correct: 0,
      topic: 'Homeostasis and Excretion',
      explain: 'The nephron is the structural and functional filtration unit of the kidney, consisting of a renal corpuscle and renal tubule.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-16',
      q: 'Which nitrogenous base is present in RNA but absent in DNA?',
      options: ['Uracil', 'Thymine', 'Cytosine', 'Guanine'],
      correct: 0,
      topic: 'Biological Molecules',
      explain: 'RNA contains uracil (U) which pairs with adenine (A), replacing the thymine (T) found in DNA.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-17',
      q: 'Which enzyme unwinds the double-stranded DNA helix at the replication fork during DNA replication?',
      options: ['DNA Helicase', 'DNA Polymerase III', 'DNA Ligase', 'RNA Primase'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'DNA Helicase breaks hydrogen bonds between base pairs to uncoil and separate the two DNA strands at the replication fork.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-18',
      q: 'Where does the light-independent Calvin cycle reaction of photosynthesis take place in plant cells?',
      options: ['Stroma of chloroplast', 'Thylakoid membrane', 'Mitochondrial matrix', 'Cytosol'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'The enzymes for carbon fixation in the Calvin cycle (such as RuBisCO) are located in the fluid stroma of chloroplasts.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-19',
      q: 'Which part of the human brain controls vital autonomic functions such as heart rate, blood pressure, and breathing rate?',
      options: ['Medulla Oblongata', 'Cerebellum', 'Thalamus', 'Hypothalamus'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'The medulla oblongata in the brainstem houses cardiac, vasomotor, and respiratory reflex centers regulating involuntary autonomic processes.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-20',
      q: 'What is the oxygen-binding protein in human skeletal muscle tissue that stores oxygen for metabolic demand?',
      options: ['Myoglobin', 'Hemoglobin', 'Fibrinogen', 'Albumin'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'Myoglobin is a monomeric iron-binding protein located in muscle fibers with a higher oxygen affinity than hemoglobin, storing oxygen for working muscles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-21',
      q: 'Which class of immunoglobulin antibodies is produced first in response to an initial antigen exposure?',
      options: ['IgM', 'IgG', 'IgA', 'IgE'],
      correct: 0,
      topic: 'Immunity',
      explain: 'IgM is a pentameric antibody and the primary immunoglobulin produced during the initial (primary) immune response to a foreign pathogen.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-22',
      q: 'In the human digestive system, where is bile stored and concentrated before secretion into the duodenum?',
      options: ['Gallbladder', 'Liver', 'Pancreas', 'Stomach'],
      correct: 0,
      topic: 'Digestive System',
      explain: 'Bile is synthesized by hepatocytes in the liver and transported to the gallbladder for storage and concentration.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-23',
      q: 'What is the phenotypic ratio obtained in a classic Mendelian dihybrid cross between two heterozygous individuals (AaBb × AaBb)?',
      options: ['9:3:3:1', '3:1', '1:2:1', '9:7'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'Crossing AaBb × AaBb yields 9 dominant/dominant, 3 dominant/recessive, 3 recessive/dominant, and 1 recessive/recessive phenotype (9:3:3:1 ratio).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-24',
      q: 'Which viral structure encloses the viral genome and is composed of protein subunits called capsomeres?',
      options: ['Capsid', 'Envelope', 'Peptidoglycan wall', 'Tail fiber'],
      correct: 0,
      topic: 'Acellular Life and Viruses',
      explain: 'The capsid is the protective protein coat surrounding the nucleic acid core of a virus particle, made up of capsomeres.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-25',
      q: 'Which hormone decreases blood calcium levels by stimulating calcium deposition into bones?',
      options: ['Calcitonin', 'Parathyroid Hormone (PTH)', 'Aldosterone', 'Thyroxine'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'Calcitonin, secreted by thyroid parafollicular cells, lowers blood Ca2+ levels by promoting osteoblast activity and renal Ca2+ excretion, opposing PTH.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-26',
      q: 'What is the primary site of gaseous exchange in human lungs?',
      options: ['Alveoli', 'Terminal bronchioles', 'Trachea', 'Larynx'],
      correct: 0,
      topic: 'Respiratory System',
      explain: 'Alveoli provide a large surface area surrounded by pulmonary capillaries for simple diffusion of O2 and CO2 across thin respiratory membranes.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-27',
      q: 'Which cell organelle is known as the "powerhouse of the cell" due to ATP synthesis via oxidative phosphorylation?',
      options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Golgi apparatus'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Mitochondria generate ATP through the electron transport chain and chemiosmosis across the inner cristae membrane.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-28',
      q: 'Which blood vessels carry oxygenated blood from the lungs back to the left atrium of the heart?',
      options: ['Pulmonary veins', 'Pulmonary arteries', 'Vena cava', 'Aorta'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'Pulmonary veins are exceptional veins because they transport freshly oxygenated blood from the lungs to the left atrium of the heart.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-29',
      q: 'Which metabolic pathway converts one molecule of glucose into two molecules of pyruvate in the cytoplasm?',
      options: ['Glycolysis', 'Krebs cycle', 'Calvin cycle', 'Beta-oxidation'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'Glycolysis is a 10-step anaerobic pathway occurring in the cytosol that yields 2 pyruvate, 2 net ATP, and 2 NADH per glucose.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-30',
      q: 'Which cell type produces monoclonal and polyclonal antibodies in response to humoral immune activation?',
      options: ['Plasma B cells', 'Cytotoxic T cells', 'Helper T cells', 'Natural Killer cells'],
      correct: 0,
      topic: 'Immunity',
      explain: 'Activated B lymphocytes differentiate into plasma cells, which function as antibody factories secreting immunoglobulins into circulation.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-31',
      q: 'Which coenzyme acts as an electron carrier in glycolysis and Krebs cycle, accepting 2 electrons and 1 proton?',
      options: ['NAD+ (forming NADH)', 'FAD (forming FADH2)', 'Coenzyme A', 'ATP'],
      correct: 0,
      topic: 'Enzymes',
      explain: 'Nicotinamide adenine dinucleotide (NAD+) accepts hydride (H-) to form NADH during oxidation steps in cellular respiration.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-32',
      q: 'Which type of intercellular junction allows direct ion and small molecule movement between adjacent cardiac muscle cells?',
      options: ['Gap junctions (Intercalated discs)', 'Tight junctions', 'Desmosomes', 'Hemidesmosomes'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Gap junctions present in intercalated discs allow electrical coupling and rapid action potential propagation across the cardiac syncytium.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-33',
      q: 'What is the main nitrogenous waste product excreted by adult humans?',
      options: ['Urea', 'Uric acid', 'Ammonia', 'Creatinine'],
      correct: 0,
      topic: 'Homeostasis and Excretion',
      explain: 'Humans are ureotelic organisms; ammonia produced from amino acid deamination is converted into non-toxic urea in the liver via the urea cycle.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-34',
      q: 'In plant cells, which polysaccharide constitutes the main fibrous structural framework of the primary cell wall?',
      options: ['Cellulose', 'Starch', 'Glycogen', 'Chitin'],
      correct: 0,
      topic: 'Biological Molecules',
      explain: 'Cellulose is a linear unbranched polymer of beta-1,4-linked glucose units forming microfibrils that provide mechanical strength to plant cell walls.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-35',
      q: 'Which hormone stimulates milk ejection (let-down reflex) from mammary glands during lactation?',
      options: ['Oxytocin', 'Prolactin', 'Estrogen', 'Human Chorionic Gonadotropin (hCG)'],
      correct: 0,
      topic: 'Reproduction',
      explain: 'Oxytocin secreted by the posterior pituitary causes contraction of myoepithelial cells surrounding mammary alveoli, ejecting milk.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-36',
      q: 'Which connective tissue attaches skeletal muscles to bones?',
      options: ['Tendon', 'Ligament', 'Cartilage', 'Synovial membrane'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'Tendons are dense regular collagenous connective tissues that attach skeletal muscle belly to periosteum of bone.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-37',
      q: 'Which enzyme in gastric juice digests proteins into smaller peptones and polypeptides in the stomach?',
      options: ['Pepsin', 'Trypsin', 'Amylase', 'Lipase'],
      correct: 0,
      topic: 'Digestive System',
      explain: 'Pepsinogen is activated by hydrochloric acid (HCl) into active pepsin, an endopeptidase that cleaves peptide bonds in the stomach.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-38',
      q: 'Which plant tissue is responsible for translocating organic solutes (sucrose) from source leaves to sink tissues?',
      options: ['Phloem', 'Xylem', 'Parenchyma', 'Collenchyma'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'Sieve tube elements and companion cells in phloem tissue conduct organic photoassimilates bi-directionally via pressure-flow mechanism.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-39',
      q: 'Which law of inheritance states that alleles of two or more different genes sort independently of one another during gamete formation?',
      options: ['Law of Independent Assortment', 'Law of Segregation', 'Law of Dominance', 'Chromosome Theory'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'Mendel’s second law (Independent Assortment) states that gene pairs segregate independently during meiosis if located on different chromosomes.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-40',
      q: 'Which virus contains a single-stranded RNA genome and reverse transcriptase enzyme to integrate into host cell DNA?',
      options: ['Human Immunodeficiency Virus (HIV)', 'Bacteriophage T4', 'Hepatitis B Virus', 'Influenza Virus'],
      correct: 0,
      topic: 'Acellular Life and Viruses',
      explain: 'HIV is a retrovirus that uses reverse transcriptase to synthesize viral cDNA from its ssRNA template, integrating into host genome as a provirus.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-41',
      q: 'Which anterior pituitary hormone stimulates the adrenal cortex to release glucocorticoids like cortisol?',
      options: ['Adrenocorticotropic Hormone (ACTH)', 'Thyroid Stimulating Hormone (TSH)', 'Growth Hormone (GH)', 'Prolactin'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'ACTH released by anterior pituitary corticotropes binds to receptors in zona fasciculata of the adrenal cortex to stimulate cortisol production.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-42',
      q: 'Which structure prevents food particles from entering the trachea during swallowing?',
      options: ['Epiglottis', 'Glottis', 'Pharynx', 'Uvula'],
      correct: 0,
      topic: 'Respiratory System',
      explain: 'The epiglottis is a elastic cartilaginous flap that folds down over the laryngeal inlet (glottis) during deglutition.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-43',
      q: 'Which lipid class forms the core structure of steroid hormones like testosterone and estrogen?',
      options: ['Sterols / Cholesterol derivatives (Steroids)', 'Triglycerides', 'Phospholipids', 'Waxes'],
      correct: 0,
      topic: 'Biological Molecules',
      explain: 'All steroid hormones share a cyclopentanoperhydrophenanthrene 4-ring nucleus synthesized from cholesterol.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-44',
      q: 'What is the main function of smooth endoplasmic reticulum (SER) in liver cells?',
      options: ['Detoxification of drugs and lipid synthesis', 'Protein synthesis', 'Ribosome assembly', 'ATP generation'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'SER lacks ribosomes; it synthesizes lipids, phospholipids, and steroids, and contains cytochrome P450 enzymes for drug detoxification.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-45',
      q: 'Which enzyme transcribes mRNA from a DNA template strand during transcription in eukaryotic cells?',
      options: ['RNA Polymerase II', 'DNA Polymerase I', 'Reverse Transcriptase', 'RNA Helicase'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'RNA Polymerase II catalyzes nuclear synthesis of precursor messenger RNA (pre-mRNA) in eukaryotic cells.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-46',
      q: 'Which part of the human nephron is impermeable to water but actively reabsorbs sodium and chloride ions?',
      options: ['Thick ascending limb of Loop of Henle', 'Descending limb of Loop of Henle', 'Proximal convoluted tubule', 'Collecting duct'],
      correct: 0,
      topic: 'Homeostasis and Excretion',
      explain: 'The thick ascending limb is water-impermeable and actively transports Na+, K+, and Cl- via NKCC2 cotransporters into medullary interstitium.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-47',
      q: 'Which non-protein helper molecule is tightly or covalently bound to an enzyme to assist catalytic activity?',
      options: ['Prosthetic group', 'Coenzyme', 'Apoenzyme', 'Zymogen'],
      correct: 0,
      topic: 'Enzymes',
      explain: 'A prosthetic group (like heme in catalase) is a tightly bound organic or inorganic non-protein component essential for holoenzyme activity.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-48',
      q: 'Which cellular structure forms the mitotic spindle fibers during cell division in animal cells?',
      options: ['Centrosome / Centrioles', 'Nucleolus', 'Kinetochore', 'Microfilaments'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Centrosomes containing pairs of centrioles serve as microtubule organizing centers (MTOC) that assemble the mitotic spindle.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-49',
      q: 'Which process describes the engulfment of large solid particles or bacterial cells by macrophages?',
      options: ['Phagocytosis', 'Pinocytosis', 'Exocytosis', 'Receptor-mediated endocytosis'],
      correct: 0,
      topic: 'Immunity',
      explain: 'Phagocytosis ("cell eating") involves extending pseudopodia around particulate matter to form a phagosome, which fuses with lysosomes.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-50',
      q: 'Which stage of cellular respiration produces the highest amount of ATP per glucose molecule?',
      options: ['Oxidative phosphorylation (Electron Transport Chain)', 'Glycolysis', 'Krebs cycle', 'Pyruvate oxidation'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'Chemiosmotic ATP synthesis in the electron transport chain yields approximately 28 to 32 ATP per glucose molecule.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-51',
      q: 'Which hormone released by juxtaglomerular cells in response to low blood pressure activates the renin-angiotensin-aldosterone system?',
      options: ['Renin', 'Epinephrine', 'Vasopressin (ADH)', 'Atrial Natriuretic Peptide (ANP)'],
      correct: 0,
      topic: 'Homeostasis and Excretion',
      explain: 'Renin cleaves angiotensinogen into angiotensin I, initiating vasoconstriction and aldosterone secretion to restore blood pressure.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-52',
      q: 'Which hormone promotes seed germination by breaking seed dormancy and stimulating alpha-amylase synthesis?',
      options: ['Gibberellin (GA)', 'Abscisic Acid (ABA)', 'Auxin (IAA)', 'Ethylene'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'Gibberellins trigger aleurone layer cells in cereal seeds to synthesize alpha-amylase, breaking down starch into maltose for embryo growth.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-53',
      q: 'In human skeletal system, what type of joint is the shoulder joint?',
      options: ['Ball and socket joint', 'Hinge joint', 'Pivot joint', 'Saddle joint'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'The glenohumeral (shoulder) joint is a multiaxial ball and socket synovial joint permitting 360-degree rotational movement.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-54',
      q: 'Which structural organelle in eukaryotic cells is responsible for packaging proteins into secretory vesicles?',
      options: ['Golgi apparatus', 'Rough ER', 'Peroxisome', 'Lysosome'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'The Golgi apparatus modifies, sorts, and packages synthesized proteins received from RER into secretory vesicles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-55',
      q: 'Which molecule acts as the initial carbon dioxide acceptor in C3 plants during carbon fixation?',
      options: ['Ribulose-1,5-bisphosphate (RuBP)', 'Phosphoenolpyruvate (PEP)', 'Oxaloacetate', '3-Phosphoglycerate (PGA)'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'RuBP is a 5-carbon sugar that binds CO2 catalyzed by RuBisCO to form unstable 6-carbon intermediates in C3 photosynthesis.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-56',
      q: 'Which blood component initiates blood clotting by releasing thromboplastin at damaged vascular sites?',
      options: ['Platelets (Thrombocytes)', 'Erythrocytes', 'Neutrophils', 'Monocytes'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'Platelets adhere to exposed collagen at vascular lesion sites, releasing clotting factors that convert prothrombin into thrombin.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-57',
      q: 'Which structural layer of blood vessel walls contains smooth muscle fibers regulated by sympathetic nerve impulses?',
      options: ['Tunica media', 'Tunica intima', 'Tunica adventitia', 'Endothelium'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'The tunica media is the middle layer consisting of vascular smooth muscle and elastic fibers controlling vasodilation and vasoconstriction.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-58',
      q: 'What is the function of surfactant secreted by Type II alveolar cells in human lungs?',
      options: ['Reduces surface tension to prevent alveolar collapse', 'Transports oxygen', 'Destroys airborne bacteria', 'Increases blood pressure'],
      correct: 0,
      topic: 'Respiratory System',
      explain: 'Pulmonary surfactant (dipalmitoylphosphatidylcholine) lowers surface tension at the air-water interface in alveoli, increasing lung compliance.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-59',
      q: 'Which type of RNA carries specific amino acids to ribosomes during protein translation?',
      options: ['tRNA (Transfer RNA)', 'mRNA (Messenger RNA)', 'rRNA (Ribosomal RNA)', 'snRNA (Small nuclear RNA)'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'tRNA molecules feature an anticodon loop that base-pairs with mRNA codons, delivering corresponding amino acids to the ribosome.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-60',
      q: 'Which gland secretes melatonin to regulate circadian rhythm and sleep-wake cycles?',
      options: ['Pineal gland', 'Pituitary gland', 'Adrenal gland', 'Thyroid gland'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'The pineal gland synthesizes melatonin from serotonin in response to darkness, modulating sleep cycles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-61',
      q: 'Which genetic disorder is caused by trisomy of chromosome 21 in humans?',
      options: ['Down syndrome', 'Klinefelter syndrome', 'Turner syndrome', 'Edward syndrome'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'Nondisjunction during meiosis produces an extra copy of chromosome 21 (47, XX or XY, +21), resulting in Down syndrome.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-62',
      q: 'Which enzyme breaks down bacterial cell walls by hydrolyzing beta-1,4-glycosidic bonds between NAM and NAG?',
      options: ['Lysozyme', 'Amylase', 'Pepsin', 'Maltase'],
      correct: 0,
      topic: 'Immunity',
      explain: 'Lysozyme present in tears, saliva, and mucus acts as an innate chemical defense hydrolyzing peptidoglycan wall bonds.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-63',
      q: 'Which respiratory pigment contains copper ions and is present in the hemolymph of arthropods and mollusks?',
      options: ['Hemocyanin', 'Hemoglobin', 'Chlorocruorin', 'Hemerythrin'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'Hemocyanin is a copper-containing extracellular protein that turns blue when oxygenated in arthropod/mollusk blood.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-64',
      q: 'Which hormone increases blood glucose concentration by promoting glycogenolysis and gluconeogenesis in the liver?',
      options: ['Glucagon', 'Insulin', 'Calcitonin', 'Prolactin'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'Glucagon secreted by pancreatic alpha cells elevates blood glucose by stimulating liver glycogen breakdown and glucose synthesis.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-65',
      q: 'In cardiac muscle cells, what causes the prolonged plateau phase during action potential depolarization?',
      options: ['Slow influx of Ca2+ ions through L-type calcium channels', 'Rapid efflux of K+ ions', 'Rapid influx of Na+ ions', 'Active transport of Cl- ions'],
      correct: 0,
      topic: 'Transport and Circulation',
      explain: 'The plateau phase (Phase 2) of cardiac ventricular action potentials is caused by balancing inward L-type Ca2+ current with outward K+ current.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-66',
      q: 'Which bond links monosaccharides together to form disaccharides and polysaccharides?',
      options: ['Glycosidic linkage', 'Peptide bond', 'Phosphodiester bond', 'Ester linkage'],
      correct: 0,
      topic: 'Biological Molecules',
      explain: 'A glycosidic bond is a covalent condensation bond formed between the anomeric carbon of a carbohydrate and a hydroxyl group of another molecule.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-67',
      q: 'Which plant hormone causes apical dominance by inhibiting the growth of lateral axillary buds?',
      options: ['Auxin (Indole-3-acetic acid)', 'Cytokinin', 'Gibberellin', 'Ethylene'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'Auxin produced in shoot apical meristems flows basipetally to suppress axillary bud outgrowth, maintaining apical dominance.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-68',
      q: 'What is the total lung capacity of a healthy young adult male on average?',
      options: ['5000 to 6000 mL', '1200 mL', '2500 mL', '3500 mL'],
      correct: 0,
      topic: 'Respiratory System',
      explain: 'Total Lung Capacity (TLC) is the maximum volume of air the lungs can hold after full inspiration, averaging ~5.8 to 6.0 Liters.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-69',
      q: 'Which bone cell is responsible for bone resorption and mineral matrix breakdown?',
      options: ['Osteoclast', 'Osteoblast', 'Osteocyte', 'Chondrocyte'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'Osteoclasts are multinucleated giant cells derived from macrophage precursors that secrete acid and enzymes to break down bone matrix.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-70',
      q: 'Which structure in bacterial cells allows survival under harsh heat, desiccation, and chemical disinfection conditions?',
      options: ['Endospore', 'Capsule', 'Flagellum', 'Plasmid'],
      correct: 0,
      topic: 'Prokaryotes and Microorganisms',
      explain: 'Endospores produced by genera like Bacillus and Clostridium contain dipicolinic acid and dehydrate cytoplasm to resist extreme conditions.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-71',
      q: 'Which enzyme synthesizes primers made of short RNA sequences required for DNA Polymerase initialization?',
      options: ['Primase (RNA Primase)', 'DNA Polymerase I', 'DNA Ligase', 'Topoisomerase'],
      correct: 0,
      topic: 'Genetics and Inheritance',
      explain: 'DNA Polymerase requires a 3\'-OH end to start synthesis; primase provides short RNA primers to initiate lagging and leading strand synthesis.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-72',
      q: 'Which portion of antibody molecules binds specifically to antigenic determinants (epitopes)?',
      options: ['Variable region (Fab fragment)', 'Constant region (Fc fragment)', 'Hinge region', 'Disulfide bond site'],
      correct: 0,
      topic: 'Immunity',
      explain: 'The antigen-binding site (Fab) is formed by hypervariable regions of light and heavy polypeptide chains at the amino-terminal tips.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-73',
      q: 'Which process produces identical daughter cells with the exact same chromosome number as the parent cell?',
      options: ['Mitosis', 'Meiosis I', 'Meiosis II', 'Binary fission'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Mitosis is equational division preserving diploid (2n) or haploid (n) genomic content in somatic cell multiplication.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-74',
      q: 'Where does fertilization normally occur in the female reproductive tract?',
      options: ['Ampulla of Fallopian tube (Oviduct)', 'Uterine cavity', 'Ovary', 'Cervix'],
      correct: 0,
      topic: 'Reproduction',
      explain: 'The ampulla, the longest dilated segment of the Fallopian tube, is the physiological site of sperm-egg fusion and fertilization.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-75',
      q: 'Which enzyme in pancreatic juice hydrolyzes emulsified fats into fatty acids and glycerol?',
      options: ['Pancreatic Lipase', 'Pancreatic Amylase', 'Trypsin', 'Carboxypeptidase'],
      correct: 0,
      topic: 'Digestive System',
      explain: 'Pancreatic lipase acts at oil-water interfaces of bile-emulsified lipid droplets to yield free fatty acids and 2-monoacylglycerol.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-76',
      q: 'Which structural domain of myosin binds ATP and actin to form cross-bridges during muscle contraction?',
      options: ['Myosin head (S1 fragment)', 'Myosin tail (rod)', 'Light chains', 'Tropomyosin axis'],
      correct: 0,
      topic: 'Support and Movement',
      explain: 'The globular myosin head contains catalytic ATPase domain and actin binding sites essential for power stroke generation.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-77',
      q: 'Which type of cell junction prevents leakage of extracellular fluid across epithelial cell layers in the intestine?',
      options: ['Tight junctions (Zonula occludens)', 'Gap junctions', 'Desmosomes', 'Plasmodesmata'],
      correct: 0,
      topic: 'Cell Structure and Function',
      explain: 'Tight junctions form an impermeable seal around apical perimeters of epithelial cells, enforcing transcellular transport.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-78',
      q: 'Which compound acts as the final electron acceptor at the end of the mitochondrial electron transport chain?',
      options: ['Molecular Oxygen (O2)', 'NAD+', 'FAD', 'Water'],
      correct: 0,
      topic: 'Bioenergetics',
      explain: 'Cytochrome c oxidase transfers electrons to molecular oxygen, which combines with protons to form metabolic water (H2O).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-79',
      q: 'Which condition occurs when blood glucose concentration falls significantly below normal levels (below 70 mg/dL)?',
      options: ['Hypoglycemia', 'Hyperglycemia', 'Glycosuria', 'Ketoacidosis'],
      correct: 0,
      topic: 'Homeostasis and Excretion',
      explain: 'Hypoglycemia is low plasma glucose, causing autonomic sweating, tremors, and neuroglycopenic confusion.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-80',
      q: 'Which specialized cell in the stomach lining secretes Hydrochloric Acid (HCl) and Intrinsic Factor?',
      options: ['Parietal (Oxyntic) cells', 'Chief (Zymogenic) cells', 'G cells', 'Mucous neck cells'],
      correct: 0,
      topic: 'Digestive System',
      explain: 'Parietal cells in gastric glands pump H+ and Cl- ions into lumen and secrete intrinsic factor required for Vitamin B12 absorption.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-bio-81',
      q: 'Which autoimmune condition results in progressive destruction of myelin sheaths surrounding central nervous system axons?',
      options: ['Multiple Sclerosis', 'Myasthenia Gravis', 'Parkinson disease', 'Alzheimer disease'],
      correct: 0,
      topic: 'Coordination and Control',
      explain: 'Multiple Sclerosis involves immune-mediated demyelination of CNS nerve fibers, impairing action potential conduction speed.',
      difficulty: 'Exam Standard'
    }
  ],
  Chemistry: [
    {
      id: 'mdcat-chem-1',
      q: 'What is the correct order of decreasing SN1 reaction reactivity for alkyl halides?',
      options: [
        '3° Alkyl Halide > 2° Alkyl Halide > 1° Alkyl Halide > Methyl Halide',
        '1° Alkyl Halide > 2° Alkyl Halide > 3° Alkyl Halide',
        'Methyl Halide > 1° > 2° > 3°',
        '2° Alkyl Halide > 3° Alkyl Halide > 1° Alkyl Halide'
      ],
      correct: 0,
      topic: 'Alkyl Halides',
      explain: 'SN1 reactions proceed via a carbocation intermediate. Tertiary (3°) carbocations are stabilized by hyperconjugation and +I inductive effects of three alkyl groups, making 3° alkyl halides most reactive.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-2',
      q: 'According to Le Chatelier’s principle, what occurs to the equilibrium state of N2(g) + 3H2(g) ⇌ 2NH3(g) (ΔH = -92 kJ/mol) when temperature is increased?',
      options: [
        'Equilibrium shifts to the left (reverse direction), decreasing NH3 yield',
        'Equilibrium shifts to the right, increasing NH3 yield',
        'Equilibrium constant Kc increases',
        'No change occurs to the system equilibrium'
      ],
      correct: 0,
      topic: 'Chemical Equilibrium',
      explain: 'The forward reaction is exothermic (releases heat). Raising temperature adds heat, causing the system to shift endothermically (reverse direction, to the left) to absorb excess heat.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-3',
      q: 'Which organic reagent is utilized in the Lucas Test to differentiate between primary, secondary, and tertiary alcohols?',
      options: [
        'Equimolar mixture of Anhydrous ZnCl2 and Concentrated HCl',
        'Alkaline KMnO4 solution (Baeyer Reagent)',
        'Ammoniacal Silver Nitrate solution (Tollens Reagent)',
        'Sodium Dichromate in dilute H2SO4'
      ],
      correct: 0,
      topic: 'Alcohols and Phenols',
      explain: 'Lucas reagent consists of Anhydrous ZnCl2 in Conc. HCl. Tertiary alcohols react immediately forming an oily cloudiness of alkyl chloride; secondary alcohols react in 5 mins; primary alcohols require heating.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-4',
      q: 'What is the hybridization and bond angle of carbon atoms in a benzene ring (C6H6)?',
      options: ['sp2 hybridized with 120° bond angles', 'sp3 hybridized with 109.5° bond angles', 'sp hybridized with 180° bond angles', 'dsp2 hybridized with 90° bond angles'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'In benzene, each carbon atom forms 3 sigma bonds using sp2 hybrid orbitals in a planar hexagonal geometry with 120° bond angles, while unhybridized p-orbitals overlap delocalizing 6 pi electrons.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-5',
      q: 'What is the pH of a 0.001 M solution of strong monobasic acid HCl?',
      options: ['3.0', '1.0', '7.0', '11.0'],
      correct: 0,
      topic: 'Acids, Bases and Salts',
      explain: 'For HCl (strong acid), [H+] = 0.001 M = 10^-3 M. pH = -log10[H+] = -log10(10^-3) = 3.0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-6',
      q: 'Which law states that the total pressure exerted by a mixture of non-reacting gases is equal to the sum of partial pressures of individual gases?',
      options: ['Dalton’s Law of Partial Pressures', 'Graham’s Law of Diffusion', 'Boyle’s Law', 'Charles’s Law'],
      correct: 0,
      topic: 'States of Matter (Gases)',
      explain: 'Dalton’s law states Ptotal = P1 + P2 + P3 + ... for ideal gas mixtures occupying a given volume at constant temperature.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-7',
      q: 'What is the principal quantum number (n) and azimuthal quantum number (l) for a 3p subshell electron?',
      options: ['n = 3, l = 1', 'n = 3, l = 0', 'n = 3, l = 2', 'n = 2, l = 1'],
      correct: 0,
      topic: 'Atomic Structure',
      explain: 'For 3p subshell: main shell level n = 3, and subshell designator p corresponds to azimuthal quantum number l = 1 (s=0, p=1, d=2, f=3).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-8',
      q: 'Which functional group gives a positive silver mirror test when treated with Tollens’ reagent?',
      options: ['Aldehyde (-CHO)', 'Ketone (>C=O)', 'Ester (-COOR)', 'Tertiary alcohol'],
      correct: 0,
      topic: 'Carbonyl Compounds',
      explain: 'Tollens’ reagent [Ag(NH3)2]+ oxidizes aldehydes to carboxylate ions while reducing silver ions to metallic silver (Agº) mirror on glass walls.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-9',
      q: 'What is the oxidation number of chromium in potassium dichromate (K2Cr2O7)?',
      options: ['+6', '+3', '+7', '+4'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'K (+1 x 2 = +2), O (-2 x 7 = -14). For neutrality: 2Cr + 2 - 14 = 0 → 2Cr = +12 → Cr = +6.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-10',
      q: 'Which gas shows maximum deviation from ideal gas behavior at high pressure and low temperature?',
      options: ['NH3 (Ammonia)', 'He (Helium)', 'H2 (Hydrogen)', 'N2 (Nitrogen)'],
      correct: 0,
      topic: 'States of Matter (Gases)',
      explain: 'NH3 is a polar gas capable of strong hydrogen bonding. High intermolecular attractive forces cause maximum non-ideal behavior.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-11',
      q: 'What is the product formed when phenol reacts with concentrated HNO3 in the presence of concentrated H2SO4?',
      options: ['2,4,6-trinitrophenol (Picric Acid)', 'o-nitrophenol only', 'p-nitrophenol only', 'Nitrobenzene'],
      correct: 0,
      topic: 'Alcohols and Phenols',
      explain: 'The -OH group in phenol is strongly activating and ortho/para-directing. Nitration with conc. HNO3/H2SO4 yields 2,4,6-trinitrophenol (Picric acid).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-12',
      q: 'In an electrochemical cell, at which electrode does oxidation always take place?',
      options: ['Anode', 'Cathode', 'Salt bridge', 'External wire'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'Oxidation (loss of electrons) always occurs at the anode in both galvanic and electrolytic cells.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-13',
      q: 'Which geometry is predicted by VSEPR theory for a molecule with 3 bonding pairs and 1 lone pair around the central atom (e.g. NH3)?',
      options: ['Trigonal pyramidal', 'Trigonal planar', 'Tetrahedral', 'Bent / Angular'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: '4 electron pairs (3 bond pairs + 1 lone pair) adopt a tetrahedral electron geometry, resulting in a trigonal pyramidal molecular shape.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-14',
      q: 'What is the order of reaction if doubling the concentration of reactant increases the reaction rate by a factor of 4?',
      options: ['Second order', 'First order', 'Zero order', 'Third order'],
      correct: 0,
      topic: 'Reaction Kinetics',
      explain: 'Rate = k [A]^n. If Rate increases 4x when [A] doubles (2x): 2^n = 4 → n = 2 (Second order reaction).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-15',
      q: 'Which polymer is formed by condensation polymerization of hexamethylenediamine and adipic acid?',
      options: ['Nylon-6,6', 'Terylene (Dacron)', 'Polyethylene', 'PVC'],
      correct: 0,
      topic: 'Macromolecules and Polymers',
      explain: 'Nylon-6,6 is a polyamide synthesized by condensation of a 6-carbon diamine and 6-carbon dicarboxylic acid with loss of water.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-16',
      q: 'What is the standard enthalpy of formation (ΔHf°) for any element in its standard reference state at 298 K and 1 atm?',
      options: ['0.0 kJ/mol', '100 kJ/mol', '-285.8 kJ/mol', '1.0 kJ/mol'],
      correct: 0,
      topic: 'Thermochemistry',
      explain: 'By thermodynamic convention, ΔHf° of pure elements in their most stable natural physical state at 298 K is defined as exactly 0 kJ/mol.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-17',
      q: 'Which alkane isomer of C6H14 has the lowest boiling point due to maximum branching?',
      options: ['2,2-dimethylbutane', '2,3-dimethylbutane', '3-methylpentane', 'n-hexane'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'Increased branching makes molecules spherical, reducing surface area and London dispersion forces, lowering boiling point.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-18',
      q: 'What type of isomerism is exhibited by 1-butene and 2-butene?',
      options: ['Position isomerism', 'Chain isomerism', 'Functional group isomerism', 'Tautomerism'],
      correct: 0,
      topic: 'Fundamental Concepts of Organic Chemistry',
      explain: '1-butene and 2-butene have the same carbon skeleton but differ in the position of the double bond (C1 vs C2), demonstrating position isomerism.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-19',
      q: 'Which transition metal ion is colorless in aqueous solution due to a completely filled d-subshell (d10 configuration)?',
      options: ['Zn2+', 'Cu2+', 'Fe3+', 'Cr3+'],
      correct: 0,
      topic: 'Transition Elements',
      explain: 'Zn2+ has a 3d10 electron configuration. No d-d electron transitions are possible, rendering its complexes colorless.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-20',
      q: 'What is the empirical formula of a compound containing 40% Carbon, 6.7% Hydrogen, and 53.3% Oxygen by mass?',
      options: ['CH2O', 'CHO', 'C2H4O2', 'C6H12O6'],
      correct: 0,
      topic: 'Fundamental Concepts and Stoichiometry',
      explain: 'Moles: C = 40/12 = 3.33; H = 6.7/1 = 6.7; O = 53.3/16 = 3.33. Divide by smallest (3.33): C=1, H=2, O=1 → CH2O.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-21',
      q: 'Which reaction occurs when propene reacts with HBr in the presence of organic peroxides?',
      options: ['Anti-Markovnikov addition forming 1-bromopropane', 'Markovnikov addition forming 2-bromopropane', 'Electrophilic substitution', 'Nucleophilic elimination'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'In the presence of peroxides (Kharasch effect), HBr adds via free radical mechanism in an anti-Markovnikov fashion to give 1-bromopropane.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-22',
      q: 'What is the conjugate base of the bicarbonate ion (HCO3-)?',
      options: ['Carbonate ion (CO3^2-)', 'Carbonic acid (H2CO3)', 'Carbon dioxide (CO2)', 'Hydronium ion (H3O+)'],
      correct: 0,
      topic: 'Acids, Bases and Salts',
      explain: 'According to Brønsted-Lowry theory, donating a proton (H+) from HCO3- leaves its conjugate base CO3^2-.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-23',
      q: 'Which solid type possesses sharp melting points and long-range 3D structural lattice periodicity?',
      options: ['Crystalline solids', 'Amorphous solids', 'Supercooled liquids', 'Polymeric gels'],
      correct: 0,
      topic: 'States of Matter (Solids)',
      explain: 'Crystalline solids have ordered repeating unit cell lattices with uniform bond cleavage energies, resulting in sharp melting points.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-24',
      q: 'What is the rate-determining step in the SN1 reaction mechanism?',
      options: ['Heterolytic cleavage of C-X bond to form a carbocation', 'Nucleophilic attack on carbocation', 'Deprotonation step', 'Solvation of leaving group'],
      correct: 0,
      topic: 'Alkyl Halides',
      explain: 'The slow rate-determining step in SN1 is the unimolecular ionization of alkyl halide to form the carbocation intermediate.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-25',
      q: 'Which reagent reduces aldehydes and ketones to primary and secondary alcohols respectively without reducing C=C double bonds?',
      options: ['NaBH4 (Sodium borohydride)', 'H2 / Ni under pressure', 'LiAlH4 in acidic medium', 'Zn / HCl'],
      correct: 0,
      topic: 'Carbonyl Compounds',
      explain: 'NaBH4 selectively reduces carbonyl C=O groups via nucleophilic hydride transfer without affecting non-polar carbon-carbon double bonds.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-26',
      q: 'What is the coordination number of Fe in the complex ion [Fe(CN)6]^3-?',
      options: ['6', '3', '4', '2'],
      correct: 0,
      topic: 'Transition Elements',
      explain: 'Fe is coordinated to 6 monodentate cyanide (CN-) ligands, giving a coordination number of 6 in octahedral geometry.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-27',
      q: 'Which catalyst is used in the Contact Process for industrial manufacture of sulfuric acid (H2SO4)?',
      options: ['Vanadium pentoxide (V2O5)', 'Finely divided Iron (Fe)', 'Platinum gauze', 'Nickel (Ni)'],
      correct: 0,
      topic: 'Chemical Equilibrium and Industry',
      explain: 'V2O5 catalyzes the reversible oxidation of SO2 to SO3 at 450°C in the Contact Process.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-28',
      q: 'What is the enthalpy change when one mole of water is formed from its ions H+ and OH- under standard conditions?',
      options: ['-57.3 kJ/mol', '-285.8 kJ/mol', '+57.3 kJ/mol', '-114.6 kJ/mol'],
      correct: 0,
      topic: 'Thermochemistry',
      explain: 'The standard enthalpy of neutralization for strong acid and strong base reaction (H+ + OH- -> H2O) is constant at -57.3 kJ/mol.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-29',
      q: 'Which law states that at constant temperature, the volume of a given mass of gas is inversely proportional to its pressure?',
      options: ['Boyle’s Law', 'Charles’s Law', 'Avogadro’s Law', 'Dalton’s Law'],
      correct: 0,
      topic: 'States of Matter (Gases)',
      explain: 'Boyle’s law states V ∝ 1/P (or P1V1 = P2V2) at constant temperature and mass of gas.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-30',
      q: 'What product is formed when ethanol is heated with concentrated H2SO4 at 170°C?',
      options: ['Ethene (CH2=CH2)', 'Diethyl ether', 'Ethyl hydrogen sulfate', 'Ethane'],
      correct: 0,
      topic: 'Alcohols and Phenols',
      explain: 'Intramolecular dehydration of ethanol with excess conc. H2SO4 at 170°C eliminates water to yield ethene via E1 mechanism.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-31',
      q: 'Which halogen has the highest electronegativity value on the Pauling scale?',
      options: ['Fluorine (4.0)', 'Chlorine (3.0)', 'Bromine (2.8)', 'Iodine (2.5)'],
      correct: 0,
      topic: 'Periodic Properties',
      explain: 'Fluorine is the most electronegative element (4.0 Pauling units) due to its small atomic radius and high effective nuclear charge.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-32',
      q: 'What is the formal charge on the nitrogen atom in ammonium ion (NH4+)?',
      options: ['+1', '0', '-1', '+4'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: 'Formal charge = Valence electrons (5) - Lone pair electrons (0) - Bonding pairs (4) = 5 - 0 - 4 = +1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-33',
      q: 'Which method is used to increase the octane number of straight-run gasoline in petroleum refining?',
      options: ['Reforming / Isomerization', 'Cracking', 'Fractional distillation', 'Polymerization'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'Reforming converts straight-chain alkanes into branched-chain alkanes and aromatic hydrocarbons, raising octane ratings.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-34',
      q: 'What is the half-life of a first-order reaction if its rate constant k is 0.0693 min^-1?',
      options: ['10 minutes', '100 minutes', '6.93 minutes', '1 minute'],
      correct: 0,
      topic: 'Reaction Kinetics',
      explain: 'For 1st order reaction: t1/2 = 0.693 / k = 0.693 / 0.0693 = 10 minutes.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-35',
      q: 'Which organic acid is present in ant stings and vinegar respectively?',
      options: ['Formic acid (ant sting) and Acetic acid (vinegar)', 'Acetic acid and Formic acid', 'Lactic acid and Citric acid', 'Oxalic acid and Formic acid'],
      correct: 0,
      topic: 'Carboxylic Acids',
      explain: 'Formic acid (methanoic acid, HCOOH) causes irritation in ant stings; vinegar is 4-8% dilute acetic acid (CH3COOH).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-36',
      q: 'What is the oxidation state of sulfur in thiosulfate ion (S2O3^2-)?',
      options: ['+2', '+4', '+6', '-2'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'Structure has central S (+6) and terminal S (-2). Average oxidation state = (6 - 2) / 2 = +2.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-37',
      q: 'Which organic reaction converts an acid chloride into an aldehyde using H2 over Pd-BaSO4 catalyst?',
      options: ['Rosenmund Reduction', 'Clemmensen Reduction', 'Wolff-Kishner Reduction', 'Stephen Reduction'],
      correct: 0,
      topic: 'Carbonyl Compounds',
      explain: 'Rosenmund reduction selectively reduces acyl chlorides to aldehydes using hydrogen gas with poisoned Pd/BaSO4 catalyst.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-38',
      q: 'Which disaccharide gives two glucose units upon enzymatic hydrolysis by maltase?',
      options: ['Maltose', 'Sucrose', 'Lactose', 'Cellobiose'],
      correct: 0,
      topic: 'Macromolecules',
      explain: 'Maltose consists of two alpha-D-glucose units joined by an alpha-1,4-glycosidic bond.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-39',
      q: 'What is the molarity of a solution containing 4 grams of NaOH dissolved in 250 mL of solution?',
      options: ['0.4 M', '0.1 M', '1.0 M', '0.2 M'],
      correct: 0,
      topic: 'Fundamental Concepts and Stoichiometry',
      explain: 'Moles NaOH = 4g / 40g/mol = 0.1 mol. Volume = 0.25 L. Molarity = 0.1 / 0.25 = 0.4 M.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-40',
      q: 'Which ion has the smallest ionic radius among Isoelectronic species: N3-, O2-, F-, Na+, Mg2+?',
      options: ['Mg2+', 'Na+', 'F-', 'N3-'],
      correct: 0,
      topic: 'Periodic Properties',
      explain: 'Among isoelectronic ions (10 electrons), Mg2+ has highest nuclear charge (Z=12), pulling electrons closest, giving smallest ionic radius.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-41',
      q: 'Which alcohol gives an immediate yellow precipitate of iodoform (CHI3) when treated with I2 and NaOH?',
      options: ['Ethanol (CH3CH2OH)', 'Methanol (CH3OH)', '1-Propanol', '1-Butanol'],
      correct: 0,
      topic: 'Alcohols and Phenols',
      explain: 'Ethanol contains the CH3CH(OH)- group required for positive iodoform reaction producing yellow CHI3 crystals.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-42',
      q: 'What is the pH of a buffer solution containing 0.1 M CH3COOH and 0.1 M CH3COONa (Ka for CH3COOH = 1.8 x 10^-5, pKa = 4.74)?',
      options: ['4.74', '7.0', '3.74', '5.74'],
      correct: 0,
      topic: 'Chemical Equilibrium',
      explain: 'Henderson-Hasselbalch equation: pH = pKa + log([Salt]/[Acid]) = 4.74 + log(0.1/0.1) = 4.74 + 0 = 4.74.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-43',
      q: 'Which organic reaction mechanism is involved in the nitration of benzene?',
      options: ['Electrophilic aromatic substitution', 'Nucleophilic aromatic substitution', 'Free radical substitution', 'Electrophilic addition'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'Nitration generates nitronium ion (NO2+), an electrophile that attacks the aromatic pi electron cloud in an electrophilic substitution reaction.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-44',
      q: 'Which cell parameter determines whether a redox reaction is thermodynamically spontaneous under standard conditions?',
      options: ['E°cell > 0 (Positive cell EMF)', 'E°cell < 0', 'ΔG° > 0', 'Kc < 1'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'Since ΔG° = -nFE°cell, a positive standard cell EMF (E°cell > 0) yields negative ΔG°, indicating a spontaneous redox reaction.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-chem-45',
      q: 'Which element displays variable oxidation states due to small energy difference between (n-1)d and ns subshells?',
      options: ['Transition metals (d-block elements)', 'Alkali metals', 'Halogens', 'Noble gases'],
      correct: 0,
      topic: 'Transition Elements',
      explain: 'Transition elements can lose electrons from both outer ns and inner (n-1)d orbitals because their energy levels are close.',
      difficulty: 'Exam Standard'
    }
  ],
  Physics: [
    {
      id: 'mdcat-phy-1',
      q: 'A projectile is launched with an initial velocity v at an angle of 30° with the horizontal. What is its acceleration at the highest point of its trajectory?',
      options: ['9.8 m/s² vertically downward (g)', '0 m/s²', '9.8 m/s² horizontally', '4.9 m/s² along the trajectory'],
      correct: 0,
      topic: 'Motion and Force',
      explain: 'Gravity acts downward constantly on any projectile throughout its flight. At the highest point, vertical velocity is 0, but acceleration is still g = 9.8 m/s² vertically downward.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-2',
      q: 'A transformer has 100 turns in its primary coil and 500 turns in its secondary coil. If 220V AC is supplied to the primary coil, what is the output voltage from the secondary coil?',
      options: ['1100 V', '44 V', '220 V', '550 V'],
      correct: 0,
      topic: 'Electromagnetic Induction',
      explain: 'Transformer formula: Vs / Vp = Ns / Np. Therefore Vs = Vp × (Ns / Np) = 220 V × (500 / 100) = 220 × 5 = 1100 V.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-3',
      q: 'In a photoelectric experiment, what happens to the maximum kinetic energy of emitted photoelectrons when the intensity of incident monochromatic light is doubled without changing frequency?',
      options: ['Maximum kinetic energy remains unchanged', 'Maximum kinetic energy is doubled', 'Maximum kinetic energy is quadrupled', 'Maximum kinetic energy drops to zero'],
      correct: 0,
      topic: 'Dawn of Modern Physics',
      explain: "Einstein's photoelectric equation states Kmax = hf - Φ. Kinetic energy depends strictly on photon frequency (f) and work function (Φ). Doubling intensity increases photoelectron flux, not kinetic energy.",
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-4',
      q: 'If the distance between two point charges is halved while keeping their magnitudes constant, how does the electrostatic force between them change?',
      options: ['Increases by a factor of 4', 'Decreases by a factor of 4', 'Doubles', 'Halves'],
      correct: 0,
      topic: 'Electrostatics',
      explain: "According to Coulomb's Law, F ∝ 1 / r². If r is replaced by (r/2), the force becomes F' ∝ 1 / (r/2)² = 4 / r² = 4F.",
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-5',
      q: 'What is the work done by a centripetal force acting on an object moving in a circular path of radius R with constant speed v?',
      options: ['Zero (0 Joules)', 'm v² / R', 'm v² R', '2 π m v²'],
      correct: 0,
      topic: 'Work, Energy and Power',
      explain: 'Centripetal force acts perpendicular (90°) to instantaneous displacement. W = F d cos(90°) = 0 Joules.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-6',
      q: 'Which thermodynamic process occurs at constant volume where no work is done by or on the system?',
      options: ['Isochoric process', 'Isobaric process', 'Isothermal process', 'Adiabatic process'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'In an isochoric process, ΔV = 0. Work W = P ΔV = 0. First Law becomes Q = ΔU.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-7',
      q: 'What is the equivalent resistance of three 6-ohm resistors connected in parallel?',
      options: ['2 ohms', '18 ohms', '3 ohms', '9 ohms'],
      correct: 0,
      topic: 'Current Electricity',
      explain: '1/R_eq = 1/6 + 1/6 + 1/6 = 3/6 = 1/2 → R_eq = 2 ohms.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-8',
      q: 'Which law relates the induced electromotive force (emf) in a circuit to the rate of change of magnetic flux linked with it?',
      options: ['Faraday’s Law of Electromagnetic Induction', 'Lenz’s Law', 'Ampere’s Law', 'Gauss’s Law'],
      correct: 0,
      topic: 'Electromagnetic Induction',
      explain: 'Faraday’s law states induced emf e = -N (dΦ/dt), proportional to the rate of magnetic flux change.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-9',
      q: 'What is the de Broglie wavelength of an electron of mass m moving with speed v?',
      options: ['h / (m v)', 'm v / h', 'h m v', 'h / (2 m v)'],
      correct: 0,
      topic: 'Dawn of Modern Physics',
      explain: 'De Broglie relationship links particle momentum p = mv with wave aspect wavelength λ = h / p = h / (m v).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-10',
      q: 'Which physical quantity remains conserved in an elastic collision between two isolated bodies?',
      options: ['Both total linear momentum and total kinetic energy', 'Total linear momentum only', 'Total kinetic energy only', 'Total mechanical energy only'],
      correct: 0,
      topic: 'Motion and Force',
      explain: 'In elastic collisions, no kinetic energy is transformed into heat/sound; both linear momentum and kinetic energy are conserved.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-11',
      q: 'What is the unit of electric field intensity in the SI system?',
      options: ['Volts per meter (V/m) or Newtons per Coulomb (N/C)', 'Joules per Coulomb', 'Amperes per meter', 'Farads per meter'],
      correct: 0,
      topic: 'Electrostatics',
      explain: 'Electric field strength E = F / q (N/C) or E = -dV / dr (V/m).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-12',
      q: 'What is the frequency of simple harmonic motion for a mass m suspended from a spring of spring constant k?',
      options: ['(1 / 2π) √(k / m)', '2π √(m / k)', '(1 / 2π) √(m / k)', '2π √(k / m)'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'Angular frequency ω = √(k/m). Since f = ω / 2π, frequency f = (1 / 2π) √(k / m).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-13',
      q: 'Which logic gate produces a HIGH (1) output ONLY when all of its inputs are LOW (0)?',
      options: ['NOR Gate', 'NAND Gate', 'AND Gate', 'OR Gate'],
      correct: 0,
      topic: 'Electronics',
      explain: 'A NOR gate is an inverted OR gate; its output is 1 only when all inputs are 0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-14',
      q: 'What is the SI unit of magnetic flux density (B)?',
      options: ['Tesla (T) or Weber per square meter (Wb/m²)', 'Weber', 'Gauss', 'Henry'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'Magnetic flux B = Φ / A (Wb/m²), defined in SI units as Tesla (T).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-15',
      q: 'What is the speed of electromagnetic waves in a vacuum?',
      options: ['3 x 10^8 m/s', '3 x 10^5 m/s', '330 m/s', '1.5 x 10^8 m/s'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'All electromagnetic waves travel through vacuum at c = 1 / √(μ0 ε0) ≈ 3.00 × 10^8 m/s.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-16',
      q: 'If the absolute temperature of a black body is doubled, by what factor does its total radiant energy emission per unit area increase?',
      options: ['16 times', '4 times', '2 times', '8 times'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'According to Stefan-Boltzmann law, E ∝ T^4. If temperature T doubles (2T), emission increases by (2)^4 = 16 times.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-17',
      q: 'What is the half-life of a radioactive sample if its decay constant λ is 0.035 day^-1?',
      options: ['19.8 days', '10 days', '35 days', '0.035 days'],
      correct: 0,
      topic: 'Nuclear Physics',
      explain: 'Radioactive half-life t1/2 = ln(2) / λ = 0.693 / 0.035 ≈ 19.8 days.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-18',
      q: 'Which optical phenomenon demonstrates the transverse wave nature of light?',
      options: ['Polarization', 'Interference', 'Diffraction', 'Refraction'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'Only transverse waves can be polarized. Interference and diffraction occur in both longitudinal and transverse waves.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-19',
      q: 'What is the peak voltage (V0) of a standard household AC supply rated at 220 V root-mean-square (Vrms)?',
      options: ['311 V', '220 V', '155 V', '440 V'],
      correct: 0,
      topic: 'Current Electricity',
      explain: 'Vrms = V0 / √2. Therefore peak voltage V0 = Vrms × √2 = 220 × 1.414 ≈ 311 V.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-20',
      q: 'What is the power dissipated in a circuit resistor of 10 ohms carrying a current of 3 amperes?',
      options: ['90 Watts', '30 Watts', '27 Watts', '100 Watts'],
      correct: 0,
      topic: 'Current Electricity',
      explain: 'Joule’s heating law: Power P = I² R = (3)² × 10 = 9 × 10 = 90 W.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-21',
      q: 'Which law states that the orbital radius of a planet sweeps equal areas in equal intervals of time?',
      options: ['Kepler’s Second Law (Law of Equal Areas)', 'Kepler’s First Law', 'Kepler’s Third Law', 'Newton’s Law of Gravitation'],
      correct: 0,
      topic: 'Motion and Force',
      explain: 'Kepler’s second law reflects conservation of angular momentum: areal velocity dA/dt = L / (2m) = constant.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-22',
      q: 'In Young’s double slit experiment, how does fringe width (β) change if the distance between slits (d) is doubled?',
      options: ['Fringe width is halved', 'Fringe width is doubled', 'Fringe width quadruples', 'Fringe width remains unchanged'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'Fringe width formula β = λ D / d. Fringe width is inversely proportional to slit distance d.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-23',
      q: 'What is the minimum energy required to break a nucleus into its constituent nucleons called?',
      options: ['Binding energy', 'Ionization energy', 'Work function', 'Activation energy'],
      correct: 0,
      topic: 'Nuclear Physics',
      explain: 'Binding energy ΔE = Δm c² represents mass defect converted into energy holding nucleons together.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-24',
      q: 'What is the force experienced by a charge q moving with velocity v perpendicular to a uniform magnetic field B?',
      options: ['F = q v B', 'F = q v / B', 'F = zero', 'F = q B / v'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'Lorentz magnetic force F = q (v × B) = q v B sin(90°) = q v B.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-25',
      q: 'What is the capacitance of a parallel plate capacitor filled with dielectric medium of relative permittivity εr?',
      options: ['C = εr (A ε0 / d)', 'C = A ε0 / (εr d)', 'C = εr d / (A ε0)', 'C = A d / ε0'],
      correct: 0,
      topic: 'Electrostatics',
      explain: 'Inserting dielectric of constant εr increases capacitance by factor εr: C = εr C0 = εr (A ε0 / d).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-26',
      q: 'In Bohr’s hydrogen atom model, what is the angular momentum of an electron in the n-th stationary orbit?',
      options: ['m v r = n h / (2π)', 'm v r = h / (2π n)', 'm v r = 2π n / h', 'm v r = n² h / (2π)'],
      correct: 0,
      topic: 'Atomic Spectra',
      explain: 'Bohr’s second postulate quantizes orbital angular momentum L = m v r = n ħ = n h / (2π).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-27',
      q: 'What is the acceleration due to gravity at the center of the Earth?',
      options: ['0 m/s²', '9.8 m/s²', '4.9 m/s²', 'Infinity'],
      correct: 0,
      topic: 'Motion and Force',
      explain: 'Inside Earth, g(r) = g0 (r / R). At Earth center r = 0, so g = 0 m/s².',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-28',
      q: 'Which component in a DC motor reverses the direction of current in the armature coil every half rotation?',
      options: ['Split-ring commutator', 'Slip rings', 'Carbon brushes', 'Field magnet'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'Split-ring commutators reverse coil current direction every 180° to ensure continuous unidirectional torque.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-29',
      q: 'What is the focal length of a plane glass mirror?',
      options: ['Infinity', 'Zero', '1 meter', '-10 cm'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'A plane mirror has no curvature (R = ∞). Since f = R / 2, its focal length is infinite.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-30',
      q: 'Which intrinsic semiconductor exhibits increased electrical conductivity when doped with trivalent impurity atoms (e.g. Boron)?',
      options: ['p-type semiconductor', 'n-type semiconductor', 'Intrinsic semiconductor', 'Superconductor'],
      correct: 0,
      topic: 'Electronics',
      explain: 'Doping silicon with group III elements (Boron) creates electron deficiency (holes) as majority carriers, forming p-type semiconductors.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-31',
      q: 'What is the work function of a metal if incident photon of energy 5.0 eV emits photoelectrons with maximum kinetic energy 1.8 eV?',
      options: ['3.2 eV', '6.8 eV', '1.8 eV', '5.0 eV'],
      correct: 0,
      topic: 'Dawn of Modern Physics',
      explain: 'Einstein equation E = Φ + Kmax → Φ = E - Kmax = 5.0 eV - 1.8 eV = 3.2 eV.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-32',
      q: 'What is the efficiency of a Carnot heat engine operating between reservoir temperatures 600 K and 300 K?',
      options: ['50%', '25%', '75%', '100%'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'Carnot efficiency η = 1 - (Tc / Th) = 1 - (300 / 600) = 1 - 0.5 = 0.50 (50%).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-33',
      q: 'Which wave phenomenon causes stationary waves to be formed in stretched strings?',
      options: ['Superposition of two identical waves traveling in opposite directions', 'Refraction at medium boundary', 'Diffraction around narrow obstacles', 'Polarization'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'Standing waves arise from interference between two progressive waves of same amplitude/frequency traveling in opposite directions.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-34',
      q: 'What is the SI unit of resistivity (ρ) of a conducting material?',
      options: ['Ohm-meter (Ω·m)', 'Ohm per meter', 'Ohm', 'Siemens'],
      correct: 0,
      topic: 'Current Electricity',
      explain: 'Resistance R = ρ L / A → ρ = R A / L (Ω · m² / m = Ω · m).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-35',
      q: 'What type of alpha particle scattering experiment led Rutherford to discover the atomic nucleus?',
      options: ['Alpha particle bombardment on thin Gold foil', 'Cathode ray discharge tube', 'Millikan oil drop experiment', 'X-ray diffraction'],
      correct: 0,
      topic: 'Atomic Spectra',
      explain: 'Rutherford bombarded thin gold foil with alpha particles, observing large angle deflections that proved dense positive nucleus concentration.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-phy-36',
      q: 'Which physical principle underlies the operation of optical fibers for data communication?',
      options: ['Total Internal Reflection', 'Diffraction', 'Polarization', 'Refraction'],
      correct: 0,
      topic: 'Waves and Oscillations',
      explain: 'Light signals undergo continuous total internal reflection inside high refractive index glass core trapped by cladding.',
      difficulty: 'Exam Standard'
    }
  ],
  English: [
    {
      id: 'mdcat-eng-1',
      q: 'Choose the synonym that best matches the underlined word in context: "The physician provided a meticulous analysis of the diagnostic scan."',
      options: ['Painstaking and thorough', 'Superficial', 'Hasty', 'Vague'],
      correct: 0,
      topic: 'Vocabulary',
      explain: '"Meticulous" means showing great attention to detail, highly thorough, careful, and painstaking.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-2',
      q: 'Identify the grammatically correct sentence:',
      options: [
        'Neither the surgeon nor the nurses were aware of the sudden change in vital signs.',
        'Neither the surgeon nor the nurses was aware of the sudden change in vital signs.',
        'Neither the surgeon or the nurses was aware of the sudden change in vital signs.',
        'Neither the surgeon nor the nurses has been aware of the sudden change in vital signs.'
      ],
      correct: 0,
      topic: 'Grammar',
      explain: 'When using "neither... nor...", the verb agrees with the subject closer to it. "The nurses" is plural, so the plural verb "were" is correct.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-3',
      q: 'Complete the sentence with the most appropriate transition phrase: "The experimental treatment demonstrated promising cellular regeneration; ____, further clinical trials are required before general approval."',
      options: ['nevertheless', 'consequently', 'furthermore', 'similarly'],
      correct: 0,
      topic: 'Sentence Completion',
      explain: '"Nevertheless" expresses contrast between promising early results and the need for cautious further testing.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-4',
      q: 'Choose the antonym of the word "BENIGN":',
      options: ['Malignant', 'Harmless', 'Gentle', 'Favorable'],
      correct: 0,
      topic: 'Vocabulary',
      explain: '"Benign" means gentle, non-cancerous, or harmless. Its direct antonym in medical terminology is "malignant" (harmful/cancerous).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-5',
      q: 'Identify the correct preposition to complete the sentence: "The lead researcher was accused _____ violating clinical protocol."',
      options: ['of', 'for', 'with', 'about'],
      correct: 0,
      topic: 'Grammar',
      explain: 'The verb "accuse" takes the fixed preposition "of" (e.g., accused of something).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-6',
      q: 'Select the option that correctly uses a subjunctive verb form:',
      options: [
        'The chief doctor insisted that the patient be monitored continuously.',
        'The chief doctor insisted that the patient is monitored continuously.',
        'The chief doctor insisted that the patient was monitored continuously.',
        'The chief doctor insisted that the patient will be monitored continuously.'
      ],
      correct: 0,
      topic: 'Grammar',
      explain: 'Verbs expressing insistence or demand (insist that...) require the subjunctive base verb form ("be monitored").',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-7',
      q: 'Identify the word with correct spelling:',
      options: ['Accommodation', 'Acommodation', 'Accomodation', 'Acomodation'],
      correct: 0,
      topic: 'Spelling',
      explain: '"Accommodation" is correctly spelled with double "c" and double "m".',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-8',
      q: 'Choose the correct idiom meaning "to face a difficult situation courageously":',
      options: ['Bite the bullet', 'Burn the midnight oil', 'Hit the nail on the head', 'Bark up the wrong tree'],
      correct: 0,
      topic: 'Idioms and Phrases',
      explain: '"Bite the bullet" means to endure a painful or difficult situation with courage.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-eng-9',
      q: 'Select the correct passive voice transformation: "The lab technician is analyzing the blood samples."',
      options: [
        'The blood samples are being analyzed by the lab technician.',
        'The blood samples were analyzed by the lab technician.',
        'The blood samples are analyzed by the lab technician.',
        'The blood samples have been analyzed by the lab technician.'
      ],
      correct: 0,
      topic: 'Active and Passive Voice',
      explain: 'Present continuous active ("is analyzing") transforms to present continuous passive ("are being analyzed").',
      difficulty: 'Exam Standard'
    }
  ],
  'Logical Reasoning': [
    {
      id: 'mdcat-lr-1',
      q: 'Statements: All antibiotics are pharmaceuticals. Some pharmaceuticals are natural extracts.\nConclusions:\nI. Some antibiotics are natural extracts.\nII. No natural extracts are antibiotics.\nWhich conclusion(s) logically follow?',
      options: [
        'Neither Conclusion I nor II follows definitely',
        'Only Conclusion I follows',
        'Only Conclusion II follows',
        'Both Conclusions I and II follow'
      ],
      correct: 0,
      topic: 'Logical Deduction',
      explain: 'From "All A are P" and "Some P are N", we cannot definitively establish an overlap between A and N without further premise data. Neither I nor II follows with certainty.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-2',
      q: 'Find the missing term in the sequence: B2D, E5H, H10L, K17P, ?',
      options: ['N26T', 'M25S', 'O27U', 'N25T'],
      correct: 0,
      topic: 'Letter and Symbol Series',
      explain: 'First letters: B (+3) -> E (+3) -> H (+3) -> K (+3) -> N. Numbers: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26. Third letters: D (+4) -> H (+4) -> L (+4) -> P (+4) -> T. Result: N26T.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-3',
      q: 'If "STETHOSCOPE" is coded as "TUFUIFTPDQF" in a secret cipher, how is "DOCTOR" coded in that same pattern?',
      options: ['EPDUPS', 'CNDSNP', 'EQEVPS', 'DPDUOS'],
      correct: 0,
      topic: 'Logical Problems',
      explain: 'Each letter is shifted forward by 1 (+1 in alphabet): D->E, O->P, C->D, T->U, O->P, R->S. Output: EPDUPS.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-4',
      q: 'Assertion (A): Vaccination programs prevent large-scale viral epidemics.\nReason (R): Vaccines stimulate memory B and T cells to produce rapid immune responses upon pathogen exposure.',
      options: [
        'Both A and R are true and R is the correct explanation of A',
        'Both A and R are true but R is NOT the correct explanation of A',
        'A is true but R is false',
        'A is false but R is true'
      ],
      correct: 0,
      topic: 'Cause and Effect',
      explain: 'Vaccination confers immunological memory (R), which enables rapid antibody production preventing disease spread and epidemics (A). Both are true and R explains A.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-5',
      q: 'Pointing to a photograph of a woman, Ali said, "Her mother is the only daughter of my mother-in-law." How is Ali related to the woman in the photograph?',
      options: ['Father', 'Uncle', 'Brother', 'Grandfather'],
      correct: 0,
      topic: 'Symbol-based Reasoning',
      explain: 'Only daughter of Ali’s mother-in-law is Ali’s wife. Her mother = Ali’s wife. Therefore, Ali is the woman’s father.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-6',
      q: 'Which pair of words shares the exact same logical relationship as HEPATITIS : LIVER?',
      options: ['NEPHRITIS : KIDNEY', 'ARTHRITIS : HEART', 'GASTRITIS : LUNG', 'PNEUMONIA : BRAIN'],
      correct: 0,
      topic: 'Analogies',
      explain: 'Hepatitis is inflammation of the liver. Nephritis is inflammation of the kidney (matching organ inflammation relationship).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-7',
      q: 'If all doctors are scientists and no scientists are illiterate, which statement MUST be true?',
      options: [
        'No doctors are illiterate',
        'All illiterate people are doctors',
        'Some doctors are illiterate',
        'All scientists are doctors'
      ],
      correct: 0,
      topic: 'Syllogism',
      explain: 'Since Doctors are a subset of Scientists, and Scientists do not overlap with Illiterate, Doctors cannot overlap with Illiterate either.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-8',
      q: 'Find the odd one out among the given options:',
      options: ['Tibia', 'Radius', 'Ulna', 'Fibula'],
      correct: 0,
      topic: 'Logical Classification',
      explain: 'Radius and Ulna are upper limb (arm) bones; Tibia and Fibula are lower limb (leg) bones. Alternatively, Tibia is the heaviest leg weight-bearing bone.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'mdcat-lr-9',
      q: 'Five patients A, B, C, D, E are waiting in a queue. A is ahead of B but behind C. D is ahead of C but behind E. Who is standing in the middle of the queue?',
      options: ['C', 'A', 'B', 'D'],
      correct: 0,
      topic: 'Linear Order',
      explain: 'Arrangement from front to back: E -> D -> C -> A -> B. The middle person (3rd position) is C.',
      difficulty: 'Exam Standard'
    }
  ]
};

export function getMDCATPrebuiltQuestions(subject: string, count: number = 10): Question[] {
  const normSub = Object.keys(MDCAT_PREBUILT_QUESTIONS).find(
    k => k.toLowerCase() === subject.toLowerCase()
  ) || 'Biology';

  const pool = MDCAT_PREBUILT_QUESTIONS[normSub] || MDCAT_PREBUILT_QUESTIONS['Biology'];
  const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
  const results: Question[] = [];

  for (let i = 0; i < count; i++) {
    const raw = shuffledPool[i % shuffledPool.length];
    const itemWithShuffledOptions = shuffleOptionsAndFixCorrect(raw);
    results.push({
      ...itemWithShuffledOptions,
      id: `mdcat-q-${normSub}-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    });
  }

  return results;
}

export function generateMDCATFullMockBank(): Question[] {
  // 180 MCQs total: 81 Bio, 45 Chem, 36 Phys, 9 Eng, 9 Logical Reasoning
  const seenStems = new Set<string>();

  function selectUnique(subjectKey: string, targetCount: number): Question[] {
    const pool = MDCAT_PREBUILT_QUESTIONS[subjectKey] || [];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected: Question[] = [];

    for (const qItem of shuffled) {
      if (selected.length >= targetCount) break;
      const norm = qItem.q.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenStems.has(norm)) {
        seenStems.add(norm);
        const fixed = shuffleOptionsAndFixCorrect(qItem);
        selected.push({
          ...fixed,
          id: `mdcat-mock-${subjectKey.toLowerCase()}-${selected.length + 1}-${Date.now()}`
        });
      }
    }

    // Top up safely if needed without duplicates
    let loopIndex = 0;
    while (selected.length < targetCount && pool.length > 0) {
      const base = pool[loopIndex % pool.length];
      const fixed = shuffleOptionsAndFixCorrect(base);
      selected.push({
        ...fixed,
        id: `mdcat-mock-${subjectKey.toLowerCase()}-topup-${selected.length + 1}-${Date.now()}`
      });
      loopIndex++;
    }

    return selected;
  }

  const bio = selectUnique('Biology', 81);
  const chem = selectUnique('Chemistry', 45);
  const phys = selectUnique('Physics', 36);
  const eng = selectUnique('English', 9);
  const lr = selectUnique('Logical Reasoning', 9);

  return [...bio, ...chem, ...phys, ...eng, ...lr];
}
