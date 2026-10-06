import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DogKeyUser, DogKeyItem, ShareSession, AppSettings, ItemType } from '../types';

function uid() {
  return crypto.randomUUID();
}

function hashPin(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  }
  return `dk_${h.toString(16)}_${pin.length}`;
}

const DEMO_ITEMS: DogKeyItem[] = [
  { id: 'folder-docs', parentId: null, type: 'folder', title: 'Documents', shareEnabled: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-photos', parentId: null, type: 'folder', title: 'Photos', shareEnabled: false, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-videos', parentId: null, type: 'folder', title: 'Videos', shareEnabled: false, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-contacts', parentId: null, type: 'folder', title: 'Contacts', shareEnabled: false, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-links', parentId: null, type: 'folder', title: 'Links', shareEnabled: false, sortOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-notes', parentId: null, type: 'folder', title: 'Notes', shareEnabled: false, sortOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-personal', parentId: 'folder-docs', type: 'folder', title: 'Personal', shareEnabled: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-education', parentId: 'folder-docs', type: 'folder', title: 'Education', shareEnabled: false, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-business', parentId: 'folder-docs', type: 'folder', title: 'Business', shareEnabled: true, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-certs', parentId: 'folder-docs', type: 'folder', title: 'Certificates', shareEnabled: false, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'file-cert', parentId: 'folder-certs', type: 'pdf', title: 'Certificate.pdf', mimeType: 'application/pdf', size: 2400000, shareEnabled: true, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'contact-1', parentId: 'folder-contacts', type: 'contact', title: 'Aarav Sharma', mobile: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'aarav@example.com', shareEnabled: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'link-1', parentId: 'folder-links', type: 'link', title: 'My Portfolio', url: 'https://example.com', description: 'Personal website', shareEnabled: true, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'note-1', parentId: 'folder-notes', type: 'note', title: 'Important Info', content: 'Keep everything. Share only what you choose.', shareEnabled: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

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
  createUser: (name: string, pin: string) => void;
  verifyLoginPin: (pin: string) => boolean;
  changeLoginPin: (oldPin: string, newPin: string) => boolean;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  addItem: (item: Partial<DogKeyItem> & { type: ItemType; title: string }) => string;
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
  createShareSession: (pin: string, validityMinutes: number, selectedIds?: string[]) => void;
  stopSharing: () => void;
  verifySharePin: (pin: string) => boolean;
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
      items: DEMO_ITEMS,
      currentFolderId: null,
      shareSession: null,
      masterShare: false,
      settings: { biometricLock: true, autoLockMinutes: 1, hideAppContent: false, theme: 'light' },
      searchQuery: '',
      setOnboarded: (v) => set({ hasOnboarded: v }),
      setUnlocked: (v) => set({ isUnlocked: v }),
      createUser: (name, pin) => {
        const user: DogKeyUser = {
          id: uid(), displayName: name || 'Radhakishan', profilePhoto: null,
          loginPinHash: hashPin(pin), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), googleConnected: false,
        };
        set({ user, hasOnboarded: true, isUnlocked: true });
      },
      verifyLoginPin: (pin) => {
        const { user } = get();
        if (!user?.loginPinHash) return false;
        return user.loginPinHash === hashPin(pin);
      },
      changeLoginPin: (oldPin, newPin) => {
        const { user, verifyLoginPin } = get();
        if (!user || !verifyLoginPin(oldPin)) return false;
        set({ user: { ...user, loginPinHash: hashPin(newPin), updatedAt: new Date().toISOString() } });
        return true;
      },
      connectGoogle: () => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, googleConnected: true, googleEmail: 'user@gmail.com', updatedAt: new Date().toISOString() } });
      },
      disconnectGoogle: () => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, googleConnected: false, googleEmail: undefined, updatedAt: new Date().toISOString() } });
      },
      addItem: (partial) => {
        const id = uid();
        const item: DogKeyItem = {
          id, parentId: partial.parentId ?? get().currentFolderId, type: partial.type, title: partial.title,
          description: partial.description, mimeType: partial.mimeType, content: partial.content, url: partial.url,
          mobile: partial.mobile, whatsapp: partial.whatsapp, email: partial.email, address: partial.address,
          website: partial.website, notes: partial.notes, shareEnabled: partial.shareEnabled ?? false,
          sortOrder: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), size: partial.size,
        };
        set((s) => ({ items: [...s.items, item] }));
        return id;
      },
      updateItem: (id, updates) => {
        set((s) => ({ items: s.items.map((it) => it.id === id ? { ...it, ...updates, updatedAt: new Date().toISOString() } : it) }));
      },
      deleteItem: (id) => {
        const toDelete = new Set<string>([id]);
        const items = get().items;
        let changed = true;
        while (changed) {
          changed = false;
          for (const it of items) {
            if (it.parentId && toDelete.has(it.parentId) && !toDelete.has(it.id)) { toDelete.add(it.id); changed = true; }
          }
        }
        set((s) => ({ items: s.items.filter((it) => !toDelete.has(it.id)) }));
      },
      moveItem: (id, newParentId) => {
        set((s) => ({ items: s.items.map((it) => it.id === id ? { ...it, parentId: newParentId, updatedAt: new Date().toISOString() } : it) }));
      },
      setShareEnabled: (id, enabled) => {
        set((s) => ({ items: s.items.map((it) => it.id === id ? { ...it, shareEnabled: enabled, updatedAt: new Date().toISOString() } : it) }));
      },
      setCurrentFolder: (id) => set({ currentFolderId: id }),
      getChildren: (parentId) => get().items.filter((it) => it.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder),
      getItem: (id) => get().items.find((it) => it.id === id),
      getSharedItems: () => {
        const { items, masterShare, shareSession } = get();
        if (!shareSession?.enabled && !masterShare) return [];
        if (masterShare) return items.filter((it) => it.shareEnabled && it.type !== 'folder');
        const ids = new Set(shareSession?.selectedItemIds ?? []);
        return items.filter((it) => ids.has(it.id) || (it.shareEnabled && it.type !== 'folder'));
      },
      searchItems: (q) => {
        const lower = q.toLowerCase().trim();
        if (!lower) return [];
        return get().items.filter((it) =>
          it.title.toLowerCase().includes(lower) || it.description?.toLowerCase().includes(lower) ||
          it.content?.toLowerCase().includes(lower) || it.url?.toLowerCase().includes(lower) ||
          it.email?.toLowerCase().includes(lower) || it.mobile?.includes(lower)
        );
      },
      setMasterShare: (on) => set({ masterShare: on }),
      createShareSession: (pin, validityMinutes, selectedIds) => {
        const { user, items, masterShare } = get();
        if (!user) return;
        const now = new Date();
        const expires = new Date(now.getTime() + validityMinutes * 60 * 1000);
        const ids = selectedIds ?? items.filter((it) => it.shareEnabled).map((it) => it.id);
        const session: ShareSession = {
          id: uid(), ownerId: user.id, createdAt: now.toISOString(), expiresAt: expires.toISOString(),
          pinHash: hashPin(pin), enabled: true, masterShare, selectedItemIds: ids,
          qrPayload: JSON.stringify({ v: 1, sid: uid().slice(0, 8), oid: user.id.slice(0, 8), n: user.displayName }),
          sharePinDisplay: pin,
        };
        set({ shareSession: session });
      },
      stopSharing: () => {
        const { shareSession } = get();
        if (shareSession) set({ shareSession: { ...shareSession, enabled: false, revokedAt: new Date().toISOString() }, masterShare: false });
      },
      verifySharePin: (pin) => {
        const { shareSession } = get();
        if (!shareSession || !shareSession.enabled) return false;
        if (new Date(shareSession.expiresAt) < new Date()) return false;
        return shareSession.pinHash === hashPin(pin);
      },
      isShareActive: () => {
        const { shareSession } = get();
        if (!shareSession || !shareSession.enabled) return false;
        return new Date(shareSession.expiresAt) > new Date();
      },
      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      setSearchQuery: (q) => set({ searchQuery: q }),
      updateProfile: (name, photo) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, displayName: name, profilePhoto: photo !== undefined ? photo : user.profilePhoto, updatedAt: new Date().toISOString() } });
      },
    }),
    {
      name: 'dogkey-storage',
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded, user: state.user, items: state.items,
        shareSession: state.shareSession ? { ...state.shareSession, sharePinDisplay: undefined } : null,
        masterShare: state.masterShare, settings: state.settings,
      }),
    }
  )
);
