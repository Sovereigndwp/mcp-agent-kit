export interface SovereigntyModule {
  id: string;
  title: string;
  description: string;
  route: string;
  order: number;
}

export interface SovereigntyPhase {
  id: string;
  title: string;
  summary: string;
  context: string;
  modules: SovereigntyModule[];
}

const BASE_URL = 'https://learn-bitcoin-by-doing-afqekjskn-layer-ds-projects.vercel.app/module';

export const sovereigntyPhases: SovereigntyPhase[] = [
  {
    id: 'foundations',
    title: 'Foundation & Motivation',
    summary: 'Understand money, banking, and why the current system is broken.',
    context: 'Start with the money problem and the breakthrough that Bitcoin represents.',
    modules: [
      {
        id: 'money',
        title: 'Understanding Money',
        description: 'Discover how money really works, why current systems fail, and what we desperately need.',
        route: `${BASE_URL}/money`,
        order: 1
      },
      {
        id: 'bitcoin-basics',
        title: 'Bitcoin Basics',
        description: 'Learn what Bitcoin is, how it works, and why it represents the solution to money\'s problems.',
        route: `${BASE_URL}/bitcoin-basics`,
        order: 2
      },
      {
        id: 'bitcoin-relevance',
        title: 'Why Bitcoin Matters Today',
        description: 'Real-world scenarios showing Bitcoin\'s immediate relevance to your financial life.',
        route: `${BASE_URL}/bitcoin-relevance`,
        order: 3
      },
      {
        id: 'myths',
        title: 'Bitcoin Myths & Facts',
        description: 'Address common misconceptions about Bitcoin with evidence and data.',
        route: `${BASE_URL}/myths`,
        order: 4
      }
    ]
  },
  {
    id: 'practical',
    title: 'Practical Skills First',
    summary: 'Immediate value—secure and use Bitcoin today.',
    context: 'Move from theory to practice with self-custody, transactions, and everyday tooling.',
    modules: [
      {
        id: 'custody',
        title: 'Self-Custody & Security',
        description: 'Learn practical strategies for safely storing and managing your Bitcoin.',
        route: `${BASE_URL}/custody`,
        order: 1
      },
      {
        id: 'bitcoin-toolkit',
        title: 'Bitcoin Tools & Practice',
        description: 'Hands-on experience with Bitcoin tools and real-world applications.',
        route: `${BASE_URL}/bitcoin-toolkit`,
        order: 2
      },
      {
        id: 'transactions',
        title: 'Bitcoin Transactions',
        description: 'Understand how Bitcoin moves value through the transaction system.',
        route: `${BASE_URL}/transactions`,
        order: 3
      },
      {
        id: 'keys',
        title: 'Private Keys & Addresses',
        description: 'Master Bitcoin ownership through cryptographic keys and address generation.',
        route: `${BASE_URL}/keys`,
        order: 4
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Deep Dive',
    summary: 'How Bitcoin actually works under the hood.',
    context: 'Build technical intuition so you can explain and defend Bitcoin with confidence.',
    modules: [
      {
        id: 'numbers',
        title: 'Number Systems & Data',
        description: 'Gentle introduction to how computers represent data—foundation for technical concepts.',
        route: `${BASE_URL}/numbers`,
        order: 1
      },
      {
        id: 'hashing',
        title: 'Cryptographic Hashing',
        description: 'Understand how Bitcoin uses mathematical functions to create secure digital fingerprints.',
        route: `${BASE_URL}/hashing`,
        order: 2
      },
      {
        id: 'mining',
        title: 'Bitcoin Mining',
        description: 'Learn how Bitcoin creates new coins and secures the network through proof-of-work.',
        route: `${BASE_URL}/mining`,
        order: 3
      },
      {
        id: 'scripts',
        title: 'Bitcoin Scripts',
        description: 'Learn how Bitcoin uses programmable conditions to control spending.',
        route: `${BASE_URL}/scripts`,
        order: 4
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Mastery',
    summary: 'Complete your Bitcoin understanding and stay future-proof.',
    context: 'Explore second-layer innovation, data structures, and emerging opportunities.',
    modules: [
      {
        id: 'merkle',
        title: 'Merkle Trees',
        description: 'Discover how Bitcoin efficiently verifies large amounts of data using tree structures.',
        route: `${BASE_URL}/merkle`,
        order: 1
      },
      {
        id: 'lightning',
        title: 'Lightning Network',
        description: 'Understand Bitcoin\'s second layer for fast, cheap payments.',
        route: `${BASE_URL}/lightning`,
        order: 2
      },
      {
        id: 'advanced-topics',
        title: 'Advanced Bitcoin Topics',
        description: 'Explore cutting-edge Bitcoin technology and future developments.',
        route: `${BASE_URL}/advanced-topics`,
        order: 3
      }
    ]
  }
];

export default sovereigntyPhases;
