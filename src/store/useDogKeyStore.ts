import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DogKeyUser, DogKeyItem, ShareSession, AppSettings, ItemType } from '../types';
import { generateSalt, derivePinHash, verifyPin, buildShareQrPayload } from '../lib/crypto';
import { protectContent, getSessionDataKey } from '../lib/secureVault';

function uid() {
  return crypto.randomUUID();
}

function seedFolders(): DogKeyItem[] {
  const now = new Date().toISOString();
  const roots = ['Documents', 'Photos', 'Videos', 'Contacts', 'Links', 'Notes'];
  const items: DogKeyItem[] = roots.map((title, i) => ({
    id: `folder-${title.toLowerCase()}`,
    parentId: null,
    type: 'folder' as const,
    title,
    shareEnabled: false,
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }));
  return items;
}

interface DogKeyState {
  hasOnboarded: boolean;
  isUnlocked: boolean;
  user: DogKeyUser | null;
  items: DogKeyItem[];
  currentFolderId: string | null;
  shareSession: ShareSession | null;
  masterShare: boolean;
  settings: AppSettings;
  searchQuery: string;
  setOnboarded: (v: boolean) => void;
  setUnlocked: (v: boolean) => void;
  createUser: (name: string, pin: string) => Promise<void>;
  verifyLoginPin: (pin: string) => Promise<boolean>;
  changeLoginPin: (oldPin: string, newPin: string) => Promise<boolean>;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  addItem: (item: Partial<DogKeyItem> & { type: ItemType; title: string }) => Promise<string>;
  updateItem: (id: string, updates: Partial<DogKeyItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
  setShareEnabled: (id: string, enabled: boolean) => void;
  setCurrentFolder: (id: string | null) => void;
  getChildren: (parentId: string | null) => DogKeyItem[];
  getItem: (id: string) => DogKeyItem | undefined;
  getSharedItems: () => DogKeyItem[];
  searchItems: (q: string) => DogKeyItem[];
  setMasterShare: (on: boolean) => void;
  createShareSession: (pin: string, validityMinutes: number, selectedIds?: string[]) => Promise<void>;
  stopSharing: () => void;
  verifySharePin: (pin: string) => Promise<boolean>;
  isShareActive: () => boolean;
  updateSettings: (s: Partial<AppSettings>) => void;
  setSearchQuery: (q: string) => void;
  updateProfile: (name: string, photo?: string | null) => void;
}

export const useDogKeyStore = create<DogKeyState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      isUnlocked: false,
      user: null,
      items: seedFolders(),
      currentFolderId: null,
      shareSession: null,
      masterShare: false,
      settings: { biometricLock: true, autoLockMinutes: 1, hideAppContent: false, theme: 'light' },
      searchQuery: '',
      setOnboarded: (v) => set({ hasOnboarded: v }),
      setUnlocked: (v) => set({ isUnlocked: v }),
      createUser: async (name, pin) => {
        const salt = await generateSalt();
        const loginPinHash = await derivePinHash(pin, salt);
        const user: DogKeyUser = {
          id: uid(),
          displayName: name || 'User',
          profilePhoto: null,
          loginPinHash,
          loginPinSalt: salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleConnected: false,
        };
        set({ user, hasOnboarded: true, isUnlocked: true });
      },
      verifyLoginPin: async (pin) => {
        const { user } = get();
        if (!user?.loginPinHash || !user.loginPinSalt) return false;
        return verifyPin(pin, user.loginPinSalt, user.loginPinHash);
      },
      changeLoginPin: async (oldPin, newPin) => {
        const { user } = get();
        if (!user?.loginPinHash || !user.loginPinSalt) return false;
        const ok = await verifyPin(oldPin, user.loginPinSalt, user.loginPinHash);
        if (!ok) return false;
        const salt = await generateSalt();
        const loginPinHash = await derivePinHash(newPin, salt);
        set({ user: { ...user, loginPinHash, loginPinSalt: salt, updatedAt: new Date().toISOString() } });
        return true;
      },
      connectGoogle: () => {
        console.warn('[DogKey] Google Drive requires a valid Android OAuth client (com.dogkey.app + SHA-1).');
      },
      disconnectGoogle: () => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            googleConnected: false,
            googleEmail: undefined,
            googleAccessToken: undefined,
            googleTokenExpiry: undefined,
            updatedAt: new Date().toISOString(),
          },
        });
      },
      addItem: async (partial) => {
        const id = uid();
        // Encrypt sensitive payloads when vault is unlocked (AES-GCM + Keystore-backed key)
        let content = partial.content;
        let notes = partial.notes;
        if (getSessionDataKey()) {
          if (content) content = await protectContent(content);
          if (notes) notes = await protectContent(notes);
        }
        const item: DogKeyItem = {
          id,
          parentId: partial.parentId ?? get().currentFolderId,
          type: partial.type,
          title: partial.title,
          description: partial.description,
          mimeType: partial.mimeType,
          content,
          thumbnail: partial.thumbnail,
          url: partial.url,
          mobile: partial.mobile,
          whatsapp: partial.whatsapp,
          email: partial.email,
          address: partial.address,
          website: partial.website,
          notes,
          shareEnabled: partial.shareEnabled ?? false,
          sortOrder: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          size: partial.size,
        };
        set((s) => ({ items: [...s.items, item] }));
        return id;
      },
      updateItem: (id, updates) => {
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, ...updates, updatedAt: new Date().toISOString() } : it
          ),
        }));
      },
      deleteItem: (id) => {
        const toDelete = new Set<string>([id]);
        const items = get().items;
        let changed = true;
        while (changed) {
          changed = false;
          for (const it of items) {
            if (it.parentId && toDelete.has(it.parentId) && !toDelete.has(it.id)) {
              toDelete.add(it.id);
              changed = true;
            }
          }
        }
        set((s) => ({ items: s.items.filter((it) => !toDelete.has(it.id)) }));
      },
      moveItem: (id, newParentId) => {
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, parentId: newParentId, updatedAt: new Date().toISOString() } : it
          ),
        }));
      },
      setShareEnabled: (id, enabled) => {
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, shareEnabled: enabled, updatedAt: new Date().toISOString() } : it
          ),
        }));
      },
      setCurrentFolder: (id) => set({ currentFolderId: id }),
      getChildren: (parentId) =>
        get()
          .items.filter((it) => it.parentId === parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      getItem: (id) => get().items.find((it) => it.id === id),
      getSharedItems: () => {
        const { items, masterShare, shareSession } = get();
        if (!get().isShareActive() && !masterShare) return [];
        const selected = new Set(shareSession?.selectedItemIds ?? []);
        const sharedFolderIds = new Set(
          items.filter((it) => it.type === 'folder' && it.shareEnabled).map((it) => it.id)
        );
        const underSharedFolder = (it: DogKeyItem): boolean => {
          let pid = it.parentId;
          while (pid) {
            if (sharedFolderIds.has(pid)) return true;
            const parent = items.find((x) => x.id === pid);
            pid = parent?.parentId ?? null;
          }
          return false;
        };
        return items.filter((it) => {
          if (it.type === 'folder') return false;
          if (masterShare && (it.shareEnabled || underSharedFolder(it))) return true;
          if (selected.has(it.id) || it.shareEnabled || underSharedFolder(it)) return true;
          return false;
        });
      },
      searchItems: (q) => {
        const lower = q.toLowerCase().trim();
        if (!lower) return [];
        return get().items.filter(
          (it) =>
            it.title.toLowerCase().includes(lower) ||
            it.description?.toLowerCase().includes(lower) ||
            it.content?.toLowerCase().includes(lower) ||
            it.url?.toLowerCase().includes(lower) ||
            it.email?.toLowerCase().includes(lower) ||
            it.notes?.toLowerCase().includes(lower)
        );
      },
      setMasterShare: (on) => set({ masterShare: on }),
      createShareSession: async (pin, validityMinutes, selectedIds) => {
        const { user, items, masterShare } = get();
        if (!user) return;
        const now = new Date();
        const expires = new Date(now.getTime() + validityMinutes * 60 * 1000);
        const ids = selectedIds ?? items.filter((it) => it.shareEnabled).map((it) => it.id);
        const sessionId = uid();
        const pinSalt = await generateSalt();
        const pinHash = await derivePinHash(pin, pinSalt);
        const qrPayload = buildShareQrPayload({
          id: sessionId,
          ownerId: user.id,
          expiresAt: expires.toISOString(),
          ownerName: user.displayName,
        });
        set({
          shareSession: {
            id: sessionId,
            ownerId: user.id,
            createdAt: now.toISOString(),
            expiresAt: expires.toISOString(),
            pinHash,
            pinSalt,
            enabled: true,
            masterShare,
            selectedItemIds: ids,
            qrPayload,
            sharePinDisplay: pin,
            attemptCount: 0,
          },
        });
      },
      stopSharing: () => {
        const { shareSession } = get();
        if (shareSession) {
          set({
            shareSession: {
              ...shareSession,
              enabled: false,
              revokedAt: new Date().toISOString(),
              sharePinDisplay: undefined,
            },
            masterShare: false,
          });
        }
      },
      verifySharePin: async (pin) => {
        const { shareSession } = get();
        if (!shareSession || !shareSession.enabled) return false;
        if (shareSession.revokedAt) return false;
        if (new Date(shareSession.expiresAt) < new Date()) return false;
        if (shareSession.lockedUntil && new Date(shareSession.lockedUntil) > new Date()) return false;
        const ok = await verifyPin(pin, shareSession.pinSalt, shareSession.pinHash);
        if (!ok) {
          const attempts = (shareSession.attemptCount || 0) + 1;
          set({
            shareSession: {
              ...shareSession,
              attemptCount: attempts,
              lockedUntil: attempts >= 5 ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : shareSession.lockedUntil,
            },
          });
          return false;
        }
        set({ shareSession: { ...shareSession, attemptCount: 0, lockedUntil: undefined } });
        return true;
      },
      isShareActive: () => {
        const { shareSession } = get();
        if (!shareSession || !shareSession.enabled || shareSession.revokedAt) return false;
        return new Date(shareSession.expiresAt) > new Date();
      },
      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      setSearchQuery: (q) => set({ searchQuery: q }),
      updateProfile: (name, photo) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            displayName: name,
            profilePhoto: photo !== undefined ? photo : user.profilePhoto,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'dogkey-storage-v2',
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        user: state.user,
        items: state.items,
        shareSession: state.shareSession
          ? { ...state.shareSession, sharePinDisplay: undefined }
          : null,
        masterShare: state.masterShare,
        settings: state.settings,
      }),
    }
  )
);
