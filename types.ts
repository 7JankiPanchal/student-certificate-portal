export type Role = 'student' | 'teacher';

export enum DocType {
  FEE_RECEIPT = 'Fee Receipt',
  HALL_TICKET = 'Hall Ticket',
  RESULT = 'Result',
  CERTIFICATE = 'Certificate',
  PERSONAL = 'Personal File'
}

export enum DocStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Document {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  uploadDate: string;
  points: number;
  size: string;
  owner: string;
  rejectionReason?: string;
  hash?: string;
}

export interface User {
  name: string;
  email: string;
  role: Role;
  pointsEarned: number;
  pointsTarget: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  avatar: string;
}

export interface AppState {
  user: User | null;
  documents: Document[];
  searchQuery: string;
  activeView: string;
}