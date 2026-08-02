import fs from 'fs';
import path from 'path';

export interface MCQRaw {
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

export interface ChapterMCQs {
  topic: string;
  questions: MCQRaw[];
}

const allChapters: ChapterMCQs[] = [
  // 1. Complex Numbers
  {
    topic: 'Complex Numbers',
    questions: [
      {
        q: 'What is the simplified value of $i^{103}$, where $i = \\sqrt{-1}$?',
        options: ['$1$', '$-1$', '$i$', '$-i$'],
        correct: 3,
        explain: '$i^{103} = (i^4)^{25} \\cdot i^3 = 1^{25} \\cdot (-i) = -i$.'
      },
      {
        q: 'If $z = 3 - 4i$, what is the modulus $|z|$?',
        options: ['$7$', '$5$', '$\\sqrt{7}$', '$25$'],
        correct: 1,
        explain: '$|z| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = 5$.'
      },
      {
        q: 'What is the multiplicative inverse of $1 + i$?',
        options: ['$1 - i$', '$\\frac{1}{2} - \\frac{1}{2}i$', '$\\frac{1}{2} + \\frac{1}{2}i$', '$-1 - i$'],
        correct: 1,
        explain: 'Multiplicative inverse is $\\frac{1}{1+i} = \\frac{1-i}{1^2 - i^2} = \\frac{1-i}{2} = \\frac{1}{2} - \\frac{1}{2}i$.'
      },
      {
        q: 'If $\\omega$ is a complex cube root of unity, what is the value of $1 + \\omega + \\omega^2$?',
        options: ['$1$', '$3$', '$0$', '$-1$'],
        correct: 2,
        explain: 'The sum of all three complex cube roots of unity is identically zero.'
      },
      {
        q: 'What is the value of $(1 + \\omega - \\omega^2)^3$ where $\\omega$ is a complex cube root of unity?',
        options: ['$-8$', '$8$', '$-8\\omega$', '$0$'],
        correct: 0,
        explain: 'Since $1 + \\omega = -\\omega^2$, the expression becomes $(-2\\omega^2)^3 = -8\\omega^6 = -8$.'
      },
      {
        q: 'The polar form of the complex number $z = -1 + i\\sqrt{3}$ is:',
        options: [
          '$2\\left(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}\\right)$',
          '$2\\left(\\cos\\frac{2\\pi}{3} + i\\sin\\frac{2\\pi}{3}\\right)$',
          '$\\sqrt{2}\\left(\\cos\\frac{3\\pi}{4} + i\\sin\\frac{3\\pi}{4}\\right)$',
          '$2\\left(\\cos\\frac{5\\pi}{6} + i\\sin\\frac{5\\pi}{6}\\right)$'
        ],
        correct: 1,
        explain: '$r = \\sqrt{(-1)^2 + (\\sqrt{3})^2} = 2$, $\\theta = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$.'
      },
      {
        q: 'Which of the following identities holds for all complex numbers $z_1, z_2$?',
        options: [
          '$|z_1 + z_2| = |z_1| + |z_2|$',
          '$|z_1 z_2| = |z_1| |z_2|$',
          '$\\overline{z_1 z_2} = z_1 z_2$',
          '$\\arg(z_1 z_2) = \\arg(z_1) \\arg(z_2)$'
        ],
        correct: 1,
        explain: 'Modulus of a product equals the product of their individual moduli.'
      },
      {
        q: 'If $z = a + ib$, then $z \\cdot \\bar{z}$ is equal to:',
        options: ['$a^2 - b^2$', '$a^2 + b^2$', '$2a$', '$2ib$'],
        correct: 1,
        explain: '$z \\cdot \\bar{z} = (a+ib)(a-ib) = a^2 - i^2 b^2 = a^2 + b^2$.'
      },
      {
        q: 'According to De Moivre’s Theorem, $(\\cos\\theta + i\\sin\\theta)^n$ equals:',
        options: [
          '$\\cos n\\theta + i\\sin n\\theta$',
          '$n(\\cos\\theta + i\\sin\\theta)$',
          '$\\cos^n\\theta + i\\sin^n\\theta$',
          '$\\cos n\\theta - i\\sin n\\theta$'
        ],
        correct: 0,
        explain: 'De Moivre’s Theorem states $(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$.'
      },
      {
        q: 'What is the real part of $\\frac{2 + 3i}{1 - 2i}$?',
        options: ['$\\frac{8}{5}$', '$-\\frac{4}{5}$', '$-\\frac{4}{5} + \\frac{7}{5}i$', '$\\frac{4}{5}$'],
        correct: 1,
        explain: '$\\frac{(2+3i)(1+2i)}{1+4} = \\frac{-4 + 7i}{5} = -\\frac{4}{5} + \\frac{7}{5}i$. Real part is $-\\frac{4}{5}$.'
      }
    ]
  },

  // 2. Sets, Functions & Groups
  {
    topic: 'Sets, Functions & Groups',
    questions: [
      {
        q: 'If a set $A$ has $n$ elements, how many elements does the power set $P(A)$ contain?',
        options: ['$n^2$', '$2^n$', '$2n$', '$n!$'],
        correct: 1,
        explain: 'The total number of subsets of a set containing $n$ elements is $2^n$.'
      },
      {
        q: 'According to De Morgan’s Laws, $(A \\cup B)\'$ is equal to:',
        options: ['$A\' \\cup B\'$', '$A\' \\cap B\'$', '$A \\cap B$', '$A\' \\setminus B\'$'],
        correct: 1,
        explain: 'De Morgan’s law states $(A \\cup B)\' = A\' \\cap B\'$.'
      },
      {
        q: 'If $f: \\mathbb{R} \\to \\mathbb{R}$ is defined by $f(x) = 2x + 3$, what is $f^{-1}(x)$?',
        options: ['$\\frac{x - 3}{2}$', '$\\frac{x + 3}{2}$', '$2x - 3$', '$\\frac{1}{2x + 3}$'],
        correct: 0,
        explain: 'Let $y = 2x + 3 \\implies x = \\frac{y - 3}{2} \\implies f^{-1}(x) = \\frac{x - 3}{2}$.'
      },
      {
        q: 'A function $f: A \\to B$ is bijective if and only if it is:',
        options: ['Injective only', 'Surjective only', 'Both Injective and Surjective', 'Neither Injective nor Surjective'],
        correct: 2,
        explain: 'A function is bijective (one-to-one correspondence) if it is both one-to-one (injective) and onto (surjective).'
      },
      {
        q: 'In a group $(G, *)$, the inverse of an element $a \\in G$ is:',
        options: ['Not necessarily unique', 'Always unique', 'Equal to $a$', 'Equal to identity element'],
        correct: 1,
        explain: 'By the axioms of group theory, every element in a group has a unique inverse.'
      },
      {
        q: 'Which of the following algebraic structures is an Abelian group under addition?',
        options: ['$(\\mathbb{Z}, +)$', '$(\\mathbb{N}, +)$', '$(\\mathbb{Z}, \\cdot)$', '$(\\mathbb{R}, \\cdot)$'],
        correct: 0,
        explain: 'The set of integers $(\\mathbb{Z}, +)$ satisfies closure, associativity, zero identity, additive inverse, and commutativity.'
      },
      {
        q: 'If $A = \\{1, 2, 3\\}$ and $B = \\{3, 4\\}$, then $A \\setminus B$ is:',
        options: ['$\\{1, 2\\}$', '$\\{4\\}$', '$\\{1, 2, 3, 4\\}$', '$\\{3\\}$'],
        correct: 0,
        explain: '$A \\setminus B$ contains elements present in $A$ but not in $B$: $\\{1, 2\\}$.'
      },
      {
        q: 'What is the identity element in the group $(\\mathbb{R} \\setminus \\{0\\}, \\cdot)$?',
        options: ['$0$', '$1$', '$-1$', 'Does not exist'],
        correct: 1,
        explain: 'For multiplication on real numbers, $x \\cdot 1 = 1 \\cdot x = x$, so $1$ is the multiplicative identity.'
      },
      {
        q: 'If $f(x) = x^2$ and $g(x) = x + 1$, what is $(f \\circ g)(2)$?',
        options: ['$5$', '$9$', '$3$', '$8$'],
        correct: 1,
        explain: '$(f \\circ g)(2) = f(g(2)) = f(3) = 3^2 = 9$.'
      },
      {
        q: 'The set of 4th roots of unity $\\{1, -1, i, -i\\}$ forms a group under:',
        options: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
        correct: 2,
        explain: '$\\cdot$ is closed, associative, $1$ is identity, $1^{-1}=1, (-1)^{-1}=-1, i^{-1}=-i, (-i)^{-1}=i$.'
      }
    ]
  },

  // 3. Quadratic Equations
  {
    topic: 'Quadratic Equations',
    questions: [
      {
        q: 'What are the roots of the quadratic equation $x^2 - 5x + 6 = 0$?',
        options: ['$2, 3$', '$-2, -3$', '$1, 6$', '$-1, -6$'],
        correct: 0,
        explain: '$(x - 2)(x - 3) = 0 \\implies x = 2, 3$.'
      },
      {
        q: 'The discriminant of $ax^2 + bx + c = 0$ is given by $D = b^2 - 4ac$. If $D < 0$, the roots are:',
        options: ['Real and equal', 'Real and distinct', 'Complex / Imaginary', 'Rational and unequal'],
        correct: 2,
        explain: 'When the discriminant is negative ($b^2 - 4ac < 0$), the square root yields imaginary conjugate pairs.'
      },
      {
        q: 'If $\\alpha, \\beta$ are roots of $2x^2 + 3x - 5 = 0$, what is the sum of roots $\\alpha + \\beta$?',
        options: ['$\\frac{3}{2}$', '$-\\frac{3}{2}$', '$-\\frac{5}{2}$', '$\\frac{5}{2}$'],
        correct: 1,
        explain: 'Sum of roots $\\alpha + \\beta = -\\frac{b}{a} = -\\frac{3}{2}$.'
      },
      {
        q: 'If one root of $x^2 - 6x + k = 0$ is $2$, what is the value of $k$?',
        options: ['$8$', '$-8$', '$12$', '$4$'],
        correct: 0,
        explain: 'Substitute $x = 2$: $2^2 - 6(2) + k = 0 \\implies 4 - 12 + k = 0 \\implies k = 8$.'
      },
      {
        q: 'According to the Remainder Theorem, when $P(x) = x^3 - 2x^2 + 3x - 1$ is divided by $x - 2$, the remainder is:',
        options: ['$3$', '$5$', '$1$', '$0$'],
        correct: 1,
        explain: 'Remainder $R = P(2) = 2^3 - 2(2^2) + 3(2) - 1 = 8 - 8 + 6 - 1 = 5$.'
      },
      {
        q: 'What is the product of all three complex cube roots of unity ($1 \\cdot \\omega \\cdot \\omega^2$)?',
        options: ['$0$', '$1$', '$-1$', '$\\omega$'],
        correct: 1,
        explain: '$1 \\cdot \\omega \\cdot \\omega^2 = \\omega^3 = 1$.'
      },
      {
        q: 'The quadratic equation whose roots are $3$ and $-4$ is:',
        options: ['$x^2 + x - 12 = 0$', '$x^2 - x - 12 = 0$', '$x^2 + 7x - 12 = 0$', '$x^2 - 7x + 12 = 0$'],
        correct: 0,
        explain: 'Sum $S = 3 + (-4) = -1$, Product $P = 3(-4) = -12$. Equation: $x^2 - Sx + P = 0 \\implies x^2 + x - 12 = 0$.'
      },
      {
        q: 'If $x^2 - 4x + k = 0$ has equal roots, the value of $k$ is:',
        options: ['$2$', '$4$', '$8$', '$16$'],
        correct: 1,
        explain: 'For equal roots, $b^2 - 4ac = 0 \\implies (-4)^2 - 4(1)(k) = 0 \\implies 16 - 4k = 0 \\implies k = 4$.'
      },
      {
        q: 'Synthetic division of $x^3 - 6x^2 + 11x - 6$ by $x - 1$ yields a quotient polynomial of degree:',
        options: ['$3$', '$2$', '$1$', '$0$'],
        correct: 1,
        explain: 'Dividing a polynomial of degree 3 by a linear factor (degree 1) reduces the quotient degree to $3 - 1 = 2$.'
      },
      {
        q: 'An equation remains unchanged when $x$ is replaced by $\\frac{1}{x}$. Such an equation is called:',
        options: ['Radical equation', 'Reciprocal equation', 'Exponential equation', 'Homogeneous equation'],
        correct: 1,
        explain: 'An equation is reciprocal if substituting $x \\to \\frac{1}{x}$ yields an equivalent equation.'
      }
    ]
  },

  // 4. Matrices & Determinants
  {
    topic: 'Matrices & Determinants',
    questions: [
      {
        q: 'If matrix $A$ has order $2 \\times 3$ and matrix $B$ has order $3 \\times 4$, the order of matrix $A B$ is:',
        options: ['$2 \\times 4$', '$3 \\times 3$', '$2 \\times 3$', 'Multiplication is not possible'],
        correct: 0,
        explain: 'Inner dimensions match ($3 = 3$), so the product matrix $AB$ has order $2 \\times 4$.'
      },
      {
        q: 'A square matrix $A$ is singular if and only if its determinant $|A|$ is equal to:',
        options: ['$1$', '$0$', '$-1$', 'Any non-zero real number'],
        correct: 1,
        explain: 'By definition, a square matrix $A$ is singular when $|A| = 0$.'
      },
      {
        q: 'What is the determinant of the $2 \\times 2$ matrix $A = \\begin{pmatrix} 4 & 2 \\\\ 3 & 5 \\end{pmatrix}$?',
        options: ['$26$', '$14$', '$20$', '$6$'],
        correct: 1,
        explain: '$|A| = (4)(5) - (2)(3) = 20 - 6 = 14$.'
      },
      {
        q: 'If $A$ is a square matrix, then $A + A^T$ is always:',
        options: ['Skew-symmetric', 'Symmetric', 'Identity matrix', 'Null matrix'],
        correct: 1,
        explain: '$(A + A^T)^T = A^T + (A^T)^T = A^T + A = A + A^T$, which proves symmetry.'
      },
      {
        q: 'If matrix $A = \\begin{pmatrix} 0 & 2 \\\\ -2 & 0 \\end{pmatrix}$, then $A$ is:',
        options: ['Symmetric', 'Skew-Symmetric', 'Diagonal', 'Identity'],
        correct: 1,
        explain: '$A^T = \\begin{pmatrix} 0 & -2 \\\\ 2 & 0 \\end{pmatrix} = -A$, so $A$ is skew-symmetric.'
      },
      {
        q: 'For any two invertible matrices $A$ and $B$, $(AB)^{-1}$ is equal to:',
        options: ['$A^{-1} B^{-1}$', '$B^{-1} A^{-1}$', '$(BA)^{-1}$', '$A B^{-1}$'],
        correct: 1,
        explain: 'The reversal law for inverse states $(AB)^{-1} = B^{-1} A^{-1}$.'
      },
      {
        q: 'The inverse of a $2 \\times 2$ matrix $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ exists if:',
        options: ['$ad - bc = 0$', '$ad - bc \\neq 0$', '$a + d = 0$', '$ab = cd$'],
        correct: 1,
        explain: 'An inverse matrix exists if and only if $|A| = ad - bc \\neq 0$.'
      },
      {
        q: 'The trace of a square matrix $A$, denoted $\\text{Tr}(A)$, is the sum of its:',
        options: ['All elements', 'Main diagonal elements', 'First row elements', 'Off-diagonal elements'],
        correct: 1,
        explain: 'Trace is defined as the sum of elements along the main diagonal: $\\sum a_{ii}$.'
      },
      {
        q: 'In Cramer’s Rule for solving a system $AX = B$, $x$ is given by:',
        options: ['$\\frac{|A_x|}{|A|}$', '$\\frac{|A|}{|A_x|}$', '$|A_x| \\cdot |A|$', '$|A| + |A_x|$'],
        correct: 0,
        explain: 'Cramer’s rule specifies $x = \\frac{|A_x|}{|A|}$, provided $|A| \\neq 0$.'
      },
      {
        q: 'If $|A| = 5$ for a $3 \\times 3$ matrix $A$, what is $|2A|$?',
        options: ['$10$', '$40$', '$20$', '$80$'],
        correct: 1,
        explain: 'For an $n \\times n$ matrix $A$, $|kA| = k^n |A|$. Here $2^3 \\cdot 5 = 8 \\cdot 5 = 40$.'
      }
    ]
  },

  // 5. Partial Fractions
  {
    topic: 'Partial Fractions',
    questions: [
      {
        q: 'A rational fraction $\\frac{P(x)}{Q(x)}$ is called a proper rational fraction if:',
        options: [
          'Degree of $P(x) <$ Degree of $Q(x)$',
          'Degree of $P(x) >$ Degree of $Q(x)$',
          'Degree of $P(x) =$ Degree of $Q(x)$',
          'Degree of $P(x) \\ge$ Degree of $Q(x)$'
        ],
        correct: 0,
        explain: 'A fraction is proper when the degree of the numerator polynomial is strictly less than the denominator polynomial.'
      },
      {
        q: 'The form of partial fractions for $\\frac{1}{(x-1)(x+2)}$ is:',
        options: [
          '$\\frac{A}{x-1} + \\frac{B}{x+2}$',
          '$\\frac{A}{x-1} + \\frac{Bx+C}{x+2}$',
          '$\\frac{Ax+B}{(x-1)(x+2)}$',
          '$\\frac{A}{(x-1)^2} + \\frac{B}{x+2}$'
        ],
        correct: 0,
        explain: 'Distinct linear factors in denominator decompose into $\\frac{A}{x-1} + \\frac{B}{x+2}$.'
      },
      {
        q: 'The partial fraction resolution of $\\frac{x+5}{(x+1)^2}$ is of the form:',
        options: [
          '$\\frac{A}{x+1} + \\frac{B}{(x+1)^2}$',
          '$\\frac{A}{x+1} + \\frac{Bx+C}{(x+1)^2}$',
          '$\\frac{Ax+B}{x+1} + \\frac{C}{(x+1)^2}$',
          '$\\frac{A}{(x+1)^2}$'
        ],
        correct: 0,
        explain: 'Repeated linear factor $(x+1)^2$ requires terms for $(x+1)$ and $(x+1)^2$.'
      },
      {
        q: 'What is the improper fraction $\\frac{x^2 + 1}{x^2 - 1}$ equal to when decomposed?',
        options: [
          '$1 + \\frac{2}{x^2 - 1}$',
          '$1 - \\frac{2}{x^2 - 1}$',
          '$\\frac{2}{x^2 - 1}$',
          '$x + \\frac{1}{x^2 - 1}$'
        ],
        correct: 0,
        explain: 'Long division yields $\\frac{x^2+1}{x^2-1} = \\frac{(x^2-1)+2}{x^2-1} = 1 + \\frac{2}{x^2-1}$.'
      },
      {
        q: 'In decomposing $\\frac{2x + 1}{(x-1)(x^2 + 1)}$, the term corresponding to $(x^2 + 1)$ is:',
        options: ['$\\frac{A}{x^2+1}$', '$\\frac{Bx+C}{x^2+1}$', '$\\frac{B}{x^2+1}$', '$\\frac{Bx}{x^2+1}$'],
        correct: 1,
        explain: 'An irreducible quadratic factor $(ax^2+bx+c)$ requires a linear numerator $(Bx+C)$.'
      },
      {
        q: 'If $\\frac{1}{x^2 - 1} = \\frac{A}{x - 1} + \\frac{B}{x + 1}$, then the values of $A$ and $B$ are:',
        options: ['$A = \\frac{1}{2}, B = -\\frac{1}{2}$', '$A = 1, B = -1$', '$A = \\frac{1}{2}, B = \\frac{1}{2}$', '$A = -\\frac{1}{2}, B = \\frac{1}{2}$'],
        correct: 0,
        explain: '$1 = A(x+1) + B(x-1)$. Put $x=1 \\implies A = 1/2$. Put $x=-1 \\implies B = -1/2$.'
      },
      {
        q: 'An equation $P(x) = Q(x)$ which is satisfied by all values of $x$ is called:',
        options: ['Conditional equation', 'Identity', 'Radical equation', 'Quadratic equation'],
        correct: 1,
        explain: 'An identity is an algebraic relation true for every permissible value of the variable.'
      },
      {
        q: 'How many partial fractions can $\\frac{x^2 + 2}{(x-1)(x-2)(x-3)}$ be resolved into?',
        options: ['$2$', '$3$', '$4$', '$1$'],
        correct: 1,
        explain: 'The denominator has 3 distinct linear factors, yielding 3 partial fraction constants ($A, B, C$).'
      },
      {
        q: 'The degree of the numerator in a proper rational fraction $\\frac{P(x)}{Q(x)}$ where $Q(x) = x^3 + 2x + 1$ can be at most:',
        options: ['$3$', '$2$', '$1$', '$0$'],
        correct: 1,
        explain: 'Since degree of denominator is 3, the degree of numerator for a proper fraction must be $\\le 2$.'
      },
      {
        q: 'Decomposing $\\frac{7x - 25}{(x-3)(x-4)}$ yields $A = 4$ for $\\frac{A}{x-3}$. What is $B$ for $\\frac{B}{x-4}$?',
        options: ['$3$', '$-3$', '$7$', '$5$'],
        correct: 0,
        explain: 'By cover-up method, $B = \\frac{7(4) - 25}{4-3} = \\frac{28 - 25}{1} = 3$.'
      }
    ]
  },

  // 6. Sequences & Series
  {
    topic: 'Sequences & Series',
    questions: [
      {
        q: 'What is the $n$-th term $a_n$ of an Arithmetic Progression (A.P.) with first term $a_1$ and common difference $d$?',
        options: ['$a_1 + nd$', '$a_1 + (n-1)d$', '$a_1 d^{n-1}$', '$\\frac{n}{2}(a_1 + d)$'],
        correct: 1,
        explain: 'Formula for $n$-th term of an A.P. is $a_n = a_1 + (n-1)d$.'
      },
      {
        q: 'The sum of the first $n$ terms of an A.P. is given by $S_n = $',
        options: [
          '$\\frac{n}{2}[2a_1 + (n-1)d]$',
          '$n[a_1 + (n-1)d]$',
          '$\\frac{n}{2}[a_1 + (n+1)d]$',
          '$\\frac{a_1(1 - r^n)}{1 - r}$'
        ],
        correct: 0,
        explain: 'Sum of $n$ terms of A.P.: $S_n = \\frac{n}{2}[2a_1 + (n-1)d] = \\frac{n}{2}(a_1 + a_n)$.'
      },
      {
        q: 'What is the Arithmetic Mean (A.M.) between two numbers $a$ and $b$?',
        options: ['$\\sqrt{ab}$', '$\\frac{a+b}{2}$', '$\\frac{2ab}{a+b}$', '$\\frac{a-b}{2}$'],
        correct: 1,
        explain: 'Arithmetic Mean between $a$ and $b$ is $A = \\frac{a+b}{2}$.'
      },
      {
        q: 'The common ratio $r$ of the Geometric Progression (G.P.) $2, 6, 18, 54, \\dots$ is:',
        options: ['$3$', '$2$', '$4$', '$6$'],
        correct: 0,
        explain: 'Common ratio $r = \\frac{a_2}{a_1} = \\frac{6}{2} = 3$.'
      },
      {
        q: 'The sum of an infinite Geometric Series $S_\\infty = \\frac{a_1}{1 - r}$ converges if and only if:',
        options: ['$r > 1$', '$|r| < 1$', '$r = 1$', '$|r| \\ge 1$'],
        correct: 1,
        explain: 'An infinite geometric series converges to a finite sum if and only if the absolute common ratio $|r| < 1$.'
      },
      {
        q: 'If $A, G, H$ are the Arithmetic, Geometric, and Harmonic means between two positive numbers $a$ and $b$, then:',
        options: ['$A \\le G \\le H$', '$A \\ge G \\ge H$', '$G^2 = A + H$', '$A = G = H$ for all $a \\neq b$'],
        correct: 1,
        explain: 'For any two positive distinct numbers, $A > G > H$, and $G^2 = A \\cdot H$.'
      },
      {
        q: 'What is the Harmonic Mean (H.M.) between $3$ and $6$?',
        options: ['$4.5$', '$4$', '$\\sqrt{18}$', '$5$'],
        correct: 1,
        explain: '$H = \\frac{2ab}{a+b} = \\frac{2(3)(6)}{3+6} = \\frac{36}{9} = 4$.'
      },
      {
        q: 'The sum of first $n$ natural numbers $\\sum_{k=1}^n k = 1 + 2 + 3 + \\dots + n$ is equal to:',
        options: ['$\\frac{n(n+1)}{2}$', '$\\frac{n(n+1)(2n+1)}{6}$', '$\\left[\\frac{n(n+1)}{2}\\right]^2$', '$n^2$'],
        correct: 0,
        explain: 'Standard sum formula: $\\sum k = \\frac{n(n+1)}{2}$.'
      },
      {
        q: 'The sequence $\\frac{1}{2}, \\frac{1}{4}, \\frac{1}{6}, \\frac{1}{8}, \\dots$ is an example of:',
        options: ['Arithmetic Progression', 'Geometric Progression', 'Harmonic Progression', 'Fibonacci Sequence'],
        correct: 2,
        explain: 'The reciprocals $2, 4, 6, 8, \\dots$ form an A.P., so the sequence itself is an H.P.'
      },
      {
        q: 'What is the sum of the infinite series $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\dots$?',
        options: ['$2$', '$1.5$', '$3$', '$\\infty$'],
        correct: 0,
        explain: '$S_\\infty = \\frac{a}{1 - r} = \\frac{1}{1 - 1/2} = \\frac{1}{1/2} = 2$.'
      }
    ]
  },

  // 7. Permutation, Combination & Probability
  {
    topic: 'Permutation, Combination & Probability',
    questions: [
      {
        q: 'The value of $0!$ (zero factorial) is defined as:',
        options: ['$0$', '$1$', 'Undefined', '$\\infty$'],
        correct: 1,
        explain: 'By mathematical definition, $0! = 1$.'
      },
      {
        q: 'What is the formula for the number of permutations of $n$ distinct objects taken $r$ at a time, $^nP_r$?',
        options: ['$\\frac{n!}{(n-r)!}$', '$\\frac{n!}{r!(n-r)!}$', '$\\frac{n!}{r!}$', '$n^r$'],
        correct: 0,
        explain: '$^nP_r = \\frac{n!}{(n-r)!}$.'
      },
      {
        q: 'In how many ways can $5$ people be seated around a circular table?',
        options: ['$120$', '$24$', '$60$', '$25$'],
        correct: 1,
        explain: 'Circular permutations of $n$ items is $(n-1)! = (5-1)! = 4! = 24$.'
      },
      {
        q: 'The value of $^nC_r + ^nC_{r-1}$ is equal to:',
        options: ['$^{n+1}C_r$', '$^nC_{r+1}$', '$^{n+1}C_{r+1}$', '$^{n-1}C_r$'],
        correct: 0,
        explain: 'Pascal’s Identity states $^nC_r + ^nC_{r-1} = ^{n+1}C_r$.'
      },
      {
        q: 'How many different committees of $3$ students can be formed from a group of $7$ students?',
        options: ['$210$', '$35$', '$42$', '$105$'],
        correct: 1,
        explain: '$^7C_3 = \\frac{7 \\times 6 \\times 5}{3 \\times 2 \\times 1} = 35$.'
      },
      {
        q: 'If an unbiased coin is tossed 3 times, what is the total number of outcomes in the sample space $S$?',
        options: ['$3$', '$6$', '$8$', '$9$'],
        correct: 2,
        explain: 'Number of outcomes $n(S) = 2^3 = 8$.'
      },
      {
        q: 'If $P(A) = 0.4$, $P(B) = 0.5$, and $A, B$ are independent events, then $P(A \\cap B) = $',
        options: ['$0.9$', '$0.2$', '$0.1$', '$0.7$'],
        correct: 1,
        explain: 'For independent events, $P(A \\cap B) = P(A) \\cdot P(B) = 0.4 \\times 0.5 = 0.2$.'
      },
      {
        q: 'What is the probability of drawing an Ace from a standard well-shuffled deck of 52 playing cards?',
        options: ['$\\frac{1}{52}$', '$\\frac{1}{13}$', '$\\frac{1}{4}$', '$\\frac{4}{13}$'],
        correct: 1,
        explain: 'There are 4 Aces in 52 cards: $P = \\frac{4}{52} = \\frac{1}{13}$.'
      },
      {
        q: 'The probability of an impossible event is:',
        options: ['$1$', '$0$', '$-1$', 'Between $0$ and $1$'],
        correct: 1,
        explain: 'An impossible event has zero favorable outcomes, so its probability is $0$.'
      },
      {
        q: 'The relation $^nC_r = ^nC_x$ implies that either $r = x$ or:',
        options: ['$r + x = n$', '$r - x = n$', '$r \\cdot x = n$', '$r + x = 2n$'],
        correct: 0,
        explain: 'Since $^nC_r = ^nC_{n-r}$, $^nC_r = ^nC_x \\implies r = x$ or $r + x = n$.'
      }
    ]
  },

  // 8. Mathematical Induction & Binomial Theorem
  {
    topic: 'Mathematical Induction & Binomial Theorem',
    questions: [
      {
        q: 'The first step in proving a statement $P(n)$ by Mathematical Induction for all positive integers $n$ is to show that $P(n)$ is true for:',
        options: ['$n = 0$', '$n = 1$', '$n = k$', '$n = k + 1$'],
        correct: 1,
        explain: 'The basis step verifies $P(1)$ is true.'
      },
      {
        q: 'The total number of terms in the expansion of $(a + b)^n$ for a positive integer $n$ is:',
        options: ['$n$', '$n - 1$', '$n + 1$', '$2^n$'],
        correct: 2,
        explain: 'The binomial expansion $(a+b)^n = \\sum_{r=0}^n ^nC_r a^{n-r} b^r$ contains $n+1$ terms.'
      },
      {
        q: 'The general term $T_{r+1}$ in the binomial expansion of $(a + b)^n$ is given by:',
        options: ['$^nC_r a^{n-r} b^r$', '$^nC_r a^r b^{n-r}$', '$^nC_{r+1} a^{n-r} b^r$', '$^nC_r (a + b)^{n-r}$'],
        correct: 0,
        explain: 'Formula for general term: $T_{r+1} = ^nC_r a^{n-r} b^r$.'
      },
      {
        q: 'What is the sum of all binomial coefficients in the expansion of $(1 + x)^n$? ($^nC_0 + ^nC_1 + \\dots + ^nC_n$)',
        options: ['$n^2$', '$2^n$', '$2^{n-1}$', '$n!$'],
        correct: 1,
        explain: 'Set $x = 1$ in $(1+x)^n \\implies 2^n = \\sum_{r=0}^n ^nC_r$.'
      },
      {
        q: 'The middle term in the expansion of $(x + y)^8$ is:',
        options: ['4th term', '5th term', '6th term', 'Both 4th and 5th terms'],
        correct: 1,
        explain: 'Since $n = 8$ is even, there is a single middle term at $T_{n/2 + 1} = T_5$.'
      },
      {
        q: 'The infinite binomial series $(1 + x)^n$ for fractional or negative $n$ is valid only if:',
        options: ['$x > 1$', '$|x| < 1$', '$x = 1$', '$|x| \\ge 1$'],
        correct: 1,
        explain: 'An infinite binomial expansion converges if and only if $|x| < 1$.'
      },
      {
        q: 'In the expansion of $(2x - 3y)^5$, the coefficient of $x^3 y^2$ is:',
        options: ['$720$', '$-720$', '$1080$', '$-1080$'],
        correct: 0,
        explain: '$T_{2+1} = ^5C_2 (2x)^3 (-3y)^2 = 10 \\cdot 8x^3 \\cdot 9y^2 = 720 x^3 y^2$.'
      },
      {
        q: 'The statement $3^n > n^3$ is true for all natural numbers $n \\ge$:',
        options: ['$1$', '$2$', '$3$', '$4$'],
        correct: 3,
        explain: 'For $n=1: 3 > 1$, $n=2: 9 > 8$, $n=3: 27 = 27$ (false), $n=4: 81 > 64$ (true for all $n \\ge 4$).'
      },
      {
        q: 'The term independent of $x$ in the expansion of $\\left(x + \\frac{1}{x}\\right)^6$ is:',
        options: ['$T_3$', '$T_4$', '$T_5$', '$T_2$'],
        correct: 1,
        explain: '$T_{r+1} = ^6C_r x^{6-r} (x^{-1})^r = ^6C_r x^{6-2r}$. For independent of $x$, $6-2r=0 \\implies r=3$, so term is $T_4$.'
      },
      {
        q: 'What is $^nC_1 + ^nC_3 + ^nC_5 + \\dots$ (sum of odd binomial coefficients)?',
        options: ['$2^n$', '$2^{n-1}$', '$2^{n+1}$', '$n 2^{n-1}$'],
        correct: 1,
        explain: 'The sum of odd coefficients equals the sum of even coefficients, both equal $2^{n-1}$.'
      }
    ]
  },

  // 9. Fundamentals of Trigonometry
  {
    topic: 'Fundamentals of Trigonometry',
    questions: [
      {
        q: 'How many radians are equal to $180^\\circ$?',
        options: ['$\\pi$', '$\\frac{\\pi}{2}$', '$2\\pi$', '$\\frac{\\pi}{180}$'],
        correct: 0,
        explain: 'By definition, $180^\\circ = \\pi \\text{ radians}$.'
      },
      {
        q: 'The arc length $l$ of a circle of radius $r$ subtended by a central angle $\\theta$ (in radians) is:',
        options: ['$l = r \\theta$', '$l = \\frac{1}{2} r^2 \\theta$', '$l = \\frac{r}{\\theta}$', '$l = 2\\pi r \\theta$'],
        correct: 0,
        explain: 'The circular measure arc length formula is $l = r \\theta$.'
      },
      {
        q: 'What is the area of a sector of a circle of radius $r$ and central angle $\\theta$ (in radians)?',
        options: ['$r^2 \\theta$', '$\\frac{1}{2} r^2 \\theta$', '$\\frac{1}{2} r \\theta$', '$\\pi r^2 \\theta$'],
        correct: 1,
        explain: 'Area of sector $A = \\frac{1}{2} r^2 \\theta$.'
      },
      {
        q: 'In which quadrant are both $\\sin\\theta$ and $\\tan\\theta$ negative?',
        options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
        correct: 3,
        explain: 'In Quadrant IV, $\\cos\\theta > 0$, while $\\sin\\theta < 0$ and $\\tan\\theta < 0$.'
      },
      {
        q: 'What is the fundamental Pythagorean identity relating $\\sec\\theta$ and $\\tan\\theta$?',
        options: ['$\\sec^2\\theta - \\tan^2\\theta = 1$', '$\\sec^2\\theta + \\tan^2\\theta = 1$', '$\\tan^2\\theta - \\sec^2\\theta = 1$', '$\\sec\\theta - \\tan\\theta = 1$'],
        correct: 0,
        explain: '$1 + \\tan^2\\theta = \\sec^2\\theta \\implies \\sec^2\\theta - \\tan^2\\theta = 1$.'
      },
      {
        q: 'Convert $45^\\circ$ into radian measure:',
        options: ['$\\frac{\\pi}{6}$', '$\\frac{\\pi}{4}$', '$\\frac{\\pi}{3}$', '$\\frac{\\pi}{2}$'],
        correct: 1,
        explain: '$45^\\circ = 45 \\times \\frac{\\pi}{180} = \\frac{\\pi}{4} \\text{ rad}$.'
      },
      {
        q: 'What is the value of $\\sin\\left(-\\frac{\\pi}{6}\\right)$?',
        options: ['$\\frac{1}{2}$', '$-\\frac{1}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$-\\frac{\\sqrt{3}}{2}$'],
        correct: 1,
        explain: 'Since $\\sin(-x) = -\\sin(x)$, $\\sin(-\\pi/6) = -\\sin(\\pi/6) = -1/2$.'
      },
      {
        q: 'If $\\sin\\theta = \\frac{3}{5}$ and $\\theta$ is in Quadrant II, what is $\\cos\\theta$?',
        options: ['$\\frac{4}{5}$', '$-\\frac{4}{5}$', '$\\frac{5}{4}$', '$-\\frac{3}{4}$'],
        correct: 1,
        explain: 'In Quadrant II, $\\cos\\theta < 0$: $\\cos\\theta = -\\sqrt{1 - (3/5)^2} = -4/5$.'
      },
      {
        q: 'The domain of the function $y = \\sin x$ is:',
        options: ['$[-1, 1]$', '$\\mathbb{R}$', '$[0, 2\\pi]$', '$(0, \\infty)$'],
        correct: 1,
        explain: 'The sine function is defined for all real numbers $x \\in \\mathbb{R}$.'
      },
      {
        q: 'What is the terminal arm position of a $270^\\circ$ angle in standard position?',
        options: ['Positive x-axis', 'Positive y-axis', 'Negative x-axis', 'Negative y-axis'],
        correct: 3,
        explain: '$270^\\circ$ lies on the negative y-axis.'
      }
    ]
  },

  // 10. Trigonometric Identities
  {
    topic: 'Trigonometric Identities',
    questions: [
      {
        q: 'What is $\\cos(\\alpha - \\beta)$ equal to according to the Fundamental Law of Trigonometry?',
        options: [
          '$\\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta$',
          '$\\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$',
          '$\\sin\\alpha\\cos\\beta - \\cos\\alpha\\sin\\beta$',
          '$\\sin\\alpha\\sin\\beta - \\cos\\alpha\\cos\\beta$'
        ],
        correct: 0,
        explain: 'Cosine difference formula: $\\cos(\\alpha - \\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta$.'
      },
      {
        q: 'What is $\\sin(2\\theta)$ equal to?',
        options: ['$2\\sin\\theta$', '$\\sin^2\\theta - \\cos^2\\theta$', '$2\\sin\\theta\\cos\\theta$', '$\\frac{2\\tan\\theta}{1+\\tan^2\\theta}$'],
        correct: 2,
        explain: 'Double angle formula for sine: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.'
      },
      {
        q: 'Which of the following expressions is equal to $\\cos(2\\theta)$?',
        options: ['$\\cos^2\\theta - \\sin^2\\theta$', '$1 - 2\\sin^2\\theta$', '$2\\cos^2\\theta - 1$', 'All of these'],
        correct: 3,
        explain: 'All three forms are mathematically equivalent representations of $\\cos 2\\theta$.'
      },
      {
        q: 'The allied angle identity $\\sin\\left(\\frac{\\pi}{2} - \\theta\\right)$ simplifies to:',
        options: ['$\\sin\\theta$', '$\\cos\\theta$', '$-\\cos\\theta$', '$-\\sin\\theta$'],
        correct: 1,
        explain: 'Complementary angle identity: $\\sin(\\pi/2 - \\theta) = \\cos\\theta$.'
      },
      {
        q: 'What is $\\tan(\\alpha + \\beta)$ equal to?',
        options: [
          '$\\frac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta}$',
          '$\\frac{\\tan\\alpha - \\tan\\beta}{1 + \\tan\\alpha\\tan\\beta}$',
          '$\\frac{\\tan\\alpha + \\tan\\beta}{1 + \\tan\\alpha\\tan\\beta}$',
          '$\\tan\\alpha + \\tan\\beta$'
        ],
        correct: 0,
        explain: 'Tangent sum identity: $\\tan(\\alpha+\\beta) = \\frac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta}$.'
      },
      {
        q: 'The product $2\\sin A \\cos B$ is equal to:',
        options: [
          '$\\sin(A+B) + \\sin(A-B)$',
          '$\\sin(A+B) - \\sin(A-B)$',
          '$\\cos(A+B) + \\cos(A-B)$',
          '$\\cos(A-B) - \\cos(A+B)$'
        ],
        correct: 0,
        explain: 'Product-to-sum identity: $2\\sin A \\cos B = \\sin(A+B) + \\sin(A-B)$.'
      },
      {
        q: 'The sum $\\sin P + \\sin Q$ is expressed as a product by:',
        options: [
          '$2\\sin\\left(\\frac{P+Q}{2}\\right)\\cos\\left(\\frac{P-Q}{2}\\right)$',
          '$2\\cos\\left(\\frac{P+Q}{2}\\right)\\sin\\left(\\frac{P-Q}{2}\\right)$',
          '$2\\cos\\left(\\frac{P+Q}{2}\\right)\\cos\\left(\\frac{P-Q}{2}\\right)$',
          '$-2\\sin\\left(\\frac{P+Q}{2}\\right)\\sin\\left(\\frac{P-Q}{2}\\right)$'
        ],
        correct: 0,
        explain: 'Sum-to-product identity: $\\sin P + \\sin Q = 2\\sin\\frac{P+Q}{2}\\cos\\frac{P-Q}{2}$.'
      },
      {
        q: 'What is $\\sin(3\\theta)$ in terms of $\\sin\\theta$?',
        options: ['$3\\sin\\theta - 4\\sin^3\\theta$', '$4\\sin^3\\theta - 3\\sin\\theta$', '$3\\sin\\theta + 4\\sin^3\\theta$', '$3\\sin\\theta\\cos\\theta$'],
        correct: 0,
        explain: 'Triple angle formula: $\\sin 3\\theta = 3\\sin\\theta - 4\\sin^3\\theta$.'
      },
      {
        q: 'The value of $\\cos(\\pi + \\theta)$ is:',
        options: ['$\\cos\\theta$', '$-\\cos\\theta$', '$\\sin\\theta$', '$-\\sin\\theta$'],
        correct: 1,
        explain: 'Allied angle identity: $\\cos(\\pi + \\theta) = -\\cos\\theta$.'
      },
      {
        q: 'Half-angle formula: $\\sin\\left(\\frac{\\theta}{2}\\right) = $',
        options: [
          '$\\pm\\sqrt{\\frac{1 - \\cos\\theta}{2}}$',
          '$\\pm\\sqrt{\\frac{1 + \\cos\\theta}{2}}$',
          '$\\pm\\sqrt{\\frac{1 - \\sin\\theta}{2}}$',
          '$\\frac{1 - \\cos\\theta}{2}$'
        ],
        correct: 0,
        explain: 'Half-angle formula: $\\sin(\\theta/2) = \\pm\\sqrt{\\frac{1 - \\cos\\theta}{2}}$.'
      }
    ]
  },

  // 11. Trigonometric Functions & Graphs
  {
    topic: 'Trigonometric Functions & Graphs',
    questions: [
      {
        q: 'What is the period of the function $f(x) = \\sin x$?',
        options: ['$\\pi$', '$2\\pi$', '$\\frac{\\pi}{2}$', '$4\\pi$'],
        correct: 1,
        explain: 'The fundamental period of $\\sin x$ is $2\\pi$.'
      },
      {
        q: 'What is the period of $f(x) = \\tan x$?',
        options: ['$\\pi$', '$2\\pi$', '$\\frac{\\pi}{2}$', '$3\\pi$'],
        correct: 0,
        explain: 'The fundamental period of $\\tan x$ is $\\pi$.'
      },
      {
        q: 'What is the period of the function $f(x) = \\cos(3x)$?',
        options: ['$6\\pi$', '$\\frac{2\\pi}{3}$', '$2\\pi$', '$\\frac{\\pi}{3}$'],
        correct: 1,
        explain: 'The period of $\\cos(kx)$ is $\\frac{2\\pi}{|k|} = \\frac{2\\pi}{3}$.'
      },
      {
        q: 'What is the maximum value of $y = 3\\cos x - 1$?',
        options: ['$3$', '$2$', '$4$', '$1$'],
        correct: 1,
        explain: 'Max value occurs when $\\cos x = 1 \\implies y = 3(1) - 1 = 2$.'
      },
      {
        q: 'The domain of $y = \\tan x$ excludes values of $x$ where $x = $',
        options: ['$n\\pi, n \\in \\mathbb{Z}$', '$(2n+1)\\frac{\\pi}{2}, n \\in \\mathbb{Z}$', '$n\\frac{\\pi}{4}, n \\in \\mathbb{Z}$', '$2n\\pi, n \\in \\mathbb{Z}$'],
        correct: 1,
        explain: '$\\tan x$ is undefined at odd multiples of $\\frac{\\pi}{2}$.'
      },
      {
        q: 'The range of the cosine function $y = \\cos x$ is:',
        options: ['$(-\\infty, \\infty)$', '$[-1, 1]$', '$[0, 1]$', '$[-1, 0]$'],
        correct: 1,
        explain: 'The output values of $\\cos x$ lie in the closed interval $[-1, 1]$.'
      },
      {
        q: 'What is the period of $f(x) = \\sin\\left(\\frac{x}{2}\\right)$?',
        options: ['$\\pi$', '$2\\pi$', '$4\\pi$', '$\\frac{\\pi}{2}$'],
        correct: 2,
        explain: 'Period $= \\frac{2\\pi}{1/2} = 4\\pi$.'
      },
      {
        q: 'Which trigonometric function is an even function? ($f(-x) = f(x)$)',
        options: ['$\\sin x$', '$\\cos x$', '$\\tan x$', '$\\csc x$'],
        correct: 1,
        explain: '$\\cos(-x) = \\cos x$, making cosine an even function.'
      },
      {
        q: 'The graph of $y = \\sin x$ crosses the x-axis at $x = $',
        options: ['$n\\pi, n \\in \\mathbb{Z}$', '$(2n+1)\\frac{\\pi}{2}, n \\in \\mathbb{Z}$', '$2n\\pi, n \\in \\mathbb{Z}$', '$\\frac{n\\pi}{4}, n \\in \\mathbb{Z}$'],
        correct: 0,
        explain: '$\\sin x = 0$ at integer multiples of $\\pi$.'
      },
      {
        q: 'What is the amplitude of the trigonometric curve $y = -5\\sin(2x)$?',
        options: ['$-5$', '$5$', '$2$', '$\\frac{5}{2}$'],
        correct: 1,
        explain: 'Amplitude is the absolute value of the coefficient: $|-5| = 5$.'
      }
    ]
  },

  // 12. Application of Trigonometry
  {
    topic: 'Application of Trigonometry',
    questions: [
      {
        q: 'The Law of Sines for a triangle $ABC$ with sides $a, b, c$ is:',
        options: [
          '$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$',
          '$a^2 = b^2 + c^2 - 2bc \\cos A$',
          '$\\Delta = \\sqrt{s(s-a)(s-b)(s-c)}$',
          '$\\frac{a-b}{a+b} = \\frac{\\tan\\frac{A-B}{2}}{\\tan\\frac{A+B}{2}}$'
        ],
        correct: 0,
        explain: 'Law of Sines: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$.'
      },
      {
        q: 'The Law of Cosines for side $c$ is given by $c^2 = $',
        options: [
          '$a^2 + b^2 - 2ab \\cos C$',
          '$a^2 + b^2 + 2ab \\cos C$',
          '$a^2 + b^2 - 2ab \\sin C$',
          '$(a+b)^2 - 2ab \\cos C$'
        ],
        correct: 0,
        explain: 'Law of Cosines: $c^2 = a^2 + b^2 - 2ab \\cos C$.'
      },
      {
        q: 'Hero’s Formula for the area $\\Delta$ of a triangle with sides $a, b, c$ and semi-perimeter $s = \\frac{a+b+c}{2}$ is:',
        options: [
          '$\\sqrt{s(s-a)(s-b)(s-c)}$',
          '$s(s-a)(s-b)(s-c)$',
          '$\\frac{1}{2}ab \\sin C$',
          '$\\frac{abc}{4R}$'
        ],
        correct: 0,
        explain: 'Hero’s formula: $\\Delta = \\sqrt{s(s-a)(s-b)(s-c)}$.'
      },
      {
        q: 'The radius $r$ of the incircle (inradius) of a triangle is given by:',
        options: ['$r = \\frac{\\Delta}{s}$', '$r = \\frac{abc}{4\\Delta}$', '$r = \\frac{\\Delta}{s-a}$', '$r = 4R\\sin A$'],
        correct: 0,
        explain: 'Inradius formula $r = \\frac{\\Delta}{s}$.'
      },
      {
        q: 'The radius $R$ of the circumcircle (circumradius) of a triangle is:',
        options: ['$R = \\frac{abc}{4\\Delta}$', '$R = \\frac{\\Delta}{s}$', '$R = \\frac{\\Delta}{s-a}$', '$R = \\frac{a+b+c}{4}$'],
        correct: 0,
        explain: 'Circumradius formula $R = \\frac{abc}{4\\Delta}$.'
      },
      {
        q: 'The ex-radius $r_1$ opposite to vertex $A$ is given by:',
        options: ['$r_1 = \\frac{\\Delta}{s-a}$', '$r_1 = \\frac{\\Delta}{s-b}$', '$r_1 = \\frac{\\Delta}{s}$', '$r_1 = \\frac{abc}{4\\Delta}$'],
        correct: 0,
        explain: 'Ex-radius formula $r_1 = \\frac{\\Delta}{s-a}$.'
      },
      {
        q: 'Area of triangle $ABC$ when two sides $a, b$ and included angle $C$ are given is:',
        options: ['$\\frac{1}{2} ab \\sin C$', '$\\frac{1}{2} ab \\cos C$', '$ab \\sin C$', '$\\frac{1}{2} a^2 b^2 \\sin C$'],
        correct: 0,
        explain: 'Area $\\Delta = \\frac{1}{2} ab \\sin C$.'
      },
      {
        q: 'In a right-angled triangle $ABC$ with $\\gamma = 90^\\circ$, $\\sin A$ equals:',
        options: ['$\\frac{a}{c}$', '$\\frac{b}{c}$', '$\\frac{a}{b}$', '$\\frac{c}{a}$'],
        correct: 0,
        explain: 'Opposite side $a$ divided by hypotenuse $c$: $\\sin A = a/c$.'
      },
      {
        q: 'In any triangle $ABC$, $\\cos\\left(\\frac{A}{2}\\right) = $',
        options: [
          '$\\sqrt{\\frac{s(s-a)}{bc}}$',
          '$\\sqrt{\\frac{(s-b)(s-c)}{bc}}$',
          '$\\sqrt{\\frac{s(s-b)}{ac}}$',
          '$\\sqrt{\\frac{(s-a)(s-c)}{ac}}$'
        ],
        correct: 0,
        explain: 'Half-angle cosine formula: $\\cos(A/2) = \\sqrt{\\frac{s(s-a)}{bc}}$.'
      },
      {
        q: 'If the sides of a triangle are $3, 5, 7$, the semi-perimeter $s$ is:',
        options: ['$15$', '$7.5$', '$8$', '$10$'],
        correct: 1,
        explain: '$s = \\frac{a+b+c}{2} = \\frac{3+5+7}{2} = \\frac{15}{2} = 7.5$.'
      }
    ]
  },

  // 13. Inverse Trigonometric Functions
  {
    topic: 'Inverse Trigonometric Functions',
    questions: [
      {
        q: 'What is the principal domain of $y = \\arcsin x$ (or $\\sin^{-1} x$)?',
        options: ['$[-1, 1]$', '$(-\\infty, \\infty)$', '$[0, \\pi]$', '$\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$'],
        correct: 0,
        explain: 'The domain of $\\sin^{-1} x$ is $x \\in [-1, 1]$.'
      },
      {
        q: 'What is the principal range of $y = \\arccos x$ (or $\\cos^{-1} x$)?',
        options: ['$[0, \\pi]$', '$\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$', '$(-\\infty, \\infty)$', '$[-1, 1]$'],
        correct: 0,
        explain: 'The principal branch range of $\\cos^{-1} x$ is $[0, \\pi]$.'
      },
      {
        q: 'What is the value of $\\arcsin\\left(\\frac{1}{2}\\right)$?',
        options: ['$\\frac{\\pi}{6}$', '$\\frac{\\pi}{3}$', '$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$'],
        correct: 0,
        explain: '$\\sin(\\pi/6) = 1/2 \\implies \\arcsin(1/2) = \\pi/6$.'
      },
      {
        q: 'For all $x \\in [-1, 1]$, $\\arcsin x + \\arccos x = $',
        options: ['$\\pi$', '$\\frac{\\pi}{2}$', '$0$', '$2\\pi$'],
        correct: 1,
        explain: 'Identity: $\\sin^{-1} x + \\cos^{-1} x = \\frac{\\pi}{2}$.'
      },
      {
        q: 'What is $\\arctan(1)$ equal to?',
        options: ['$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$', '$\\frac{\\pi}{6}$', '$0$'],
        correct: 0,
        explain: '$\\tan(\\pi/4) = 1 \\implies \\arctan(1) = \\pi/4$.'
      },
      {
        q: 'The identity $\\arctan A + \\arctan B$ equals:',
        options: [
          '$\\arctan\\left(\\frac{A+B}{1-AB}\\right)$',
          '$\\arctan\\left(\\frac{A-B}{1+AB}\\right)$',
          '$\\arctan\\left(\\frac{A+B}{1+AB}\\right)$',
          '$\\arctan(A+B)$'
        ],
        correct: 0,
        explain: 'Sum formula for inverse tangent: $\\arctan A + \\arctan B = \\arctan\\left(\\frac{A+B}{1-AB}\\right)$ for $AB < 1$.'
      },
      {
        q: 'What is the value of $\\sin\\left(\\arccos\\frac{3}{5}\\right)$?',
        options: ['$\\frac{4}{5}$', '$\\frac{3}{5}$', '$\\frac{5}{4}$', '$\\frac{3}{4}$'],
        correct: 0,
        explain: 'If $\\theta = \\cos^{-1}(3/5)$, $\\cos\\theta = 3/5 \\implies \\sin\\theta = \\sqrt{1 - (3/5)^2} = 4/5$.'
      },
      {
        q: 'The principal range of $y = \\arctan x$ is:',
        options: ['$\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$', '$[0, \\pi]$', '$[-1, 1]$', '$\\mathbb{R}$'],
        correct: 0,
        explain: 'The output range of $\\tan^{-1} x$ is the open interval $(-\\pi/2, \\pi/2)$.'
      },
      {
        q: 'What is $2\\arctan x$ equal to?',
        options: ['$\\arctan\\left(\\frac{2x}{1-x^2}\\right)$', '$\\arctan\\left(\\frac{2x}{1+x^2}\\right)$', '$\\arcsin\\left(\\frac{2x}{1-x^2}\\right)$', '$2x$'],
        correct: 0,
        explain: 'Double angle inverse formula: $2\\arctan x = \\arctan\\left(\\frac{2x}{1-x^2}\\right)$ for $|x| < 1$.'
      },
      {
        q: 'Evaluate $\\arccos\\left(-\\frac{1}{2}\\right)$:',
        options: ['$\\frac{2\\pi}{3}$', '$-\\frac{\\pi}{3}$', '$\\frac{\\pi}{3}$', '$\\frac{5\\pi}{6}$'],
        correct: 0,
        explain: '$\\cos(2\\pi/3) = -1/2$, and $2\\pi/3 \\in [0, \\pi]$.'
      }
    ]
  },

  // 14. Limits & Continuity
  {
    topic: 'Limits & Continuity',
    questions: [
      {
        q: 'What is the value of the standard limit $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ ($x$ in radians)?',
        options: ['$0$', '$1$', 'Undefined', '$\\infty$'],
        correct: 1,
        explain: 'Fundamental trigonometric limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.'
      },
      {
        q: 'The value of the limit $\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x$ is equal to the irrational constant:',
        options: ['$\\pi$', '$e$', '$0$', '$1$'],
        correct: 1,
        explain: 'Euler’s number definition: $\\lim_{x \\to \\infty} (1 + 1/x)^x = e \\approx 2.71828$.'
      },
      {
        q: 'Evaluate $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$:',
        options: ['$0$', '$4$', '$2$', 'Undefined'],
        correct: 1,
        explain: 'Factor numerator: $\\frac{(x-2)(x+2)}{x-2} = x+2$. As $x \\to 2$, $2+2 = 4$.'
      },
      {
        q: 'A function $f(x)$ is continuous at $x = c$ if and only if:',
        options: [
          '$\\lim_{x \\to c} f(x)$ exists',
          '$f(c)$ is defined',
          '$\\lim_{x \\to c} f(x) = f(c)$',
          'All of the above'
        ],
        correct: 3,
        explain: 'Continuity requires: 1) $f(c)$ is defined, 2) limit exists, 3) limit equals $f(c)$.'
      },
      {
        q: 'What is $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$?',
        options: ['$1$', '$\\frac{1}{2}$', '$0$', '$2$'],
        correct: 1,
        explain: 'Using L’Hôpital’s rule twice or half angle: $\\lim_{x \\to 0} \\frac{2\\sin^2(x/2)}{x^2} = \\frac{1}{2}$.'
      },
      {
        q: 'What is $\\lim_{x \\to a} \\frac{x^n - a^n}{x - a}$?',
        options: ['$n a^{n-1}$', '$a^n$', '$n a^n$', '$0$'],
        correct: 0,
        explain: 'Standard algebraic limit formula: $\\lim_{x \\to a} \\frac{x^n - a^n}{x - a} = n a^{n-1}$.'
      },
      {
        q: 'Evaluate $\\lim_{x \\to 0} \\frac{e^x - 1}{x}$:',
        options: ['$0$', '$1$', '$e$', 'Undefined'],
        correct: 1,
        explain: 'Standard exponential limit: $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$.'
      },
      {
        q: 'If $\\lim_{x \\to c^-} f(x) \\neq \\lim_{x \\to c^+} f(x)$, then $\\lim_{x \\to c} f(x)$:',
        options: ['Equals $0$', 'Equals $f(c)$', 'Does not exist', 'Equals $\\infty$'],
        correct: 2,
        explain: 'A two-sided limit exists if and only if left-hand limit equals right-hand limit.'
      },
      {
        q: 'What is $\\lim_{x \\to 0} (1 + x)^{1/x}$?',
        options: ['$1$', '$e$', '$0$', '$\\infty$'],
        correct: 1,
        explain: 'Equivalent definition of $e$: $\\lim_{x \\to 0} (1+x)^{1/x} = e$.'
      },
      {
        q: 'The limit $\\lim_{x \\to 0} \\frac{\\tan x}{x}$ is equal to:',
        options: ['$0$', '$1$', '$\\infty$', 'Undefined'],
        correct: 1,
        explain: '$\\lim_{x \\to 0} \\frac{\\sin x / \\cos x}{x} = 1 \\cdot 1 = 1$.'
      }
    ]
  },

  // 15. Differentiation
  {
    topic: 'Differentiation',
    questions: [
      {
        q: 'By power rule of differentiation, $\\frac{d}{dx}(x^n) = $',
        options: ['$n x^{n-1}$', '$n x^n$', '$\\frac{x^{n+1}}{n+1}$', '$(n-1) x^n$'],
        correct: 0,
        explain: 'Power rule: $\\frac{d}{dx}(x^n) = n x^{n-1}$.'
      },
      {
        q: 'What is the derivative of $\\sin x$ with respect to $x$?',
        options: ['$\\cos x$', '$-\\cos x$', '$\\sec^2 x$', '$-\\sin x$'],
        correct: 0,
        explain: '$\\frac{d}{dx}(\\sin x) = \\cos x$.'
      },
      {
        q: 'What is the derivative of $\\cos x$ with respect to $x$?',
        options: ['$\\sin x$', '$-\\sin x$', '$-\\csc^2 x$', '$\\tan x$'],
        correct: 1,
        explain: '$\\frac{d}{dx}(\\cos x) = -\\sin x$.'
      },
      {
        q: 'Product Rule: $\\frac{d}{dx}[u(x) v(x)] = $',
        options: [
          '$\\frac{du}{dx} \\frac{dv}{dx}$',
          '$u \\frac{dv}{dx} + v \\frac{du}{dx}$',
          '$u \\frac{dv}{dx} - v \\frac{du}{dx}$',
          '$\\frac{u \\frac{dv}{dx} + v \\frac{du}{dx}}{v^2}$'
        ],
        correct: 1,
        explain: 'Product rule: $(uv)\' = u\'v + uv\'$.'
      },
      {
        q: 'Quotient Rule: $\\frac{d}{dx}\\left[\\frac{u(x)}{v(x)}\\right] = $',
        options: [
          '$\\frac{v \\frac{du}{dx} - u \\frac{dv}{dx}}{v^2}$',
          '$\\frac{u \\frac{dv}{dx} - v \\frac{du}{dx}}{v^2}$',
          '$\\frac{\\frac{du}{dx}}{\\frac{dv}{dx}}$',
          '$\\frac{v \\frac{du}{dx} + u \\frac{dv}{dx}}{v^2}$'
        ],
        correct: 0,
        explain: 'Quotient rule: $\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$.'
      },
      {
        q: 'What is the derivative of $\\ln x$ for $x > 0$?',
        options: ['$\\frac{1}{x}$', '$e^x$', '$x$', '$-\\frac{1}{x^2}$'],
        correct: 0,
        explain: '$\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$.'
      },
      {
        q: 'What is the derivative of $\\arcsin x$ with respect to $x$?',
        options: ['$\\frac{1}{\\sqrt{1-x^2}}$', '$-\\frac{1}{\\sqrt{1-x^2}}$', '$\\frac{1}{1+x^2}$', '$\\frac{1}{x\\sqrt{x^2-1}}$'],
        correct: 0,
        explain: '$\\frac{d}{dx}(\\sin^{-1} x) = \\frac{1}{\\sqrt{1-x^2}}$.'
      },
      {
        q: 'The derivative of $\\tan x$ with respect to $x$ is:',
        options: ['$\\sec^2 x$', '$\\cot x$', '$-\\csc^2 x$', '$\\sec x \\tan x$'],
        correct: 0,
        explain: '$\\frac{d}{dx}(\\tan x) = \\sec^2 x$.'
      },
      {
        q: 'Chain Rule: $\\frac{d}{dx}[f(g(x))] = $',
        options: [
          '$f\'(g(x)) \\cdot g\'(x)$',
          '$f\'(g\'(x))$',
          '$f\'(x) \\cdot g\'(x)$',
          '$f(g\'(x)) \\cdot g(x)$'
        ],
        correct: 0,
        explain: 'Chain rule differentiates composite functions: $(f \\circ g)\'(x) = f\'(g(x)) \\cdot g\'(x)$.'
      },
      {
        q: 'What is the slope of the tangent line to the curve $y = x^2 - 3x + 2$ at $x = 2$?',
        options: ['$1$', '$0$', '$2$', '$-1$'],
        correct: 0,
        explain: '$\\frac{dy}{dx} = 2x - 3$. At $x = 2$, slope $m = 2(2) - 3 = 1$.'
      }
    ]
  },

  // 16. Vectors
  {
    topic: 'Vectors',
    questions: [
      {
        q: 'The magnitude of the vector $\\vec{r} = x\\hat{i} + y\\hat{j} + z\\hat{k}$ is:',
        options: ['$\\sqrt{x^2 + y^2 + z^2}$', '$x^2 + y^2 + z^2$', '$x + y + z$', '$\\sqrt{x + y + z}$'],
        correct: 0,
        explain: 'Magnitude formula: $|\\vec{r}| = \\sqrt{x^2 + y^2 + z^2}$.'
      },
      {
        q: 'A unit vector in the direction of vector $\\vec{a}$ is given by $\\hat{a} = $',
        options: ['$\\frac{\\vec{a}}{|\\vec{a}|}$', '$|\\vec{a}| \\vec{a}$', '$\\vec{a} \\cdot \\vec{a}$', '$\\frac{|\\vec{a}|}{\\vec{a}}$'],
        correct: 0,
        explain: 'Unit vector $\\hat{a} = \\frac{\\vec{a}}{|\\vec{a}|}$.'
      },
      {
        q: 'The dot (scalar) product of two vectors $\\vec{a}$ and $\\vec{b}$ is zero if and only if they are:',
        options: ['Parallel', 'Perpendicular', 'Collinear', 'Equal'],
        correct: 1,
        explain: '$\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta = 0 \\iff \\cos\\theta = 0 \\iff \\theta = 90^\\circ$.'
      },
      {
        q: 'What is the cross product $\\hat{i} \\times \\hat{j}$ equal to?',
        options: ['$\\hat{k}$', '$-\\hat{k}$', '$0$', '$1$'],
        correct: 0,
        explain: 'Right-hand rule for unit basis vectors: $\\hat{i} \\times \\hat{j} = \\hat{k}$.'
      },
      {
        q: 'If $\\vec{a} = 2\\hat{i} - \\hat{j} + 2\\hat{k}$, what is the magnitude $|\\vec{a}|$?',
        options: ['$3$', '$9$', '$\\sqrt{5}$', '$5$'],
        correct: 0,
        explain: '$|\\vec{a}| = \\sqrt{2^2 + (-1)^2 + 2^2} = \\sqrt{4 + 1 + 4} = \\sqrt{9} = 3$.'
      },
      {
        q: 'Work done $W$ by a constant force $\\vec{F}$ causing a displacement $\\vec{d}$ is given by:',
        options: ['$\\vec{F} \\cdot \\vec{d}$', '$\\vec{F} \\times \\vec{d}$', '$\\frac{|\\vec{F}|}{|\\vec{d}|}$', '$|\\vec{F}| |\\vec{d}|$'],
        correct: 0,
        explain: 'Work done is a scalar quantity defined as dot product $W = \\vec{F} \\cdot \\vec{d}$.'
      },
      {
        q: 'The magnitude of the vector product $|\\vec{a} \\times \\vec{b}|$ represents the area of a:',
        options: ['Parallelogram formed by $\\vec{a}$ and $\\vec{b}$', 'Triangle formed by $\\vec{a}$ and $\\vec{b}$', 'Circle of radius $|a|$', 'Square of side $|b|$'],
        correct: 0,
        explain: 'Area of parallelogram with adjacent sides $\\vec{a}$ and $\\vec{b}$ equals $|\\vec{a} \\times \\vec{b}|$.'
      },
      {
        q: 'The scalar triple product $[\\vec{a} \\; \\vec{b} \\; \\vec{c}] = \\vec{a} \\cdot (\\vec{b} \\times \\vec{c})$ represents the volume of a:',
        options: ['Parallelepiped', 'Sphere', 'Cylinder', 'Tetrahedron'],
        correct: 0,
        explain: 'The absolute scalar triple product gives the volume of a parallelepiped.'
      },
      {
        q: 'What is the angle $\\theta$ between two non-zero vectors $\\vec{a}$ and $\\vec{b}$ if $\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|$?',
        options: ['$0^\\circ$', '$90^\\circ$', '$180^\\circ$', '$45^\\circ$'],
        correct: 0,
        explain: '$\\cos\\theta = 1 \\implies \\theta = 0^\\circ$ (vectors are parallel and in same direction).'
      },
      {
        q: 'Projection of vector $\\vec{a}$ along vector $\\vec{b}$ is:',
        options: ['$\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}$', '$\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}|}$', '$\\vec{a} \\times \\vec{b}$', '$\\frac{|\\vec{a}|}{|\\vec{b}|}$'],
        correct: 0,
        explain: 'Scalar projection of $\\vec{a}$ onto $\\vec{b}$ is $\\vec{a} \\cdot \\hat{b} = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}$.'
      }
    ]
  }
];

// Write out JSON
const outputPath = path.join(process.cwd(), 'scripts', 'math_1st_year_mcqs.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(allChapters, null, 2), 'utf8');

const totalCount = allChapters.reduce((acc, ch) => acc + ch.questions.length, 0);
console.log(`Successfully generated ${allChapters.length} chapters containing ${totalCount} total MCQs!`);
console.log(`Saved to ${outputPath}`);
