export type ItemType = 'folder' | 'file' | 'image' | 'video' | 'pdf' | 'contact' | 'link' | 'note' | 'text';

export interface DogKeyUser {
  id: string;
  displayName: string;
  profilePhoto: string | null;
  loginPinHash: string | null;
  createdAt: string;
  updatedAt: string;
  googleConnected: boolean;
  googleEmail?: string;
}

export interface DogKeyItem {
  id: string;
  parentId: string | null;
  type: ItemType;
  title: string;
  description?: string;
  mimeType?: string;
  driveFileId?: string;
  driveFolderId?: string;
  content?: string;
  thumbnail?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
  shareEnabled: boolean;
  sortOrder: number;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  website?: string;
  notes?: string;
  url?: string;
}

export interface ShareSession {
  id: string;
  ownerId: string;
  createdAt: string;
  expiresAt: string;
  pinHash: string;
  enabled: boolean;
  masterShare: boolean;
  selectedItemIds: string[];
  qrPayload: string;
  revokedAt?: string;
  sharePinDisplay?: string;
}

export interface AppSettings {
  biometricLock: boolean;
  autoLockMinutes: number;
  hideAppContent: boolean;
  theme: 'light';
}

export type Screen =
  | 'splash'
  | 'welcome'
  | 'create-pin'
  | 'connect-drive'
  | 'home'
  | 'folder'
  | 'add-new'
  | 'add-contact'
  | 'add-link'
  | 'add-note'
  | 'share-settings'
  | 'qr-card'
  | 'receiver-pin'
  | 'shared-content'
  | 'security'
  | 'settings'
  | 'validity'
  | 'about'
  | 'file-options'
  | 'search';
