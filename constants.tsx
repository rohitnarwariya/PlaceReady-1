
import { Guideline, Company, Question, SeniorMistake, SeniorLearningPost, PlacedStudentDisplay } from './types';

export const DOMAINS = [
  'DSA', 
  'Web Development', 
  'App Development', 
  'Core Subjects', 
  'HR & Behavioral', 
  'Internships', 
  'Off-campus',
  'General'
];

export const MOCK_PLACEMENTS: PlacedStudentDisplay[] = [
  {
    id: 'p1',
    companyId: 'google',
    userId: 's1',
    roleOffered: 'Software Engineer L3',
    placementYear: 2024,
    isVerified: true,
    userName: 'Rahul Sharma',
    userBranch: 'CSE',
    userGradYear: 2024,
    userProfilePic: 'https://i.pravatar.cc/150?u=s1',
    userLinkedin: 'https://linkedin.com/in/rahul-sharma'
  },
  {
    id: 'p2',
    companyId: 'google',
    userId: 's6',
    roleOffered: 'SDE-1',
    placementYear: 2023,
    isVerified: true,
    userName: 'Ishita Roy',
    userBranch: 'CSE',
    userGradYear: 2023,
    userProfilePic: 'https://i.pravatar.cc/150?u=s6',
    userLinkedin: 'https://linkedin.com/in/ishita-roy'
  },
  {
    id: 'p3',
    companyId: 'microsoft',
    userId: 's2',
    roleOffered: 'Support Engineer',
    placementYear: 2024,
    isVerified: true,
    userName: 'Priya Malhotra',
    userBranch: 'IT',
    userGradYear: 2024,
    userProfilePic: 'https://i.pravatar.cc/150?u=s2',
    userLinkedin: 'https://linkedin.com/in/priya-m'
  }
];

export const MOCK_LEARNINGS: SeniorLearningPost[] = [
  {
    id: 'l1',
    title: 'How I Cracked Amazon SDE-1 Technical Rounds',
    type: 'Interview Learning',
    company: 'Amazon',
    role: 'SDE-1',
    year: '2023',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
    whatIDid: 'I practiced 200 medium LeetCode questions focusing on Graphs and Trees. I also conducted 5 mock interviews focusing specifically on Amazon Leadership Principles.',
    whatWentWrong: 'I initially struggled with the Bar Raiser round because I was too brief with my behavioral answers. I didn\'t use the STAR method properly.',
    whatILearned: 'Technical skills are only 50% of the game at Amazon. The STAR method for behavioral questions is absolutely mandatory for success.',
    keyTakeaway: 'Master the STAR method for behavioral questions as much as you master Graphs and Dynamic Programming.',
    seniorId: 's6',
    seniorName: 'Ishita Roy',
    seniorCompany: 'Amazon',
    seniorCollege: 'BITS Pilani',
    isApproved: true,
    createdAt: '2023-11-20T10:00:00Z'
  },
  {
    id: 'l2',
    title: 'Preparation Roadmap for Frontend Engineers',
    type: 'Preparation Tip',
    company: 'Adobe',
    role: 'Frontend Developer',
    year: '2024',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1200',
    whatIDid: 'Built 3 production-grade React projects and dove deep into JavaScript internals like the Event Loop and Closures.',
    whatWentWrong: 'I ignored basic CSS layouts (Flexbox/Grid) assuming they were "too easy", which cost me time during the machine coding round.',
    whatILearned: 'Don\'t ignore the fundamentals. Interviewers often test your depth in core technologies before looking at your framework knowledge.',
    keyTakeaway: 'JS Internals + Solid CSS + One solid framework is the perfect recipe for Frontend roles.',
    seniorId: 's1',
    seniorName: 'Rahul Sharma',
    seniorCompany: 'Google',
    seniorCollege: 'IIT Bombay',
    isApproved: true,
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'l3',
    title: 'The Hidden Reality of Off-Campus Applications',
    type: 'Experience',
    company: 'Zomato',
    role: 'SDE Intern',
    year: '2023',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
    whatIDid: 'Cold messaged 50+ recruiters on LinkedIn and asked for referrals from alumni. I focused on building a niche portfolio in Next.js.',
    whatWentWrong: 'I applied to 100+ roles without tailoring my resume. I got zero callbacks for the first month.',
    whatILearned: 'Referrals are 10x more powerful than cold applying. Quality of application > Quantity.',
    keyTakeaway: 'Find an insider, get a referral, and tailor your resume to the specific job description.',
    seniorId: 's2',
    seniorName: 'Priya Malhotra',
    seniorCompany: 'Microsoft',
    seniorCollege: 'NIT Trichy',
    isApproved: true,
    createdAt: '2024-02-10T11:00:00Z'
  }
];

export const MOCK_MISTAKES: SeniorMistake[] = [
  {
    id: 'm1',
    title: 'Skipping Fundamentals for Competitive Programming',
    category: 'DSA',
    mistake: 'I jumped straight into LeetCode hard problems without understanding basic recursion and complexity analysis.',
    consequence: 'Failed the first 3 OAs because I couldn\'t solve even the basic dry-run questions correctly.',
    lesson: 'Master the basics first. Understand "why" a data structure works, not just "how" to code it.',
    seniorId: 's1',
    seniorName: 'Rahul Sharma',
    isApproved: true,
    createdAt: '2023-10-15T10:00:00Z'
  },
  {
    id: 'm2',
    title: 'Neglecting HR Round & Culture Fit',
    category: 'Interview',
    mistake: 'I assumed HR rounds were just "formalities" and didn\'t research the company values or leadership principles.',
    consequence: 'Got rejected at the final stage of Amazon despite clearing all technical rounds with top scores.',
    lesson: 'Treat every round with equal respect. Behavioral questions are often the deciding factor in final selections.',
    seniorId: 's6',
    seniorName: 'Ishita Roy',
    isApproved: true,
    createdAt: '2023-11-05T09:00:00Z'
  },
  {
    id: 'm3',
    title: 'Fabricating Project Details on Resume',
    category: 'Resume',
    mistake: 'I added a Machine Learning project to my resume that I had only watched a tutorial on, but never actually built.',
    consequence: 'The interviewer grilled me on the specific math behind the model, and I went blank. It ruined the rest of the interview.',
    lesson: 'Be 100% honest. If you didn\'t build it, don\'t list it. Interviewers value honesty over fake complexity.',
    seniorId: 's2',
    seniorName: 'Priya Malhotra',
    isApproved: true,
    createdAt: '2023-12-01T14:20:00Z'
  }
];

export const MOCK_GUIDELINES: Guideline[] = [
  { id: '1', category: 'DSA', question: 'How much Graph theory is actually required?', advice: 'Focus on BFS, DFS and Dijkstra. Most interviews don\'t go beyond simple shortest path problems.', author: 'Rahul S.', authorId: 's1', authorRole: 'Placed', likes: 24 },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    bannerImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1200',
    description: 'The world leader in search and cloud computing.',
    branch: ['CSE', 'IT', 'ECE'],
    placedCount: 12,
    eligibility: { cgpa: 8.5, skills: ['Data Structures', 'Algorithms', 'System Design'] },
    process: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'Technical Round 3', 'Googlyness (HR)'],
    mustHaveSkills: ['C++/Java/Python', 'Strong Problem Solving', 'OS Fundamentals'],
    goodToHaveSkills: ['Cloud Knowledge', 'Distributed Systems'],
    seniorInsights: ['They value "Googlyness" - being humble and collaborative.', 'Focus on time complexity optimization.'],
    preparationPriority: ['LeetCode Medium/Hard', 'Mock Interviews', 'Review OS/CN basics']
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    bannerImage: 'https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=1200',
    description: 'Empowering every person and every organization on the planet to achieve more.',
    branch: ['CSE', 'IT', 'ECE', 'EEE'],
    placedCount: 25,
    eligibility: { cgpa: 8.0, skills: ['C#', 'OOPS', 'SQL'] },
    process: ['Coding Test', 'Tech Interview 1', 'Tech Interview 2', 'AA (As Appropriate) Round'],
    mustHaveSkills: ['OOPS', 'C++', 'DBMS'],
    goodToHaveSkills: ['Web Dev', 'Azure basics'],
    seniorInsights: ['They focus heavily on clean code.', 'Explain your thought process clearly.'],
    preparationPriority: ['OOPS Concepts', 'Top 100 Interview Questions', 'SQL Joins']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    bannerImage: 'https://images.unsplash.com/photo-1523474253046-5cd2c48b63cd?q=80&w=1200',
    description: 'Earth\'s most customer-centric company and a leader in e-commerce and AWS.',
    branch: ['CSE', 'IT', 'ECE', 'EEE', 'ME'],
    placedCount: 40,
    eligibility: { cgpa: 7.5, skills: ['Java', 'DSA', 'System Design'] },
    process: ['Online Assessment (2 Questions)', 'Technical Round 1', 'Technical Round 2', 'Bar Raiser Round'],
    mustHaveSkills: ['Leadership Principles', 'Data Structures', 'Complexity Analysis'],
    goodToHaveSkills: ['AWS Basics', 'NoSQL', 'Scalability Concepts'],
    seniorInsights: ['Leadership Principles (LP) are as important as coding.', 'Focus on Edge Cases in coding rounds.'],
    preparationPriority: ['14 Leadership Principles', 'LeetCode (Trees & Graphs)', 'STAR Method for HR']
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    bannerImage: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1200',
    description: 'Pioneering premium hardware, software, and services integration.',
    branch: ['CSE', 'IT', 'ECE'],
    placedCount: 5,
    eligibility: { cgpa: 9.0, skills: ['C', 'Swift', 'Operating Systems'] },
    process: ['CV Shortlisting', 'Intro Call', 'Technical Interview 1', 'Technical Interview 2', 'Onsite/Final Board'],
    mustHaveSkills: ['Low-level Programming', 'Memory Management', 'Computer Architecture'],
    goodToHaveSkills: ['App Development', 'Security Fundamentals'],
    seniorInsights: ['They care deeply about your passion for the product.', 'Deep knowledge of OS is mandatory.'],
    preparationPriority: ['Core OS Concepts', 'Pointer Manipulation in C', 'Project Architecture Deep-dive']
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    bannerImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1200',
    description: 'The world\'s leading entertainment service with 200+ million paid memberships.',
    branch: ['CSE', 'IT'],
    placedCount: 2,
    eligibility: { cgpa: 8.5, skills: ['Distributed Systems', 'Java', 'Microservices'] },
    process: ['Recruiter Screen', 'Technical Screen', 'Value Interview', 'System Design Panel', 'Panel Interview'],
    mustHaveSkills: ['System Design', 'Testing Culture', 'Decision Making'],
    goodToHaveSkills: ['Chaos Engineering', 'High Availability Architectures'],
    seniorInsights: ['Read the "Netflix Culture Memo" thrice.', 'They focus on your "Impact" and "Context".'],
    preparationPriority: ['Advanced System Design', 'Scalability Patterns', 'Culture Fit Alignment']
  },
  {
    id: 'zomato',
    name: 'Zomato',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
    bannerImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200',
    description: 'Leading food discovery and delivery platform based in India.',
    branch: ['CSE', 'IT', 'ECE', 'ME', 'CE'],
    placedCount: 18,
    eligibility: { cgpa: 7.0, skills: ['Full Stack', 'Problem Solving', 'Data Analytics'] },
    process: ['Aptitude & Coding', 'Technical Interview', 'Product/Case Round', 'Culture Fit'],
    mustHaveSkills: ['JavaScript/Golang', 'Product Thinking', 'Ownership'],
    goodToHaveSkills: ['Mobile Dev', 'Data Visualization', 'SQL'],
    seniorInsights: ['Focus on practical problem solving over academic theory.', 'Be ready for a fast-paced environment.'],
    preparationPriority: ['Building Real Projects', 'Modern Tech Stack (React/Node)', 'Case Study Analysis']
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    description: 'Leading global investment banking, securities, and investment management firm.',
    branch: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'],
    placedCount: 15,
    eligibility: { cgpa: 8.0, skills: ['Java', 'Algorithms', 'Probability'] },
    process: ['Aptitude Test', 'Coding Round', 'Technical Interview 1', 'Technical Interview 2', 'HR/Behavioral'],
    mustHaveSkills: ['Mathematics & Probability', 'Strong Java Fundamentals', 'SQL'],
    goodToHaveSkills: ['Finance Knowledge', 'R/Python', 'Competitive Programming'],
    seniorInsights: ['They love puzzles and math-heavy questions.', 'Java Collections is a frequent topic.'],
    preparationPriority: ['Probability & Statistics', 'Puzzles (GeeksforGeeks)', 'Advanced DSA']
  }
];

export const MOCK_QA: Question[] = [
  {
    id: 'q1',
    title: 'How deep do Google interviews go into DP?',
    description: 'I am comfortable with basic Knapsack and LCS. Should I focus more on Bitmask DP and Digit DP for intern roles?',
    category: 'Tech',
    subCategory: 'DSA',
    section: 'DSA',
    authorId: 'u1',
    authorName: 'Sunil V.',
    authorRole: 'Junior',
    askedByYear: 1,
    timestamp: '2 hours ago',
    isResolved: false
  }
];
