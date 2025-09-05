export interface OrganizationInvitation {
  id: string;
  email: string;
  state: string;
  acceptedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
