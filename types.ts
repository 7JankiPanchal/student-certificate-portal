// Role type
export type Role = 'student' | 'teacher';

// Document Types
export enum DocType {
  FEE_RECEIPT = 'Fee Receipt',
  HALL_TICKET = 'Hall Ticket',
  RESULT = 'Result',
  CERTIFICATE = 'Certificate',
  PERSONAL = 'Personal File',
}

// Document Status
export enum DocStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Document Interface
export interface Document {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  uploadDate: string; // ISO string preferred
  points: number;
  size: string;
  owner: string;
  rejectionReason?: string;
  hash?: string;
}

// User Interface
export interface User {
  name: string;
  email: string;
  role: Role;
  pointsEarned: number;
  pointsTarget: number;
  storageUsed: number;   // in GB
  storageLimit: number;  // in GB
  avatar: string;
}

// App State Interface
export interface AppState {
  user: User | null;
  documents: Document[];
  searchQuery: string;
  activeView: string;
}