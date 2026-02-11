
import { User, Document, DocType, DocStatus } from './types';

export const MOCK_STUDENT: User = {
  name: "Alex Johnson",
  email: "alex.j@college.edu",
  role: 'student',
  pointsEarned: 124,
  pointsTarget: 200,
  storageUsed: 1.2,
  storageLimit: 5,
  avatar: "https://picsum.photos/seed/alex/200/200"
};

export const MOCK_TEACHER: User = {
  name: "Dr. Sarah Miller",
  email: "s.miller@college.edu",
  role: 'teacher',
  pointsEarned: 0,
  pointsTarget: 0,
  storageUsed: 0,
  storageLimit: 0,
  avatar: "https://picsum.photos/seed/sarah/200/200"
};

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Fall 2023 Fee Receipt.pdf',
    type: DocType.FEE_RECEIPT,
    status: DocStatus.APPROVED,
    uploadDate: '2023-09-15',
    points: 10,
    size: '2.4 MB',
    owner: 'Alex Johnson',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: '2',
    name: 'AWS Cloud Practitioner Cert.pdf',
    type: DocType.CERTIFICATE,
    status: DocStatus.PENDING,
    uploadDate: '2024-02-10',
    points: 50,
    size: '1.8 MB',
    owner: 'Alex Johnson'
  },
  {
    id: '3',
    name: 'Mid-term Results Sem 5.pdf',
    type: DocType.RESULT,
    status: DocStatus.APPROVED,
    uploadDate: '2023-11-20',
    points: 15,
    size: '0.9 MB',
    owner: 'Alex Johnson',
    hash: 'd6a99264c9f139d89264c9f139d8d6a99264c9f139d89264c9f139d8d6a99264'
  },
  {
    id: '4',
    name: 'Hackathon Participation.pdf',
    type: DocType.CERTIFICATE,
    status: DocStatus.REJECTED,
    uploadDate: '2024-01-05',
    points: 20,
    size: '3.1 MB',
    owner: 'Alex Johnson',
    rejectionReason: 'Invalid signature. Please re-upload with official seal.'
  },
  {
    id: '5',
    name: 'Spring 2024 Hall Ticket.pdf',
    type: DocType.HALL_TICKET,
    status: DocStatus.APPROVED,
    uploadDate: '2024-03-01',
    points: 5,
    size: '1.2 MB',
    owner: 'Alex Johnson',
    hash: '4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5'
  },
  {
    id: '6',
    name: 'Robotics Workshop Cert.pdf',
    type: DocType.CERTIFICATE,
    status: DocStatus.PENDING,
    uploadDate: '2024-03-12',
    points: 30,
    size: '2.2 MB',
    owner: 'Alex Johnson'
  }
];
