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

export const TCAT_PREBUILT_QUESTIONS: Record<string, Question[]> = {
  Mathematics: [
    {
      id: 'tcat-math-1',
      q: 'If A is a 3x3 square matrix such that |A| = 5, what is the value of |adj(A)|?',
      options: ['25', '125', '5', '1/5'],
      correct: 0,
      topic: 'Matrices and Determinants',
      explain: 'For an n x n square matrix A, |adj(A)| = |A|^(n-1). Here n = 3, so |adj(A)| = 5^(3-1) = 5² = 25.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-2',
      q: 'What are the roots of the quadratic equation 2x² - 5x + 3 = 0?',
      options: ['x = 1 and x = 3/2', 'x = -1 and x = -3/2', 'x = 2 and x = 3', 'x = -2 and x = 1/2'],
      correct: 0,
      topic: 'Quadratic Equations',
      explain: 'Factoring 2x² - 5x + 3 = 0 → (2x - 3)(x - 1) = 0 → x = 3/2 and x = 1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-3',
      q: 'What is the sum of the infinite geometric series 12 + 4 + 4/3 + 4/9 + ...?',
      options: ['18', '16', '24', '12'],
      correct: 0,
      topic: 'Sequences and Series',
      explain: 'First term a = 12, common ratio r = 4/12 = 1/3. Sum S = a / (1 - r) = 12 / (1 - 1/3) = 12 / (2/3) = 18.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-4',
      q: 'What is the period of the trigonometric function f(x) = sin(3x)?',
      options: ['2π / 3', '2π', 'π / 3', '6π'],
      correct: 0,
      topic: 'Trigonometric Functions',
      explain: 'The period of sin(kx) is 2π / |k|. For k = 3, period = 2π / 3.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-5',
      q: 'Evaluate the limit: lim (x -> 0) [sin(5x) / x].',
      options: ['5', '1', '0', '1/5'],
      correct: 0,
      topic: 'Limits and Continuity',
      explain: 'Standard limit theorem: lim (u -> 0) [sin(u) / u] = 1. Therefore lim (x -> 0) [5 * sin(5x)/(5x)] = 5 * 1 = 5.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-6',
      q: 'What is the derivative of f(x) = e^(3x) * cos(x) with respect to x?',
      options: ['e^(3x) [3 cos(x) - sin(x)]', '3 e^(3x) sin(x)', 'e^(3x) [cos(x) + sin(x)]', '-3 e^(3x) sin(x)'],
      correct: 0,
      topic: 'Differentiation',
      explain: 'Using product rule: d/dx [u*v] = u\'*v + u*v\'. Here u = e^(3x), u\' = 3 e^(3x); v = cos(x), v\' = -sin(x). f\'(x) = 3 e^(3x) cos(x) - e^(3x) sin(x) = e^(3x) [3 cos(x) - sin(x)].',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-7',
      q: 'Evaluate the definite integral: ∫ from 0 to 2 of (3x² + 2x) dx.',
      options: ['12', '10', '14', '8'],
      correct: 0,
      topic: 'Integration',
      explain: 'Antiderivative is [x³ + x²] from 0 to 2 = (2³ + 2²) - (0) = (8 + 4) = 12.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-8',
      q: 'What is the radius of the circle given by x² + y² - 6x + 8y = 0?',
      options: ['5', '25', '10', '√7'],
      correct: 0,
      topic: 'Conic Sections',
      explain: 'Rewrite: (x - 3)² + (y + 4)² = 9 + 16 = 25. Thus radius r = √25 = 5.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-9',
      q: 'If vectors A = 2i + 3j - k and B = i - j + 2k, what is their scalar dot product A · B?',
      options: ['-3', '3', '7', '1'],
      correct: 0,
      topic: 'Vectors in 3D Space',
      explain: 'Dot product A · B = (2)(1) + (3)(-1) + (-1)(2) = 2 - 3 - 2 = -3.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-10',
      q: 'What is the modulus of the complex number z = 3 - 4i?',
      options: ['5', '25', '7', '1'],
      correct: 0,
      topic: 'Complex Numbers',
      explain: '|z| = √(a² + b²) = √(3² + (-4)²) = √(9 + 16) = √25 = 5.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-11',
      q: 'In how many distinct ways can 5 books be arranged on a single shelf?',
      options: ['120', '60', '25', '24'],
      correct: 0,
      topic: 'Permutations and Combinations',
      explain: 'Number of arrangements = 5! = 5 x 4 x 3 x 2 x 1 = 120.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-12',
      q: 'What is the acute angle between lines y = x and y = -x?',
      options: ['90° (π/2)', '45°', '60°', '30°'],
      correct: 0,
      topic: 'Analytical Geometry',
      explain: 'Slopes m1 = 1 and m2 = -1. m1 * m2 = -1, which proves the lines are perpendicular (90° angle).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-13',
      q: 'What is the sum of the roots of 3x² - 12x + 7 = 0?',
      options: ['4', '-4', '7/3', '12'],
      correct: 0,
      topic: 'Quadratic Equations',
      explain: 'By Vieta’s formulas, sum of roots = -b / a = -(-12) / 3 = 4.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-14',
      q: 'Which trigonometric identity is equivalent to 1 + tan²(θ)?',
      options: ['sec²(θ)', 'cosec²(θ)', 'cot²(θ)', 'cos²(θ)'],
      correct: 0,
      topic: 'Trigonometry',
      explain: 'Fundamental Pythagorean identity: 1 + tan²(θ) = sec²(θ).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-15',
      q: 'What is the slope of the tangent line to y = x³ - 3x at x = 2?',
      options: ['9', '12', '6', '3'],
      correct: 0,
      topic: 'Differentiation',
      explain: 'dy/dx = 3x² - 3. At x = 2: dy/dx = 3(2)² - 3 = 12 - 3 = 9.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-16',
      q: 'Evaluate ∫ sin(2x) dx.',
      options: ['-1/2 cos(2x) + C', '1/2 cos(2x) + C', '-2 cos(2x) + C', '2 cos(2x) + C'],
      correct: 0,
      topic: 'Integration',
      explain: '∫ sin(kx) dx = -1/k cos(kx) + C. Here k = 2, so result is -1/2 cos(2x) + C.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-17',
      q: 'What is the value of C(7, 3)?',
      options: ['35', '210', '42', '21'],
      correct: 0,
      topic: 'Permutations and Combinations',
      explain: 'C(7, 3) = 7! / (3! * 4!) = (7 x 6 x 5) / (3 x 2 x 1) = 35.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-18',
      q: 'If two fair 6-sided dice are rolled simultaneously, what is the probability of rolling a sum of 7?',
      options: ['1/6', '1/12', '1/36', '7/36'],
      correct: 0,
      topic: 'Probability',
      explain: 'Favorable pairs for sum = 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6 outcomes. Total outcomes = 36. Probability = 6/36 = 1/6.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-19',
      q: 'What is the eccentricity of a parabola?',
      options: ['e = 1', 'e < 1', 'e > 1', 'e = 0'],
      correct: 0,
      topic: 'Conic Sections',
      explain: 'By definition, a parabola has an eccentricity e = 1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-20',
      q: 'What is the magnitude of vector A = 3i - 6j + 2k?',
      options: ['7', '49', '11', '√11'],
      correct: 0,
      topic: 'Vectors in 3D Space',
      explain: '|A| = √(3² + (-6)² + 2²) = √(9 + 36 + 4) = √49 = 7.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-21',
      q: 'What is the value of i^24 where i = √(-1)?',
      options: ['1', '-1', 'i', '-i'],
      correct: 0,
      topic: 'Complex Numbers',
      explain: 'Since 24 is a multiple of 4, i^24 = (i^4)^6 = 1^6 = 1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-22',
      q: 'What is the distance between parallel lines 3x + 4y = 10 and 3x + 4y = 25?',
      options: ['3 units', '5 units', '15 units', '1 unit'],
      correct: 0,
      topic: 'Analytical Geometry',
      explain: 'Distance d = |C2 - C1| / √(A² + B²) = |25 - 10| / √(3² + 4²) = 15 / 5 = 3 units.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-23',
      q: 'Evaluate lim (x -> ∞) [(3x² + 5x) / (2x² - 7)].',
      options: ['3/2', '∞', '0', '5/2'],
      correct: 0,
      topic: 'Limits and Continuity',
      explain: 'Dividing numerator and denominator by highest power x² yields (3 + 5/x) / (2 - 7/x²). As x -> ∞, limit = 3/2.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-24',
      q: 'Which term of Arithmetic Progression 5, 9, 13, 17, ... equals 81?',
      options: ['20th term', '19th term', '21st term', '25th term'],
      correct: 0,
      topic: 'Sequences and Series',
      explain: 'a = 5, d = 4. Formula: a_n = a + (n-1)d → 81 = 5 + (n-1)4 → 76 = 4(n-1) → n-1 = 19 → n = 20.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-25',
      q: 'What is the domain of f(x) = √(x - 4)?',
      options: ['x ≥ 4', 'x > 4', 'x ≤ 4', 'All real numbers'],
      correct: 0,
      topic: 'Functions and Graphs',
      explain: 'Radicand must be non-negative: x - 4 ≥ 0 → x ≥ 4.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-26',
      q: 'What is the value of log10(1000)?',
      options: ['3', '100', '10', '0.3'],
      correct: 0,
      topic: 'Logarithms',
      explain: 'Since 10³ = 1000, log10(1000) = 3.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-27',
      q: 'What is the angle between two orthogonal vectors A and B?',
      options: ['90° (π/2 radians)', '0°', '180°', '45°'],
      correct: 0,
      topic: 'Vectors in 3D Space',
      explain: 'Orthogonal vectors are mutually perpendicular, forming a 90° angle.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-28',
      q: 'What is the inverse of matrix A = [[2, 0], [0, 3]]?',
      options: ['[[1/2, 0], [0, 1/3]]', '[[3, 0], [0, 2]]', '[[-2, 0], [0, -3]]', '[[1/3, 0], [0, 1/2]]'],
      correct: 0,
      topic: 'Matrices and Determinants',
      explain: 'For a diagonal matrix, inverse elements are reciprocals of diagonal entries: 1/2 and 1/3.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-29',
      q: 'Evaluate ∫ x * e^x dx using integration by parts.',
      options: ['x e^x - e^x + C', 'x e^x + e^x + C', 'e^x + C', '1/2 x² e^x + C'],
      correct: 0,
      topic: 'Integration',
      explain: '∫ u dv = u v - ∫ v du. Let u = x, dv = e^x dx → du = dx, v = e^x. Result: x e^x - e^x + C.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-math-30',
      q: 'What is the maximum value of f(θ) = 3 sin(θ) + 4 cos(θ)?',
      options: ['5', '7', '1', '12'],
      correct: 0,
      topic: 'Trigonometry',
      explain: 'Maximum value of A sin(θ) + B cos(θ) is √(A² + B²) = √(3² + 4²) = √25 = 5.',
      difficulty: 'Exam Standard'
    }
  ],
  Physics: [
    {
      id: 'tcat-phy-1',
      q: 'A force of 50 N acts on an object at an angle of 60° to the horizontal, moving it 10 m along the horizontal. What is the work done?',
      options: ['250 Joules', '500 Joules', '433 Joules', '100 Joules'],
      correct: 0,
      topic: 'Work, Energy and Power',
      explain: 'W = F d cos(θ) = 50 N x 10 m x cos(60°) = 500 x 0.5 = 250 J.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-2',
      q: 'What is the escape velocity from Earth’s surface (g = 9.8 m/s², R = 6.4 x 10^6 m)?',
      options: ['11.2 km/s', '7.9 km/s', '9.8 km/s', '15.0 km/s'],
      correct: 0,
      topic: 'Circular Motion and Gravitation',
      explain: 'v_escape = √(2 g R) = √(2 x 9.8 x 6.4 x 10^6) ≈ 11.2 x 10^3 m/s = 11.2 km/s.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-3',
      q: 'According to Bernoulli’s principle for fluid flow, where fluid speed increases, what happens to internal fluid pressure?',
      options: ['Static pressure decreases', 'Static pressure increases', 'Pressure remains constant', 'Pressure doubles'],
      correct: 0,
      topic: 'Fluid Dynamics',
      explain: 'Bernoulli’s equation (P + 1/2 ρ v² + ρ g h = constant) states that an increase in fluid velocity produces a simultaneous drop in static pressure.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-4',
      q: 'What is the resonant frequency of an LC circuit with inductance L = 1 H and capacitance C = 1 μF?',
      options: ['159 Hz', '1000 Hz', '50 Hz', '318 Hz'],
      correct: 0,
      topic: 'Electromagnetic Induction',
      explain: 'f_r = 1 / (2π √(L C)) = 1 / (2π √(1 x 10^-6)) = 1000 / (2π) ≈ 159.15 Hz.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-5',
      q: 'In a Young’s double-slit experiment using light of wavelength 600 nm, if slit separation is 0.2 mm and screen distance is 1.0 m, what is the fringe width?',
      options: ['3.0 mm', '1.2 mm', '6.0 mm', '0.3 mm'],
      correct: 0,
      topic: 'Physical Optics',
      explain: 'β = λ D / d = (600 x 10^-9 m x 1.0 m) / (0.2 x 10^-3 m) = 3.0 x 10^-3 m = 3.0 mm.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-6',
      q: 'Which law states that total charge inside a closed surface equals ε0 times the electric flux passing through it?',
      options: ['Gauss’s Law', 'Coulomb’s Law', 'Ampere’s Law', 'Faraday’s Law'],
      correct: 0,
      topic: 'Electrostatics',
      explain: 'Gauss’s law: Total electric flux Φ = Q_enclosed / ε0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-7',
      q: 'What is the period of a simple pendulum of length L = 0.98 m at a place where g = 9.8 m/s²?',
      options: ['1.98 seconds (~2 seconds)', '1.0 second', '3.14 seconds', '0.5 seconds'],
      correct: 0,
      topic: 'Simple Harmonic Motion',
      explain: 'T = 2π √(L / g) = 2π √(0.98 / 9.8) = 2π √(0.1) ≈ 2 x 3.1416 x 0.3162 ≈ 1.98 s.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-8',
      q: 'What is the efficiency of a Carnot heat engine operating between 500 K and 300 K?',
      options: ['40%', '60%', '20%', '50%'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'η = 1 - (Tc / Th) = 1 - (300 / 500) = 1 - 0.6 = 0.4 = 40%.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-9',
      q: 'What is the velocity of sound in air at 0°C at standard atmospheric pressure?',
      options: ['332 m/s', '300 m/s', '340 m/s', '1500 m/s'],
      correct: 0,
      topic: 'Oscillations and Waves',
      explain: 'Laplace formula gives sound velocity in dry air at 0°C as approximately 332 m/s.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-10',
      q: 'What is the power of a convex lens with a focal length of +20 cm (+0.2 m)?',
      options: ['+5.0 Diopters', '+0.2 Diopters', '+2.0 Diopters', '+20 Diopters'],
      correct: 0,
      topic: 'Geometrical Optics',
      explain: 'Power P = 1 / f(in meters) = 1 / 0.2 m = +5.0 D.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-11',
      q: 'Which component stores energy in its magnetic field when an electric current flows through it?',
      options: ['Inductor', 'Capacitor', 'Resistor', 'Transformer'],
      correct: 0,
      topic: 'Current Electricity',
      explain: 'Inductors store energy in magnetic field U = 1/2 L I².',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-12',
      q: 'What is the moment of inertia of a uniform solid cylinder of mass M and radius R about its longitudinal central axis?',
      options: ['1/2 M R²', 'M R²', '2/5 M R²', '1/12 M R²'],
      correct: 0,
      topic: 'Rotational Motion',
      explain: 'Moment of inertia of solid cylinder/disk about central axis is I = 1/2 M R².',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-13',
      q: 'What is the terminal velocity reached by a spherical raindrop falling through air when viscous drag balances gravitational force?',
      options: ['v_t = (2 r² g (ρ - σ)) / (9 η)', 'v_t = r g / η', 'v_t = 6 π η r', 'v_t = m g / r'],
      correct: 0,
      topic: 'Fluid Dynamics',
      explain: 'By Stokes law balancing viscous drag (6πηrv) + buoyancy with gravity, terminal velocity v_t = 2 r² g (ρ - σ) / (9 η).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-14',
      q: 'Which logic gate output is LOW (0) ONLY when both inputs are HIGH (1)?',
      options: ['NAND Gate', 'NOR Gate', 'AND Gate', 'XOR Gate'],
      correct: 0,
      topic: 'Electronics',
      explain: 'A NAND gate is an inverted AND gate; output is 0 only when inputs A=1 and B=1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-15',
      q: 'What is the wavelength of light with frequency 5 x 10^14 Hz in vacuum?',
      options: ['600 nm', '500 nm', '400 nm', '700 nm'],
      correct: 0,
      topic: 'Physical Optics',
      explain: 'λ = c / f = (3 x 10^8 m/s) / (5 x 10^14 Hz) = 6 x 10^-7 m = 600 nm.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-16',
      q: 'What is the force between two parallel wires carrying currents I1 and I2 in same direction at distance d?',
      options: ['Attractive force', 'Repulsive force', 'Zero force', 'Torque without force'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'Parallel currents in same direction produce magnetic forces that attract each other (Ampere force).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-17',
      q: 'What is the charge stored in a 10 μF capacitor connected across a 12 V DC power source?',
      options: ['120 μC', '1.2 C', '12 μC', '1200 C'],
      correct: 0,
      topic: 'Electrostatics',
      explain: 'Q = C V = (10 x 10^-6 F) x 12 V = 120 x 10^-6 C = 120 μC.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-18',
      q: 'Which law relates angle of incidence to angle of refraction across a medium interface?',
      options: ['Snell’s Law', 'Brewster’s Law', 'Malus’ Law', 'Bragg’s Law'],
      correct: 0,
      topic: 'Geometrical Optics',
      explain: 'Snell’s law: n1 sin(θ1) = n2 sin(θ2).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-19',
      q: 'What is the angular speed of the second hand of an analog clock?',
      options: ['π / 30 rad/s', 'π / 60 rad/s', '2π rad/s', 'π rad/s'],
      correct: 0,
      topic: 'Rotational Motion',
      explain: 'Second hand completes 2π radians in 60 seconds: ω = 2π / 60 = π / 30 rad/s.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-20',
      q: 'What is the magnetic field inside a long ideal solenoid carrying current I with n turns per unit length?',
      options: ['B = μ0 n I', 'B = μ0 I / (2π r)', 'B = zero', 'B = μ0 N I'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'By Ampere’s law, uniform interior field of long solenoid is B = μ0 n I.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-21',
      q: 'What is the dimensional formula of universal gravitational constant G?',
      options: ['[M^-1 L^3 T^-2]', '[M L T^-2]', '[M L^2 T^-2]', '[M^-1 L^2 T^-1]'],
      correct: 0,
      topic: 'Measurements',
      explain: 'F = G m1 m2 / r² → G = F r² / (m1 m2) = [M L T^-2][L²] / [M²] = [M^-1 L^3 T^-2].',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-22',
      q: 'What is the change in internal energy during an isothermal expansion of an ideal gas?',
      options: ['Zero (ΔU = 0)', 'Positive', 'Negative', 'Equal to heat added'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'For an ideal gas, internal energy depends solely on temperature U = f(T). In isothermal process, ΔT = 0, so ΔU = 0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-23',
      q: 'Which law describes heat generated in a conductor carrying current I for time t?',
      options: ['Joule’s Law of Heating (H = I² R t)', 'Ohm’s Law', 'Seebeck Effect', 'Peltier Effect'],
      correct: 0,
      topic: 'Current Electricity',
      explain: 'Joule heating energy H = I² R t.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-24',
      q: 'What is the energy of a photon of ultraviolet light of frequency 10^15 Hz (h = 6.63 x 10^-34 J·s)?',
      options: ['6.63 x 10^-19 Joules', '6.63 x 10^-49 Joules', '1.6 x 10^-19 Joules', '3.0 x 10^-8 Joules'],
      correct: 0,
      topic: 'Modern Physics',
      explain: 'E = h f = (6.63 x 10^-34 J·s) x (10^15 Hz) = 6.63 x 10^-19 J.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-25',
      q: 'Which property of sound wave determines its musical pitch?',
      options: ['Frequency', 'Amplitude', 'Speed', 'Waveform'],
      correct: 0,
      topic: 'Oscillations and Waves',
      explain: 'Pitch is the subjective perception of sound wave frequency.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-26',
      q: 'What is the maximum torque on a current loop of area A carrying current I in magnetic field B?',
      options: ['τ = N I A B', 'τ = zero', 'τ = N I B / A', 'τ = I A / B'],
      correct: 0,
      topic: 'Electromagnetism',
      explain: 'Torque τ = N I A B sin(θ). Maximum torque occurs when plane of loop is parallel to field (θ = 90°), giving τ = N I A B.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-27',
      q: 'What is the root mean square speed of gas molecules proportional to?',
      options: ['√T (Square root of absolute temperature)', 'T', 'T²', '1 / T'],
      correct: 0,
      topic: 'Thermodynamics',
      explain: 'Kinetic theory gives v_rms = √(3 R T / M) ∝ √T.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-28',
      q: 'What happens to total capacitance when two capacitors C1 and C2 are connected in series?',
      options: ['1/C_total = 1/C1 + 1/C2', 'C_total = C1 + C2', 'C_total = C1 C2', 'C_total = C1 - C2'],
      correct: 0,
      topic: 'Electrostatics',
      explain: 'In series connection, reciprocals of capacitance sum up: 1/C = 1/C1 + 1/C2.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-29',
      q: 'What is the critical angle for total internal reflection from glass (n = 1.5) to air (n = 1.0)?',
      options: ['41.8°', '30.0°', '45.0°', '60.0°'],
      correct: 0,
      topic: 'Geometrical Optics',
      explain: 'sin(θc) = n2 / n1 = 1.0 / 1.5 = 0.6667 → θc = arcsin(0.6667) ≈ 41.8°.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-phy-30',
      q: 'What is the stopping potential in photoelectric effect directly proportional to?',
      options: ['Frequency of incident light minus threshold frequency', 'Intensity of incident light', 'Distance from light source', 'Surface area of target cathode'],
      correct: 0,
      topic: 'Modern Physics',
      explain: 'e V0 = h (f - f0) → Stopping potential V0 is linearly proportional to frequency above threshold.',
      difficulty: 'Exam Standard'
    }
  ],
  Chemistry: [
    {
      id: 'tcat-chem-1',
      q: 'What volume of 0.5 M NaOH is required to completely neutralize 25 mL of 1.0 M H2SO4 solution?',
      options: ['100 mL', '50 mL', '25 mL', '200 mL'],
      correct: 0,
      topic: 'Stoichiometry',
      explain: 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O. Equivalents: M1 V1 n1 = M2 V2 n2 → (1.0)(25)(2) = (0.5)(V2)(1) → 50 = 0.5 V2 → V2 = 100 mL.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-2',
      q: 'What is the oxidation number of manganese in potassium permanganate (KMnO4)?',
      options: ['+7', '+6', '+4', '+2'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'K(+1) + Mn + 4 x O(-2) = 0 → 1 + Mn - 8 = 0 → Mn = +7.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-3',
      q: 'Which gas law describes the relationship between pressure and temperature of a gas at constant volume?',
      options: ['Gay-Lussac’s Law (P ∝ T)', 'Boyle’s Law', 'Charles’s Law', 'Graham’s Law'],
      correct: 0,
      topic: 'Gas Laws',
      explain: 'Gay-Lussac’s law states that at constant volume, pressure of a given gas mass is directly proportional to absolute temperature.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-4',
      q: 'What is the bond angle in a tetrahedral methane (CH4) molecule?',
      options: ['109.5°', '120°', '180°', '90°'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: 'Methane has sp3 hybridized carbon with 4 equivalent bonding pairs, yielding a regular tetrahedral geometry with 109.5° bond angles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-5',
      q: 'According to Le Chatelier’s principle, what happens to the equilibrium 2SO2(g) + O2(g) ⇌ 2SO3(g) if pressure is increased?',
      options: ['Equilibrium shifts to the right (towards SO3 formation)', 'Equilibrium shifts to the left', 'No change in equilibrium', 'Kc increases'],
      correct: 0,
      topic: 'Chemical Equilibrium',
      explain: 'Increasing pressure shifts equilibrium toward fewer gas moles (3 moles reactant -> 2 moles product, right shift).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-6',
      q: 'Which organic reaction converts benzene to nitrobenzene using concentrated HNO3 and H2SO4?',
      options: ['Electrophilic aromatic substitution', 'Electrophilic addition', 'Nucleophilic substitution', 'Free radical substitution'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'Nitration of benzene replaces a ring hydrogen with NO2+ via electrophilic aromatic substitution.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-7',
      q: 'What is the pH of a 0.01 M solution of strong base NaOH?',
      options: ['12.0', '2.0', '7.0', '14.0'],
      correct: 0,
      topic: 'Acids and Bases',
      explain: '[OH-] = 0.01 M = 10^-2 M → pOH = -log10(10^-2) = 2.0. pH = 14 - pOH = 14 - 2 = 12.0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-8',
      q: 'Which element has the electron configuration [Ar] 3d5 4s1 in its ground state?',
      options: ['Chromium (Cr, Z=24)', 'Copper (Cu, Z=29)', 'Manganese (Mn, Z=25)', 'Iron (Fe, Z=26)'],
      correct: 0,
      topic: 'Atomic Structure',
      explain: 'Chromium (Z=24) exhibits exceptional half-filled d-subshell stability with configuration [Ar] 3d5 4s1.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-9',
      q: 'What product is obtained from the hydration of ethyne (acetylene) in the presence of HgSO4 and dilute H2SO4?',
      options: ['Acetaldehyde (Ethanal)', 'Ethanol', 'Acetic acid', 'Acetone'],
      correct: 0,
      topic: 'Hydrocarbons',
      explain: 'Hydration of ethyne forms vinyl alcohol intermediate, which tautomerizes to acetaldehyde (CH3CHO).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-10',
      q: 'Which catalyst is used in the industrial Haber-Bosch process for ammonia synthesis?',
      options: ['Finely divided Iron with Al2O3/K2O promoter', 'Vanadium pentoxide', 'Platinum gauze', 'Nickel'],
      correct: 0,
      topic: 'Chemical Equilibrium and Industry',
      explain: 'Haber process synthesizes NH3 from N2 and H2 using iron catalyst promoted with alumina and potassium oxide at 450°C and 200 atm.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-11',
      q: 'What is the formal oxidation state of carbon in formaldehyde (HCHO)?',
      options: ['0', '+2', '-2', '+4'],
      correct: 0,
      topic: 'Carbonyl Compounds',
      explain: 'H (+1 x 2 = +2), O (-2). For neutrality: C + 2 - 2 = 0 → C = 0.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-12',
      q: 'Which functional group test produces a red precipitate of Cu2O with Fehling’s solution?',
      options: ['Aliphatic Aldehydes', 'Aromatic Aldehydes', 'Ketones', 'Esters'],
      correct: 0,
      topic: 'Carbonyl Compounds',
      explain: 'Aliphatic aldehydes reduce Cu2+ ions in Fehling’s reagent to brick-red insoluble Cu2O precipitate.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-13',
      q: 'What is the coordination number and geometry of platinum in [Pt(NH3)2Cl2] (cisplatin)?',
      options: ['4, Square Planar', '6, Octahedral', '4, Tetrahedral', '2, Linear'],
      correct: 0,
      topic: 'Transition Elements',
      explain: 'Pt(II) d8 complexes adopt a 4-coordinate square planar geometry.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-14',
      q: 'Which law states that energy change in a chemical reaction is independent of path taken or intermediate steps?',
      options: ['Hess’s Law of Constant Heat Summation', 'First Law of Thermodynamics', 'Third Law of Thermodynamics', 'Kirchhoff’s Law'],
      correct: 0,
      topic: 'Thermochemistry',
      explain: 'Hess’s law is a consequence of enthalpy being a state function: ΔH_total = ΔH1 + ΔH2 + ...',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-15',
      q: 'What type of crystal lattice structure does sodium chloride (NaCl) exhibit?',
      options: ['Face-Centered Cubic (FCC)', 'Body-Centered Cubic (BCC)', 'Simple Cubic', 'Hexagonal Close-Packed'],
      correct: 0,
      topic: 'States of Matter (Solids)',
      explain: 'NaCl forms an FCC lattice of Cl- ions with Na+ occupying all octahedral interstitial sites.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-16',
      q: 'Which intermolecular force is strongest in liquid water (H2O)?',
      options: ['Hydrogen bonding', 'London dispersion forces', 'Dipole-induced dipole', 'Ion-dipole'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: 'Water molecules form dense hydrogen bonding networks between O-H dipoles.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-17',
      q: 'What is the major product when 2-bromobutane is heated with alcoholic KOH?',
      options: ['2-butene (Saytzeff product)', '1-butene', '2-butanol', '1-butanol'],
      correct: 0,
      topic: 'Alkyl Halides',
      explain: 'E2 elimination follows Saytzeff rule, yielding the more substituted, thermodynamic alkene (2-butene).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-18',
      q: 'What is the standard reduction potential of Standard Hydrogen Electrode (SHE) defined as?',
      options: ['0.00 Volts', '1.00 Volt', '-0.76 Volts', '+0.34 Volts'],
      correct: 0,
      topic: 'Electrochemistry',
      explain: 'The potential of SHE (2H+ + 2e- <-> H2) at 298 K, 1 atm, 1 M H+ is arbitrarily defined as 0.00 V.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-19',
      q: 'Which element exhibits the highest second ionization energy?',
      options: ['Sodium (Na)', 'Magnesium (Mg)', 'Aluminum (Al)', 'Silicon (Si)'],
      correct: 0,
      topic: 'Periodic Properties',
      explain: 'Sodium (Na) loses 1 electron to reach stable noble gas core [Ne]. Removing 2nd electron requires breaking noble gas core, giving huge 2nd IE.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-20',
      q: 'What is the rate equation for a reaction A + B -> Products if rate quadruples when [A] doubles and [B] remains constant?',
      options: ['Rate = k [A]²', 'Rate = k [A] [B]', 'Rate = k [A]', 'Rate = k [A]² [B]'],
      correct: 0,
      topic: 'Reaction Kinetics',
      explain: 'Rate ∝ [A]^n. 4 = 2^n → n = 2. Reaction is second order with respect to A.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-21',
      q: 'Which isomerism is present in glucose and fructose?',
      options: ['Functional group isomerism', 'Chain isomerism', 'Position isomerism', 'Geometrical isomerism'],
      correct: 0,
      topic: 'Macromolecules',
      explain: 'Both have molecular formula C6H12O6; glucose is an aldohexose while fructose is a ketohexose.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-22',
      q: 'What is the bond order of oxygen molecule (O2) according to Molecular Orbital Theory?',
      options: ['2', '1', '3', '1.5'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: 'O2 has 10 bonding electrons and 6 antibonding electrons: Bond Order = (10 - 6) / 2 = 2.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-23',
      q: 'Which gas is responsible for depletion of stratospheric ozone layer via free radical chain reactions?',
      options: ['Chlorofluorocarbons (CFCs)', 'Carbon dioxide', 'Methane', 'Sulfur dioxide'],
      correct: 0,
      topic: 'Environmental Chemistry',
      explain: 'UV radiation breaks CFCs to yield Chlorine free radicals (Cl·) that catalytically destroy O3 molecules.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-24',
      q: 'What is the percentage of nitrogen by mass in urea, CO(NH2)2 (Molar mass = 60 g/mol)?',
      options: ['46.6%', '28.0%', '33.3%', '14.0%'],
      correct: 0,
      topic: 'Stoichiometry',
      explain: 'Urea contains 2 Nitrogens (2 x 14 = 28 g/mol). Mass % = (28 / 60) x 100 = 46.67%.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-25',
      q: 'Which salt solution turns blue litmus paper red due to cationic hydrolysis?',
      options: ['NH4Cl', 'NaCl', 'Na2CO3', 'CH3COONa'],
      correct: 0,
      topic: 'Acids and Bases',
      explain: 'NH4Cl is formed from weak base NH3 and strong acid HCl. NH4+ hydrolyzes yielding H3O+, making solution acidic (pH < 7).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-26',
      q: 'What product is formed when primary alcohol is oxidized using excess K2Cr2O7 in dilute H2SO4 under reflux?',
      options: ['Carboxylic Acid', 'Aldehyde', 'Ketone', 'Ester'],
      correct: 0,
      topic: 'Alcohols and Phenols',
      explain: 'Refluxing primary alcohol with strong oxidizing agent K2Cr2O7/H2SO4 fully oxidizes it to carboxylic acid.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-27',
      q: 'What is the hybridization of carbon atom in hydrogen cyanide (H-C≡N)?',
      options: ['sp', 'sp2', 'sp3', 'dsp2'],
      correct: 0,
      topic: 'Chemical Bonding',
      explain: 'Carbon forms 1 single bond to H and 1 triple bond (1 sigma + 2 pi) to N, requiring sp hybridization in linear geometry.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-28',
      q: 'Which element is liquid at room temperature (25°C)?',
      options: ['Bromine (Br2)', 'Chlorine (Cl2)', 'Iodine (I2)', 'Fluorine (F2)'],
      correct: 0,
      topic: 'Periodic Table',
      explain: 'Bromine is a dark red liquid non-metal at standard room temperature and pressure.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-29',
      q: 'What is the osmotic pressure (π) formula for a dilute solution of non-electrolyte solute?',
      options: ['π = C R T', 'π = C R / T', 'π = P V', 'π = K_b m'],
      correct: 0,
      topic: 'Solutions',
      explain: 'van \'t Hoff equation for osmotic pressure is π = C R T = (n/V) R T.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-chem-30',
      q: 'Which indicator is suitable for titration between strong acid HCl and weak base NH4OH?',
      options: ['Methyl orange (pH range 3.1 - 4.4)', 'Phenolphthalein', 'Litmus', 'Universal indicator'],
      correct: 0,
      topic: 'Acids and Bases',
      explain: 'Titration of strong acid and weak base reaches equivalence point in acidic range (pH ~ 4-5), where methyl orange changes color.',
      difficulty: 'Exam Standard'
    }
  ],
  English: [
    {
      id: 'tcat-eng-1',
      q: 'Select the synonym for the word "PRAGMATIC":',
      options: ['Practical', 'Idealistic', 'Theoretical', 'Irrational'],
      correct: 0,
      topic: 'Vocabulary',
      explain: '"Pragmatic" means dealing with things sensibly and realistically based on practical considerations.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-2',
      q: 'Identify the grammatically correct sentence:',
      options: [
        'Each of the engineering candidates is required to submit their credentials.',
        'Each of the engineering candidates are required to submit their credentials.',
        'Each of the engineering candidates were required to submit their credentials.',
        'Each of the engineering candidates have been required to submit their credentials.'
      ],
      correct: 0,
      topic: 'Grammar',
      explain: '"Each" is an indefinite singular pronoun requiring a singular verb form ("is required").',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-3',
      q: 'Choose the correct word to complete the analogy: ENGINE is to CAR as HEART is to ______.',
      options: ['HUMAN BODY', 'BLOOD', 'PULSE', 'VEIN'],
      correct: 0,
      topic: 'Analogies',
      explain: 'An engine is the primary power-generating organ/source for a car, just as the heart is the central organ powering the human body.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-4',
      q: 'Select the correct passive form: "The chief engineer will inspect the bridge tomorrow."',
      options: [
        'The bridge will be inspected by the chief engineer tomorrow.',
        'The bridge would be inspected by the chief engineer tomorrow.',
        'The bridge is inspected by the chief engineer tomorrow.',
        'The bridge was inspected by the chief engineer tomorrow.'
      ],
      correct: 0,
      topic: 'Active and Passive Voice',
      explain: 'Simple future active ("will inspect") converts to simple future passive ("will be inspected").',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-5',
      q: 'Choose the correct antonym of "AMBIGUOUS":',
      options: ['Clear and explicit', 'Vague', 'Obscure', 'Dubious'],
      correct: 0,
      topic: 'Vocabulary',
      explain: '"Ambiguous" means open to more than one interpretation; its antonym is clear or explicit.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-6',
      q: 'Fill in the blank with the appropriate preposition: "The software algorithm complies _____ international safety standards."',
      options: ['with', 'to', 'for', 'at'],
      correct: 0,
      topic: 'Prepositions',
      explain: 'The verb "comply" takes the fixed preposition "with" (comply with standards).',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-7',
      q: 'Identify the error in the sentence: "Hardly had the test started when the power went out."',
      options: [
        'No error - the sentence is grammatically correct.',
        'Change "when" to "than".',
        'Change "had" to "has".',
        'Remove "Hardly".'
      ],
      correct: 0,
      topic: 'Grammar',
      explain: '"Hardly... when" is the correct inverted conjunction pair. The sentence is completely correct.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-8',
      q: 'Choose the word that best completes the sentence: "The panel reached a _____ decision after hours of deliberation."',
      options: ['unanimous', 'anonymous', 'ambivalent', 'unilateral'],
      correct: 0,
      topic: 'Sentence Completion',
      explain: '"Unanimous" means fully agreed upon by all members of a group.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-9',
      q: 'Select the correctly reported speech: She said, "I have completed the circuit diagram."',
      options: [
        'She said that she had completed the circuit diagram.',
        'She said that she has completed the circuit diagram.',
        'She said that I completed the circuit diagram.',
        'She told she completes the circuit diagram.'
      ],
      correct: 0,
      topic: 'Direct and Indirect Speech',
      explain: 'Present perfect ("have completed") in direct speech backshifts to past perfect ("had completed") in indirect speech.',
      difficulty: 'Exam Standard'
    },
    {
      id: 'tcat-eng-10',
      q: 'Choose the word with correct spelling:',
      options: ['Maintenance', 'Maintainance', 'Maintenence', 'Mentenance'],
      correct: 0,
      topic: 'Spelling',
      explain: '"Maintenance" is the correct spelling (derived from maintain, but spelled m-a-i-n-t-e-n-a-n-c-e).',
      difficulty: 'Exam Standard'
    }
  ]
};

export function getTCATPrebuiltQuestions(subject: string, count: number = 10): Question[] {
  const normSub = Object.keys(TCAT_PREBUILT_QUESTIONS).find(
    (k) => k.toLowerCase() === subject.toLowerCase()
  ) || 'Mathematics';

  const pool = TCAT_PREBUILT_QUESTIONS[normSub] || TCAT_PREBUILT_QUESTIONS['Mathematics'];
  const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
  const results: Question[] = [];

  for (let i = 0; i < count; i++) {
    const raw = shuffledPool[i % shuffledPool.length];
    const itemWithShuffledOptions = shuffleOptionsAndFixCorrect(raw);
    results.push({
      ...itemWithShuffledOptions,
      id: `tcat-q-${normSub}-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });
  }

  return results;
}

export function generateTCATFullMockBank(groupSubjects: string[] = ['Mathematics', 'Physics', 'Chemistry', 'English']): Question[] {
  // 100 MCQs total: 30 Math, 30 Phys, 30 Chem, 10 Eng
  const sub1 = groupSubjects[0] || 'Mathematics';
  const sub2 = groupSubjects[1] || 'Physics';
  const sub3 = groupSubjects[2] || 'Chemistry';
  const sub4 = 'English';

  const seenStems = new Set<string>();

  function selectUnique(subjectKey: string, targetCount: number): Question[] {
    const pool = TCAT_PREBUILT_QUESTIONS[subjectKey] || TCAT_PREBUILT_QUESTIONS['Mathematics'] || [];
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
          id: `tcat-mock-${subjectKey.toLowerCase()}-${selected.length + 1}-${Date.now()}`
        });
      }
    }

    let loopIndex = 0;
    while (selected.length < targetCount && pool.length > 0) {
      const base = pool[loopIndex % pool.length];
      const fixed = shuffleOptionsAndFixCorrect(base);
      selected.push({
        ...fixed,
        id: `tcat-mock-${subjectKey.toLowerCase()}-topup-${selected.length + 1}-${Date.now()}`
      });
      loopIndex++;
    }

    return selected;
  }

  const q1 = selectUnique(sub1, 30);
  const q2 = selectUnique(sub2, 30);
  const q3 = selectUnique(sub3, 30);
  const q4 = selectUnique(sub4, 10);

  return [...q1, ...q2, ...q3, ...q4];
}
