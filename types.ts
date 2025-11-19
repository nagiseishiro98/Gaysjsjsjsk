export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  BANNED = 'BANNED',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export enum DurationType {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  YEARS = 'YEARS'
}

export interface LicenseKey {
  id: string;
  key: string;
  note: string;
  createdAt: number;
  expiresAt: number | null; // null means lifetime
  status: KeyStatus;
  maxDevices: number;
  boundDeviceId: string | null; // Hardware ID (HWID)
  lastUsed: number | null;
  ip: string | null;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface GenerateKeyParams {
  prefix: string;
  durationValue: number;
  durationType: DurationType;
  note: string;
}