/**
 * Google Drive integration preparation layer.
 * Does NOT authenticate or set googleConnected=true without real OAuth.
 */

export const DRIVE_CONFIG = {
  packageName: 'com.dogkey.app',
  androidClientId: '',
  webClientId: '',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
  ],
  rootFolderName: 'DogKey',
};

export interface DriveTokens {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
  email?: string;
}

export type DriveStatus =
  | { state: 'not_configured'; reason: string }
  | { state: 'ready_to_auth'; package: string; sha1?: string }
  | { state: 'connected'; email: string; expiresAt: string }
  | { state: 'expired' };

export function getDriveStatus(user: {
  googleConnected?: boolean;
  googleEmail?: string;
  googleTokenExpiry?: string;
} | null): DriveStatus {
  if (!DRIVE_CONFIG.androidClientId) {
    return {
      state: 'not_configured',
      reason:
        'Android OAuth client not configured. Create client for package com.dogkey.app with debug SHA-1 in Google Cloud Console.',
    };
  }
  if (user?.googleConnected && user.googleEmail && user.googleTokenExpiry) {
    if (new Date(user.googleTokenExpiry) > new Date()) {
      return { state: 'connected', email: user.googleEmail, expiresAt: user.googleTokenExpiry };
    }
    return { state: 'expired' };
  }
  return { state: 'ready_to_auth', package: DRIVE_CONFIG.packageName };
}

export async function driveListFiles(_accessToken: string, _folderId?: string): Promise<never> {
  throw new Error('Drive API not connected — configure Android OAuth client first');
}

export async function driveUpload(
  _accessToken: string,
  _name: string,
  _mimeType: string,
  _body: Blob
): Promise<never> {
  throw new Error('Drive API not connected — configure Android OAuth client first');
}
