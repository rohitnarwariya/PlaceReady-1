
export interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  section: string;
  year: 1 | 2 | 3 | 4;
  yearLabel: string;
  role: 'junior' | 'senior' | 'admin';
  skills: string[];
  college?: string;
  graduationYear?: number;
  currentCompany?: string;
  linkedinUrl?: string;
  bio?: string;
  isVerified?: boolean;
  profilePic?: string;
  cgpa?: number;
}

export interface Placement {
  id: string;
  userId: string;
  companyId: string;
  roleOffered: string;
  placementYear: number;
  isVerified: boolean;
  verifiedBy?: string;
}

// Joined type for UI rendering
export interface PlacedStudentDisplay extends Placement {
  userName: string;
  userBranch: string;
  userProfilePic?: string;
  userLinkedin?: string;
  userGradYear?: number;
}

export type ChatRequestStatus = 'pending' | 'accepted' | 'rejected';
export type ChatRequestReason = 'Internship' | 'Skills' | 'CGPA' | 'Placement';

export interface ChatRequest {
  id: string;
  // Unified schema fields used in dashboard and senior profiles
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  domain?: string;
  // Shared fields
  reason: ChatRequestReason;
  message: string;
  status: ChatRequestStatus;
  createdAt: string;
  // Legacy fields for backward compatibility
  senderId?: string;
  senderName?: string;
  receiverId?: string;
}

export interface Chat {
  id: string;
  // Unified schema fields used for 1-to-1 chats
  userAId: string;
  userBId: string;
  userAName: string;
  userBName: string;
  domain?: string;
  // Common properties
  lastMessage?: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  participants?: string[];
  participantNames?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  category: 'Tech' | 'Non-Tech';
  subCategory: string;
  section: string; // Mapping to legacy for compatibility
  authorId: string;
  authorName: string;
  authorRole: string;
  askedByYear: number;
  timestamp: string;
  isResolved: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorCompany?: string;
  authorYear: number;
  authorSection: string;
  timestamp: string;
  isVerified: boolean;
}

export type LearningType = 'Interview Learning' | 'Preparation Tip' | 'Experience' | 'Advice';
export interface SeniorLearningPost {
  id: string;
  title: string;
  type: LearningType;
  company: string;
  role: string;
  year: string;
  imageUrl?: string;
  whatIDid: string;
  whatWentWrong: string;
  whatILearned: string;
  keyTakeaway: string;
  seniorId: string;
  seniorName: string;
  seniorCompany?: string;
  seniorCollege?: string;
  isApproved: boolean;
  createdAt: string;
}
export interface SeniorMistake {
  id: string;
  title: string;
  mistake: string;
  consequence: string;
  lesson: string;
  category: 'Interview' | 'Exam' | 'DSA' | 'Resume' | 'Skills' | 'Internship' | 'General';
  seniorId: string;
  seniorName: string;
  isApproved: boolean;
  createdAt: string;
}
export interface Guideline {
  id: string;
  category: 'DSA' | 'HR' | 'DBMS';
  question: string;
  advice: string;
  author: string;
  authorId?: string;
  authorRole: 'Senior' | 'Alumni' | 'Placed';
  likes: number;
}
export interface Company {
  id: string;
  name: string;
  logo: string;
  bannerImage: string;
  description: string;
  branch: string[];
  placedCount: number;
  eligibility: {
    cgpa: number;
    skills: string[];
  };
  process: string[];
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  seniorInsights: string[];
  preparationPriority: string[];
}

// Added missing types for Campus Clubs and Representatives to fix import errors
export interface Club {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  bannerUrl?: string;
  shortDesc: string;
  fullDesc: string;
  recruitmentInfo?: string;
}

export interface ClubRepresentative {
  id: string;
  clubId: string;
  userId: string;
  name: string;
  role: string;
  branch: string;
  year: number;
}

export interface ClubPost {
  id: string;
  clubId: string;
  title: string;
  content: string;
  category: 'Recruitment' | 'Preparation' | 'General' | 'Event';
  createdAt: string;
}
