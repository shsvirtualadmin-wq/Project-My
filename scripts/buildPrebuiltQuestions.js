import fs from 'fs';
import path from 'path';

// Let's create a script that generates src/data/prebuiltQuestions.ts cleanly

const physicsQuestions = [
  {
    id: "phy-1",
    q: "A body moving in a circle at constant speed has:",
    options: ["Zero acceleration", "Constant velocity", "Centripetal acceleration", "Constant momentum"],
    correct: 2,
    topic: "Circular Motion & Gravitation",
    explain: "Even at constant speed, the direction of velocity continuously changes toward the center, producing centripetal acceleration."
  },
  {
    id: "phy-2",
    q: "The SI unit of electric resistance is:",
    options: ["Ampere", "Ohm", "Volt", "Watt"],
    correct: 1,
    topic: "Current Electricity & Ohm's Law",
    explain: "Resistance is measured in Ohms (Ω), defined by R = V / I according to Ohm's law."
  },
  {
    id: "phy-3",
    q: "Which wave requires a physical medium to travel?",
    options: ["Light wave", "Radio wave", "Sound wave", "X-ray"],
    correct: 2,
    topic: "Waves & Sound",
    explain: "Sound is a mechanical wave and requires a physical medium (solid, liquid, or gas) to propagate."
  },
  {
    id: "phy-4",
    q: "Work done is zero when the angle between force and displacement is:",
    options: ["0°", "45°", "90°", "180°"],
    correct: 2,
    topic: "Work, Power & Energy",
    explain: "Work W = F · d · cos(θ). At θ = 90°, cos(90°) = 0, so work done is zero."
  },
  {
    id: "phy-5",
    q: "The phenomenon of bending of light around sharp edges or obstacles is called:",
    options: ["Reflection", "Refraction", "Diffraction", "Dispersion"],
    correct: 2,
    topic: "Physical Optics",
    explain: "Diffraction is the bending and spreading of waves around obstacles or through narrow apertures."
  },
  {
    id: "phy-6",
    q: "Two point charges +2 μC and +6 μC repel each other with a force of 12 N. If -4 μC is added to each, the new force will be:",
    options: ["12 N repulsive", "4 N attractive", "4 N repulsive", "0 N"],
    correct: 1,
    topic: "Electrostatics & Coulomb's Law",
    explain: "New charges become (+2 - 4) = -2 μC and (+6 - 4) = +2 μC. The charges have opposite signs, resulting in an attractive force of 4 N."
  },
  {
    id: "phy-7",
    q: "The half-life of a radioactive element is 10 days. What fraction of the original sample remains after 30 days?",
    options: ["1/2", "1/4", "1/8", "1/16"],
    correct: 2,
    topic: "Nuclear Physics & Radioactivity",
    explain: "30 days represents 3 half-lives (30 / 10 = 3). The remaining fraction is (1/2)^3 = 1/8."
  },
  {
    id: "phy-8",
    q: "In an AC circuit containing pure capacitance, the alternating current:",
    options: ["Lags voltage by 90°", "Leads voltage by 90°", "Is in phase with voltage", "Lags voltage by 180°"],
    correct: 1,
    topic: "Alternating Current",
    explain: "In a purely capacitive AC circuit, the current leads the voltage by a phase angle of 90° (π/2 radians)."
  },
  {
    id: "phy-9",
    q: "According to Newton's second law of motion, force is equal to the rate of change of:",
    options: ["Velocity", "Kinetic energy", "Linear momentum", "Displacement"],
    correct: 2,
    topic: "Dynamics & Force",
    explain: "Newton's 2nd Law states F = dp/dt, meaning force is the rate of change of linear momentum."
  },
  {
    id: "phy-10",
    q: "The escape velocity from the surface of the Earth depends on:",
    options: ["Mass of the projecting body", "Mass and radius of the Earth", "Angle of projection", "Density of the body"],
    correct: 1,
    topic: "Gravitation & Satellite Motion",
    explain: "Escape velocity v_e = √(2 G M_E / R_E), which depends on Earth's mass and radius, independent of the object's mass."
  },
  {
    id: "phy-11",
    q: "In simple harmonic motion (SHM), the acceleration of the particle is maximum at:",
    options: ["Mean position", "Extreme positions", "Midway between mean and extreme", "Nowhere, it is constant"],
    correct: 1,
    topic: "Oscillations & SHM",
    explain: "Acceleration a = -ω² x. Displacement x is maximum at the extreme positions, so acceleration is maximum at extreme positions."
  },
  {
    id: "phy-12",
    q: "Which law states that the total electric flux through a closed surface is equal to 1/ε₀ times the total enclosed charge?",
    options: ["Ampere's Law", "Faraday's Law", "Gauss's Law", "Lenz's Law"],
    correct: 2,
    topic: "Electrostatics",
    explain: "Gauss's Law states Φ_e = q_enclosed / ε₀ for any closed surface."
  },
  {
    id: "phy-13",
    q: "The dimension of Planck's constant (h) is the same as the dimension of:",
    options: ["Linear momentum", "Angular momentum", "Energy", "Force"],
    correct: 1,
    topic: "Measurements & Dimensions",
    explain: "Units of Planck's constant are J·s (N·m·s = kg·m²/s), which matches the dimension of angular momentum (L = m v r = kg·m²/s)."
  },
  {
    id: "phy-14",
    q: "The efficiency of a Carnot engine working between temperatures T1 (hot) and T2 (cold) in Kelvin is given by:",
    options: ["1 - T2/T1", "1 - T1/T2", "T2 / T1", "(T1 + T2) / T1"],
    correct: 0,
    topic: "Thermodynamics",
    explain: "Carnot efficiency η = (T1 - T2) / T1 = 1 - T2/T1 where T1 and T2 are absolute temperatures in Kelvin."
  },
  {
    id: "phy-15",
    q: "Which electromagnetic wave has the highest frequency?",
    options: ["Radio waves", "Microwaves", "X-rays", "Gamma rays"],
    correct: 3,
    topic: "Electromagnetic Spectrum",
    explain: "Gamma rays have the shortest wavelength and highest frequency in the electromagnetic spectrum."
  },
  {
    id: "phy-16",
    q: "The work-energy theorem states that the net work done on an object equals its change in:",
    options: ["Potential energy", "Kinetic energy", "Total mechanical energy", "Momentum"],
    correct: 1,
    topic: "Work, Power & Energy",
    explain: "W_net = ΔK = K_final - K_initial."
  },
  {
    id: "phy-17",
    q: "A concave lens always forms a image that is:",
    options: ["Real, inverted, and magnified", "Virtual, erect, and diminished", "Real, erect, and magnified", "Virtual, inverted, and enlarged"],
    correct: 1,
    topic: "Geometrical Optics",
    explain: "A diverging (concave) lens always forms a virtual, erect, and diminished image for real objects."
  },
  {
    id: "phy-18",
    q: "The SI unit of magnetic flux density (magnetic field B) is:",
    options: ["Weber", "Tesla", "Henry", "Gauss"],
    correct: 1,
    topic: "Electromagnetism",
    explain: "Magnetic field intensity B is measured in Tesla (T) or Wb/m²."
  },
  {
    id: "phy-19",
    q: "In a P-N junction diode, the depletion region consists of:",
    options: ["Free electrons only", "Holes only", "Immobile positive and negative ions", "Both free electrons and holes"],
    correct: 2,
    topic: "Electronics & Semiconductors",
    explain: "The depletion region is depleted of mobile charge carriers and contains fixed immobile donor/acceptor ions."
  },
  {
    id: "phy-20",
    q: "Which effect proves the particle nature of light?",
    options: ["Interference", "Diffraction", "Polarization", "Photoelectric Effect"],
    correct: 3,
    topic: "Dawn of Modern Physics",
    explain: "Einstein's photoelectric effect explanation proved light behaves as discrete energy packets called photons."
  },
  {
    id: "phy-21",
    q: "The slope of a velocity-time graph represents:",
    options: ["Displacement", "Acceleration", "Force", "Work"],
    correct: 1,
    topic: "Kinematics",
    explain: "Acceleration is defined as dv/dt, which is the slope of the velocity vs time curve."
  },
  {
    id: "phy-22",
    q: "Two resistors of 6 Ω and 3 Ω are connected in parallel. Their equivalent resistance is:",
    options: ["9 Ω", "4.5 Ω", "2 Ω", "18 Ω"],
    correct: 2,
    topic: "Current Electricity",
    explain: "1/R_eq = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2, so R_eq = 2 Ω."
  },
  {
    id: "phy-23",
    q: "What type of transformer increases the voltage in a secondary coil?",
    options: ["Step-down transformer", "Step-up transformer", "Autotransformer", "Isolating transformer"],
    correct: 1,
    topic: "Electromagnetic Induction",
    explain: "A step-up transformer has more secondary turns than primary turns (N_s > N_p), increasing secondary output voltage."
  },
  {
    id: "phy-24",
    q: "Lenz's law is a consequence of the law of conservation of:",
    options: ["Charge", "Momentum", "Energy", "Mass"],
    correct: 2,
    topic: "Electromagnetic Induction",
    explain: "Lenz's law ensures mechanical work done against induced magnetic opposition converts into electrical energy, satisfying conservation of energy."
  },
  {
    id: "phy-25",
    q: "A projectile reaches its maximum height when its vertical velocity component becomes:",
    options: ["Maximum", "Zero", "Equal to horizontal velocity", "Negative"],
    correct: 1,
    topic: "2D Kinematics & Projectiles",
    explain: "At the peak trajectory point, vertical motion momentarily stops (v_y = 0), while horizontal velocity v_x remains constant."
  },
  {
    id: "phy-26",
    q: "Which property of light remains unchanged when it enters from air into glass?",
    options: ["Velocity", "Wavelength", "Frequency", "Amplitude"],
    correct: 2,
    topic: "Wave Optics & Refraction",
    explain: "Frequency depends strictly on the source of light and remains constant across dielectric media boundaries."
  },
  {
    id: "phy-27",
    q: "The maximum force experienced by a current-carrying conductor in a magnetic field occurs when the angle between conductor and field is:",
    options: ["0°", "45°", "90°", "180°"],
    correct: 2,
    topic: "Electromagnetism",
    explain: "Magnetic force F = I L B sin(θ). sin(90°) = 1 (maximum)."
  },
  {
    id: "phy-28",
    q: "The de Broglie wavelength λ associated with a particle of mass m moving with velocity v is:",
    options: ["λ = h / (m v)", "λ = h m v", "λ = m v / h", "λ = h / (m v²)"],
    correct: 0,
    topic: "Modern Physics & Quantum Theory",
    explain: "de Broglie relation gives λ = h / p = h / (m v)."
  },
  {
    id: "phy-29",
    q: "Which thermodynamic process takes place at constant volume?",
    options: ["Isothermal", "Isobaric", "Isochoric", "Adiabatic"],
    correct: 2,
    topic: "Thermodynamics",
    explain: "An isochoric (or isovolumetric) process occurs at constant volume (ΔV = 0, work W = 0)."
  },
  {
    id: "phy-30",
    q: "What is the unit of electric capacitance?",
    options: ["Coulomb", "Volt", "Farad", "Henry"],
    correct: 2,
    topic: "Electrostatics & Capacitors",
    explain: "Capacitance C = Q / V is measured in Farads (F)."
  },
  {
    id: "phy-31",
    q: "Moment of inertia depends on:",
    options: ["Mass of body only", "Distribution of mass relative to axis of rotation", "Angular velocity only", "Torque applied"],
    correct: 1,
    topic: "Rotational Dynamics",
    explain: "Moment of inertia I = ∑ m_i r_i², depending on mass and its radial distribution from the rotational axis."
  },
  {
    id: "phy-32",
    q: "In an elastic collision between two masses, which quantities are conserved?",
    options: ["Linear momentum only", "Kinetic energy only", "Both momentum and kinetic energy", "Neither momentum nor kinetic energy"],
    correct: 2,
    topic: "Work & Momentum",
    explain: "By definition, an elastic collision conserves both total linear momentum and total kinetic energy."
  },
  {
    id: "phy-33",
    q: "Sound waves cannot be polarized because they are:",
    options: ["Electromagnetic waves", "Longitudinal waves", "Transverse waves", "High frequency waves"],
    correct: 1,
    topic: "Waves & Sound",
    explain: "Polarization occurs only in transverse waves where oscillations are perpendicular to propagation direction. Sound waves are longitudinal."
  },
  {
    id: "phy-34",
    q: "The energy stored in a charged capacitor of capacitance C and voltage V is:",
    options: ["C V", "1/2 C V²", "C² V", "1/2 C² V"],
    correct: 1,
    topic: "Electrostatics",
    explain: "Energy U = 1/2 C V²."
  },
  {
    id: "phy-35",
    q: "Heavy water (D₂O) is used in nuclear reactors primarily as a:",
    options: ["Fuel", "Moderator", "Shielding material", "Absorber of neutrons"],
    correct: 1,
    topic: "Nuclear Physics",
    explain: "Heavy water slows down fast neutrons to thermal speeds without capturing them, acting as an effective moderator."
  }
];

console.log("Physics questions created:", physicsQuestions.length);
