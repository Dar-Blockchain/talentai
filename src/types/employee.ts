export interface Invitation {
  _id: string;
  email: string;
  Company?: any;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'active' | 'revoked';
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  token?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
}