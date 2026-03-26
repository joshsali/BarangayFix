export type UserRole = 'resident' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: any;
}

export type ReportStatus = 'submitted' | 'under review' | 'in progress' | 'resolved';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  reporterUid: string;
  location?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}
