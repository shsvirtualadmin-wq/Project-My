import { Question } from '../types';
import { mapSubject } from '../utils/subjectMapper';

export const PREBUILT_QUESTIONS: Record<string, Question[]> = {
  "Physics": [
    {
      id: "phy-1",
      q: "A body moving in a circle at constant speed has:",
      options: ["Zero acceleration","Constant velocity","Centripetal acceleration","Constant momentum"],
      correct: 2,
      topic: "Circular Motion & Gravitation",
      explain: "Even at constant speed, velocity direction continuously changes toward the center, producing centripetal acceleration."
    },
    {
      id: "phy-2",
      q: "The SI unit of electric resistance is:",
      options: ["Ampere","Ohm","Volt","Watt"],
      correct: 1,
      topic: "Current Electricity & Ohm's Law",
      explain: "Resistance is measured in Ohms (Ω), defined by R = V / I according to Ohm's law."
    },
    {
      id: "phy-3",
      q: "Which wave requires a physical medium to travel?",
      options: ["Light wave","Radio wave","Sound wave","X-ray"],
      correct: 2,
      topic: "Waves & Sound",
      explain: "Sound is a mechanical wave and requires a physical medium (solid, liquid, or gas) to propagate."
    },
    {
      id: "phy-4",
      q: "Work done is zero when the angle between force and displacement is:",
      options: ["0°","45°","90°","180°"],
      correct: 2,
      topic: "Work, Power & Energy",
      explain: "Work W = F · d · cos(θ). At θ = 90°, cos(90°) = 0, so work done is zero."
    },
    {
      id: "phy-5",
      q: "The phenomenon of bending of light around sharp edges or obstacles is called:",
      options: ["Reflection","Refraction","Diffraction","Dispersion"],
      correct: 2,
      topic: "Physical Optics",
      explain: "Diffraction is the bending and spreading of waves around obstacles or through narrow apertures."
    },
    {
      id: "phy-6",
      q: "Two point charges +2 μC and +6 μC repel each other with a force of 12 N. If -4 μC is added to each, the new force will be:",
      options: ["12 N repulsive","4 N attractive","4 N repulsive","0 N"],
      correct: 1,
      topic: "Electrostatics & Coulomb's Law",
      explain: "New charges become (+2 - 4) = -2 μC and (+6 - 4) = +2 μC. The charges have opposite signs, resulting in an attractive force of 4 N."
    },
    {
      id: "phy-7",
      q: "The half-life of a radioactive element is 10 days. What fraction of the original sample remains after 30 days?",
      options: ["1/2","1/4","1/8","1/16"],
      correct: 2,
      topic: "Nuclear Physics & Radioactivity",
      explain: "30 days represents 3 half-lives (30 / 10 = 3). The remaining fraction is (1/2)^3 = 1/8."
    },
    {
      id: "phy-8",
      q: "In an AC circuit containing pure capacitance, the alternating current:",
      options: ["Lags voltage by 90°","Leads voltage by 90°","Is in phase with voltage","Lags voltage by 180°"],
      correct: 1,
      topic: "Alternating Current",
      explain: "In a purely capacitive AC circuit, the current leads the voltage by a phase angle of 90° (π/2 radians)."
    },
    {
      id: "phy-9",
      q: "According to Newton's second law of motion, force is equal to the rate of change of:",
      options: ["Velocity","Kinetic energy","Linear momentum","Displacement"],
      correct: 2,
      topic: "Dynamics & Force",
      explain: "Newton's 2nd Law states F = dp/dt, meaning force is the rate of change of linear momentum."
    },
    {
      id: "phy-10",
      q: "The escape velocity from the surface of the Earth depends on:",
      options: ["Mass of the projecting body","Mass and radius of the Earth","Angle of projection","Density of the body"],
      correct: 1,
      topic: "Gravitation & Satellite Motion",
      explain: "Escape velocity v_e = √(2 G M_E / R_E), which depends on Earth's mass and radius, independent of the object's mass."
    },
    {
      id: "phy-11",
      q: "In simple harmonic motion (SHM), the acceleration of the particle is maximum at:",
      options: ["Mean position","Extreme positions","Midway between mean and extreme","Zero position"],
      correct: 1,
      topic: "Oscillations & SHM",
      explain: "Acceleration a = -ω² x. Displacement x is maximum at the extreme positions, so acceleration is maximum at extreme positions."
    },
    {
      id: "phy-12",
      q: "Which law states that the total electric flux through a closed surface is equal to 1/ε₀ times the total enclosed charge?",
      options: ["Ampere's Law","Faraday's Law","Gauss's Law","Lenz's Law"],
      correct: 2,
      topic: "Electrostatics",
      explain: "Gauss's Law states Φ_e = q_enclosed / ε₀ for any closed surface."
    },
    {
      id: "phy-13",
      q: "The dimension of Planck's constant (h) is identical to the dimension of:",
      options: ["Linear momentum","Angular momentum","Energy","Force"],
      correct: 1,
      topic: "Measurements & Dimensions",
      explain: "Units of Planck's constant are J·s (N·m·s = kg·m²/s), which matches the dimension of angular momentum (L = m v r = kg·m²/s)."
    },
    {
      id: "phy-14",
      q: "The efficiency of a Carnot engine working between temperatures T1 (hot) and T2 (cold) in Kelvin is given by:",
      options: ["1 - T2/T1","1 - T1/T2","T2 / T1","(T1 + T2) / T1"],
      correct: 0,
      topic: "Thermodynamics",
      explain: "Carnot efficiency η = (T1 - T2) / T1 = 1 - T2/T1 where T1 and T2 are absolute temperatures in Kelvin."
    },
    {
      id: "phy-15",
      q: "Which electromagnetic wave has the highest frequency?",
      options: ["Radio waves","Microwaves","X-rays","Gamma rays"],
      correct: 3,
      topic: "Electromagnetic Spectrum",
      explain: "Gamma rays have the shortest wavelength and highest frequency in the electromagnetic spectrum."
    },
    {
      id: "phy-16",
      q: "The work-energy theorem states that the net work done on an object equals its change in:",
      options: ["Potential energy","Kinetic energy","Total mechanical energy","Momentum"],
      correct: 1,
      topic: "Work, Power & Energy",
      explain: "W_net = ΔK = K_final - K_initial."
    },
    {
      id: "phy-17",
      q: "A concave lens always forms an image that is:",
      options: ["Real, inverted, and magnified","Virtual, erect, and diminished","Real, erect, and magnified","Virtual, inverted, and enlarged"],
      correct: 1,
      topic: "Geometrical Optics",
      explain: "A diverging (concave) lens always forms a virtual, erect, and diminished image for real objects."
    },
    {
      id: "phy-18",
      q: "The SI unit of magnetic field strength (B) is:",
      options: ["Weber","Tesla","Henry","Gauss"],
      correct: 1,
      topic: "Electromagnetism",
      explain: "Magnetic flux density B is measured in Tesla (T)."
    },
    {
      id: "phy-19",
      q: "In a P-N junction diode, the depletion region consists of:",
      options: ["Free electrons only","Holes only","Immobile positive and negative ions","Both free electrons and holes"],
      correct: 2,
      topic: "Electronics & Semiconductors",
      explain: "The depletion region is depleted of mobile charge carriers and contains fixed immobile donor/acceptor ions."
    },
    {
      id: "phy-20",
      q: "Which phenomenon conclusively demonstrates the particle nature of light?",
      options: ["Interference","Diffraction","Polarization","Photoelectric Effect"],
      correct: 3,
      topic: "Dawn of Modern Physics",
      explain: "Einstein's photoelectric effect explanation proved light behaves as discrete energy quanta called photons."
    },
    {
      id: "phy-21",
      q: "The slope of a velocity-time graph represents:",
      options: ["Displacement","Acceleration","Force","Work"],
      correct: 1,
      topic: "Kinematics",
      explain: "Acceleration is defined as dv/dt, which is the slope of the velocity vs time curve."
    },
    {
      id: "phy-22",
      q: "Two resistors of 6 Ω and 3 Ω are connected in parallel. Their equivalent resistance is:",
      options: ["9 Ω","4.5 Ω","2 Ω","18 Ω"],
      correct: 2,
      topic: "Current Electricity",
      explain: "1/R_eq = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2, so R_eq = 2 Ω."
    },
    {
      id: "phy-23",
      q: "What type of transformer increases secondary output voltage relative to primary voltage?",
      options: ["Step-down transformer","Step-up transformer","Autotransformer","Isolating transformer"],
      correct: 1,
      topic: "Electromagnetic Induction",
      explain: "A step-up transformer has more secondary turns than primary turns (N_s > N_p), increasing secondary output voltage."
    },
    {
      id: "phy-24",
      q: "Lenz's law is a direct consequence of the law of conservation of:",
      options: ["Charge","Momentum","Energy","Mass"],
      correct: 2,
      topic: "Electromagnetic Induction",
      explain: "Lenz's law ensures mechanical work done against induced magnetic opposition converts into electrical energy, satisfying energy conservation."
    },
    {
      id: "phy-25",
      q: "A projectile reaches its maximum height when its vertical velocity component becomes:",
      options: ["Maximum","Zero","Equal to horizontal velocity","Negative"],
      correct: 1,
      topic: "2D Kinematics & Projectiles",
      explain: "At the peak trajectory point, vertical motion momentarily stops (v_y = 0), while horizontal velocity v_x remains constant."
    },
    {
      id: "phy-26",
      q: "Which characteristic of a light wave remains constant when passing from air into glass?",
      options: ["Velocity","Wavelength","Frequency","Amplitude"],
      correct: 2,
      topic: "Wave Optics & Refraction",
      explain: "Frequency depends strictly on the light source and remains unchanged across refractive boundaries."
    },
    {
      id: "phy-27",
      q: "The magnetic force on a current-carrying conductor is maximum when the angle between conductor and magnetic field is:",
      options: ["0°","45°","90°","180°"],
      correct: 2,
      topic: "Electromagnetism",
      explain: "Magnetic force F = I L B sin(θ). At θ = 90°, sin(90°) = 1 (maximum)."
    },
    {
      id: "phy-28",
      q: "The de Broglie wavelength λ associated with a particle of mass m moving with velocity v is:",
      options: ["λ = h / (m v)","λ = h m v","λ = m v / h","λ = h / (m v²)"],
      correct: 0,
      topic: "Modern Physics & Quantum Theory",
      explain: "de Broglie relation gives λ = h / p = h / (m v)."
    },
    {
      id: "phy-29",
      q: "Which thermodynamic process takes place at constant volume?",
      options: ["Isothermal","Isobaric","Isochoric","Adiabatic"],
      correct: 2,
      topic: "Thermodynamics",
      explain: "An isochoric process occurs at constant volume (ΔV = 0, work W = 0)."
    },
    {
      id: "phy-30",
      q: "What is the unit of electric capacitance?",
      options: ["Coulomb","Volt","Farad","Henry"],
      correct: 2,
      topic: "Electrostatics & Capacitors",
      explain: "Capacitance C = Q / V is measured in Farads (F)."
    },
    {
      id: "phy-31",
      q: "Moment of inertia of a rigid body depends on:",
      options: ["Mass of body only","Distribution of mass relative to axis of rotation","Angular velocity only","Applied torque"],
      correct: 1,
      topic: "Rotational Dynamics",
      explain: "Moment of inertia I = ∑ m_i r_i², depending on mass and its radial distance distribution from the rotational axis."
    },
    {
      id: "phy-32",
      q: "In an elastic collision between two isolated bodies, which quantities are conserved?",
      options: ["Linear momentum only","Kinetic energy only","Both linear momentum and kinetic energy","Neither momentum nor kinetic energy"],
      correct: 2,
      topic: "Work & Momentum",
      explain: "By definition, an elastic collision conserves both total linear momentum and total kinetic energy."
    },
    {
      id: "phy-33",
      q: "Sound waves cannot be polarized because they are:",
      options: ["Electromagnetic waves","Longitudinal mechanical waves","Transverse waves","High frequency waves"],
      correct: 1,
      topic: "Waves & Sound",
      explain: "Polarization occurs only in transverse waves. Sound waves in air are longitudinal pressure waves."
    },
    {
      id: "phy-34",
      q: "The electrostatic energy stored in a capacitor of capacitance C charged to potential difference V is:",
      options: ["C V","1/2 C V²","C² V","1/2 C² V"],
      correct: 1,
      topic: "Electrostatics",
      explain: "Stored electrostatic potential energy U = 1/2 C V²."
    },
    {
      id: "phy-35",
      q: "Heavy water (D₂O) is used in nuclear fission reactors primarily as a:",
      options: ["Nuclear fuel","Neutron moderator","Radiation shield","Neutron absorber"],
      correct: 1,
      topic: "Nuclear Physics",
      explain: "Heavy water slows down fast fission neutrons to thermal speeds without capturing them, serving as a moderator."
    }
  ],
  "Chemistry": [
    {
      id: "chem-1",
      q: "The number of electrons in a neutral Carbon atom is:",
      options: ["4","6","8","12"],
      correct: 1,
      topic: "Atomic Structure",
      explain: "Carbon's atomic number is 6, meaning a neutral carbon atom contains 6 protons and 6 electrons."
    },
    {
      id: "chem-2",
      q: "Which of these processes is an example of an exothermic chemical reaction?",
      options: ["Photosynthesis","Combustion of methane","Melting of ice","Evaporation of water"],
      correct: 1,
      topic: "Thermochemistry",
      explain: "Combustion releases energy to the surroundings, giving a negative enthalpy change (ΔH < 0)."
    },
    {
      id: "chem-3",
      q: "The pH of a neutral aqueous solution at 25°C is:",
      options: ["0","7","14","1"],
      correct: 1,
      topic: "Acids, Bases & pH",
      explain: "Pure water at 25°C has [H⁺] = 10⁻⁷ M, resulting in pH = -log(10⁻⁷) = 7."
    },
    {
      id: "chem-4",
      q: "Which chemical bond involves equal or unequal sharing of electron pairs between atoms?",
      options: ["Ionic bond","Covalent bond","Metallic bond","Hydrogen bond"],
      correct: 1,
      topic: "Chemical Bonding",
      explain: "A covalent bond is formed by mutual sharing of valence electrons between atoms."
    },
    {
      id: "chem-5",
      q: "According to Avogadro's constant, 1 mole of any substance contains how many representative particles?",
      options: ["3.011 × 10²³","6.022 × 10²³","1.602 × 10⁻¹⁹","9.109 × 10⁻³¹"],
      correct: 1,
      topic: "Stoichiometry & Mole Concept",
      explain: "Avogadro's number is 6.022 × 10²³ particles per mole."
    },
    {
      id: "chem-6",
      q: "Which subatomic particle carries a negative fundamental electric charge?",
      options: ["Proton","Neutron","Electron","Positron"],
      correct: 2,
      topic: "Atomic Structure",
      explain: "Electrons carry a single unit negative charge (-1.602 × 10⁻¹⁹ C)."
    },
    {
      id: "chem-7",
      q: "Elements belonging to Group 17 of the periodic table are collectively known as:",
      options: ["Alkali metals","Alkaline earth metals","Halogens","Noble gases"],
      correct: 2,
      topic: "Periodic Table & Periodicity",
      explain: "Group 17 elements (F, Cl, Br, I, At) are salt-formers called Halogens."
    },
    {
      id: "chem-8",
      q: "What is the oxidation number of Sulfur in sulfuric acid (H₂SO₄)?",
      options: ["+2","+4","+6","-2"],
      correct: 2,
      topic: "Electrochemistry & Oxidation Numbers",
      explain: "2(+1) + S + 4(-2) = 0 => +2 + S - 8 = 0 => S = +6."
    },
    {
      id: "chem-9",
      q: "Which gas law states that at constant temperature, the volume of a given mass of gas is inversely proportional to its pressure?",
      options: ["Boyle's Law","Charles's Law","Avogadro's Law","Dalton's Law"],
      correct: 0,
      topic: "States of Matter & Gases",
      explain: "Boyle's Law states P ∝ 1/V or P₁V₁ = P₂V₂ at constant temperature."
    },
    {
      id: "chem-10",
      q: "General formula for unsaturated hydrocarbons containing one carbon-carbon triple bond (Alkynes) is:",
      options: ["C_n H_(2n+2)","C_n H_(2n)","C_n H_(2n-2)","C_n H_(2n-4)"],
      correct: 2,
      topic: "Organic Chemistry & Hydrocarbons",
      explain: "Alkynes (like ethyne C₂H₂) follow the general formula C_n H_(2n-2)."
    },
    {
      id: "chem-11",
      q: "Which element has the highest electronegativity on the Pauling scale?",
      options: ["Oxygen","Chlorine","Fluorine","Nitrogen"],
      correct: 2,
      topic: "Periodic Trends",
      explain: "Fluorine is the most electronegative element with a Pauling value of 4.0."
    },
    {
      id: "chem-12",
      q: "In an electrochemical cell, oxidation always takes place at the:",
      options: ["Anode","Cathode","Salt bridge","Outer circuit wire"],
      correct: 0,
      topic: "Electrochemistry",
      explain: "Anode is defined as the electrode where oxidation (loss of electrons) occurs."
    },
    {
      id: "chem-13",
      q: "Which catalyst is commonly used in the industrial Haber process for synthesizing ammonia (NH₃)?",
      options: ["Nickel","Iron with promoter Al₂O₃/K₂O","Platinum","Vanadium pentoxide"],
      correct: 1,
      topic: "Chemical Equilibrium & Industrial Chemistry",
      explain: "Finely divided iron with promoters like Al₂O₃ and K₂O catalyzes N₂ + 3H₂ ⇌ 2NH₃."
    },
    {
      id: "chem-14",
      q: "The IUPAC name of CH₃-CH₂-OH is:",
      options: ["Methanol","Ethanol","Propanol","Ethanal"],
      correct: 1,
      topic: "Organic Chemistry & Functional Groups",
      explain: "A 2-carbon chain with an -OH hydroxyl group is Ethanol."
    },
    {
      id: "chem-15",
      q: "What is the shape of a Methane (CH₄) molecule according to VSEPR theory?",
      options: ["Linear","Trigonal planar","Tetrahedral","Bent / V-shaped"],
      correct: 2,
      topic: "Chemical Bonding & VSEPR",
      explain: "Carbon in CH₄ forms 4 sp³ hybrid bonding pairs with 0 lone pairs, giving a regular tetrahedral geometry (bond angle 109.5°)."
    },
    {
      id: "chem-16",
      q: "Which type of crystalline solid conducts electricity in both molten state and aqueous solution, but not in solid state?",
      options: ["Ionic solid","Covalent network solid","Metallic solid","Molecular solid"],
      correct: 0,
      topic: "States of Matter & Solids",
      explain: "Ionic solids contain fixed ions in solid lattice. Melting or dissolving frees ions to carry current."
    },
    {
      id: "chem-17",
      q: "According to the Bronsted-Lowry concept, an acid is defined as a substance that:",
      options: ["Accepts a proton","Donates a proton (H⁺)","Donates an electron pair","Produces OH⁻ ions in water"],
      correct: 1,
      topic: "Acids and Bases",
      explain: "Bronsted-Lowry theory defines an acid as a proton donor and a base as a proton acceptor."
    },
    {
      id: "chem-18",
      q: "Which gas law states that total pressure of a mixture of non-reacting gases equals the sum of partial pressures?",
      options: ["Graham's Law","Dalton's Law","Henry's Law","Ideal Gas Law"],
      correct: 1,
      topic: "Gas Laws",
      explain: "Dalton's Law of Partial Pressures states P_total = P₁ + P₂ + P₃ + ... for ideal non-reacting gas mixtures."
    },
    {
      id: "chem-19",
      q: "What is the principal quantum number (n) value for the M shell in an atom?",
      options: ["n = 1","n = 2","n = 3","n = 4"],
      correct: 2,
      topic: "Atomic Structure & Quantum Numbers",
      explain: "Shells K, L, M, N correspond to principal quantum numbers n = 1, 2, 3, 4 respectively."
    },
    {
      id: "chem-20",
      q: "Isotopes of the same element differ in their number of:",
      options: ["Protons","Electrons","Neutrons","Atomic number"],
      correct: 2,
      topic: "Atomic Structure",
      explain: "Isotopes have identical atomic numbers (protons) but different mass numbers due to varying neutron counts."
    },
    {
      id: "chem-21",
      q: "Chemical equilibrium is dynamic in nature because:",
      options: ["Reactants stop reacting completely","Forward and reverse reactions occur at equal rates","Concentrations of reactants become zero","Product concentration drops to zero"],
      correct: 1,
      topic: "Chemical Equilibrium",
      explain: "Dynamic equilibrium means forward and reverse reactions continue simultaneously at equal speeds."
    },
    {
      id: "chem-22",
      q: "Which Functional Group characterizes Aldehydes?",
      options: ["-OH","-CHO","-COOH","-CO-"],
      correct: 1,
      topic: "Organic Functional Groups",
      explain: "Aldehydes contain the formyl group -CHO attached to a carbon chain or hydrogen."
    },
    {
      id: "chem-23",
      q: "According to Le Chatelier's principle, increasing pressure on a gaseous equilibrium system shifts the equilibrium toward the side with:",
      options: ["Fewer moles of gas","Greater moles of gas","Higher temperature","No change regardless of moles"],
      correct: 0,
      topic: "Chemical Equilibrium",
      explain: "Higher pressure favors the direction that decreases gas volume/moles to relieve the pressure stress."
    },
    {
      id: "chem-24",
      q: "Which process converts an Alkene into an Alkane by adding hydrogen gas in the presence of Nickel/Platinum catalyst?",
      options: ["Dehydration","Halogenation","Hydrogenation","Hydrohalogenation"],
      correct: 2,
      topic: "Hydrocarbons & Organic Reactions",
      explain: "Catalytic hydrogenation adds H₂ across carbon-carbon double bonds to produce saturated alkanes."
    },
    {
      id: "chem-25",
      q: "Which oxide is classified as an Amphoteric oxide?",
      options: ["Na₂O","SO₃","Al₂O₃","CO"],
      correct: 2,
      topic: "Periodic Table & Oxides",
      explain: "Aluminum oxide (Al₂O₃) reacts with both strong acids and strong bases, showing amphoteric properties."
    },
    {
      id: "chem-26",
      q: "What is the molar volume of an ideal gas at Standard Temperature and Pressure (STP: 0°C and 1 atm)?",
      options: ["22.4 dm³ (liters)","24.0 dm³","11.2 dm³","100 dm³"],
      correct: 0,
      topic: "Stoichiometry & Gas Molar Volume",
      explain: "At STP, 1 mole of any ideal gas occupies 22.4 dm³ (or liters)."
    },
    {
      id: "chem-27",
      q: "Which type of chemical bond holds together atoms within a metallic lattice?",
      options: ["Covalent bond","Ionic bond","Metallic bond (sea of delocalized electrons)","Dipole-dipole force"],
      correct: 2,
      topic: "Chemical Bonding",
      explain: "Metallic bonding arises from electrostatic attraction between metal cations and a sea of delocalized valence electrons."
    },
    {
      id: "chem-28",
      q: "In an endothermic reaction, the enthalpy of products is:",
      options: ["Less than enthalpy of reactants","Greater than enthalpy of reactants","Equal to enthalpy of reactants","Zero"],
      correct: 1,
      topic: "Thermochemistry",
      explain: "Endothermic reactions absorb heat (ΔH = H_products - H_reactants > 0), so products have higher enthalpy."
    },
    {
      id: "chem-29",
      q: "Which reagent is used to distinguish between Alkanes and Alkenes by decolorization?",
      options: ["Tollens' reagent","Fehling's solution","Bromine water (Br₂ / CCl₄)","Benedict's solution"],
      correct: 2,
      topic: "Hydrocarbons & Organic Testing",
      explain: "Unsaturated alkenes undergo rapid addition with reddish-brown bromine water, decolorizing it."
    },
    {
      id: "chem-30",
      q: "What is the conjugate base of H₂SO₄?",
      options: ["SO₄²⁻","HSO₄⁻","H₃SO₄⁺","SO₂"],
      correct: 1,
      topic: "Acids and Bases",
      explain: "Removing one proton (H⁺) from H₂SO₄ leaves its conjugate base HSO₄⁻ (hydrogen sulfate ion)."
    },
    {
      id: "chem-31",
      q: "Which block of the periodic table contains transition metals?",
      options: ["s-block","p-block","d-block","f-block"],
      correct: 2,
      topic: "Periodic Table",
      explain: "d-block elements (Groups 3 to 12) are outer transition metals."
    },
    {
      id: "chem-32",
      q: "The maximum number of electrons that can be accommodated in a d-subshell is:",
      options: ["2","6","10","14"],
      correct: 2,
      topic: "Atomic Structure & Orbital Configuration",
      explain: "A d-subshell has 5 orbitals, holding up to 2 × 5 = 10 electrons."
    },
    {
      id: "chem-33",
      q: "Boiling point elevation is classified as a:",
      options: ["Constitutive property","Colligative property","Chemical property","Additive property"],
      correct: 1,
      topic: "Solutions & Colligative Properties",
      explain: "Colligative properties depend solely on the number of solute particles in solution, independent of their chemical identity."
    },
    {
      id: "chem-34",
      q: "The major product formed by dehydration of Ethanol with concentrated H₂SO₄ at 170°C is:",
      options: ["Ethene","Diethyl ether","Ethane","Ethanal"],
      correct: 0,
      topic: "Organic Reactions & Alcohols",
      explain: "Intramolecular dehydration of CH₃CH₂OH at 170°C yields CH₂=CH₂ (Ethene) and H₂O."
    },
    {
      id: "chem-35",
      q: "Which law of electrolysis states that mass deposited at an electrode is directly proportional to chemical equivalent weight for the same quantity of electricity?",
      options: ["Faraday's First Law","Faraday's Second Law","Ohm's Law","Kohlrausch's Law"],
      correct: 1,
      topic: "Electrochemistry",
      explain: "Faraday's 2nd Law states W₁ / W₂ = E₁ / E₂ when identical charge passes through different electrolytes."
    }
  ],
  "Biology": [
    {
      id: "bio-1",
      q: "Which organelle is known as the powerhouse of the eukaryotic cell?",
      options: ["Nucleus","Ribosome","Mitochondria","Golgi apparatus"],
      correct: 2,
      topic: "Cell Biology",
      explain: "Mitochondria carry out cellular respiration to produce ATP, the energy currency of the cell."
    },
    {
      id: "bio-2",
      q: "The process of copying a genetic sequence of DNA into messenger RNA (mRNA) is called:",
      options: ["Translation","Transcription","Replication","Transformation"],
      correct: 1,
      topic: "Molecular Genetics",
      explain: "Transcription synthesizes RNA from a DNA template strand using RNA polymerase."
    },
    {
      id: "bio-3",
      q: "Which macromolecule acts as the primary catalyst (enzymes) for biochemical reactions in living organisms?",
      options: ["Carbohydrates","Lipids","Proteins","Nucleic acids"],
      correct: 2,
      topic: "Biochemistry & Enzymes",
      explain: "Enzymes are specialized biological catalysts composed almost entirely of globular proteins."
    },
    {
      id: "bio-4",
      q: "During photosynthesis, the light-independent reactions (Calvin cycle) take place in the:",
      options: ["Thylakoid membrane","Stroma of chloroplast","Inner mitochondrial membrane","Cytoplasm"],
      correct: 1,
      topic: "Bioenergetics",
      explain: "The Calvin cycle occurs in the fluid-filled stroma of chloroplasts, fixing CO₂ into carbohydrates."
    },
    {
      id: "bio-5",
      q: "Which blood vessel carries oxygenated blood from the lungs back to the left atrium of the heart?",
      options: ["Pulmonary artery","Pulmonary vein","Vena cava","Aorta"],
      correct: 1,
      topic: "Human Transport & Circulation",
      explain: "Pulmonary veins are unique veins that transport freshly oxygenated blood from lungs to the left atrium."
    },
    {
      id: "bio-6",
      q: "The functional filtering unit of the human kidney is called a:",
      options: ["Neuron","Nephron","Alveolus","Villus"],
      correct: 1,
      topic: "Excretion & Homeostasis",
      explain: "Each human kidney contains roughly 1 million nephrons responsible for filtering metabolic waste from blood."
    },
    {
      id: "bio-7",
      q: "Which hormone produced by pancreatic beta cells lowers blood glucose concentration?",
      options: ["Glucagon","Insulin","Adrenaline","Thyroxine"],
      correct: 1,
      topic: "Coordination & Endocrine System",
      explain: "Insulin promotes cellular absorption of glucose and glycogenesis, lowering blood sugar levels."
    },
    {
      id: "bio-8",
      q: "Cell division that results in four genetically diverse haploid daughter cells (gametes) is called:",
      options: ["Mitosis","Meiosis","Binary fission","Budding"],
      correct: 1,
      topic: "Cell Cycle & Reproduction",
      explain: "Meiosis reduces chromosome number by half through two successive divisions, generating 4 haploid gametes."
    },
    {
      id: "bio-9",
      q: "Which nitrogenous base is present in RNA but absent in DNA?",
      options: ["Adenine","Thymine","Uracil","Guanine"],
      correct: 2,
      topic: "Genetics & Nucleic Acids",
      explain: "RNA contains Uracil (U) instead of Thymine (T) pairing with Adenine."
    },
    {
      id: "bio-10",
      q: "Plant cell walls are primarily composed of which structural polysaccharide?",
      options: ["Starch","Glycogen","Cellulose","Chitin"],
      correct: 2,
      topic: "Cell Structure & Biochemistry",
      explain: "Cellulose is an unbranched polymer of β-D-glucose providing rigidity to plant cell walls."
    },
    {
      id: "bio-11",
      q: "The site of protein synthesis inside all living cells is the:",
      options: ["Ribosome","Lysosome","Centrosome","Smooth ER"],
      correct: 0,
      topic: "Cell Organelles",
      explain: "Ribosomes translate mRNA codon sequences into amino acid polypeptide chains."
    },
    {
      id: "bio-12",
      q: "Which gas is released as a byproduct during the light-dependent reactions of photosynthesis?",
      options: ["Carbon dioxide","Oxygen","Nitrogen","Methane"],
      correct: 1,
      topic: "Bioenergetics",
      explain: "Photolysis of water (H₂O splitting) in photosystem II releases O₂ as a byproduct."
    },
    {
      id: "bio-13",
      q: "In human blood, oxygen is primarily carried by binding to which iron-containing protein?",
      options: ["Myoglobin","Hemoglobin","Fibrinogen","Albumin"],
      correct: 1,
      topic: "Transport in Humans",
      explain: "Hemoglobin in red blood cells binds up to four oxygen molecules to form oxyhemoglobin."
    },
    {
      id: "bio-14",
      q: "Which part of the human brain controls involuntary body functions such as heart rate and breathing?",
      options: ["Cerebrum","Cerebellum","Medulla oblongata","Hypothalamus"],
      correct: 2,
      topic: "Nervous Coordination",
      explain: "Medulla oblongata in the brainstem regulates cardiac, respiratory, and vasomotor autonomic reflex centers."
    },
    {
      id: "bio-15",
      q: "According to Mendel's principles, an organism possessing two identical alleles for a given gene trait is described as:",
      options: ["Heterozygous","Homozygous","Hemizygous","Phenotypic"],
      correct: 1,
      topic: "Genetics & Inheritance",
      explain: "Homozygous organisms have two identical alleles (e.g., TT or tt) for a single trait."
    },
    {
      id: "bio-16",
      q: "Which enzyme digests starch into maltose disaccharides in the human mouth and intestine?",
      options: ["Pepsin","Amylase","Lipase","Trypsin"],
      correct: 1,
      topic: "Human Digestion",
      explain: "Salivary and pancreatic amylases break down complex starch polysaccharides into maltose."
    },
    {
      id: "bio-17",
      q: "In an ecological food chain, primary producers belong to which trophic category?",
      options: ["Autotrophs","Herbivores","Carnivores","Decomposers"],
      correct: 0,
      topic: "Ecology & Ecosystems",
      explain: "Autotrophs (green plants, algae) synthesize organic food from inorganic solar energy, forming the base trophic level."
    },
    {
      id: "bio-18",
      q: "Which organelle contains digestive hydrolytic enzymes capable of breaking down waste and worn-out organelles?",
      options: ["Peroxisome","Lysosome","Vacuole","Endosome"],
      correct: 1,
      topic: "Cell Organelles",
      explain: "Lysosomes contain acid hydrolases that digest intracellular debris and pathogens."
    },
    {
      id: "bio-19",
      q: "What is the net yield of ATP molecules produced per glucose molecule during Glycolysis alone under anaerobic conditions?",
      options: ["2 ATP","4 ATP","36 ATP","38 ATP"],
      correct: 0,
      topic: "Respiration & Bioenergetics",
      explain: "Glycolysis consumes 2 ATP and produces 4 ATP, yielding a net gain of 2 ATP per glucose."
    },
    {
      id: "bio-20",
      q: "Which vitamin deficiency causes Scurvy, characterized by bleeding gums and poor wound healing?",
      options: ["Vitamin A","Vitamin B1","Vitamin C (Ascorbic acid)","Vitamin D"],
      correct: 2,
      topic: "Human Nutrition",
      explain: "Vitamin C is essential for collagen synthesis; its deficiency leads to fragile capillaries and scurvy."
    },
    {
      id: "bio-21",
      q: "Movement of water molecules across a selectively permeable membrane from higher water potential to lower water potential is:",
      options: ["Diffusion","Osmosis","Active transport","Facilitated diffusion"],
      correct: 1,
      topic: "Cell Transport",
      explain: "Osmosis is the passive net movement of solvent (water) across a semipermeable membrane down its concentration gradient."
    },
    {
      id: "bio-22",
      q: "Which plant tissue is responsible for transporting water and dissolved mineral ions upward from roots to leaves?",
      options: ["Phloem","Xylem","Cambium","Epidermis"],
      correct: 1,
      topic: "Plant Transport",
      explain: "Xylem vessel elements and tracheids conduct water and inorganic nutrients unidirectionally upward."
    },
    {
      id: "bio-23",
      q: "In double-stranded DNA, according to Chargaff's rules, Adenine always pairs with:",
      options: ["Cytosine","Guanine","Thymine","Uracil"],
      correct: 2,
      topic: "Molecular Biology",
      explain: "Adenine forms two hydrogen bonds specifically with Thymine in DNA."
    },
    {
      id: "bio-24",
      q: "Which disease is caused by a deficiency of Thyroid hormone (Thyroxine) in infants?",
      options: ["Cretinism","Gigantism","Diabetes mellitus","Goiter in adults"],
      correct: 0,
      topic: "Endocrine System",
      explain: "Severe congenital hypothyroidism in infants leads to cretinism, marked by stunted physical and mental growth."
    },
    {
      id: "bio-25",
      q: "Restriction endonucleases are bacterial enzymes used in genetic engineering to:",
      options: ["Join DNA fragments","Cut DNA at specific nucleotide recognition sequences","Copy RNA into DNA","Synthesize proteins"],
      correct: 1,
      topic: "Biotechnology",
      explain: "Restriction enzymes cut phosphodiester bonds of double-stranded DNA at palindromic restriction sites."
    },
    {
      id: "bio-26",
      q: "Which structural component of human skeletal muscle contracts by sliding over myosin filaments?",
      options: ["Actin filaments","Collagen fibers","Fibrin threads","Elastin"],
      correct: 0,
      topic: "Support and Movement",
      explain: "According to the sliding filament model, thin actin filaments slide past thick myosin filaments to shorten sarcomeres."
    },
    {
      id: "bio-27",
      q: "Which type of immunity is acquired by receiving ready-made antibodies (e.g. anti-tetanus serum or maternal antibodies)?",
      options: ["Active natural immunity","Active artificial immunity","Passive immunity","Innate non-specific immunity"],
      correct: 2,
      topic: "Immunity",
      explain: "Passive immunity involves direct transfer of pre-formed antibodies, giving immediate but temporary protection."
    },
    {
      id: "bio-28",
      q: "Transpiration in plants refers to:",
      options: ["Absorption of water by roots","Evaporative loss of water vapor from aerial plant parts through stomata","Transport of sugars in phloem","Uptake of carbon dioxide"],
      correct: 1,
      topic: "Plant Physiology",
      explain: "Transpiration is the loss of water vapor mainly through leaf stomatal pores, driving transpiration pull."
    },
    {
      id: "bio-29",
      q: "Which respiratory pigment gives muscle fibers their dark red color and stores oxygen locally?",
      options: ["Hemoglobin","Myoglobin","Hemocyanin","Cytochrome"],
      correct: 1,
      topic: "Human Physiology",
      explain: "Myoglobin is an iron-binding protein found in muscle tissue that stores oxygen for cellular work."
    },
    {
      id: "bio-30",
      q: "What is the final electron acceptor in the mitochondrial electron transport chain during aerobic respiration?",
      options: ["NAD⁺","FAD","Oxygen (O₂)","Pyruvate"],
      correct: 2,
      topic: "Cellular Respiration",
      explain: "Oxygen acts as the terminal electron acceptor, combining with electrons and protons to form water."
    },
    {
      id: "bio-31",
      q: "Fungi cell walls are made of:",
      options: ["Cellulose","Peptidoglycan","Chitin","Lignin"],
      correct: 2,
      topic: "Diversity of Life",
      explain: "Fungal cell walls consist of chitin, a tough N-acetylglucosamine polymer."
    },
    {
      id: "bio-32",
      q: "Which hormone stimulates uterine contractions during labor and milk ejection in mothers?",
      options: ["Prolactin","Oxytocin","Progesterone","Estrogen"],
      correct: 1,
      topic: "Reproduction & Endocrine System",
      explain: "Oxytocin released by posterior pituitary causes uterine wall contractions and milk let-down reflex."
    },
    {
      id: "bio-33",
      q: "Chromosomes align along the equatorial plane (metaphase plate) during which phase of mitosis?",
      options: ["Prophase","Metaphase","Anaphase","Telophase"],
      correct: 1,
      topic: "Cell Cycle",
      explain: "During Metaphase, spindle fibers attach to kinetochores and align chromosomes along the cell equator."
    },
    {
      id: "bio-34",
      q: "Which technique is widely used to amplify millions of copies of a specific DNA segment in vitro?",
      options: ["Gel electrophoresis","Polymerase Chain Reaction (PCR)","Western blotting","DNA microarrays"],
      correct: 1,
      topic: "Biotechnology",
      explain: "PCR uses thermal cycling and Taq polymerase to exponentially amplify targeted DNA sequences."
    },
    {
      id: "bio-35",
      q: "The symbiotic association between plant roots and mycorrhizal fungi provides the plant primarily with enhanced absorption of:",
      options: ["Glucose","Phosphorus and water","Nitrogen gas directly","Carbon dioxide"],
      correct: 1,
      topic: "Ecology & Symbiosis",
      explain: "Mycorrhizae extend soil surface area for absorption of water and essential mineral nutrients, especially phosphorus."
    }
  ],
  "Mathematics": [
    {
      id: "math-1",
      q: "What is the derivative of f(x) = x³ with respect to x?",
      options: ["3x","3x²","x²","2x³"],
      correct: 1,
      topic: "Calculus & Differentiation",
      explain: "Using the power rule d/dx(xⁿ) = n xⁿ⁻¹, d/dx(x³) = 3x²."
    },
    {
      id: "math-2",
      q: "The value of sin(90°) or sin(π/2) is:",
      options: ["0","0.5","1","Undefined"],
      correct: 2,
      topic: "Trigonometry",
      explain: "On the unit circle, at 90°, the y-coordinate is 1, so sin(90°) = 1."
    },
    {
      id: "math-3",
      q: "A square matrix A is called singular if its determinant |A| is equal to:",
      options: ["1","-1","0","Infinity"],
      correct: 2,
      topic: "Matrices & Determinants",
      explain: "By definition, a matrix is singular if det(A) = 0, meaning it has no multiplicative inverse."
    },
    {
      id: "math-4",
      q: "If z = 3 + 4i is a complex number, its modulus |z| is:",
      options: ["7","5","12","25"],
      correct: 1,
      topic: "Complex Numbers",
      explain: "Modulus |z| = √(a² + b²) = √(3² + 4²) = √(9 + 16) = √25 = 5."
    },
    {
      id: "math-5",
      q: "The discriminant of a quadratic equation ax² + bx + c = 0 is:",
      options: ["b - 4ac","b² - 4ac","b² + 4ac","√(b² - 4ac)"],
      correct: 1,
      topic: "Quadratic Equations",
      explain: "Discriminant Δ = b² - 4ac determines the nature of the roots."
    },
    {
      id: "math-6",
      q: "What is the log base 10 value of 1000 (log₁₀ 1000)?",
      options: ["1","2","3","10"],
      correct: 2,
      topic: "Logarithms",
      explain: "Since 10³ = 1000, log₁₀(1000) = 3."
    },
    {
      id: "math-7",
      q: "What is the derivative of e²ˣ with respect to x?",
      options: ["e²ˣ","2 e²ˣ","x e²ˣ","2 eˣ"],
      correct: 1,
      topic: "Calculus",
      explain: "Using chain rule, d/dx(e^(k x)) = k e^(k x), so d/dx(e²ˣ) = 2 e²ˣ."
    },
    {
      id: "math-8",
      q: "The indefinite integral ∫ cos(x) dx is equal to:",
      options: ["-sin(x) + C","sin(x) + C","tan(x) + C","-cos(x) + C"],
      correct: 1,
      topic: "Calculus & Integration",
      explain: "Since d/dx(sin x) = cos x, the antiderivative ∫ cos(x) dx = sin(x) + C."
    },
    {
      id: "math-9",
      q: "The slope m of a straight line passing through points (x₁, y₁) and (x₂, y₂) is given by:",
      options: ["(x₂ - x₁) / (y₂ - y₁)","(y₂ - y₁) / (x₂ - x₁)","(y₁ + y₂) / 2","(x₁ + x₂) / 2"],
      correct: 1,
      topic: "Coordinate Geometry",
      explain: "Slope m = rise / run = (y₂ - y₁) / (x₂ - x₁)."
    },
    {
      id: "math-10",
      q: "If two non-zero vectors A and B are perpendicular to each other, their dot product A · B is:",
      options: ["1","0","|A||B|","-1"],
      correct: 1,
      topic: "Vectors",
      explain: "A · B = |A||B| cos(θ). Since cos(90°) = 0, the dot product is 0."
    },
    {
      id: "math-11",
      q: "Which trigonometric identity is fundamental for all real angles θ?",
      options: ["sin² θ - cos² θ = 1","sin² θ + cos² θ = 1","1 + tan² θ = sin² θ","sec² θ + tan² θ = 1"],
      correct: 1,
      topic: "Trigonometry",
      explain: "Pythagorean trigonometric identity states sin² θ + cos² θ = 1."
    },
    {
      id: "math-12",
      q: "The sum of the interior angles of a triangle is always:",
      options: ["90°","180° (π radians)","270°","360° (2π radians)"],
      correct: 1,
      topic: "Geometry",
      explain: "In Euclidean geometry, interior angles of any triangle sum to 180°."
    },
    {
      id: "math-13",
      q: "What is the conjugate of the complex number z = 5 - 2i?",
      options: ["-5 - 2i","-5 + 2i","5 + 2i","2 - 5i"],
      correct: 2,
      topic: "Complex Numbers",
      explain: "Complex conjugate of a + bi is a - bi. So conjugate of 5 - 2i is 5 + 2i."
    },
    {
      id: "math-14",
      q: "The midpoint of a line segment connecting (2, 4) and (6, 8) is:",
      options: ["(4, 6)","(8, 12)","(3, 5)","(4, 4)"],
      correct: 0,
      topic: "Coordinate Geometry",
      explain: "Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2) = ((2 + 6)/2, (4 + 8)/2) = (4, 6)."
    },
    {
      id: "math-15",
      q: "What is the value of limit lim (x->0) [sin(x) / x]?",
      options: ["0","1","Infinity","Undefined"],
      correct: 1,
      topic: "Calculus & Limits",
      explain: "Standard trigonometric limit states lim (x->0) [sin x / x] = 1."
    },
    {
      id: "math-16",
      q: "If a matrix has 3 rows and 4 columns, its order is:",
      options: ["4 × 3","3 × 4","12","7"],
      correct: 1,
      topic: "Matrices",
      explain: "Matrix dimension order is written as (number of rows) × (number of columns) = 3 × 4."
    },
    {
      id: "math-17",
      q: "The distance between the origin (0,0) and point (3,4) in Cartesian plane is:",
      options: ["3","4","5","7"],
      correct: 2,
      topic: "Coordinate Geometry",
      explain: "Distance d = √(3² + 4²) = √(9 + 16) = √25 = 5."
    },
    {
      id: "math-18",
      q: "What is the value of 5! (5 factorial)?",
      options: ["20","60","120","24"],
      correct: 2,
      topic: "Permutations & Combinations",
      explain: "5! = 5 × 4 × 3 × 2 × 1 = 120."
    },
    {
      id: "math-19",
      q: "The sum of an infinite geometric series a + ar + ar² + ... converges to a/(1 - r) provided:",
      options: ["|r| > 1","|r| < 1","r = 1","r = 0 only"],
      correct: 1,
      topic: "Sequences and Series",
      explain: "An infinite geometric series converges if and only if absolute common ratio |r| < 1."
    },
    {
      id: "math-20",
      q: "What is d/dx(ln x) for x > 0?",
      options: ["1/x","eˣ","x","ln(x)"],
      correct: 0,
      topic: "Calculus",
      explain: "Derivative of natural logarithm function ln(x) is 1/x."
    },
    {
      id: "math-21",
      q: "In a right-angled triangle, if length of hypotenuse is 10 cm and base is 6 cm, the perpendicular length is:",
      options: ["4 cm","8 cm","12 cm","14 cm"],
      correct: 1,
      topic: "Trigonometry & Geometry",
      explain: "Pythagorean theorem: h² = p² + b² => 100 = p² + 36 => p² = 64 => p = 8 cm."
    },
    {
      id: "math-22",
      q: "What is the period of the sine function sin(x)?",
      options: ["π / 2","π","2π","4π"],
      correct: 2,
      topic: "Trigonometric Functions",
      explain: "The basic sine wave repeats its cycle every 2π radians (360°)."
    },
    {
      id: "math-23",
      q: "The derivative of tan(x) with respect to x is:",
      options: ["sec²(x)","-sec²(x)","cot(x)","cosec²(x)"],
      correct: 0,
      topic: "Calculus",
      explain: "d/dx(tan x) = sec²(x)."
    },
    {
      id: "math-24",
      q: "What is the value of ∫₁² 2x dx?",
      options: ["2","3","4","5"],
      correct: 1,
      topic: "Integration",
      explain: "∫ 2x dx = x². Evaluated from 1 to 2 gives 2² - 1² = 4 - 1 = 3."
    },
    {
      id: "math-25",
      q: "A relation R on a set A is called an equivalence relation if it is:",
      options: ["Reflexive only","Symmetric and transitive only","Reflexive, symmetric, and transitive","Irreflexive"],
      correct: 2,
      topic: "Sets, Functions & Relations",
      explain: "An equivalence relation satisfies reflexivity, symmetry, and transitivity."
    },
    {
      id: "math-26",
      q: "The cross product of two parallel vectors A and B (A × B) is equal to:",
      options: ["Zero vector 0","Unit vector","A · B","1"],
      correct: 0,
      topic: "Vector Algebra",
      explain: "|A × B| = |A||B| sin(0°) = 0."
    },
    {
      id: "math-27",
      q: "What is the nth term formula a_n for an Arithmetic Progression with first term a and common difference d?",
      options: ["a + (n - 1)d","a + nd","a · rⁿ⁻¹","n/2 (2a + d)"],
      correct: 0,
      topic: "Sequences & Series",
      explain: "General term of AP is a_n = a + (n - 1)d."
    },
    {
      id: "math-28",
      q: "The center of the circle given by equation x² + y² - 6x + 8y = 0 is:",
      options: ["(3, -4)","(-3, 4)","(6, -8)","(0, 0)"],
      correct: 0,
      topic: "Conic Sections",
      explain: "Circle x² + y² + 2gx + 2fy + c = 0 has center (-g, -f). Here 2g = -6 => g = -3, 2f = 8 => f = 4. Center is (3, -4)."
    },
    {
      id: "math-29",
      q: "If A and B are independent events, P(A ∩ B) is equal to:",
      options: ["P(A) + P(B)","P(A) · P(B)","P(A) / P(B)","P(A) - P(B)"],
      correct: 1,
      topic: "Probability",
      explain: "For independent events, joint probability P(A ∩ B) = P(A) · P(B)."
    },
    {
      id: "math-30",
      q: "What is d/dx (sin 2x)?",
      options: ["cos 2x","2 cos 2x","-2 cos 2x","2 sin 2x"],
      correct: 1,
      topic: "Calculus",
      explain: "Using chain rule, d/dx(sin 2x) = (cos 2x) · 2 = 2 cos 2x."
    },
    {
      id: "math-31",
      q: "What is log_b(1) for any valid base b > 0?",
      options: ["0","1","b","Undefined"],
      correct: 0,
      topic: "Logarithms",
      explain: "Since b⁰ = 1 for any non-zero base, log_b(1) = 0."
    },
    {
      id: "math-32",
      q: "The derivative of a constant function f(x) = C is:",
      options: ["1","0","C","x"],
      correct: 1,
      topic: "Calculus",
      explain: "Rate of change of a constant value is zero."
    },
    {
      id: "math-33",
      q: "Two lines with slopes m₁ and m₂ are perpendicular if and only if:",
      options: ["m₁ = m₂","m₁ · m₂ = -1","m₁ · m₂ = 1","m₁ + m₂ = 0"],
      correct: 1,
      topic: "Coordinate Geometry",
      explain: "Perpendicular lines have negative reciprocal slopes: m₁ · m₂ = -1."
    },
    {
      id: "math-34",
      q: "What is the value of tan(45°)?",
      options: ["0","0.5","1","√3"],
      correct: 2,
      topic: "Trigonometry",
      explain: "tan(45°) = sin(45°)/cos(45°) = (1/√2) / (1/√2) = 1."
    },
    {
      id: "math-35",
      q: "In binomial expansion of (x + y)ⁿ, the total number of terms in the expansion is:",
      options: ["n - 1","n","n + 1","2ⁿ"],
      correct: 2,
      topic: "Binomial Theorem",
      explain: "The expansion of (x + y)ⁿ contains exactly (n + 1) terms."
    }
  ],
  "Computer Science": [
    {
      id: "cs-1",
      q: "Which data structure operates strictly on a Last-In, First-Out (LIFO) basis?",
      options: ["Queue","Stack","Array","Linked List"],
      correct: 1,
      topic: "Data Structures",
      explain: "A Stack inserts and removes elements from the top end following LIFO principle."
    },
    {
      id: "cs-2",
      q: "What is the average time complexity for searching an element in a balanced Binary Search Tree (BST)?",
      options: ["O(1)","O(n)","O(log n)","O(n log n)"],
      correct: 2,
      topic: "Algorithms & Trees",
      explain: "Balanced BST cuts search space in half at each step, giving O(log n) time complexity."
    },
    {
      id: "cs-3",
      q: "Which layer of the 7-layer OSI network model is responsible for routing packets across logical networks?",
      options: ["Data Link Layer","Network Layer","Transport Layer","Physical Layer"],
      correct: 1,
      topic: "Computer Networks & OSI Model",
      explain: "Network Layer (Layer 3) handles IP addressing and packet routing."
    },
    {
      id: "cs-4",
      q: "In C/C++ programming, which operator is used to access the memory address of a variable?",
      options: ["*","&","->","."],
      correct: 1,
      topic: "C++ Programming & Pointers",
      explain: "The ampersand (&) operator is the address-of operator in C/C++."
    },
    {
      id: "cs-5",
      q: "In Relational Database Systems (RDBMS), a field that uniquely identifies every record in a table is called a:",
      options: ["Foreign Key","Primary Key","Composite Key","Candidate Key"],
      correct: 1,
      topic: "Database Systems & SQL",
      explain: "A Primary Key uniquely identifies each row in a database table and cannot contain NULL values."
    },
    {
      id: "cs-6",
      q: "1 Byte is composed of how many binary bits?",
      options: ["4 bits","8 bits","16 bits","32 bits"],
      correct: 1,
      topic: "Computer Fundamentals",
      explain: "By standard definition, 8 bits equal 1 byte."
    },
    {
      id: "cs-7",
      q: "Which memory component inside CPU stores data and instructions temporarily at ultra-high speed during execution?",
      options: ["Hard Disk","RAM","Cache / Register Memory","ROM"],
      correct: 2,
      topic: "Computer Architecture",
      explain: "CPU Registers and L1/L2 Cache are the fastest memory units directly inside or closest to the processor."
    },
    {
      id: "cs-8",
      q: "In Object-Oriented Programming (OOP), deriving a new class from an existing parent class is known as:",
      options: ["Encapsulation","Polymorphism","Inheritance","Abstraction"],
      correct: 2,
      topic: "Object Oriented Programming",
      explain: "Inheritance allows a child class to inherit properties and methods from a parent class."
    },
    {
      id: "cs-9",
      q: "Which data structure operates on a First-In, First-Out (FIFO) ordering principle?",
      options: ["Stack","Queue","Tree","Graph"],
      correct: 1,
      topic: "Data Structures",
      explain: "A Queue processes elements in arrival order (FIFO)."
    },
    {
      id: "cs-10",
      q: "The hexadecimal number system uses which base?",
      options: ["Base 2","Base 8","Base 10","Base 16"],
      correct: 3,
      topic: "Number Systems",
      explain: "Hexadecimal is a base-16 system using digits 0-9 and letters A-F."
    },
    {
      id: "cs-11",
      q: "Which logic gate outputs 1 (TRUE) only when ALL of its inputs are 1?",
      options: ["OR gate","AND gate","NOT gate","XOR gate"],
      correct: 1,
      topic: "Digital Logic & Boolean Algebra",
      explain: "An AND gate requires all inputs to be TRUE to produce a TRUE output."
    },
    {
      id: "cs-12",
      q: "In SQL, which statement is used to retrieve data from a database table?",
      options: ["UPDATE","DELETE","SELECT","INSERT"],
      correct: 2,
      topic: "Database Systems",
      explain: "The SELECT statement queries and retrieves records from database tables."
    },
    {
      id: "cs-13",
      q: "Which protocol is used for securely transmitting encrypted web pages over the internet?",
      options: ["HTTP","HTTPS","FTP","SMTP"],
      correct: 1,
      topic: "Networking & Security",
      explain: "HTTPS uses SSL/TLS encryption over port 443 to secure web communications."
    },
    {
      id: "cs-14",
      q: "What is the primary role of an Operating System (OS)?",
      options: ["Database editing","Hardware resource management and user interface provider","Web design","Compiler execution"],
      correct: 1,
      topic: "Operating Systems",
      explain: "The OS manages hardware (CPU, memory, devices) and acts as an interface between user and hardware."
    },
    {
      id: "cs-15",
      q: "In C++, which keyword is used to allocate memory dynamically on the heap?",
      options: ["malloc","new","alloc","create"],
      correct: 1,
      topic: "C++ Programming",
      explain: "The 'new' operator dynamically allocates memory on the heap in C++."
    },
    {
      id: "cs-16",
      q: "Which device operates at the Physical layer (Layer 1) of the OSI model to regenerate signals?",
      options: ["Router","Switch","Repeater","Gateway"],
      correct: 2,
      topic: "Networking Hardware",
      explain: "A Repeater operates at Layer 1 to amplify or regenerate degraded physical signals."
    },
    {
      id: "cs-17",
      q: "What is the worst-case time complexity of Quick Sort algorithm?",
      options: ["O(log n)","O(n)","O(n log n)","O(n²)"],
      correct: 3,
      topic: "Algorithms & Sorting",
      explain: "When pivot selection is poor (e.g. sorted array without random pivot), Quick Sort degrades to O(n²)."
    },
    {
      id: "cs-18",
      q: "Which programming paradigm hides internal implementation details and shows only essential interface features?",
      options: ["Abstraction","Inheritance","Overloading","Recursion"],
      correct: 0,
      topic: "OOP Concepts",
      explain: "Abstraction reduces complexity by exposing only relevant operational interfaces."
    },
    {
      id: "cs-19",
      q: "In C programming, the index of the first element in an array is always:",
      options: ["0","1","-1","Depends on declaration"],
      correct: 0,
      topic: "C Programming",
      explain: "Arrays in C/C++ use zero-based indexing."
    },
    {
      id: "cs-20",
      q: "Which network topology connects all nodes directly to a central hub or switch?",
      options: ["Bus topology","Ring topology","Star topology","Mesh topology"],
      correct: 2,
      topic: "Computer Networks",
      explain: "Star topology routes all client communication through a central switch or hub."
    },
    {
      id: "cs-21",
      q: "What does HTML stand for in web development?",
      options: ["Hyper Text Markup Language","High Technical Markup Language","Hyperlink Text Machine Language","Home Tool Markup Language"],
      correct: 0,
      topic: "Web Development",
      explain: "HTML stands for Hyper Text Markup Language."
    },
    {
      id: "cs-22",
      q: "Which memory type is non-volatile and retains firmware boot instructions (BIOS) when powered off?",
      options: ["RAM","ROM","Cache","SRAM"],
      correct: 1,
      topic: "Computer Architecture",
      explain: "ROM (Read-Only Memory) holds permanent non-volatile system startup code."
    },
    {
      id: "cs-23",
      q: "Which protocol is used specifically for sending electronic mail across networks?",
      options: ["POP3","IMAP","SMTP","DNS"],
      correct: 2,
      topic: "Application Layer Protocols",
      explain: "SMTP (Simple Mail Transfer Protocol) is used to transmit outgoing emails."
    },
    {
      id: "cs-24",
      q: "What is the decimal equivalent of binary number 1010₂?",
      options: ["8","10","12","14"],
      correct: 1,
      topic: "Number Systems",
      explain: "1010₂ = 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10."
    },
    {
      id: "cs-25",
      q: "A software tool that translates entire source code of a high-level language into machine code at once is a:",
      options: ["Interpreter","Compiler","Assembler","Linker"],
      correct: 1,
      topic: "System Software",
      explain: "A Compiler translates the entire source program into machine object code before execution."
    },
    {
      id: "cs-26",
      q: "In SQL, which clause is used to filter records based on a specified condition?",
      options: ["ORDER BY","GROUP BY","WHERE","HAVING"],
      correct: 2,
      topic: "Database Systems",
      explain: "The WHERE clause filters rows matching a logical condition."
    },
    {
      id: "cs-27",
      q: "Which boolean algebra law states that A + 0 = A and A · 1 = A?",
      options: ["Complement law","Identity law","Commutative law","Distributive law"],
      correct: 1,
      topic: "Boolean Algebra",
      explain: "Identity law preserves the original boolean variable value when combined with identity constants 0 or 1."
    },
    {
      id: "cs-28",
      q: "In C++, wrapping data members and methods together into a single unit (class) is called:",
      options: ["Inheritance","Polymorphism","Encapsulation","Abstraction"],
      correct: 2,
      topic: "OOP Concepts",
      explain: "Encapsulation bundles data and member functions into a protected class container."
    },
    {
      id: "cs-29",
      q: "Which device connects distinct networks and makes routing decisions based on IP addresses?",
      options: ["Switch","Hub","Router","Bridge"],
      correct: 2,
      topic: "Networking",
      explain: "Routers operate at Network Layer (Layer 3) to route packets across separate IP subnets."
    },
    {
      id: "cs-30",
      q: "In C language, which symbol terminates every executable statement?",
      options: [":",";",".",","],
      correct: 1,
      topic: "C Syntax",
      explain: "C statement syntax requires a semicolon (;) as statement terminator."
    },
    {
      id: "cs-31",
      q: "A condition where two or more processes are unable to proceed because each is waiting for the other to release resources is:",
      options: ["Starvation","Deadlock","Paging","Thrashing"],
      correct: 1,
      topic: "Operating Systems",
      explain: "Deadlock occurs when processes hold resources while waiting for other held resources in a circular wait dependency."
    },
    {
      id: "cs-32",
      q: "Which data structure uses pointers to connect nodes located non-contiguously in memory?",
      options: ["Array","Linked List","Stack array","Matrix"],
      correct: 1,
      topic: "Data Structures",
      explain: "A Linked List consists of nodes containing data and pointer links to next nodes in memory."
    },
    {
      id: "cs-33",
      q: "What is the primary function of DNS (Domain Name System) on the internet?",
      options: ["Translating domain names into IP addresses","Encrypting web traffic","Filtering spam emails","Allocating bandwidth"],
      correct: 0,
      topic: "Networking",
      explain: "DNS maps human-readable hostname domain strings (e.g. example.com) to numeric IP addresses."
    },
    {
      id: "cs-34",
      q: "In Boolean logic, the dual of De Morgan's law (A · B)' is:",
      options: ["A' + B'","A' · B'","(A + B)'","A + B"],
      correct: 0,
      topic: "Boolean Logic",
      explain: "De Morgan's theorem states (A · B)' = A' + B'."
    },
    {
      id: "cs-35",
      q: "Which loop structure in C/C++ guarantees execution of its code body AT LEAST once?",
      options: ["for loop","while loop","do-while loop","nested loop"],
      correct: 2,
      topic: "Programming Control Structures",
      explain: "A do-while loop evaluates its exit condition at the end of the iteration body."
    }
  ],
  "English": [
    {
      id: "eng-1",
      q: "Choose the word most nearly SYNONYMOUS in meaning to 'BENEVOLENT':",
      options: ["Hostile","Kindhearted","Greedy","Arrogant"],
      correct: 1,
      topic: "Vocabulary & Synonyms",
      explain: "Benevolent means well-meaning, kindly, and charitable."
    },
    {
      id: "eng-2",
      q: "Identify the grammatically correct sentence:",
      options: ["Neither of the answers are correct.","Neither of the answers is correct.","Neither of the answer are correct.","Neither of the answers were correct."],
      correct: 1,
      topic: "Grammar & Subject-Verb Agreement",
      explain: "The indefinite pronoun 'Neither' is singular and requires the singular verb 'is'."
    },
    {
      id: "eng-3",
      q: "Choose the word most nearly ANTONYMOUS (opposite) in meaning to 'CANDID':",
      options: ["Frank","Secretive / Deceitful","Honest","Sincere"],
      correct: 1,
      topic: "Vocabulary & Antonyms",
      explain: "Candid means open and straightforward; its opposite is secretive or deceitful."
    },
    {
      id: "eng-4",
      q: "In the sentence 'The classroom was a zoo during break time', which figure of speech is used?",
      options: ["Simile","Metaphor","Personification","Hyperbole"],
      correct: 1,
      topic: "Literary Devices & Figures of Speech",
      explain: "A Metaphor makes a direct comparison between two unlike things without using 'like' or 'as'."
    },
    {
      id: "eng-5",
      q: "Fill in the correct preposition: 'She is very fond ___ listening to classical music.'",
      options: ["with","of","about","at"],
      correct: 1,
      topic: "Prepositions",
      explain: "The adjective 'fond' takes the fixed preposition 'of'."
    },
    {
      id: "eng-6",
      q: "Convert to Passive Voice: 'The mechanic repaired the car.'",
      options: ["The car is repaired by the mechanic.","The car was repaired by the mechanic.","The car had been repaired by mechanic.","The car repair by the mechanic."],
      correct: 1,
      topic: "Active & Passive Voice",
      explain: "Simple past active ('repaired') converts to 'was repaired' in passive voice."
    },
    {
      id: "eng-7",
      q: "Identify the part of speech of the underlined word: 'He walked *swiftly* to catch the bus.'",
      options: ["Adjective","Adverb","Noun","Conjunction"],
      correct: 1,
      topic: "Parts of Speech",
      explain: "'Swiftly' modifies the verb 'walked', functioning as an adverb of manner."
    },
    {
      id: "eng-8",
      q: "Choose the correct indirect speech form: He said, 'I am reading a novel.'",
      options: ["He said that he is reading a novel.","He said that he was reading a novel.","He told that he had read a novel.","He says that he read a novel."],
      correct: 1,
      topic: "Direct & Indirect Speech",
      explain: "Present continuous ('am reading') in reported speech changes to past continuous ('was reading')."
    },
    {
      id: "eng-9",
      q: "What is the meaning of the idiom 'To burn the candle at both ends'?",
      options: ["To waste money recklessly","To work late into the night and early in the morning","To ruin a friendship","To celebrate enthusiastically"],
      correct: 1,
      topic: "Idioms & Phrasal Verbs",
      explain: "The idiom means exhausting oneself by working continuous long hours."
    },
    {
      id: "eng-10",
      q: "Identify the sentence that uses correct punctuation:",
      options: ["However I decided to stay home.","However, I decided to stay home.","However I decided, to stay home.","However; I decided to stay home"],
      correct: 1,
      topic: "Punctuation Rules",
      explain: "Transition adverbs like 'However' at the start of a clause must be followed by a comma."
    },
    {
      id: "eng-11",
      q: "Choose the word spelled correctly:",
      options: ["Accommodate","Acommodate","Accomodate","Acomodate"],
      correct: 0,
      topic: "Spelling Accuracy",
      explain: "'Accommodate' has double 'c' and double 'm'."
    },
    {
      id: "eng-12",
      q: "Select the sentence with correct subject-verb agreement:",
      options: ["Each of the students have completed the project.","Each of the students has completed the project.","Each of the student have completed the project.","Each of students having completed the project."],
      correct: 1,
      topic: "Grammar Rules",
      explain: "'Each' is a singular subject requiring the singular verb 'has'."
    },
    {
      id: "eng-13",
      q: "Choose the correct antonym for 'OBDIVIOUS' / 'OBSOLETE':",
      options: ["Outdated","Modern / Current","Ancient","Archaic"],
      correct: 1,
      topic: "Vocabulary",
      explain: "'Obsolete' means no longer produced or used; its opposite is modern or current."
    },
    {
      id: "eng-14",
      q: "In poetry, the repetition of initial consonant sounds in consecutive words is termed:",
      options: ["Assonance","Alliteration","Consonance","Onomatopoeia"],
      correct: 1,
      topic: "Literary Devices",
      explain: "Alliteration is the repetition of identical initial consonant sounds (e.g. 'sweet birds sang')."
    },
    {
      id: "eng-15",
      q: "Complete with appropriate conjunction: 'Work hard ___ you should fail.'",
      options: ["unless","lest","otherwise","until"],
      correct: 1,
      topic: "Conjunctions",
      explain: "'Lest' means 'for fear that' and is naturally paired with 'should'."
    },
    {
      id: "eng-16",
      q: "Identify the type of sentence: 'Although it was raining, we enjoyed the football match.'",
      options: ["Simple sentence","Compound sentence","Complex sentence","Compound-complex sentence"],
      correct: 2,
      topic: "Sentence Structure",
      explain: "A sentence containing one independent clause and at least one dependent clause introduced by 'Although' is a Complex sentence."
    },
    {
      id: "eng-17",
      q: "Choose the synonym for 'METICULOUS':",
      options: ["Careless","Thorough / Very careful","Hasty","Sloppy"],
      correct: 1,
      topic: "Vocabulary",
      explain: "Meticulous means showing great attention to detail; very careful and precise."
    },
    {
      id: "eng-18",
      q: "Which option provides the correct passive form of 'Who wrote this famous poem?'",
      options: ["By whom was this famous poem written?","Who was written this famous poem?","By whom this famous poem was written?","Whom wrote this famous poem?"],
      correct: 0,
      topic: "Active & Passive Voice",
      explain: "'Who' changes to 'By whom' in passive questions: By whom + was + subject + past participle."
    },
    {
      id: "eng-19",
      q: "Fill in the blank: 'He insisted ___ paying for the dinner.'",
      options: ["for","on","in","to"],
      correct: 1,
      topic: "Prepositions",
      explain: "The verb 'insist' takes the fixed preposition 'on' followed by a gerund."
    },
    {
      id: "eng-20",
      q: "What figure of speech gives human qualities to non-human objects or ideas?",
      options: ["Personification","Simile","Metaphor","Oxymoron"],
      correct: 0,
      topic: "Literary Devices",
      explain: "Personification endows abstract concepts or inanimate objects with human attributes."
    },
    {
      id: "eng-21",
      q: "Choose the word most nearly opposite in meaning to 'DILIGENT':",
      options: ["Hardworking","Lazy / Idle","Persistent","Attentive"],
      correct: 1,
      topic: "Antonyms",
      explain: "Diligent means showing care and conscientiousness; its opposite is lazy or idle."
    },
    {
      id: "eng-22",
      q: "Identify the correct conditional sentence:",
      options: ["If he works hard, he will pass the examination.","If he work hard, he will pass examination.","If he worked hard, he will pass examination.","If he will work hard, he passes examination."],
      correct: 0,
      topic: "Conditionals",
      explain: "First conditional rule: If + simple present (works), main clause + simple future (will pass)."
    },
    {
      id: "eng-23",
      q: "What is the collective noun for a group of lions?",
      options: ["Flock","Herd","Pride","Pack"],
      correct: 2,
      topic: "Nouns & Grammar",
      explain: "A group of lions is called a pride."
    },
    {
      id: "eng-24",
      q: "Select the option that correctly completes: 'The news ___ true.'",
      options: ["are","is","were","have been"],
      correct: 1,
      topic: "Subject-Verb Agreement",
      explain: "'News' is an uncountable singular noun and takes a singular verb 'is'."
    },
    {
      id: "eng-25",
      q: "Choose the synonym for 'PRUDENT':",
      options: ["Reckless","Wise / Cautious","Rash","Foolish"],
      correct: 1,
      topic: "Vocabulary",
      explain: "Prudent means acting with or showing care and thought for the future; wise."
    },
    {
      id: "eng-26",
      q: "Identify the figure of speech in: 'She was as brave as a lion.'",
      options: ["Metaphor","Simile","Hyperbole","Irony"],
      correct: 1,
      topic: "Literary Terms",
      explain: "A Simile explicitly compares two things using 'as' or 'like'."
    },
    {
      id: "eng-27",
      q: "Choose the correct phrasal verb: 'He promises to ___ smoking next month.'",
      options: ["give up","give in","give away","give out"],
      correct: 0,
      topic: "Phrasal Verbs",
      explain: "'Give up' means to quit or cease a habit."
    },
    {
      id: "eng-28",
      q: "Identify the error in: 'One of my friend is moving abroad.'",
      options: ["Change 'friend' to 'friends'","Change 'is' to 'are'","Change 'abroad' to 'foreign'","No error"],
      correct: 0,
      topic: "Grammar Correction",
      explain: "The structure 'One of + plural noun' requires 'One of my friends'."
    },
    {
      id: "eng-29",
      q: "Choose the correct spelling:",
      options: ["Maintenance","Maintenence","Maintanance","Maintainance"],
      correct: 0,
      topic: "Spelling",
      explain: "'Maintenance' is spelled with 'a-i-n-t-e-n-a-n-c-e'."
    },
    {
      id: "eng-30",
      q: "Select the antonym for 'TRANSIENT':",
      options: ["Temporary","Permanent / Lasting","Fleeting","Brief"],
      correct: 1,
      topic: "Vocabulary",
      explain: "Transient means lasting only a short time; its opposite is permanent."
    },
    {
      id: "eng-31",
      q: "What does the idiom 'Break the ice' mean?",
      options: ["To fracture ice on a lake","To initiate conversation in a social setting","To feel extremely cold","To make an argument worse"],
      correct: 1,
      topic: "Idioms",
      explain: "'Break the ice' means to relieve tension and start conversation among unfamiliar people."
    },
    {
      id: "eng-32",
      q: "Fill in the blank: 'He is senior ___ me in rank.'",
      options: ["than","to","from","with"],
      correct: 1,
      topic: "Prepositions & Degrees of Comparison",
      explain: "Latin comparative adjectives like senior, junior, superior, inferior take 'to', not 'than'."
    },
    {
      id: "eng-33",
      q: "Choose the word that best completes: 'The doctor advised him to abstain ___ alcohol.'",
      options: ["from","off","with","against"],
      correct: 0,
      topic: "Prepositions",
      explain: "'Abstain' takes the fixed preposition 'from'."
    },
    {
      id: "eng-34",
      q: "What is the plural form of the word 'Criterion'?",
      options: ["Criterions","Criteria","Criterias","Criterion"],
      correct: 1,
      topic: "Plural Nouns",
      explain: "The Greek origin word 'Criterion' forms its plural as 'Criteria'."
    },
    {
      id: "eng-35",
      q: "Identify the sentence written in Past Perfect Tense:",
      options: ["She had already completed her homework before dinner.","She has completed her homework.","She completed her homework.","She was completing her homework."],
      correct: 0,
      topic: "Tenses",
      explain: "Past Perfect Tense uses 'had' + past participle verb form ('had completed')."
    }
  ],
  "Analytical Reasoning": [
    {
      id: "ana-1",
      q: "If A is taller than B, and B is taller than C, who is the shortest?",
      options: ["A","B","C","Cannot be determined"],
      correct: 2,
      topic: "Sequencing & Ordering",
      explain: "Since A > B and B > C, the order is A > B > C, making C the shortest."
    },
    {
      id: "ana-2",
      q: "Five people (P, Q, R, S, T) sit in a row. P is next to Q, and R is next to S. If T is at the far left and P is at the far right, who is in the middle?",
      options: ["Q","R","S","Cannot be determined without more info"],
      correct: 3,
      topic: "Seating Arrangement",
      explain: "Without knowing the exact order between (Q, P) or (R, S), the exact middle position cannot be uniquely determined."
    },
    {
      id: "ana-3",
      q: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely:",
      options: ["Lazzies","Razzies only","Not Lazzies","Sometimes Lazzies"],
      correct: 0,
      topic: "Syllogistic Deductions",
      explain: "Bloops ⊂ Razzies ⊂ Lazzies, so Bloops ⊂ Lazzies."
    },
    {
      id: "ana-4",
      q: "Complete the numerical pattern: 2, 4, 8, 16, 32, __",
      options: ["48","64","128","36"],
      correct: 1,
      topic: "Pattern Recognition",
      explain: "Each number is multiplied by 2. 32 × 2 = 64."
    },
    {
      id: "ana-5",
      q: "In a family, X is the brother of Y. Y is the mother of Z. What is the relation of X to Z?",
      options: ["Father","Maternal Uncle","Brother","Grandfather"],
      correct: 1,
      topic: "Blood Relations",
      explain: "The brother of one's mother is one's maternal uncle."
    },
    {
      id: "ana-6",
      q: "If RED is coded as 18-5-4 in a code language, how is BED coded?",
      options: ["2-5-4","2-4-5","1-5-4","3-5-4"],
      correct: 0,
      topic: "Coding & Decoding",
      explain: "Letters are converted to alphabetical position: B=2, E=5, D=4 => 2-5-4."
    },
    {
      id: "ana-7",
      q: "If 3 x + 7 = 22, what is the value of x?",
      options: ["3","5","7","15"],
      correct: 1,
      topic: "Quantitative Analytical",
      explain: "3x = 22 - 7 = 15 => x = 5."
    },
    {
      id: "ana-8",
      q: "A clock shows 3:00. What is the angle between the hour hand and minute hand?",
      options: ["45°","60°","90°","120°"],
      correct: 2,
      topic: "Clock Angles",
      explain: "At 3:00, minute hand points to 12 and hour hand points to 3. Angle = 3 × 30° = 90°."
    },
    {
      id: "ana-9",
      q: "Find the odd one out: Apple, Banana, Mango, Potato",
      options: ["Apple","Banana","Mango","Potato"],
      correct: 3,
      topic: "Classification",
      explain: "Potato is a root tuber vegetable, whereas Apple, Banana, and Mango are tree/plant fruits."
    },
    {
      id: "ana-10",
      q: "If a car travels 60 km in 45 minutes, what is its speed in km/h?",
      options: ["80 km/h","75 km/h","90 km/h","100 km/h"],
      correct: 0,
      topic: "Speed & Time",
      explain: "45 min = 0.75 hours. Speed = 60 / 0.75 = 80 km/h."
    },
    {
      id: "ana-11",
      q: "Pointing to a photograph, a man says: 'He is the son of my father's only son.' Who is in the photo?",
      options: ["His brother","His son","His nephew","His father"],
      correct: 1,
      topic: "Blood Relations",
      explain: "'My father's only son' refers to the man himself. Therefore, the photo is of his son."
    },
    {
      id: "ana-12",
      q: "Complete the letter series: A, C, E, G, I, __",
      options: ["J","K","L","M"],
      correct: 1,
      topic: "Letter Series",
      explain: "The pattern skips one letter each step (+2 in alphabet): I + 2 = K."
    },
    {
      id: "ana-13",
      q: "If CAT is coded as 24 (3+1+20), what is the code value for DOG?",
      options: ["26","23","28","30"],
      correct: 0,
      topic: "Coding Decoding",
      explain: "D=4, O=15, G=7. Sum = 4 + 15 + 7 = 26."
    },
    {
      id: "ana-14",
      q: "A person walks 4 km North, then turns right and walks 3 km. What is the direct distance from the starting point?",
      options: ["7 km","5 km","1 km","12 km"],
      correct: 1,
      topic: "Direction Sense",
      explain: "Using Pythagoras theorem d = √(4² + 3²) = √(16 + 9) = √25 = 5 km."
    },
    {
      id: "ana-15",
      q: "Statement: All students passed the exam. Ali is a student. Conclusion:",
      options: ["Ali passed the exam","Ali failed the exam","Ali did not take the exam","Cannot be determined"],
      correct: 0,
      topic: "Deductive Logic",
      explain: "Direct logical deduction from universal affirmative premise."
    },
    {
      id: "ana-16",
      q: "Which number replaces the question mark: 5, 10, 20, 40, ?",
      options: ["50","60","80","100"],
      correct: 2,
      topic: "Number Sequences",
      explain: "Double the previous term: 40 × 2 = 80."
    },
    {
      id: "ana-17",
      q: "If SOUTH-EAST becomes NORTH, what does WEST become?",
      options: ["SOUTH-EAST","NORTH-EAST","SOUTH-WEST","NORTH-WEST"],
      correct: 0,
      topic: "Direction Transformation",
      explain: "Rotation is 135° counter-clockwise. WEST rotated 135° CCW becomes SOUTH-EAST."
    },
    {
      id: "ana-18",
      q: "How many 3-digit numbers can be formed using digits 1, 2, 3 without repetition?",
      options: ["3","6","9","27"],
      correct: 1,
      topic: "Permutations",
      explain: "3! = 3 × 2 × 1 = 6 numbers."
    },
    {
      id: "ana-19",
      q: "If 1st January 2024 was a Monday, what day of the week was 8th January 2024?",
      options: ["Sunday","Monday","Tuesday","Wednesday"],
      correct: 1,
      topic: "Calendar Logic",
      explain: "7 days later is the exact same day of the week (Monday)."
    },
    {
      id: "ana-20",
      q: "Find the next term in series: Z, X, V, T, __",
      options: ["R","S","Q","P"],
      correct: 0,
      topic: "Alphabetical Order",
      explain: "Moving backward by 2 letters in alphabet: T - 2 = R."
    },
    {
      id: "ana-21",
      q: "In a class of 30 students, Sarah ranks 10th from the top. What is her rank from the bottom?",
      options: ["20th","21st","22nd","19th"],
      correct: 1,
      topic: "Ranking & Position",
      explain: "Rank from bottom = (Total + 1) - Rank from top = (30 + 1) - 10 = 21st."
    },
    {
      id: "ana-22",
      q: "If '+' means multiply and '×' means add, what is 4 + 5 × 3?",
      options: ["27","23","20","15"],
      correct: 1,
      topic: "Operator Symbol Logic",
      explain: "4 + 5 × 3 becomes 4 × 5 + 3 = 20 + 3 = 23."
    },
    {
      id: "ana-23",
      q: "Which word does NOT belong with the others: Kilometer, Meter, Gram, Centimeter?",
      options: ["Kilometer","Meter","Gram","Centimeter"],
      correct: 2,
      topic: "Classification",
      explain: "Gram measures mass, while Kilometer, Meter, and Centimeter measure length."
    },
    {
      id: "ana-24",
      q: "If A = 1, B = 2, C = 3, what is the product value of B × C × D?",
      options: ["12","24","6","18"],
      correct: 1,
      topic: "Analytical Substitution",
      explain: "B=2, C=3, D=4. Product = 2 × 3 × 4 = 24."
    },
    {
      id: "ana-25",
      q: "Find the missing term: 1, 4, 9, 16, 25, __",
      options: ["30","36","49","64"],
      correct: 1,
      topic: "Square Sequences",
      explain: "The series represents perfect squares: 1², 2², 3², 4², 5², 6² = 36."
    },
    {
      id: "ana-26",
      q: "If A is to B as 1 is to 2, then C (3) is to D (4) as 3 is to:",
      options: ["3","4","6","12"],
      correct: 1,
      topic: "Analogy",
      explain: "Proportional positional pairing gives 4."
    },
    {
      id: "ana-27",
      q: "If all roses are flowers and some flowers fade quickly, which statement MUST be true?",
      options: ["All roses fade quickly","Some roses are flowers","No roses fade quickly","Roses are not flowers"],
      correct: 1,
      topic: "Logical Relations",
      explain: "Since all roses are flowers, it is necessarily true that some roses are flowers."
    },
    {
      id: "ana-28",
      q: "A man is 4 times as old as his son. In 20 years, he will be twice as old as his son. How old is the son now?",
      options: ["5 years","10 years","15 years","20 years"],
      correct: 1,
      topic: "Age Problems",
      explain: "Let son's age = x. Father = 4x. 4x + 20 = 2(x + 20) => 2x = 20 => x = 10."
    },
    {
      id: "ana-29",
      q: "Choose the word that completes the analogy: Light : Darkness :: Knowledge : ?",
      options: ["Ignorance","Intelligence","Wisdom","School"],
      correct: 0,
      topic: "Analogy",
      explain: "Darkness is the absence of light; Ignorance is the absence of knowledge."
    },
    {
      id: "ana-30",
      q: "Find the odd number: 13, 17, 19, 21, 23",
      options: ["13","17","21","23"],
      correct: 2,
      topic: "Number Logic",
      explain: "21 is a composite number (3 × 7), whereas 13, 17, 19, 23 are prime numbers."
    },
    {
      id: "ana-31",
      q: "A cube has how many flat faces?",
      options: ["4","6","8","12"],
      correct: 1,
      topic: "Spatial Reasoning",
      explain: "A standard geometric cube has 6 square faces."
    },
    {
      id: "ana-32",
      q: "Complete the pattern: 3, 6, 11, 18, 27, __",
      options: ["38","36","35","40"],
      correct: 0,
      topic: "Pattern Analysis",
      explain: "Differences are +3, +5, +7, +9, +11. 27 + 11 = 38."
    },
    {
      id: "ana-33",
      q: "If BOOK is coded as 2-15-15-11, how is PEN coded?",
      options: ["16-5-14","15-5-14","16-6-14","16-5-15"],
      correct: 0,
      topic: "Coding Decoding",
      explain: "P=16, E=5, N=14 => 16-5-14."
    },
    {
      id: "ana-34",
      q: "If A > B and B = C, which statement is guaranteed?",
      options: ["A > C","A < C","A = C","B > A"],
      correct: 0,
      topic: "Transitive Properties",
      explain: "Since B = C, substituting C for B in A > B gives A > C."
    },
    {
      id: "ana-35",
      q: "Which direction is opposite to SOUTH-WEST?",
      options: ["NORTH-WEST","NORTH-EAST","SOUTH-EAST","NORTH"],
      correct: 1,
      topic: "Direction Sense",
      explain: "The exact 180° opposite of South-West is North-East."
    }
  ],
  "Logical Reasoning": [
    {
      id: "log-1",
      q: "All mammals are warm-blooded. All whales are mammals. Therefore:",
      options: ["All whales are warm-blooded","Some whales are cold-blooded","No whales are mammals","Whales are fish"],
      correct: 0,
      topic: "Categorical Syllogism",
      explain: "Standard deductive syllogism: Whales ⊂ Mammals ⊂ Warm-blooded."
    },
    {
      id: "log-2",
      q: "Premise 1: If it rains, the grass gets wet. Premise 2: It is raining. Conclusion:",
      options: ["The grass is wet","The grass is dry","It is not raining","The sun is shining"],
      correct: 0,
      topic: "Modus Ponens",
      explain: "By Modus Ponens (If P then Q; P; therefore Q), the grass gets wet."
    },
    {
      id: "log-3",
      q: "Premise 1: If the battery is dead, the car will not start. Premise 2: The car started. Conclusion:",
      options: ["The battery is not dead","The battery is dead","The car is broken","No conclusion possible"],
      correct: 0,
      topic: "Modus Tollens",
      explain: "By Modus Tollens (If P then Q; Not Q; therefore Not P), the battery is not dead."
    },
    {
      id: "log-4",
      q: "Which statement represents a logical fallacy known as Circular Reasoning?",
      options: ["P is true because Q is true, and Q is true because P is true","P leads to Q","Either P or Q is true","P is false therefore Q is true"],
      correct: 0,
      topic: "Logical Fallacies",
      explain: "Circular reasoning (begging the question) assumes the premise in its argument."
    },
    {
      id: "log-5",
      q: "No reptiles have fur. All snakes are reptiles. Therefore:",
      options: ["No snakes have fur","All snakes have fur","Some snakes have fur","Snakes are mammals"],
      correct: 0,
      topic: "Negative Syllogism",
      explain: "Since snakes are entirely contained within reptiles and no reptiles have fur, no snakes have fur."
    },
    {
      id: "log-6",
      q: "Assume: 'Some doctors are surgeons. All surgeons are graduates.' Which conclusion logically follows?",
      options: ["Some doctors are graduates","All doctors are graduates","No doctors are graduates","All graduates are surgeons"],
      correct: 0,
      topic: "Syllogisms",
      explain: "The subset of doctors who are surgeons are also graduates, so 'Some doctors are graduates' is valid."
    },
    {
      id: "log-7",
      q: "Statement: 'If you study, you will pass.' Logical Contrapositive statement:",
      options: ["If you do not pass, you did not study","If you pass, you studied","If you do not study, you will fail","Passing means studying"],
      correct: 0,
      topic: "Logical Equivalents",
      explain: "The contrapositive of 'P → Q' is 'Not Q → Not P', which is logically equivalent."
    },
    {
      id: "log-8",
      q: "Which conclusion is VALID? 'All roses are flowers. This plant is not a flower.'",
      options: ["This plant is not a rose","This plant is a rose","This plant is a tree","This plant will bloom"],
      correct: 0,
      topic: "Syllogistic Logic",
      explain: "Since roses are flowers, anything that is not a flower cannot be a rose."
    },
    {
      id: "log-9",
      q: "Statement: 'Either Ali goes to school or he goes to the library.' Ali did not go to school. Therefore:",
      options: ["Ali went to the library","Ali stayed home","Ali went to market","Ali went to school"],
      correct: 0,
      topic: "Disjunctive Syllogism",
      explain: "By disjunctive elimination (P or Q; Not P; therefore Q), Ali went to the library."
    },
    {
      id: "log-10",
      q: "Identify the logical flaw in: 'Every time I wash my car, it rains. Washing my car causes rain.'",
      options: ["Post hoc ergo propter hoc (false cause)","Ad hominem","Straw man","Red herring"],
      correct: 0,
      topic: "Logical Fallacies",
      explain: "Assuming temporal sequence implies causation is the Post Hoc fallacy."
    },
    {
      id: "log-11",
      q: "All fruits contain seeds. An apple is a fruit. Therefore:",
      options: ["An apple contains seeds","An apple has no seeds","All seeds are apples","Apples are vegetables"],
      correct: 0,
      topic: "Deductive Reasoning",
      explain: "Apples inherit all properties defined for the set 'fruits'."
    },
    {
      id: "log-12",
      q: "If 'No metals are liquids' and 'Mercury is a liquid', then:",
      options: ["Mercury is not a metal (under strict categorical logic definition)","Mercury is a metal","All liquids are metals","Metals are liquids"],
      correct: 0,
      topic: "Formal Logic",
      explain: "Strict categorical logic dictates Mercury is excluded from the set of metals defined by premise 1."
    },
    {
      id: "log-13",
      q: "Statement: 'Only members can vote.' John voted. Conclusion:",
      options: ["John is a member","John is not a member","John is the president","Non-members voted"],
      correct: 0,
      topic: "Conditional Deduction",
      explain: "'Only members can vote' means Voting → Member. Since John voted, John is a member."
    },
    {
      id: "log-14",
      q: "Find the logical inverse of 'If it is a bird, it has wings':",
      options: ["If it is not a bird, it does not have wings","If it has wings, it is a bird","If it has no wings, it is not a bird","Birds fly"],
      correct: 0,
      topic: "Logical Inverse",
      explain: "Inverse of 'P → Q' is 'Not P → Not Q'."
    },
    {
      id: "log-15",
      q: "Assume: 'All A are B. No B are C.' What can be concluded about A and C?",
      options: ["No A are C","All A are C","Some A are C","Some C are A"],
      correct: 0,
      topic: "Categorical Propositions",
      explain: "Since set A is entirely inside B, and B has zero overlap with C, A has zero overlap with C."
    },
    {
      id: "log-16",
      q: "Which argument is sound?",
      options: ["Valid logic with factually true premises","Invalid logic with true premises","Valid logic with false premises","Any argument with a conclusion"],
      correct: 0,
      topic: "Argument Evaluation",
      explain: "An argument is sound if and only if it is valid AND all its premises are factually true."
    },
    {
      id: "log-17",
      q: "Statement: 'All cars have wheels.' Conclusion 1: 'A bicycle is a car.' Conclusion 2: 'A vehicle without wheels is not a car.'",
      options: ["Only Conclusion 2 is valid","Only Conclusion 1 is valid","Both conclusions are valid","Neither conclusion is valid"],
      correct: 0,
      topic: "Evaluating Conclusions",
      explain: "Conclusion 2 is the contrapositive of the premise (No wheels → Not a car), which is logically valid."
    },
    {
      id: "log-18",
      q: "If 'Some A are B' and 'Some B are C', does it logically follow that 'Some A are C'?",
      options: ["No, not necessarily valid","Yes, always valid","Only if A = B","Only if C = A"],
      correct: 0,
      topic: "Syllogisms & Fallacies",
      explain: "Undistributed middle term ('B') means no valid relationship between A and C is established."
    },
    {
      id: "log-19",
      q: "What is the negation of the proposition 'All cats are friendly'?",
      options: ["At least one cat is not friendly","No cats are friendly","All cats are unfriendly","Some cats are friendly"],
      correct: 0,
      topic: "Logical Negation",
      explain: "The formal negation of 'All A are B' is 'Some A are not B' (or at least one A is not B)."
    },
    {
      id: "log-20",
      q: "Premise 1: Every prime number greater than 2 is odd. Premise 2: 37 is a prime number greater than 2. Conclusion:",
      options: ["37 is an odd number","37 is an even number","37 is divisible by 2","37 is not odd"],
      correct: 0,
      topic: "Mathematical Logic",
      explain: "37 satisfies the condition and inherits the property of being odd."
    },
    {
      id: "log-21",
      q: "Statement: 'If a triangle is equilateral, then it is equiangular.' A certain triangle is not equiangular. Conclusion:",
      options: ["It is not equilateral","It is equilateral","It is a right triangle","It has 4 sides"],
      correct: 0,
      topic: "Modus Tollens",
      explain: "Negating the consequent (equiangular) logically negates the antecedent (equilateral)."
    },
    {
      id: "log-22",
      q: "Which statement is logically equivalent to 'If you smoke, your health suffers'?",
      options: ["If your health does not suffer, you do not smoke","If you do not smoke, your health does not suffer","If your health suffers, you smoke","Smoking is healthy"],
      correct: 0,
      topic: "Contrapositive Equivalence",
      explain: "The contrapositive 'Not Q → Not P' is logically identical to 'P → Q'."
    },
    {
      id: "log-23",
      q: "Statement: 'All birds lay eggs. Penguins are birds.' Conclusion:",
      options: ["Penguins lay eggs","Penguins cannot fly","Penguins live in cold weather","All egg layers are penguins"],
      correct: 0,
      topic: "Deductive Proof",
      explain: "Penguins inherit the property of laying eggs from the universal premise."
    },
    {
      id: "log-24",
      q: "What type of reasoning moves from specific observed cases to a general probabilistic rule?",
      options: ["Inductive reasoning","Deductive reasoning","Abductive reasoning","Tautology"],
      correct: 0,
      topic: "Types of Reasoning",
      explain: "Inductive reasoning generalizes broad principles from specific observations."
    },
    {
      id: "log-25",
      q: "Premise: 'No odd numbers are divisible by 2.' Number 15 is odd. Conclusion:",
      options: ["15 is not divisible by 2","15 is divisible by 2","15 is an even number","15 equals 2"],
      correct: 0,
      topic: "Categorical Logic",
      explain: "Since 15 belongs to the set of odd numbers, it is not divisible by 2."
    },
    {
      id: "log-26",
      q: "In logic, a compound proposition that is ALWAYS true regardless of the truth values of its component variables is called a:",
      options: ["Tautology","Contradiction","Contingency","Fallacy"],
      correct: 0,
      topic: "Propositional Logic",
      explain: "A Tautology (e.g. P ∨ ¬P) is true under all possible truth value assignments."
    },
    {
      id: "log-27",
      q: "In logic, a compound proposition that is ALWAYS false under all truth value assignments is called a:",
      options: ["Contradiction","Tautology","Hypothesis","Axiom"],
      correct: 0,
      topic: "Propositional Logic",
      explain: "A Contradiction (e.g. P ∧ ¬P) is false in all rows of its truth table."
    },
    {
      id: "log-28",
      q: "Statement: 'If X is true, Y is false.' Given Y is true. What can be concluded about X?",
      options: ["X is false","X is true","X is uncertain","Y is false"],
      correct: 0,
      topic: "Modus Tollens",
      explain: "Since Y is true, the consequent ('Y is false') is false. Thus X must be false."
    },
    {
      id: "log-29",
      q: "Premise: 'All squares are rectangles. All rectangles have 4 sides.' Conclusion:",
      options: ["All squares have 4 sides","All 4-sided figures are squares","Some squares are triangles","No squares have 4 sides"],
      correct: 0,
      topic: "Chain Syllogism",
      explain: "Transitive property: Squares ⊂ Rectangles ⊂ 4-sided figures."
    },
    {
      id: "log-30",
      q: "Identify the fallacy in: 'You should support this law because everyone else is supporting it.'",
      options: ["Bandwagon fallacy (Argumentum ad populum)","Ad hominem","False dilemma","Slippery slope"],
      correct: 0,
      topic: "Fallacies",
      explain: "Appealing to popularity rather than factual merit is the Bandwagon fallacy."
    },
    {
      id: "log-31",
      q: "Which set operation corresponds to the logical 'AND' connective?",
      options: ["Intersection (∩)","Union (∪)","Difference (-)","Complement (')"],
      correct: 0,
      topic: "Logic and Sets",
      explain: "Element x ∈ (A ∩ B) if and only if x ∈ A AND x ∈ B."
    },
    {
      id: "log-32",
      q: "Which set operation corresponds to the logical 'OR' connective?",
      options: ["Union (∪)","Intersection (∩)","Subset (⊂)","Complement (')"],
      correct: 0,
      topic: "Logic and Sets",
      explain: "Element x ∈ (A ∪ B) if and only if x ∈ A OR x ∈ B."
    },
    {
      id: "log-33",
      q: "Statement: 'If you break the law, you get arrested.' Fact: Hassan was arrested. Can we logically conclude he broke the law?",
      options: ["No, asserting the consequent is an invalid fallacy","Yes, definitely","Yes, legally proved","He is innocent"],
      correct: 0,
      topic: "Fallacy of Asserting Consequent",
      explain: "People can be arrested for other reasons; 'If P then Q; Q; therefore P' is a formal logical fallacy."
    },
    {
      id: "log-34",
      q: "Statement: 'All prime numbers greater than 2 are odd.' Is the statement '2 is an odd prime' true?",
      options: ["False","True","Undetermined","Tautology"],
      correct: 0,
      topic: "Fact Verification",
      explain: "2 is the only even prime number; it is not odd."
    },
    {
      id: "log-35",
      q: "If P → Q is true and Q → R is true, then P → R is:",
      options: ["Always true (Hypothetical Syllogism)","Always false","Sometimes true","Undefined"],
      correct: 0,
      topic: "Hypothetical Syllogism",
      explain: "Transitive property of implication guarantees P → R is true."
    }
  ],
  "Pakistan Studies": [
    {
      id: "pak-1",
      q: "The historic Lahore Resolution (Pakistan Resolution) was passed on March 23 in which year?",
      options: ["1930","1937","1940","1947"],
      correct: 2,
      topic: "Pakistan Movement (1857-1947)",
      explain: "The Resolution presented by A.K. Fazlul Huq was adopted on March 23, 1940 at Minto Park, Lahore."
    },
    {
      id: "pak-2",
      q: "The highest mountain peak in Pakistan is:",
      options: ["Nanga Parbat","K2 (Godwin-Austen)","Broad Peak","Rakaposhi"],
      correct: 1,
      topic: "Geography & Mountains",
      explain: "K2 in the Karakoram range stands at 8,611 meters, making it Pakistan's highest peak."
    },
    {
      id: "pak-3",
      q: "Who was appointed as the first Prime Minister of Pakistan in August 1947?",
      options: ["Quaid-e-Azam Muhammad Ali Jinnah","Liaquat Ali Khan","Khawaja Nazimuddin","Choudhry Muhammad Ali"],
      correct: 1,
      topic: "Post-Independence Political History",
      explain: "Liaquat Ali Khan served as Pakistan's first Prime Minister from August 1947 until October 1951."
    },
    {
      id: "pak-4",
      q: "The Constitution of 1973 was promulgated during the tenure of:",
      options: ["Ayub Khan","Yahya Khan","Zulfikar Ali Bhutto","Zia-ul-Haq"],
      correct: 2,
      topic: "Constitutional History",
      explain: "The 1973 Constitution was passed under Prime Minister Zulfikar Ali Bhutto and enforced on August 14, 1973."
    },
    {
      id: "pak-5",
      q: "Which river is the longest river in Pakistan?",
      options: ["Jhelum River","Chenab River","Ravi River","Indus River"],
      correct: 3,
      topic: "Geography & River Systems",
      explain: "The Indus River (~3,180 km) is the longest and main river system of Pakistan."
    },
    {
      id: "pak-6",
      q: "Sir Syed Ahmad Khan founded the Muhammadan Anglo-Oriental (MAO) College at Aligarh in which year?",
      options: ["1857","1875","1885","1906"],
      correct: 1,
      topic: "Aligarh Movement",
      explain: "Sir Syed Ahmad Khan established MAO College at Aligarh in 1875, which later became Aligarh Muslim University."
    },
    {
      id: "pak-7",
      q: "Who presented the famous Allahabad Address in December 1930, proposing a separate Muslim state in North-Western India?",
      options: ["Allama Muhammad Iqbal","Quaid-e-Azam Muhammad Ali Jinnah","Sir Syed Ahmad Khan","Chaudhry Rahmat Ali"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "Allama Iqbal delivered the presidential address at the Muslim League session in Allahabad in 1930."
    },
    {
      id: "pak-8",
      q: "The Objectives Resolution was passed by the Constituent Assembly of Pakistan on:",
      options: ["March 12, 1949","August 14, 1947","March 23, 1956","August 14, 1973"],
      correct: 0,
      topic: "Constitutional Developments",
      explain: "Prime Minister Liaquat Ali Khan introduced the Objectives Resolution, which was passed on March 12, 1949."
    },
    {
      id: "pak-9",
      q: "The All-India Muslim League was founded in December 1906 at which historic city?",
      options: ["Lahore","Aligarh","Dhaka","Karachi"],
      correct: 2,
      topic: "Pakistan Movement",
      explain: "The All-India Muslim League was established on December 30, 1906 in Dhaka under Nawab Waqar-ul-Mulk."
    },
    {
      id: "pak-10",
      q: "Which famous dam built on the Jhelum River is one of the largest earth-fill dams in the world?",
      options: ["Tarbela Dam","Mangla Dam","Warsak Dam","Khanpur Dam"],
      correct: 1,
      topic: "Water Resources & Dams",
      explain: "Mangla Dam was constructed on the Jhelum River under the Indus Waters Treaty."
    },
    {
      id: "pak-11",
      q: "Who coined the name 'Pakistan' in his famous 1933 pamphlet 'Now or Never'?",
      options: ["Chaudhry Rahmat Ali","Allama Iqbal","Sir Syed Ahmad Khan","A.K. Fazlul Huq"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "Chaudhry Rahmat Ali coined the name 'Pakistan' while studying at Cambridge in 1933."
    },
    {
      id: "pak-12",
      q: "Which agreement was signed between Quaid-e-Azam Muhammad Ali Jinnah and Congress leaders in 1916 for Hindu-Muslim unity?",
      options: ["Lucknow Pact","Delhi Pact","Simla Agreement","Tashkent Declaration"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "The Lucknow Pact (1916) marked joint constitutional demands by Muslim League and Congress."
    },
    {
      id: "pak-13",
      q: "The first Constitution of Pakistan was promulgated on March 23 in which year?",
      options: ["1949","1956","1962","1973"],
      correct: 1,
      topic: "Constitutional History",
      explain: "Pakistan's 1st Constitution was enforced on March 23, 1956, declaring Pakistan an Islamic Republic."
    },
    {
      id: "pak-14",
      q: "Which Pass connects Pakistan with China through the Karakoram Highway?",
      options: ["Khyber Pass","Karakoram / Khunjerab Pass","Bolan Pass","Tochi Pass"],
      correct: 1,
      topic: "Geography & Trade Routes",
      explain: "Khunjerab Pass at 4,693 meters connects Gilgit-Baltistan with Xinjiang, China."
    },
    {
      id: "pak-15",
      q: "The Partition of Bengal took place in 1905 during the viceroyalty of:",
      options: ["Lord Curzon","Lord Mountbatten","Lord Minto","Lord Wavell"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "Lord Curzon partitioned Bengal into East Bengal & Assam and West Bengal in 1905."
    },
    {
      id: "pak-16",
      q: "Which seaport is Pakistan's largest deep-sea port developed under CPEC in Balochistan?",
      options: ["Karachi Port","Port Qasim","Gwadar Port","Pasni Port"],
      correct: 2,
      topic: "Economic Development & Ports",
      explain: "Gwadar Port on the Arabian Sea is the strategic deep-sea port center of CPEC."
    },
    {
      id: "pak-17",
      q: "Quaid-e-Azam presented his famous 'Fourteen Points' in 1929 as a rebuttal to which document?",
      options: ["Simon Commission","Nehru Report","Cripps Proposals","Cabinet Mission Plan"],
      correct: 1,
      topic: "Pakistan Movement",
      explain: "Jinnah's 14 Points were formulated in response to the anti-Muslim provisions of the 1928 Nehru Report."
    },
    {
      id: "pak-18",
      q: "In which year did Pakistan become an Islamic Republic under its first constitution?",
      options: ["1947","1956","1962","1973"],
      correct: 1,
      topic: "Constitutional History",
      explain: "The 1956 Constitution officially declared the country as the 'Islamic Republic of Pakistan'."
    },
    {
      id: "pak-19",
      q: "Which mountain range separates Pakistan from Afghanistan along the western border?",
      options: ["Himalayas","Karakoram","Hindu Kush","Sulaiman Range"],
      correct: 2,
      topic: "Geography",
      explain: "The Hindu Kush range forms the northwestern natural boundary between Pakistan and Afghanistan."
    },
    {
      id: "pak-20",
      q: "The Indus Waters Treaty was brokered by the World Bank between Pakistan and India in which year?",
      options: ["1948","1960","1965","1971"],
      correct: 1,
      topic: "Foreign Policy & Water Resources",
      explain: "Field Marshal Ayub Khan and Jawaharlal Nehru signed the treaty in Karachi on September 19, 1960."
    },
    {
      id: "pak-21",
      q: "Who served as the last Viceroy of British India who oversaw the transfer of power in 1947?",
      options: ["Lord Wavell","Lord Linlithgow","Lord Mountbatten","Lord Minto"],
      correct: 2,
      topic: "Partition 1947",
      explain: "Lord Louis Mountbatten was the last British Viceroy who implemented the June 3, 1947 Partition Plan."
    },
    {
      id: "pak-22",
      q: "The Second OIC Summit Conference was held in 1974 at which historical city of Pakistan?",
      options: ["Karachi","Islamabad","Lahore","Peshawar"],
      correct: 2,
      topic: "Foreign Policy & History",
      explain: "The 2nd Summit of the Organization of Islamic Cooperation was hosted by Zulfikar Ali Bhutto in Lahore in February 1974."
    },
    {
      id: "pak-23",
      q: "Which desert is located in the eastern region of Punjab province in Pakistan?",
      options: ["Thar Desert","Cholistan Desert","Thal Desert","Kharan Desert"],
      correct: 1,
      topic: "Geography & Climate",
      explain: "Cholistan Desert (Rohi) covers the Southern Punjab Bahawalpur division region."
    },
    {
      id: "pak-24",
      q: "The Cabinet Mission arrived in British India in which year to negotiate constitutional reform?",
      options: ["1942","1945","1946","1947"],
      correct: 2,
      topic: "Pakistan Movement",
      explain: "The 3-member British Cabinet Mission arrived in March 1946."
    },
    {
      id: "pak-25",
      q: "What is the national flower of Pakistan?",
      options: ["Rose","Jasmine (Chambeli)","Tulip","Sunflower"],
      correct: 1,
      topic: "National Symbols",
      explain: "Jasmine (Poet's Jasmine) is Pakistan's national flower."
    },
    {
      id: "pak-26",
      q: "Which historical monument in Lahore was constructed by Mughal Emperor Aurangzeb in 1673?",
      options: ["Badshahi Mosque","Shalimar Gardens","Lahore Fort","Wazir Khan Mosque"],
      correct: 0,
      topic: "Cultural Heritage",
      explain: "Badshahi Mosque was commissioned by Aurangzeb Alamgir in 1671 and completed in 1673."
    },
    {
      id: "pak-27",
      q: "Which organization was formed in Simla in October 1906 to demand separate electorates for Muslims?",
      options: ["Simla Deputation","Khilafat Committee","Ali Brothers League","Red Shirts Movement"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "Sir Aga Khan led 35 prominent Muslim leaders in the Simla Deputation to Viceroy Lord Minto."
    },
    {
      id: "pak-28",
      q: "What is the total area of Pakistan in square kilometers?",
      options: ["796,095 sq km","881,913 sq km","650,000 sq km","950,000 sq km"],
      correct: 1,
      topic: "Geography",
      explain: "Official updated area including Gilgit-Baltistan & AJK is 881,913 sq km (796,095 sq km land mass)."
    },
    {
      id: "pak-29",
      q: "The Khilafat Movement in India was launched in 1919 under the leadership of:",
      options: ["Ali Brothers (Maulana Muhammad Ali & Shaukat Ali)","Sir Syed Ahmad Khan","Allama Iqbal","Quaid-e-Azam"],
      correct: 0,
      topic: "Pakistan Movement",
      explain: "Maulana Muhammad Ali and Maulana Shaukat Ali led the Khilafat Movement to preserve the Ottoman Caliphate."
    },
    {
      id: "pak-30",
      q: "Which province of Pakistan is known as 'Babul Islam' (Gateway of Islam)?",
      options: ["Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan"],
      correct: 1,
      topic: "History & Heritage",
      explain: "Sindh is called Babul Islam due to the conquest by Muhammad bin Qasim in 712 AD."
    },
    {
      id: "pak-31",
      q: "The Tarbela Dam, built on the Indus River, is located in which province?",
      options: ["Punjab","Khyber Pakhtunkhwa (KPK)","Sindh","Balochistan"],
      correct: 1,
      topic: "Dams & Resources",
      explain: "Tarbela Dam is situated in Haripur district of Khyber Pakhtunkhwa."
    },
    {
      id: "pak-32",
      q: "Which Constitution introduced a Unicameral legislature in Pakistan?",
      options: ["1956 Constitution","1973 Constitution","18th Amendment","Legal Framework Order"],
      correct: 0,
      topic: "Constitutional Developments",
      explain: "Both the 1956 and 1962 constitutions established unicameral parliaments (National Assembly only)."
    },
    {
      id: "pak-33",
      q: "In which city is the headquarters of the State Bank of Pakistan located?",
      options: ["Islamabad","Lahore","Karachi","Rawalpindi"],
      correct: 2,
      topic: "Economy & Financial Institutions",
      explain: "The State Bank of Pakistan, inaugurated by Quaid-e-Azam in July 1948, is headquartered in Karachi."
    },
    {
      id: "pak-34",
      q: "Which crops are classified as Rabi crops in Pakistan?",
      options: ["Wheat, Gram, Barley","Rice, Cotton, Sugarcane","Maize, Millet, Sorghum","Tobacco, Cotton, Rice"],
      correct: 0,
      topic: "Agriculture",
      explain: "Rabi crops are sown in winter (October-December) and harvested in spring (March-April), led by Wheat."
    },
    {
      id: "pak-35",
      q: "The boundary line drawn in 1893 between British India and Afghanistan is known as the:",
      options: ["Radcliffe Line","McMahon Line","Durand Line","Control Line"],
      correct: 2,
      topic: "Geography & Borders",
      explain: "Sir Mortimer Durand and Afghan Amir Abdur Rahman Khan established the 2,640 km Durand Line in 1893."
    }
  ],
  "Urdu": [
    // Class 9 (15 MCQs)
    {
      id: "urdu-1",
      q: "غزل کی صنف میں ہر شعر کا کیا خاصہ ہوتا ہے؟",
      options: ["ہر شعر ایک مکمل خیال ہوتا ہے", "تمام اشعار ایک ہی موضوع پر ہوتے ہیں", "صرف مطلع میں قافیہ آتا ہے", "کوئی ردیف نہیں ہوتی"],
      correct: 0,
      topic: "اصنافِ سخن - غزل (جماعت نہم FBISE)",
      explain: "غزل کا ہر شعر اپنے مفہوم میں مستقل اور مکمل اکائی ہوتا ہے۔"
    },
    {
      id: "urdu-2",
      q: "'قومی زبان' کے موضوع پر مضمون میں مصنف کس زبان کو پاکستان کی قومی زبان قرار دیتا ہے؟",
      options: ["پنجابی", "اردو", "انگریزی", "سندھی"],
      correct: 1,
      topic: "نصابی اسباق (جماعت نہم FBISE)",
      explain: "آئینِ پاکستان کے مطابق اردو پاکستان کی قومی زبان ہے۔"
    },
    {
      id: "urdu-3",
      q: "علامہ اقبال کی نظم 'ہمالہ' میں ہمالہ پہاڑ کو کس چیز کی علامت کے طور پر پیش کیا گیا ہے؟",
      options: ["کمزوری", "عظمت و بلندی", "تنہائی", "خاموشی"],
      correct: 1,
      topic: "نظم - ہمالہ (علامہ اقبال)",
      explain: "علامہ اقبال نے ہمالہ کو برصغیر کی عظمت اور قدیم شوکت کا مظہر قرار دیا ہے۔"
    },
    {
      id: "urdu-4",
      q: "مثنوی کی بنیادی خصوصیت کیا ہے؟",
      options: ["ہر شعر کا الگ قافیہ", "مصرعوں کا ہم قافیہ ہونا", "بحر کا نہ ہونا", "صرف عشقیہ مضمون"],
      correct: 1,
      topic: "اصنافِ سخن - مثنوی",
      explain: "مثنوی کے ہر شعر کے دونوں مصرعے ہم قافیہ اور ہم ردیف ہوتے ہیں جبکہ اگلے شعر کا قافیہ بدل جاتا ہے۔"
    },
    {
      id: "urdu-5",
      q: "حالی کو کس صنفِ سخن کا بانی کہا جاتا ہے؟",
      options: ["نظم مسدس اور مرثیہ نگاری میں اصلاحی رنگ", "قصیدہ گوئی", "داستان نویسی", "سفر نامہ نگاری"],
      correct: 0,
      topic: "شخصیات - مولانا الطاف حسین حالی",
      explain: "مولانا حالی نے 'مسدسِ حالی' سے اردو میں قومی و اصلاحی مسدس نگاری کی بنیاد رکھی۔"
    },
    {
      id: "urdu-6",
      q: "خط و کتابت کے مضمون میں رسمی خط اور غیر رسمی خط میں بنیادی فرق کیا ہوتا ہے؟",
      options: ["زبان کا استعمال اور لب و لہجہ", "صرف لمبائی", "کاغذ کا رنگ", "دستخط کی جگہ"],
      correct: 0,
      topic: "تخلیقی تحریر - خطوط",
      explain: "رسمی خطوط میں مودبانہ اور باضابطہ زبان استعمال ہوتی ہے جبکہ غیر رسمی میں دلی جذبات و بے تکلفی۔"
    },
    {
      id: "urdu-7",
      q: "محاورہ اور ضرب المثل میں کیا فرق ہے؟",
      options: ["محاورہ مکمل جملہ ہوتا ہے، ضرب المثل نہیں", "ضرب المثل مکمل اور نصیحت آموز جملہ ہوتی ہے جبکہ محاورہ فقرے کا حصہ ہوتا ہے", "دونوں ایک ہی چیز ہیں", "محاورہ صرف شاعری میں استعمال ہوتا ہے"],
      correct: 1,
      topic: "قواعد و انشاء - محاورہ و ضرب المثل",
      explain: "ضرب المثل اپنے اندر کامل حکمت و نصیحت رکھتی ہے جبکہ محاورہ جملے کی ترکیب کا جزو ہوتا ہے۔"
    },
    {
      id: "urdu-8",
      q: "سید احمد شہید کے متعلق نصابی سبق میں ان کی تحریک کا بنیادی مقصد کیا بیان کیا گیا ہے؟",
      options: ["تجارت کا فروغ", "دین کی سربلندی اور اصلاح", "زمینداری کا نظام", "شاعری کا احیاء"],
      correct: 1,
      topic: "تاريخ و شخصیات (FBISE)",
      explain: "سید احمد شہید بریلوی رحمة اللہ علیہ نے تحریکِ مجاہدین کے ذریعے دینِ اسلام کی احیاء کے لیے جدوجہد کی۔"
    },
    {
      id: "urdu-9",
      q: "اسم اور فعل کے فرق کی بنیادی تعریف کیا ہے؟",
      options: ["اسم کسی کام کے ہونے کو ظاہر کرتا ہے", "اسم کسی شخص، چیز یا جگہ کا نام ہوتا ہے جبکہ فعل کام کے ہونے کو ظاہر کرتا ہے", "دونوں ایک جیسے ہیں", "فعل ہمیشہ جملے کے شروع میں آتا ہے"],
      correct: 1,
      topic: "قواعد - اسم و فعل",
      explain: "اسم زماں سے آزاد نام ہوتا ہے جبکہ فعل میں کسی زمانے کے ساتھ کام کا کرنا یا ہونا پایا جاتا ہے۔"
    },
    {
      id: "urdu-10",
      q: "'میر تقی میر' کی غزل گوئی کا خاص رنگ کیا سمجھا جاتا ہے؟",
      options: ["طنز و مزاح", "سادگی اور دردمندی", "فلسفیانہ پیچیدگی", "قصیدہ گوئی"],
      correct: 1,
      topic: "کلاسیکی غزل - میر تقی میر",
      explain: "میر تقی میر کا کلام سوز و گداز، سادگی، خلوص اور دلنشیں دردمندی سے عبارت ہے۔"
    },
    {
      id: "urdu-11",
      q: "تلمیح کی ادبی اصطلاح سے کیا مراد ہے؟",
      options: ["کسی تاریخی یا مذہبی واقعے کی طرف اشارہ کرنا", "دو الفاظ کے درمیان تضاد", "شعر میں ردیف کا نہ ہونا", "نثر میں مکالمے کا استعمال"],
      correct: 0,
      topic: "ادبی اصطلاحات - تلمیح",
      explain: "تلمیح سے مراد کلام میں کسی مشہور تاریخی، قرآنی یا قصصاتی واقعے کی طرف اشارہ کرنا ہے۔"
    },
    {
      id: "urdu-12",
      q: "استعارہ اور تشبیہ میں بنیادی فرق کیا ہے؟",
      options: ["استعارہ میں مشبہ اور مشبہ بہ دونوں بیان ہوتے ہیں", "تشبیہ میں دو چیزوں کا موازنہ حرفِ تشبیہ کے ساتھ ہوتا ہے جبکہ استعارے میں مشبہ بہ کو براہِ راست مشبہ کی جگہ استعمال کیا جاتا ہے", "دونوں ایک ہی چیز ہیں", "استعارہ صرف نثر میں ہوتا ہے"],
      correct: 1,
      topic: "علمِ بیان - استعارہ و تشبیہ",
      explain: "استعارہ میں عینیت ہوتی ہے یعنی ایک چیز کو بعینہ دوسری چیز مان لیا جاتا ہے۔"
    },
    {
      id: "urdu-13",
      q: "خاکہ نگاری کس صنفِ نثر میں شمار ہوتی ہے؟",
      options: ["شخصیت کی سیرت اور کردار کو الفاظ میں پیش کرنا", "صرف واقعات کی ترتیب", "شاعری کی ایک قسم", "لغت نویسی"],
      correct: 0,
      topic: "اصنافِ نثر - خاکہ نگاری",
      explain: "خاکہ میں کسی شخص کے اندرونی و بیرونی اوصاف کی قلمی تصویر کشی کی جاتی ہے۔"
    },
    {
      id: "urdu-14",
      q: "پطرس بخاری کا شمار اردو ادب کی کس صنف کے مشہور مصنفین میں ہوتا ہے؟",
      options: ["مرثیہ نگاری", "مزاحیہ مضمون نگاری", "قصیدہ گوئی", "سفرنامہ نگاری"],
      correct: 1,
      topic: "مزاح نگاری - پطرس بخاری",
      explain: "پطرس کے مضامین اردو مزاحیہ ادب کا لافانی اور شاہکار سرمایہ ہیں۔"
    },
    {
      id: "urdu-15",
      q: "رومانوی اور اصلاحی نظم میں بنیادی امتیاز کیا ہوتا ہے؟",
      options: ["رومانوی نظم جذبات و احساسات پر مبنی ہوتی ہے جبکہ اصلاحی نظم معاشرتی سدھار پر زور دیتی ہے", "دونوں کا مقصد ایک ہی ہوتا ہے", "اصلاحی نظم صرف عشق کے موضوع پر ہوتی ہے", "رومانوی نظم ہمیشہ طویل ہوتی ہے"],
      correct: 0,
      topic: "اصنافِ نظم",
      explain: "رومانوی نظم کا محور حسن و جمال اور جذبات ہیں جبکہ اصلاحی نظم کا مقصد معاشرتی سدھار ہے۔"
    },

    // Class 10 (15 MCQs)
    {
      id: "urdu-16",
      q: "فیض احمد فیض کی شاعری میں کس موضوع کو نمایاں مقام حاصل ہے؟",
      options: ["صرف رزمیہ واقعات", "انقلاب اور مزاحمت کے ساتھ رومانویت", "صرف مذہبی مضامین", "سفرنامہ نگاری"],
      correct: 1,
      topic: "جدید غزل و نظم - فیض احمد فیض (جماعت دہم FBISE)",
      explain: "فیض کے ہاں سیاسی بصیرت اور رومانی جذب کا حسنِ امتزاج پایا جاتا ہے۔"
    },
    {
      id: "urdu-17",
      q: "'سبق آموز کہانی' یا حکایت کا بنیادی مقصد کیا ہوتا ہے؟",
      options: ["صرف تفریح", "اخلاقی سبق دینا", "تاریخی حقائق بیان کرنا", "شاعری کی اصناف سکھانا"],
      correct: 1,
      topic: "نثری اسالیب - حکایت",
      explain: "حکایات و تمثیلات کا اصل مدعا خوانندگان کو اخلاقی و تربیتی درس فراہم کرنا ہے۔"
    },
    {
      id: "urdu-18",
      q: "درخواست نویسی میں مندرجہ ذیل میں سے کون سا جزو ضروری ہوتا ہے؟",
      options: ["عنوان اور دستخط", "صرف تاریخ", "شعر و شاعری", "کہانی کا خلاصہ"],
      correct: 0,
      topic: "تخلیقی تحریر - درخواست",
      explain: "درخواست میں باضابطہ جنابِ عالی، عنوان، متن، العارض اور تاریخ ضروری عناصر ہیں۔"
    },
    {
      id: "urdu-19",
      q: "مولانا الطاف حسین حالی کی نظم 'برکھا رت' کس موضوع پر مبنی ہے؟",
      options: ["بارش کے موسم کی منظر کشی", "جنگ کے واقعات", "سیاسی تحریک", "درخواست نویسی"],
      correct: 0,
      topic: "اصلاحی نظم - الطاف حسین حالی",
      explain: "'برکھا رت' میں حالی نے موسمِ برسات کا فطری اور جاندار نقشہ کھینچا ہے۔"
    },
    {
      id: "urdu-20",
      q: "مرثیہ نگاری میں میر انیس کا رتبہ کس وجہ سے بلند سمجھا جاتا ہے؟",
      options: ["واقعہ کربلا کی مؤثر اور فصیح منظر کشی", "صرف طویل بحر کے استعمال کی وجہ سے", "مزاحیہ انداز کی وجہ سے", "نثری اسلوب کی وجہ سے"],
      correct: 0,
      topic: "اصنافِ سخن - مرثیہ (میر انیس)",
      explain: "میر انیس نے واقعہ کربلا کو فصاحت و بلاغت اور اعلیٰ منظر کشی سے لازوال بنایا۔"
    },
    {
      id: "urdu-21",
      q: "جملے میں فاعل، مفعول اور فعل کی ترتیب اردو نحو میں عموماً کیسی ہوتی ہے؟",
      options: ["فاعل، مفعول، فعل", "فعل، فاعل، مفعول", "مفعول، فعل، فاعل", "کوئی ترتیب نہیں ہوتی"],
      correct: 0,
      topic: "نحو و قواعد - ساختِ جملہ",
      explain: "اردو میں جملے کا باضابطہ ساختہ نظام: فاعل (Subject) + مفعول (Object) + فعل (Verb) ہے۔"
    },
    {
      id: "urdu-22",
      q: "روزنامچہ (ڈائری) نویسی کی نثری صنف کی نمایاں خصوصیت کیا ہے؟",
      options: ["روزمرہ واقعات کا ذاتی اور بے تکلف اندازِ بیان", "مکمل طور پر فرضی کہانی", "صرف تاریخی حقائق", "شعری ہیئت"],
      correct: 0,
      topic: "اصنافِ نثر - روزنامچہ",
      explain: "روزنامچہ میں تحریر کنندہ روزانہ کی روداد کو اپنے ذاتی تاثرات کیساتھ قلمبند کرتا ہے۔"
    },
    {
      id: "urdu-23",
      q: "سرسید احمد خان کی علی گڑھ تحریک کا بنیادی مقصد کیا تھا؟",
      options: ["مسلمانوں میں جدید تعلیم کا فروغ", "صرف مذہبی تبلیغ", "کاروباری منافع", "شاعری کی ترویج"],
      correct: 0,
      topic: "تاریخ و نثر - سرسید احمد خان",
      explain: "سرسید نے مسلمانوں کو زوال سے نکالنے کے لیے جدید سائنسی و انگریزی تعلیم کا بیدار کن پیغام دیا۔"
    },
    {
      id: "urdu-24",
      q: "غزل میں 'ردیف' کی تعریف کیا ہے؟",
      options: ["وہ لفظ جو قافیے کے بعد ہر شعر کے دونوں مصرعوں میں دہرایا جائے", "شعر کا پہلا مصرع", "شعر کی بحر", "صرف مطلع میں آنے والا لفظ"],
      correct: 0,
      topic: "علمِ عروض - ردیف",
      explain: "ردیف وہ مستقل لفظ یا الفاظ کا مجموعہ ہے جو قافیے کے بعد من وعن دہرایا جاتا ہے۔"
    },
    {
      id: "urdu-25",
      q: "سفرنامہ نگاری کی صنف میں مصنف بنیادی طور پر کیا بیان کرتا ہے؟",
      options: ["اپنے سفر کے مشاہدات و تجربات", "صرف فرضی داستان", "قواعد و انشاء", "خط کی تحریر"],
      correct: 0,
      topic: "اصنافِ نثر - سفرنامہ",
      explain: "سفرنامے میں سیاح یا مصنف دیارِ غیر یا سفر کے مشاہدات و تہذیب کو بیان کرتا ہے۔"
    },
    {
      id: "urdu-26",
      q: "'رعایتِ لفظی' کی ادبی اصطلاح سے کیا مراد ہے؟",
      options: ["ایک لفظ کے دو معنوں میں سے مناسب معنی کا چناؤ کر کے شعری حسن پیدا کرنا", "شعر میں وزن کا نہ ہونا", "نثر میں تلمیح کا استعمال", "قافیہ بندی سے اجتناب"],
      correct: 0,
      topic: "صنایع بدائع - رعایتِ لفظی",
      explain: "کلام میں ایسے الفاظ لانا جن کے درمیان باہمی مناسبت و معنوی رشتہ پایا جائے۔"
    },
    {
      id: "urdu-27",
      q: "جوش ملیح آبادی کو ان کی شاعرانہ جولانیِ طبع کی بنا پر کس لقب سے یاد کیا جاتا ہے؟",
      options: ["شاعرِ مشرق", "شاعرِ انقلاب", "خاتونِ پاکستان", "مصورِ فطرت"],
      correct: 1,
      topic: "القاب و شاعراں - جوش ملیح آبادی",
      explain: "انقلابی ترانوں اور ولولہ انگیز کلام کی بناء پر جوش کو 'شاعرِ انقلاب' کہا جاتا ہے۔"
    },
    {
      id: "urdu-28",
      q: "بامحاورہ ترجمہ کرتے وقت سب سے اہم اصول کیا ہوتا ہے؟",
      options: ["لفظ بہ لفظ ترجمہ", "اصل مفہوم اور روانی کو برقرار رکھنا", "صرف گرامر کا خیال رکھنا", "جملے کی لمبائی برابر رکھنا"],
      correct: 1,
      topic: "ترجمہ نگاری",
      explain: "ترجمہ میں اصل زبان کا روح اور دوسری زبان کی شائستگی و روانگی بنیادی اصول ہے۔"
    },
    {
      id: "urdu-29",
      q: "اردو زبان میں 'واحد' اور 'جمع' کے قواعد کس زمرے میں آتے ہیں؟",
      options: ["صرف و نحو", "عروض", "بلاغت", "تلمیح"],
      correct: 0,
      topic: "قواعد - صرف و نحو",
      explain: "واحد جمع، مذکر مؤنث اور الفاظ کی تراتیب علمِ صرف کے تحت آتی ہیں۔"
    },
    {
      id: "urdu-30",
      q: "ناول اور افسانے میں بنیادی فرق کیا ہے؟",
      options: ["ناول میں کردار اور واقعات کی تفصیل زیادہ وسیع ہوتی ہے جبکہ افسانہ ایک مختصر اور مرکوز واقعے پر مبنی ہوتا ہے", "دونوں ایک ہی صنف ہیں", "افسانہ ہمیشہ طویل ہوتا ہے", "ناول میں کردار نہیں ہوتے"],
      correct: 0,
      topic: "اصنافِ نثر - ناول و افسانہ",
      explain: "افسانہ اختصار اور وحدتِ تاثر رکھتا ہے جبکہ ناول زندگی کی وسیع کینوس کی عکاسی کرتا ہے۔"
    },

    // Class 11 (15 MCQs)
    {
      id: "urdu-31",
      q: "غالب کی شاعری کا نمایاں وصف کیا سمجھا جاتا ہے؟",
      options: ["سادہ اور سیدھی زبان", "فکری گہرائی اور پیچیدہ استعارے", "صرف مذہبی موضوعات", "طنزیہ اندازِ نثر"],
      correct: 1,
      topic: "کلاسیکی غزل - مرزا اسد اللہ خان غالب (جماعت یازدہم FBISE)",
      explain: "غالب کے ہاں جدتِ طبع، نازک خیالی اور فلسفیانہ گہرائی غالب عنصر ہے۔"
    },
    {
      id: "urdu-32",
      q: "اقبال کے کلام میں 'خودی' کے تصور سے بنیادی طور پر کیا مراد ہے؟",
      options: ["خود غرضی", "انسان کی داخلی قوت اور خود شناسی", "کمزوری اور بے بسی", "مادہ پرستی"],
      correct: 1,
      topic: "فکرِ اقبال - تصورِ خودی",
      explain: "خودی سے مراد ذات کی شناخت، خود اعتمادی اور خدا سے تعلق استوار کرنا ہے۔"
    },
    {
      id: "urdu-33",
      q: "مضمون نگاری میں تمہید، متن اور اختتام کی ترتیب کا مقصد کیا ہے؟",
      options: ["مضمون کو منطقی اور مربوط بنانا", "مضمون کو طویل کرنا", "صرف الفاظ کی تعداد بڑھانا", "شعری وزن قائم رکھنا"],
      correct: 0,
      topic: "مضمون نگاری - ساخت",
      explain: "مضمون میں تسلسل اور ربط کے لیے تمہید، نفسِ مضمون اور حاصلِ کلام لازمی ہیں۔"
    },
    {
      id: "urdu-34",
      q: "ن م راشد کو جدید اردو شاعری میں کس رجحان کا بانی سمجھا جاتا ہے؟",
      options: ["کلاسیکی غزل", "آزاد نظم", "قصیدہ گوئی", "مرثیہ نگاری"],
      correct: 1,
      topic: "جدید نظم - ن م راشد",
      explain: "ن م راشد، میرا جی اور فیض کے ہمراہ آزاد نظم کے صف اول کے معمار ہیں۔"
    },
    {
      id: "urdu-35",
      q: "تنقید نگاری میں 'جمالیاتی تنقید' کس چیز پر توجہ مرکوز کرتی ہے؟",
      options: ["صرف مصنف کی سوانح", "فن پارے کے حسن اور فنی محاسن", "تاریخی پس منظر", "لسانی اغلاط"],
      correct: 1,
      topic: "ادبی تنقید - جمالیاتی تنقید",
      explain: "جمالیاتی تنقید نگار فن پارے میں موجود جمالیاتی مسرت اور فنکارانہ خوبیوں کو پرکھتا ہے۔"
    },
    {
      id: "urdu-36",
      q: "انشائیہ اور مضمون میں بنیادی فرق کیا ہے؟",
      options: ["انشائیہ ذاتی، غیر رسمی اور تخلیقی اسلوب رکھتا ہے جبکہ مضمون منظم اور معروضی ہوتا ہے", "دونوں ایک ہی صنف ہیں", "انشائیہ ہمیشہ سائنسی موضوع پر ہوتا ہے", "مضمون میں مزاح نہیں ہوتا"],
      correct: 0,
      topic: "اصنافِ نثر - انشائیہ",
      explain: "انشائیہ میں مصنف کی غیر رسمی ذہن کی ترنگ اور آزادانہ فکری طبع ہوتی ہے۔"
    },
    {
      id: "urdu-37",
      q: "ڈرامہ نگاری میں 'مکالمہ' کی بنیادی اہمیت کیا ہے؟",
      options: ["کرداروں کے خیالات اور واقعات کو آگے بڑھانا", "صرف منظر کی تفصیل", "موسیقی کا اضافہ", "عنوان کا تعین"],
      correct: 0,
      topic: "اصنافِ ادب - ڈرامہ",
      explain: "مکالمے کے بغیر ڈرامے کا پلاٹ اور کردار نگاری آگے نہیں بڑھ سکتی۔"
    },
    {
      id: "urdu-38",
      q: "'علامتی نظم' کی خصوصیت کیا ہے؟",
      options: ["براہِ راست بیانیہ اسلوب", "اشیاء و کرداروں کو کسی گہرے مفہوم کی علامت کے طور پر پیش کرنا", "صرف تاریخی واقعات کا بیان", "عروضی پابندیوں سے مکمل آزادی"],
      correct: 1,
      topic: "جدید نظم - علامتی نظم",
      explain: "علامتی نظم میں مفہوم براہِ راست بیان ہونے کی بجائے باطنی اشاروں میں پوشیدہ ہوتا ہے۔"
    },
    {
      id: "urdu-39",
      q: "پروین شاکر کی شاعری میں نسائی جذبات کے اظہار کا کیا رنگ نمایاں ہے؟",
      options: ["رزمیہ انداز", "نازک اور دلی احساسات کی عکاسی", "صرف طنزیہ لہجہ", "مکمل طور پر سیاسی موضوعات"],
      correct: 1,
      topic: "جدید غزل - پروین شاکر",
      explain: "پروین شاکر نے عورت کے لہجے اور اس کے سچے جذبات کو اردو غزل میں خوبصورت ڈھیل دی۔"
    },
    {
      id: "urdu-40",
      q: "بیانیہ نثر کی خصوصیت کیا ہوتی ہے؟",
      options: ["واقعات کو ترتیب وار اور تفصیل سے بیان کرنا", "صرف شعری اوزان کا استعمال", "مکالموں کا نہ ہونا", "خط کی صورت میں تحریر"],
      correct: 0,
      topic: "نثری اسالیب - بیانیہ نثر",
      explain: "بیانیہ نثر میں واقعات کی تسلسل اور داستان گوئی کا تسلسل موجود ہوتا ہے۔"
    },
    {
      id: "urdu-41",
      q: "'معنی آفرینی' کی اصطلاح غالب کے کلام کے تناظر میں کس چیز کی طرف اشارہ کرتی ہے؟",
      options: ["الفاظ کے سادہ اور واضح معنی", "ایک ہی شعر میں کئی معنوی امکانات کا پیدا ہونا", "عروضی بحر کی پابندی", "صرف تلمیحات کا استعمال"],
      correct: 1,
      topic: "نقدِ غالب - معنی آفرینی",
      explain: "غالب کے اشعار میں ایک سے زائد تہیں اور مختلف زاویہ ہائے نگاہ پائے جاتے ہیں۔"
    },
    {
      id: "urdu-42",
      q: "ریڈیائی تقریر اور تحریری مضمون میں بنیادی فرق کیا ہے؟",
      options: ["دونوں ایک جیسے ہوتے ہیں", "تقریر سامعین کے لیے زبانی اور اثر انگیز اندازِ بیان اپناتی ہے جبکہ مضمون تحریری اور مربوط ہوتا ہے", "تقریر میں دلائل نہیں ہوتے", "مضمون ہمیشہ مختصر ہوتا ہے"],
      correct: 1,
      topic: "اصنافِ ابلاغ - تقریر",
      explain: "ریڈیائی تقریر میں صوتی اثرات، سادگی اور فوری ابلاغ پر زور دیا جاتا ہے۔"
    },
    {
      id: "urdu-43",
      q: "'دیباچہ' کسی کتاب کے کس حصے کو کہا جاتا ہے؟",
      options: ["کتاب کا تعارفی حصہ", "کتاب کا آخری باب", "فہرست مضامین", "اشاریہ"],
      correct: 0,
      topic: "کتابیات و تدوین",
      explain: "دیباچہ کتاب کا مطلع یا ابتدائی تعارف ہوتا ہے جس میں مصنف اپنے مدعا کا اظہار کرتا ہے۔"
    },
    {
      id: "urdu-44",
      q: "ادبی تحریک 'ترقی پسند تحریک' کا بنیادی مقصد کیا تھا؟",
      options: ["صرف کلاسیکی روایات کا احیاء", "ادب کو سماجی اور معاشی مسائل سے جوڑنا", "مذہبی شاعری کا فروغ", "رومانوی تنہائی کا اظہار"],
      correct: 1,
      topic: "ادبی تحریکات - ترقی پسند تحریک (1936ء)",
      explain: "ترقی پسند تحریک نے ادب برائے زندگی اور مزدور و کسان کی زبوں حالی کو موضوع بنایا۔"
    },
    {
      id: "urdu-45",
      q: "حلقہ ارباب ذوق کا ادبی رجحان کس چیز پر زور دیتا تھا؟",
      options: ["فن برائے فن اور جمالیاتی اقدار", "صرف سیاسی نعرے بازی", "تاریخی حقائق کی جمع آوری", "درسی کتب کی تدوین"],
      correct: 0,
      topic: "ادبی تحریکات - حلقہ اربابِ ذوق",
      explain: "حلقہ ارباب ذوق نے فن کی انفرادیت، رومانیت اور حسی تجربات پر مبنی تحریروں کی سرپرستی کی۔"
    },

    // Class 12 (15 MCQs)
    {
      id: "urdu-46",
      q: "فراق گورکھپوری کی غزل گوئی میں کس عنصر کو نمایاں مقام حاصل ہے؟",
      options: ["ہندوستانی تہذیب اور رومانیت کا امتزاج", "صرف مذہبی مضامین", "جنگی واقعات", "سفرنامہ نگاری"],
      correct: 0,
      topic: "غزل نگاری - فراق گورکھپوری (جماعت دوازدہم FBISE)",
      explain: "فراق کی غزلوں میں ہندوستانی جمالیات اور لطیف حسی تجربات گہرے ملتے ہیں۔"
    },
    {
      id: "urdu-47",
      q: "تحقیقی مقالے کی بنیادی خصوصیت کیا ہوتی ہے؟",
      options: ["دلائل اور حوالہ جات کے ساتھ منظم انداز میں مواد کی پیشکش", "صرف ذاتی رائے کا اظہار", "شعری اسلوب", "مکالماتی صورت"],
      correct: 0,
      topic: "تحقیق و تدوین",
      explain: "تحقیقی مقالہ حقائق کی تلاش، غیر جانبدارانہ تجزیہ اور مستند حوالوں پر استوار ہوتا ہے۔"
    },
    {
      id: "urdu-48",
      q: "مشتاق احمد یوسفی کی نثر کا نمایاں رنگ کیا ہے؟",
      options: ["سنجیدہ فلسفیانہ بحث", "ظرافت اور شگفتہ بیانی", "صرف تاریخی روداد", "مرثیائی لب و لہجہ"],
      correct: 1,
      topic: "جدید مزاح - مشتاق احمد یوسفی",
      explain: "یوسفی کی طنز و ظرافت میں نفاست، بلاغت اور بے مثل الفاظ کا چناؤ پایا جاتا ہے۔"
    },
    {
      id: "urdu-49",
      q: "جدید غزل میں روایتی موضوعات کے ساتھ کس نئے رجحان کا اضافہ ہوا؟",
      options: ["عصری اور سماجی مسائل کی عکاسی", "صرف عشقیہ مضامین تک محدود رہنا", "عروض سے مکمل انحراف", "قدیم فارسی تراکیب کا اجتناب"],
      correct: 0,
      topic: "جدید غزل - ارتقاء",
      explain: "جدید غزل نے دورِ حاضر کے نفسیاتی، معاشی اور تنہائی کے کرب کو اپنا موضوع بنایا۔"
    },
    {
      id: "urdu-50",
      q: "ادبی تنقید میں 'تاثراتی تنقید' کس بنیاد پر فن پارے کا جائزہ لیتی ہے؟",
      options: ["ناقد کے ذاتی تاثر اور احساس پر", "صرف سائنسی اصولوں پر", "مصنف کی سوانح عمری پر", "لسانی قواعد پر"],
      correct: 0,
      topic: "ادبی تنقید - تاثراتی تنقید",
      explain: "تاثراتی تنقید میں ناقد اپنے ذاتی قلبی تاثرات کو بنامِ نقد پیش کرتا ہے۔"
    },
    {
      id: "urdu-51",
      q: "'رمزیت' (Symbolism) کا ادبی تصور اردو نظم میں کس طرح کارفرما ہوتا ہے؟",
      options: ["براہِ راست بیان کے ذریعے", "اشاروں اور کنایوں کے ذریعے گہرے مفہوم کی ترسیل", "صرف اعداد و شمار کے ذریعے", "خطوط کی صورت میں"],
      correct: 1,
      topic: "ادبی نظریات - رمزیت",
      explain: "رمزیت میں حقیقت کو راست الفاظ کی بجائے علامات اور رموز کے ذریعے محسوس کرایا جاتا ہے۔"
    },
    {
      id: "urdu-52",
      q: "خطبات یا تقریر نویسی میں سامعین کو متاثر کرنے کے لیے کون سا عنصر اہم ہے؟",
      options: ["موثر اسلوبِ بیان اور مضبوط دلائل", "صرف طویل جملے", "مشکل الفاظ کی بھرمار", "خاموشی"],
      correct: 0,
      topic: "فنِ خطابت",
      explain: "خطابت میں فصاحت، جوش، مضبوط استدلال اور لہجے کا اتار چڑھاؤ کلیدی اہمیت رکھتا ہے۔"
    },
    {
      id: "urdu-53",
      q: "ادب میں 'علامتی افسانہ' کی نمایاں خصوصیت کیا ہے؟",
      options: ["سیدھا سادہ بیانیہ", "کردار اور واقعات کے ذریعے تجریدی اور گہرے مفاہیم کی عکاسی", "صرف مزاحیہ انداز", "تاریخی دستاویز کی حیثیت"],
      correct: 1,
      topic: "اصنافِ نثر - علامتی افسانہ",
      explain: "علامتی افسانے میں کردار بظاہر عام ہوتے ہیں مگر ان کی تہہ میں گہرے بین الاقوامی یا نفسیاتی معانی ہوتے ہیں۔"
    },
    {
      id: "urdu-54",
      q: "رپورتاژ نگاری کس قسم کی نثر ہے؟",
      options: ["کسی واقعے یا مقام کی حقیقت پسندانہ اور مشاہداتی روداد", "خالص تخیلاتی کہانی", "شعری اصناف کی ایک قسم", "خط کی تحریر"],
      correct: 0,
      topic: "اصنافِ نثر - رپورتاژ",
      explain: "رپورتاژ صحافتی خبر کی سچائی اور ادبی چاشنی کا ملاپ ہوتا ہے۔"
    },
    {
      id: "urdu-55",
      q: "جدیدیت (Modernism) کی تحریک نے اردو ادب میں کس رجحان کو فروغ دیا؟",
      options: ["روایتی بیانیہ اور سیدھے سادے اسلوب کا تسلسل", "تجریدیت، لاشعوری اظہار اور روایت شکنی", "صرف مذہبی موضوعات کی طرف رجوع", "عروضی سختی میں اضافہ"],
      correct: 1,
      topic: "ادبی تحریکات - جدیدیت",
      explain: "جدیدیت نے جدید انسان کی تنہائی، عدمِ تحفظ اور ہیئت کے تجربات کو سامنے لایا۔"
    },
    {
      id: "urdu-56",
      q: "خاکہ نگاری اور سوانح نگاری میں فرق کیا ہے؟",
      options: ["خاکہ کسی شخصیت کے چند نمایاں پہلوؤں کو مختصراً پیش کرتا ہے جبکہ سوانح پوری زندگی کا تفصیلی احاطہ کرتی ہے", "دونوں ایک ہی صنف ہیں", "خاکہ ہمیشہ طویل ہوتا ہے", "سوانح میں تاریخ شامل نہیں ہوتی"],
      correct: 0,
      topic: "اصنافِ نثر - خاکہ و سوانح",
      explain: "سوانح تحیات کا تفصیلی ریکارڈ ہے جبکہ خاکہ ایک تاثراتی اور قلمی شبیہ ہے۔"
    },
    {
      id: "urdu-57",
      q: "مکالماتی اسلوب کس صنفِ ادب میں سب سے زیادہ استعمال ہوتا ہے؟",
      options: ["ڈرامہ", "قصیدہ", "مرثیہ", "دیباچہ"],
      correct: 0,
      topic: "اصنافِ ادب - ڈرامہ",
      explain: "ڈرامہ مکمل طور پر مکالمات کی بنیاد پر استوار ہوتا ہے۔"
    },
    {
      id: "urdu-58",
      q: "ساختیات (Structuralism) کا تنقیدی نظریہ متن کے مطالعے میں کس چیز پر زور دیتا ہے؟",
      options: ["صرف مصنف کی سوانح", "متن کے اندرونی ڈھانچے اور علامتی نظام پر", "قاری کے جذبات پر", "تاریخی سیاق و سباق پر"],
      correct: 1,
      topic: "ادبی تنقید - ساختیات",
      explain: "ساختیات کے مطابق متن اپنی جگہ ایک مکمل اور خود کفیل لسانی نظام ہوتا ہے۔"
    },
    {
      id: "urdu-59",
      q: "ادب میں 'وجودیت' (Existentialism) کا فلسفہ بنیادی طور پر کس موضوع سے متعلق ہے؟",
      options: ["انسانی وجود، آزادی اور انتخاب کے مسائل", "صرف مادی ترقی", "قدیم روایات کی پاسداری", "سائنسی ایجادات"],
      correct: 0,
      topic: "فلسفہ و ادب - وجودیت",
      explain: "وجودیت انسان کے اپنے وجود، جبریت و اختیار اور جستجو کا مطالعہ کرتی ہے۔"
    },
    {
      id: "urdu-60",
      q: "تلخیص نویسی کا بنیادی مقصد کیا ہے؟",
      options: ["کسی طویل تحریر کے مرکزی خیال کو مختصر اور جامع انداز میں پیش کرنا", "تحریر کو مزید طویل کرنا", "الفاظ کا محض شمار کرنا", "شعری وزن شامل کرنا"],
      correct: 0,
      topic: "تخلیقی تحریر - تلخیص",
      explain: "تلخیص اصل عبارت کا ایک تہائی (1/3) حصہ غیر ضروری تفصیلات کو حذف کر کے لکھی جاتی ہے۔"
    }
  ],
  "Islamic Studies": [
    // Class 9 (15 MCQs)
    {
      id: "islam-1",
      q: "قرآن مجید کی پہلی وحی کون سی سورت کی ابتدائی آیات ہیں؟",
      options: ["سورۃ الفاتحہ", "سورۃ العلق", "سورۃ البقرہ", "سورۃ الاخلاص"],
      correct: 1,
      topic: "نزولِ قرآن (جماعت نہم FBISE)",
      explain: "نبی کریم ﷺ پر غارِ حرا میں سورۃ العلق کی ابتدائی پانچ آیات نازل ہوئیں۔"
    },
    {
      id: "islam-2",
      q: "اسلام کے پانچ ارکان میں سب سے پہلا رکن کون سا ہے؟",
      options: ["نماز", "روزہ", "کلمہ شہادت (توحید و رسالت پر ایمان)", "حج"],
      correct: 2,
      topic: "ارکانِ اسلام",
      explain: "حدیثِ جبریل کے مطابق ایمان باللہ و بالرسول اسلام کا بنیادی ستون ہے۔"
    },
    {
      id: "islam-3",
      q: "نبی کریم ﷺ کی پیدائش کس شہر میں ہوئی؟",
      options: ["مدینہ منورہ", "مکہ مکرمہ", "طائف", "دمشق"],
      correct: 1,
      topic: "سیرت النبی ﷺ - ولادتِ با سعادت",
      explain: "نبی کریم ﷺ عام الفیل (571ء) میں مکہ مکرمہ میں پیدا ہوئے۔"
    },
    {
      id: "islam-4",
      q: "ہجرتِ مدینہ کس سن میں واقع ہوئی؟",
      options: ["610 عیسوی", "622 عیسوی", "632 عیسوی", "570 عیسوی"],
      correct: 1,
      topic: "سیرت النبی ﷺ - ہجرتِ مدینہ",
      explain: "622ء میں مسلمان مکہ سے مدینہ ہجرت کر گئے جس سے اسلامی تقویم (ہجری) کا آغاز ہوا۔"
    },
    {
      id: "islam-5",
      q: "زکوٰۃ کن مسلمانوں پر فرض ہے؟",
      options: ["صاحبِ نصاب مالدار مسلمانوں پر", "صرف تاجروں پر", "صرف حکمرانوں پر", "تمام غیر مسلموں پر"],
      correct: 0,
      topic: "ارکانِ اسلام - زکوٰۃ",
      explain: "زکوٰۃ ان تمام بالغ عاقل مسلمانوں پر فرض ہے جو نصابِ مال کے مالک ہوں۔"
    },
    {
      id: "islam-6",
      q: "غزوۂ بدر کس ہجری سال میں پیش آئی؟",
      options: ["1 ہجری", "2 ہجری", "5 ہجری", "8 ہجری"],
      correct: 1,
      topic: "غزواتِ نبوی ﷺ - غزوۂ بدر",
      explain: "17 رمضان المبارک 2 ہجری کو حق و باطل کا پہلا معرکہ بدر کے مقام پر برپا ہوا۔"
    },
    {
      id: "islam-7",
      q: "قرآن مجید کے مطابق نماز کن اوقات میں فرض کی گئی ہے؟",
      options: ["دن میں تین بار", "دن اور رات میں پانچ اوقات میں", "صرف جمعہ کے دن", "صرف رمضان میں"],
      correct: 1,
      topic: "ارکانِ اسلام - نماز",
      explain: "نماز فجر، ظہر، عصر، مغرب اور عشاء معینہ اوقات پر فرض کی گئی ہے۔"
    },
    {
      id: "islam-8",
      q: "حضرت خدیجہؓ کا شمار کن مسلمانوں میں ہوتا ہے؟",
      options: ["سب سے پہلے ایمان لانے والوں میں", "آخری دور کے مسلمانوں میں", "منافقین میں", "صرف تاجروں میں"],
      correct: 0,
      topic: "امہات المؤمنین - حضرت خدیجة الکبریٰؓ",
      explain: "حضرت خدیجہؓ عورتوں، مردوں اور تمام بنی نوع انسان میں سب سے پہلے اسلام لانے والی سچی عاشقِ رسول ہیں۔"
    },
    {
      id: "islam-9",
      q: "روزہ کس مہینے میں فرض کیا گیا؟",
      options: ["شعبان", "رمضان", "شوال", "ذوالحجہ"],
      correct: 1,
      topic: "ارکانِ اسلام - صوم (روزہ)",
      explain: "2 ہجری میں شعبان کے مہینے میں رمضان کے روزے فرض کیے گئے۔"
    },
    {
      id: "islam-10",
      q: "'توحید' کا بنیادی مفہوم کیا ہے؟",
      options: ["اللہ تعالیٰ کی وحدانیت پر ایمان", "کئی معبودوں پر یقین", "صرف انبیاء پر ایمان", "فرشتوں کا انکار"],
      correct: 0,
      topic: "عقائدِ اسلام - توحید",
      explain: "توحید سے مراد اللہ کو ذات، صفات اور عبادت میں یکتا و بے مثال ماننا ہے۔"
    },
    {
      id: "islam-11",
      q: "میثاقِ مدینہ کی دستاویز کا بنیادی مقصد کیا تھا؟",
      options: ["مدینہ کے مختلف قبائل اور یہود کے مابین ایک متفقہ سیاسی و سماجی نظام قائم کرنا", "صرف تجارتی معاہدہ", "جنگ کا اعلان", "زکوٰۃ کی شرح کا تعین"],
      correct: 0,
      topic: "تاریخِ اسلام - میثاقِ مدینہ",
      explain: "میثاقِ مدینہ دنیا کا پہلا تحریری بین الاقوامی آئین تسلیم کیا جاتا ہے۔"
    },
    {
      id: "islam-12",
      q: "حضرت جبرائیل علیہ السلام کا بنیادی فریضہ کیا تھا؟",
      options: ["انبیاء کرام تک اللہ کی وحی پہنچانا", "رزق تقسیم کرنا", "موت کا فرشتہ ہونا", "صور پھونکنا"],
      correct: 0,
      topic: "عقائدِ اسلام - ملائکہ",
      explain: "حضرت جبرائیلؑ تمام انبیاءِ کرامؑ تک اللہ تعالیٰ کا پیغام و وحی لانے پر مامور تھے۔"
    },
    {
      id: "islam-13",
      q: "قرآن مجید کی جمع و تدوین کا کام باقاعدہ طور پر کس خلیفہ کے دور میں مکمل ہوا؟",
      options: ["حضرت ابوبکرؓ کے دور میں آغاز اور حضرت عثمانؓ کے دور میں یکساں نسخے کی تیاری", "حضرت عمرؓ کے دور میں", "حضرت علیؓ کے دور میں", "نبی کریم ﷺ کی وفات سے پہلے مکمل کتابی صورت میں"],
      correct: 0,
      topic: "علوم القرآن - حفاظت و تدوین",
      explain: "حضرت ابوبکرؓ نے صحائف مرتب کرائے اور حضرت عثمانؓ نے امتی نسخے (مصحفِ عثمانی) تیار کروا کر بھیجے۔"
    },
    {
      id: "islam-14",
      q: "اسلام میں سب سے بڑی عبادت گاہ کون سی ہے؟",
      options: ["مسجدِ اقصیٰ", "خانہ کعبہ (مسجدِ حرام)", "مسجدِ نبوی", "مسجدِ قبا"],
      correct: 1,
      topic: "شعائرِ اسلام - بیت اللہ",
      explain: "مکہ مکرمہ میں واقع مسجدِ حرام اور بیت اللہ روئے زمین پر عبادتِ الٰہی کا پہلا مرکز ہے۔"
    },
    {
      id: "islam-15",
      q: "غار حرا میں نبی کریم ﷺ کے معمول کا بنیادی مقصد کیا تھا؟",
      options: ["تجارت کے معاملات طے کرنا", "تنہائی میں غور و فکر اور عبادت", "قبائل سے ملاقات", "جنگی حکمتِ عملی بنانا"],
      correct: 1,
      topic: "سیرت النبی ﷺ - غارِ حرا",
      explain: "بعثت سے قبل رسول اکرم ﷺ غارِ حرا میں تحنث (عبادتِ الٰہی و تفکر) فرمایا کرتے تھے۔"
    },

    // Class 10 (15 MCQs)
    {
      id: "islam-16",
      q: "خلافتِ راشدہ کے پہلے خلیفہ کون تھے؟",
      options: ["حضرت عمرؓ", "حضرت ابوبکرؓ", "حضرت عثمانؓ", "حضرت علیؓ"],
      correct: 1,
      topic: "خلافتِ راشدہ (جماعت دہم FBISE)",
      explain: "وصالِ نبوی ﷺ کے بعد اجماعِ صحابہؓ سے حضرت ابوبکر صدیقؓ خلیفہ راشد اول بنے۔"
    },
    {
      id: "islam-17",
      q: "حج کس مہینے میں ادا کیا جاتا ہے؟",
      options: ["رمضان", "شوال", "ذوالحجہ", "محرم"],
      correct: 2,
      topic: "ارکانِ اسلام - حج",
      explain: "حجِ بیت اللہ ذوالحجہ کی 8 سے 12 تاریخ کے ایام میں ادا کیا جاتا ہے۔"
    },
    {
      id: "islam-18",
      q: "حدیث کی بنیادی تعریف کیا ہے؟",
      options: ["نبی کریم ﷺ کے اقوال، افعال اور تقریرات", "صرف قرآن کی آیات", "صحابہ کرامؓ کے اشعار", "خلفائے راشدینؓ کے فرمودات"],
      correct: 0,
      topic: "علوم الحدیث",
      explain: "حدیث رسول اکرم ﷺ کے مبارک ارشادات، عمل اور صحابہ کے اعمال پر خاموش توثیق کا نام ہے۔"
    },
    {
      id: "islam-19",
      q: "حضرت عمر فاروقؓ کے دور خلافت کی نمایاں خصوصیت کیا تھی؟",
      options: ["انتظامی نظام کی توسیع اور عدل و انصاف کا قیام", "صرف مکہ تک حکومت کی توسیع", "خلافت کا خاتمہ", "قرآن کی تدوین کا آغاز"],
      correct: 0,
      topic: "خلافتِ راشدہ - حضرت عمر فاروقؓ",
      explain: "حضرت عمرؓ نے بیت المال، عدالت، پولیس اور فوجی چھاؤنیوں کا نظام قائم فرمایا۔"
    },
    {
      id: "islam-20",
      q: "جنگِ خندق میں مسلمانوں نے کس حکمتِ عملی سے دفاع کیا؟",
      options: ["مدینہ کے گرد خندق کھود کر", "کھلے میدان میں لڑ کر", "صرف مذاکرات کے ذریعے", "ہجرت کر کے"],
      correct: 0,
      topic: "غزوات - غزوۂ احزاب/خندق",
      explain: "حضرت سلمان فارسیؓ کے مشورے پر مدینہ کے غیر محفوظ جانب خندق کھودی گئی۔"
    },
    {
      id: "islam-21",
      q: "حضرت عثمانؓ کی خلافت کا ایک اہم کارنامہ کیا تھا؟",
      options: ["قرآن مجید کے متفقہ نسخے کی تدوین اور اشاعت", "خلافت کا خاتمہ", "صرف فوجی مہمات", "زکوٰۃ کا خاتمہ"],
      correct: 0,
      topic: "خلافتِ راشدہ - حضرت عثمان غنیؓ",
      explain: "قرأت کے اختلاف کو مٹانے کے لیے حضرت عثمانؓ نے تمام نسخوں کو مصحفِ ام پر جمع فرمایا۔"
    },
    {
      id: "islam-22",
      q: "اسلامی معاشرے میں یتیموں کے حقوق کے بارے میں قرآن کیا تعلیم دیتا ہے؟",
      options: ["ان کے مال کی حفاظت اور ان سے حسنِ سلوک", "ان کے حقوق کو نظر انداز کرنا", "صرف مالی امداد کی ممانعت", "کوئی خاص ہدایت نہیں"],
      correct: 0,
      topic: "حقوق العباد - یتیموں کی کفالت",
      explain: "قرآن مجید میں یتیم کے مال کو ناحق کھانے کی سخت وعید آئی ہے۔"
    },
    {
      id: "islam-23",
      q: "حضرت علیؓ کے دور خلافت میں پیش آنے والے بڑے چیلنجز میں کیا شامل تھا؟",
      options: ["داخلی خانہ جنگی اور سیاسی انتشار", "مکمل اتحاد اور امن", "خلافت کی توسیع میں مکمل کامیابی بلا رکاوٹ", "قرآن کی تدوین کا مسئلہ"],
      correct: 0,
      topic: "خلافتِ راشدہ - حضرت علی مرتضیٰؓ",
      explain: "شہادتِ عثمانؓ کے بعد پیدا ہونے والے فتنے اور داخلی اختلافات حضرت علیؓ کے دور میں ملتے ہیں۔"
    },
    {
      id: "islam-24",
      q: "اسلام میں سود (ربا) کے بارے میں بنیادی حکم کیا ہے؟",
      options: ["حرام قرار دیا گیا ہے", "مکمل طور پر جائز ہے", "صرف تاجروں کے لیے جائز ہے", "صرف بینکوں کے لیے مباح ہے"],
      correct: 0,
      topic: "اسلامی معیشت - حرمتِ ربا",
      explain: "قرآن مجید میں سود کو اللہ اور اس کے رسول کے خلاف جنگ قرار دیا گیا ہے۔"
    },
    {
      id: "islam-25",
      q: "صلہ رحمی کا مطلب کیا ہے؟",
      options: ["رشتہ داروں سے حسنِ سلوک اور تعلقات کو برقرار رکھنا", "رشتہ داروں سے قطع تعلق", "صرف پڑوسیوں سے تعلق", "صرف دوستوں سے میل جول"],
      correct: 0,
      topic: "حقوق العباد - صلہ رحمی",
      explain: "صلہ رحمی سے مال و عمر میں برکت اور اللہ کی خوشنودی حاصل ہوتی ہے۔"
    },
    {
      id: "islam-26",
      q: "حجۃ الوداع کے خطبے میں نبی کریم ﷺ نے کن بنیادی حقوق کی تاکید فرمائی؟",
      options: ["انسانی مساوات، عورتوں کے حقوق اور جان و مال کی حرمت", "صرف تجارتی معاملات", "صرف جنگی احکام", "زکوٰۃ کی شرح میں تبدیلی"],
      correct: 0,
      topic: "خطبہ حجۃ الوداع - حقوقِ انسانی",
      explain: "خطبہ حجۃ الوداع عالمی منشورِ حقوقِ انسانی کا لازوال نقشہ ہے۔"
    },
    {
      id: "islam-27",
      q: "اسلام میں امانت داری کی کیا اہمیت بیان کی گئی ہے؟",
      options: ["یہ ایمان کا لازمی جزو اور مؤمن کی نمایاں صفت ہے", "اس کی کوئی اہمیت نہیں", "صرف حکمرانوں کے لیے ضروری ہے", "صرف تجارت میں ضروری ہے"],
      correct: 0,
      topic: "اسلامی اخلاقیات - امانت و دیانت",
      explain: "حدیث نبوی ﷺ: 'جس میں امانت داری نہیں اس کا کوئی ایمان نہیں۔'"
    },
    {
      id: "islam-28",
      q: "خلفائے راشدینؓ کے دور کو 'خلافتِ راشدہ' کیوں کہا جاتا ہے؟",
      options: ["کیونکہ یہ ہدایت یافتہ اور عادلانہ خلافت کا دور تھا", "صرف جغرافیائی وسعت کی بنا پر", "کیونکہ یہ موروثی نظام تھا", "کیونکہ یہ صرف مکہ تک محدود تھا"],
      correct: 0,
      topic: "خلافتِ راشدہ - مفہوم",
      explain: "یہ دور نبوت کے منہج پر مبنی راشدہ و عادلہ حکومت کا دور تھا۔"
    },
    {
      id: "islam-29",
      q: "اسلام میں پڑوسیوں کے حقوق کے متعلق کیا تعلیم دی گئی ہے؟",
      options: ["ان کے ساتھ حسنِ سلوک اور خیال رکھنا لازم ہے", "ان سے کوئی تعلق ضروری نہیں", "صرف مسلمان پڑوسیوں کا خیال رکھنا ہے", "پڑوسیوں کے حقوق کا کوئی تصور نہیں"],
      correct: 0,
      topic: "حقوق العباد - پڑوسیوں کے حقوق",
      explain: "نبی کریم ﷺ نے فرمایا جبرائیلؑ پڑوسی کے حقوق کی اتنی تاکید کرتے رہے کہ مجھے گمان ہوا کہ اسے وارث بنا دیں گے۔"
    },
    {
      id: "islam-30",
      q: "غزوۂ حنین میں ابتدائی پسپائی کے بعد مسلمانوں کی کامیابی کی بنیادی وجہ کیا بیان کی جاتی ہے؟",
      options: ["نبی کریم ﷺ کی ثابت قدمی اور صحابہ کرامؓ کا دوبارہ منظم ہونا", "دشمن کی پسپائی بغیر لڑائی کے", "صرف تعداد کی برتری", "مذاکرات کے ذریعے صلح"],
      correct: 0,
      topic: "غزوات - غزوۂ حنین",
      explain: "رسول اللہ ﷺ کے میدان میں جمے رہنے اور نداءِ صحابہ سے فتحِ مبین حاصل ہوئی۔"
    },

    // Class 11 (15 MCQs)
    {
      id: "islam-31",
      q: "قرآن مجید کو مسلمانوں کے لیے ہدایت کا بنیادی سرچشمہ کیوں قرار دیا گیا ہے؟",
      options: ["کیونکہ یہ اللہ تعالیٰ کا آخری اور محفوظ کلام ہے", "کیونکہ یہ انسانی تصنیف ہے", "کیونکہ یہ صرف تاریخی کتاب ہے", "کیونکہ یہ فقط عربی ادب کا نمونہ ہے"],
      correct: 0,
      topic: "علوم القرآن (جماعت یازدہم FBISE)",
      explain: "قرآن مجید قیامت تک تمام انسانیت کے لیے عالمگیر ہدایت کا ضامن کلام ہے۔"
    },
    {
      id: "islam-32",
      q: "سنت سے کیا مراد ہے؟",
      options: ["نبی کریم ﷺ کا طرزِ عمل، اقوال اور تقریرات", "صرف قرآنی آیات", "صحابہ کرامؓ کی رائے", "فقہاء کے اجتہادات"],
      correct: 0,
      topic: "سنت و حدیث - اہمیت",
      explain: "سنت قرآن کی عملی تفسیر اور تشریح و تبئین فراہم کرتی ہے۔"
    },
    {
      id: "islam-33",
      q: "اجتہاد کی اصطلاحی تعریف کیا ہے؟",
      options: ["کسی نئے مسئلے میں قرآن و سنت کی روشنی میں غور و فکر کر کے حکم اخذ کرنا", "قرآن کی تلاوت کرنا", "صرف حدیث کو یاد کرنا", "نماز کی ادائیگی کا طریقہ"],
      correct: 0,
      topic: "اصولِ فقہ - اجتہاد",
      explain: "جدید دور کے غیر منصوص مسائل کا حل اجتہاد کے ذریعے تلاش کیا جاتا ہے۔"
    },
    {
      id: "islam-34",
      q: "اسلامی نظامِ معیشت میں سود کی حرمت کے پیچھے بنیادی حکمت کیا بیان کی جاتی ہے؟",
      options: ["معاشی استحصال کا خاتمہ اور مساوات کا فروغ", "صرف تجارت کو محدود کرنا", "بینکاری نظام کا خاتمہ", "زکوٰۃ کا متبادل فراہم کرنا"],
      correct: 0,
      topic: "اسلامی نظامِ معیشت",
      explain: "سود سے سرمائے کی چند ہاتھوں میں گردش اور غریب کا استحصال ہوتا ہے۔"
    },
    {
      id: "islam-35",
      q: "خلافت اور بادشاہت میں بنیادی فرق کیا ہے؟",
      options: ["خلافت شورائیت اور اسلامی اصولوں پر مبنی نظام ہے جبکہ بادشاہت موروثی ہوتی ہے", "دونوں ایک ہی نظام ہیں", "خلافت میں کوئی مشاورت نہیں ہوتی", "بادشاہت اسلامی اصطلاح ہے"],
      correct: 0,
      topic: "اسلامی نظامِ حکومت",
      explain: "خلافت میں حاکمیتِ الٰہیہ، شوریٰ اور احتساب بنیادی خصوصیات ہیں۔"
    },
    {
      id: "islam-36",
      q: "اسلام میں انسانی حقوق کے تصور کی بنیاد کیا ہے؟",
      options: ["تمام انسانوں کی مساوات اور کرامت پر مبنی الٰہی تعلیمات", "صرف طبقاتی امتیاز", "نسلی برتری", "صرف مالی حیثیت"],
      correct: 0,
      topic: "اسلام اور انسانی حقوق",
      explain: "اسلام میں تکریمِ بنی آدم کو رنگ، نسل اور زبان سے بالاتر رکھا گیا ہے۔"
    },
    {
      id: "islam-37",
      q: "فقہ اسلامی میں 'قیاس' کس چیز کو کہتے ہیں؟",
      options: ["نئے مسئلے کا حکم کسی مشابہ اصل مسئلے کی علت کی بنیاد پر اخذ کرنا", "قرآن کی براہِ راست تلاوت", "اجماعِ امت کا انکار", "صرف ذاتی رائے پر عمل"],
      correct: 0,
      topic: "اصولِ فقہ - قیاس",
      explain: "قیاس مصادرِ شریعت کا چوتھا بڑا مآخذ ہے۔"
    },
    {
      id: "islam-38",
      q: "اسلامی تہذیب کے فروغ میں مسلم سائنسدانوں کا کیا کردار رہا؟",
      options: ["علم و تحقیق کے میدان میں نمایاں خدمات", "علم سے مکمل اجتناب", "صرف فوجی سرگرمیاں", "صرف تجارتی سرگرمیاں"],
      correct: 0,
      topic: "اسلامی تہذیب و سائنس",
      explain: "ابنِ سینا، الخوارزمی اور جابر بن حیان نے سائنس کے علوم کی بنیاد رکھی۔"
    },
    {
      id: "islam-39",
      q: "اسلام میں شورائیت (مشاورت) کے نظام کی بنیادی اہمیت کیا ہے؟",
      options: ["اجتماعی فیصلوں میں انصاف اور بہتری کو یقینی بنانا", "فیصلوں میں تاخیر پیدا کرنا", "صرف حکمران کی مرضی کا نفاذ", "عوام کو فیصلوں سے دور رکھنا"],
      correct: 0,
      topic: "اسلامی سیاسی نظام - شوریٰ",
      explain: "قرآن مجید کی صریح ہدایت: 'وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ'۔"
    },
    {
      id: "islam-40",
      q: "اسلامی قانون میں مصادرِ اربعہ (چار بنیادی مآخذ) کیا شمار کیے جاتے ہیں؟",
      options: ["قرآن، سنت، اجماع اور قیاس", "صرف قرآن اور حدیث", "صرف عرف اور رواج", "صرف فقہاء کی آراء"],
      correct: 0,
      topic: "مآخذِ شریعت",
      explain: "فقہِ اسلامی ان چاروں مصادر و ادلہ شرعیہ پر مبنی ہے۔"
    },
    {
      id: "islam-41",
      q: "اسلام میں علم حاصل کرنے کی کیا حیثیت بیان کی گئی ہے؟",
      options: ["ہر مسلمان مرد و عورت پر فرض قرار دیا گیا ہے", "صرف علماء کے لیے ضروری ہے", "اختیاری معاملہ ہے", "صرف دنیاوی علم تک محدود ہے"],
      correct: 0,
      topic: "تعلیماتِ اسلام - حصولِ علم",
      explain: "حدیثِ مبارکہ: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ'۔"
    },
    {
      id: "islam-42",
      q: "عہدِ رسالت میں تجارتی معاملات میں دیانت داری پر کیوں زور دیا گیا؟",
      options: ["معاشی نظام میں اعتماد اور شفافیت قائم رکھنے کے لیے", "صرف منافع بڑھانے کے لیے", "اجارہ داری کے فروغ کے لیے", "تجارت کی حوصلہ شکنی کے لیے"],
      correct: 0,
      topic: "اسلامی معیشت - تجارت",
      explain: "سچا اور امانت دار تاجر قیامت کے دن انبیاء، صدیقین اور شہداء کے ساتھ ہوگا۔"
    },
    {
      id: "islam-43",
      q: "اسلامی عبادات میں روزے کا بنیادی مقصد قرآن میں کیا بیان ہوا ہے؟",
      options: ["تقویٰ کا حصول", "صرف بھوک برداشت کرنا", "جسمانی کمزوری", "کوئی روحانی مقصد نہیں"],
      correct: 0,
      topic: "حکمتِ عبادات - روزہ",
      explain: "قرآن کا ارشاد: 'لَعَلَّكُمْ تَتَّقُونَ' تاکہ تم تقویٰ اختیار کرو۔"
    },
    {
      id: "islam-44",
      q: "اسلامی نظامِ عدل میں قاضی کی تقرری میں کن اوصاف کو بنیادی حیثیت حاصل ہے؟",
      options: ["علم، دیانت اور تقویٰ", "صرف خاندانی حیثیت", "صرف مالی وسعت", "صرف عمر رسیدگی"],
      correct: 0,
      topic: "عدلیہ - شرائطِ قاضی",
      explain: "قاضی کا عالم، عادل، متقی اور غیر جانبدار ہونا شرطِ اول ہے۔"
    },
    {
      id: "islam-45",
      q: "اسلام میں غلامی کے خاتمے کے لیے کون سے اقدامات کی ترغیب دی گئی؟",
      options: ["غلاموں کی آزادی کو نیکی اور کفارے کا ذریعہ قرار دیا گیا", "غلامی کے نظام کو مزید مضبوط کیا گیا", "کوئی خاص ہدایت نہیں دی گئی", "صرف جنگی قیدیوں کو مستثنیٰ رکھا گیا"],
      correct: 0,
      topic: "اصلاحِ معاشرہ - انسانی آزادی",
      explain: "اسلام نے غلاموں کی مکاتبت اور آزادی کو عظیم ثواب قرار دیا۔"
    },

    // Class 12 (15 MCQs)
    {
      id: "islam-46",
      q: "اسلامی نظامِ زندگی میں عبادات اور معاملات کا باہمی تعلق کیسا بیان کیا گیا ہے؟",
      options: ["دونوں ایک دوسرے سے جڑے اور مکمل نظامِ حیات کا حصہ ہیں", "دونوں کا آپس میں کوئی تعلق نہیں", "صرف عبادات اہم ہیں", "صرف معاملات اہم ہیں"],
      correct: 0,
      topic: "اسلام کامل نظامِ حیات (جماعت دوازدہم FBISE)",
      explain: "اسلام کوئی محض چند عبادات کا نام نہیں بلکہ کامل ضابطہء حیات ہے۔"
    },
    {
      id: "islam-47",
      q: "اسلامی معاشی نظام میں زکوٰۃ کا بنیادی سماجی مقصد کیا بیان کیا جاتا ہے؟",
      options: ["دولت کی منصفانہ تقسیم اور غربت کا خاتمہ", "صرف مالداروں کی دولت میں اضافہ", "حکومتی خزانے کو محدود کرنا", "تجارت کی حوصلہ شکنی"],
      correct: 0,
      topic: "اسلامی معیشت - زکوٰۃ",
      explain: "زکوٰۃ مالداروں سے لے کر حاجت مندوں کو دینے کا توازن قائم کرتی ہے۔"
    },
    {
      id: "islam-48",
      q: "اسلام میں خاندانی نظام کی بنیادی اکائی کس رشتے کو قرار دیا گیا ہے؟",
      options: ["نکاح پر مبنی خاندان", "صرف قبائلی نظام", "صرف دوستی کے رشتے", "کوئی خاص اکائی نہیں"],
      correct: 0,
      topic: "اسلامی خاندانی نظام",
      explain: "نکاح معاشرتی استحکام، عفت اور پاکیزگی کا اولین ضامن معاہدہ ہے۔"
    },
    {
      id: "islam-49",
      q: "عصرِ حاضر میں اجتہاد کی ضرورت کیوں محسوس کی جاتی ہے؟",
      options: ["نئے پیدا ہونے والے مسائل کا قرآن و سنت کی روشنی میں حل تلاش کرنے کے لیے", "قدیم فقہی آراء کو مکمل رد کرنے کے لیے", "دین میں تبدیلی لانے کے لیے", "صرف علماء کی تعداد بڑھانے کے لیے"],
      correct: 0,
      topic: "عصرِ حاضر اور اجتہاد",
      explain: "میڈیکل سائنس، فنانس اور جدید ٹیکنالوجی کے نت نئے مسائل پر شرعی رہنمائی اجتہاد سے ملتی ہے۔"
    },
    {
      id: "islam-50",
      q: "اسلامی تعلیمات میں بین الاقوامی تعلقات اور امن کے حوالے سے بنیادی اصول کیا ہے؟",
      options: ["عدل، وفائے عہد اور غیر مسلموں کے حقوق کا احترام", "صرف جنگ و جدل", "دوسرے مذاہب کے ساتھ مکمل قطع تعلق", "صرف اقتصادی مفادات"],
      correct: 0,
      topic: "اسلام اور بین الاقوامی تعلقات",
      explain: "قرآن مجید تمام اقوام کے ساتھ عدل اور معاہدوں کی پاسداری کا حکم دیتا ہے۔"
    },
    {
      id: "islam-51",
      q: "اسلام میں عورتوں کو وراثت میں حصہ دینے کا حکم کس منبع سے ثابت ہے؟",
      options: ["قرآن مجید کی واضح آیات سے", "صرف رسم و رواج سے", "صرف اجتہادی رائے سے", "کسی مآخذ سے ثابت نہیں"],
      correct: 0,
      topic: "حقوقِ نسواں - وراثت",
      explain: "سورۃ النساء (آیت 7 و 11) میں عورتوں کے حقِ وراثت کا صریح و حتمی حکم دیا گیا۔"
    },
    {
      id: "islam-52",
      q: "جدید دور میں سائنس اور اسلام کے باہمی تعلق کے بارے میں عمومی مؤقف کیا ہے؟",
      options: ["اسلام علم و تحقیق کی حوصلہ افزائی کرتا ہے اور سائنس سے متصادم نہیں", "اسلام سائنسی ترقی کے خلاف ہے", "دونوں کا آپس میں کوئی تعلق نہیں", "اسلام صرف روحانی معاملات تک محدود ہے"],
      correct: 0,
      topic: "اسلام اور سائنس",
      explain: "قرآن مجید میں کائنات میں تدبر اور سائنسی حقائق پر سوینچنے کی سینکڑوں آیات ہیں۔"
    },
    {
      id: "islam-53",
      q: "اسلامی ریاست میں غیر مسلم شہریوں (اہلِ ذمہ) کے حقوق کے بارے میں بنیادی اصول کیا ہے؟",
      options: ["ان کی جان، مال اور عبادت کی آزادی کا تحفظ کیا جائے", "انہیں کسی قسم کے حقوق حاصل نہیں", "صرف جزیہ کی ادائیگی ضروری ہے، کوئی حق نہیں", "انہیں ریاست سے بے دخل کیا جانا چاہیے"],
      correct: 0,
      topic: "اقلیتوں کے حقوق - ذمی",
      explain: "حدیثِ نبوی ﷺ: 'جس نے کسی ذمی پر ظلم کیا میں قیامت کے دن اس کے خلاف مدعی ہوں گا۔'"
    },
    {
      id: "islam-54",
      q: "اسلام میں انسانی جان کے تقدس کے متعلق بنیادی تعلیم کیا ہے؟",
      options: ["ایک انسان کا قتل پوری انسانیت کے قتل کے مترادف قرار دیا گیا", "جان کی کوئی حرمت نہیں", "صرف مسلمانوں کی جان کا تقدس ہے", "کوئی واضح تعلیم نہیں"],
      correct: 0,
      topic: "احترامِ انسانیت",
      explain: "سورۃ المائدہ میں ایک بے گناہ نفس کے قتل کو پوری انسانیت کا قتل قرار دیا گیا۔"
    },
    {
      id: "islam-55",
      q: "عالمِ اسلام میں اتحاد کے فروغ کے لیے قرآن کس بنیادی اصول کی طرف رہنمائی کرتا ہے؟",
      options: ["اعتصام بالحبل اللہ (اللہ کی رسی کو مضبوطی سے تھامنا) اور باہمی اتحاد", "فرقہ بندی کی حوصلہ افزائی", "صرف علاقائی تعصب", "قومیت پر مبنی تقسیم"],
      correct: 0,
      topic: "اتحادِ امت",
      explain: "قرآن کا حکم: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا'۔"
    },
    {
      id: "islam-56",
      q: "اسلامی معاشرت میں حسنِ اخلاق کی بنیادی اہمیت کس حدیث مبارکہ سے واضح ہوتی ہے؟",
      options: ["نبی کریم ﷺ کے فرمان کے مطابق سب سے کامل مومن وہ ہے جس کے اخلاق سب سے بہتر ہوں", "اخلاق کی کوئی خاص اہمیت نہیں", "صرف عبادات کافی ہیں", "اخلاق صرف دنیاوی معاملہ ہے"],
      correct: 0,
      topic: "اسلامی اخلاقیات",
      explain: "بعثتِ نبوی ﷺ کا اصل مقصد ہی مکارمِ اخلاق کی تکمیل فرمایا جانا تھا۔"
    },
    {
      id: "islam-57",
      q: "عصرِ حاضر کے چیلنجز میں 'الحاد و مادیت پرستی' کے مقابلے میں اسلامی فکر کیا مؤقف پیش کرتی ہے؟",
      options: ["توحید، آخرت پر ایمان اور روحانی و مادی توازن پر مبنی نظریۂ حیات", "مکمل مادہ پرستی کی حمایت", "دین اور دنیا کی مکمل علیحدگی", "کوئی واضح مؤقف نہیں"],
      correct: 0,
      topic: "عصرِ حاضر کے چیلنجز",
      explain: "اسلام روحانیت اور مادیت دونوں کا توازن اور بندگیِ الٰہی کا درس دیتا ہے۔"
    },
    {
      id: "islam-58",
      q: "اسلامی تعلیمات کے مطابق ماحولیات اور قدرتی وسائل کے استعمال میں انسان کی حیثیت کیا بیان کی گئی ہے؟",
      options: ["زمین پر اللہ کا خلیفہ اور امانت دار", "وسائل کا لامحدود مالک", "کوئی ذمہ داری نہیں", "فطرت سے مکمل بے تعلق"],
      correct: 0,
      topic: "اسلام اور ماحولیات",
      explain: "انسان کو نیچر اور کائنات کا امانت دار محافظ و خلیفہ بنایا گیا ہے۔"
    },
    {
      id: "islam-59",
      q: "اسلام میں عدل و انصاف کے قیام کو کس چیز سے مشروط قرار دیا گیا؟",
      options: ["دشمن سے بھی انصاف کے تقاضے پورے کرنا", "صرف اپنوں کے ساتھ انصاف کرنا", "طاقتور کی رعایت", "انصاف کا کوئی معیار نہیں"],
      correct: 0,
      topic: "عدل و انصاف",
      explain: "قرآن کا ارشاد: کسی قوم کی دشمنی تمہیں نا انصافی پر نہ ابھارنے پائے۔"
    },
    {
      id: "islam-60",
      q: "عصرِ حاضر میں اسلامی بینکاری کے نظام کا بنیادی فلسفہ کیا ہے؟",
      options: ["سود کے بغیر منافع و نقصان کی شراکت پر مبنی معاشی لین دین", "روایتی سودی نظام کا تسلسل", "صرف نقد لین دین کی ممانعت", "بینکاری کا مکمل خاتمہ"],
      correct: 0,
      topic: "اسلامی بینکاری",
      explain: "اسلامی بینک مضاربہ و مشارکہ پر حلال تجارت و منافع پر کام کرتے ہیں۔"
    }
  ]
};

import { MDCAT_PREBUILT_QUESTIONS, generateMDCATFullMockBank } from './mdcatPrebuiltQuestions';
import { TCAT_PREBUILT_QUESTIONS, generateTCATFullMockBank } from './tcatPrebuiltQuestions';

// Map aliases for prebuilt lookup so queries never fail
PREBUILT_QUESTIONS["Islamiat"] = PREBUILT_QUESTIONS["Islamic Studies"];
PREBUILT_QUESTIONS["Islamiyat"] = PREBUILT_QUESTIONS["Islamic Studies"];
PREBUILT_QUESTIONS["Pak Studies"] = PREBUILT_QUESTIONS["Pakistan Studies"];
PREBUILT_QUESTIONS["Pak-Studies"] = PREBUILT_QUESTIONS["Pakistan Studies"];

/**
 * Safely fetches prebuilt questions for any requested subject.
 * Uses centralized mapSubject — NEVER defaults to another subject!
 */
export function getPrebuiltQuestionsForSubject(subjectName: string): Question[] {
  if (!subjectName) return [];

  const clean = subjectName.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('tcat full') || lower.includes('tcat mock')) {
    return generateTCATFullMockBank();
  }

  if (lower.includes('mdcat full') || lower.includes('full mock')) {
    return generateMDCATFullMockBank();
  }

  if (lower.includes('logic') || lower.includes('reasoning')) {
    return MDCAT_PREBUILT_QUESTIONS['Logical Reasoning'] || [];
  }

  if (TCAT_PREBUILT_QUESTIONS[clean]) {
    return TCAT_PREBUILT_QUESTIONS[clean];
  }

  if (MDCAT_PREBUILT_QUESTIONS[clean]) {
    return MDCAT_PREBUILT_QUESTIONS[clean];
  }

  const canon = mapSubject(subjectName);
  return TCAT_PREBUILT_QUESTIONS[canon] || MDCAT_PREBUILT_QUESTIONS[canon] || PREBUILT_QUESTIONS[canon] || PREBUILT_QUESTIONS[subjectName] || [];
}
