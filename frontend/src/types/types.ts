// Role type
export type Role = 'student' | 'teacher';

// Document Status
export enum DocStatus {
  PENDING = 'PENDING',
  APPROVED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// Document Interface
export interface Document {
  id: string;
  name: string;
  status: DocStatus;
  uploadDate: string;
  points: number;
  size: number;
  owner: string;
  ownerName?: string;
  url?: string;
  rejectionReason?: string;
  hash?: string;
  signature?: string;
}

// User Interface
export interface User {
  student_id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
}
