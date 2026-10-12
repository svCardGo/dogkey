import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { Toggle } from './components/Toggle';
import Icon from './lib/icons';
import { takePhoto, pickFile } from './lib/media';
import { GlassDialog } from './components/GlassDialog';
import { BottomNav, ItemRow } from './screensA';

/** DocBox card — mockup layout */
function DocBoxCard({
  title,
  count,
  thumb,
  onOpen,
  onCart,
  onShare,
}: {
  title: string;
  count: number;
  thumb?: string;
  onOpen: () => void;
  onCart?: () => void;
  onShare?: () => void;
}) {
  return (
    <article className="docbox-card">
      <div className="docbox-card-media" onClick={onOpen}>
        <span className="docbox-badge">{count}</span>
        <span className="docbox-eye" aria-hidden>👁</span>
        {thumb ? (
          <img src={thumb} alt="" />
        ) : (
          <div className="docbox-placeholder">Empty · Camera / Upload</div>
        )}
        <div className="docbox-side-actions">
          <button type="button" className="docbox-mini" aria-label="Email">✉</button>
          <button type="button" className="docbox-mini" aria-label="WhatsApp">💬</button>
        </div>
      </div>
      <div className="docbox-card-foot">
        <p className="docbox-title">{title}</p>
        <div className="docbox-actions">
          <button type="button" className="docbox-mini" title="Delete">🗑</button>
          <button type="button" className="docbox-mini" title="Camera" onClick={() => void takePhoto()}>📷</button>
          <button type="button" className="docbox-mini" title="Download">⬇</button>
          <button type="button" className="docbox-mini" title="Upload" onClick={() => void pickFile()}>⬆</button>
          <button type="button" className="docbox-mini" title="Cart" onClick={onCart}>🛒</button>
          <button type="button" className="docbox-mini" title="Share" onClick={onShare}>↗</button>
        </div>
      </div>
    </article>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, getChildren, setCurrentFolder, searchQuery, setSearchQuery, searchItems, addItem, setShareEnabled } = useDogKeyStore();
  const [showSheet, setShowSheet] = useState(false);
  const [folderDialog, setFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [gridMode, setGridMode] = useState<'grid' | 'single'>('grid');
  const roots = getChildren(null);
  const results = searchQuery ? searchItems(searchQuery) : null;

  return (
    <div className="docbox-app fade-in">
      <header className="docbox-header">
        <div className="docbox-header-row">
          <div className="docbox-logo-row">
            <span className="docbox-key-mark">🔑</span>
            <span className="docbox-brand">Dogkey</span>
          </div>
          <div className="docbox-header-actions">
            <button type="button" className="docbox-icon-btn" aria-label="Settings" onClick={() => navigate('/settings')}>⚙</button>
            <button type="button" className="docbox-icon-btn" aria-label="QR Card" onClick={() => navigate('/qr-card')}>▦</button>
            <button type="button" className="docbox-icon-btn" aria-label="Cart" onClick={() => navigate('/share')}>🛒</button>
            <button type="button" className="docbox-avatar" onClick={() => navigate('/profile')}>
              {user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <span>{(user?.displayName || 'U').charAt(0)}</span>}
            </button>
          </div>
        </div>
        <div className="docbox-search">
          <span className="docbox-search-ico">🔍</span>
          <input
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="docbox-search-mic" aria-hidden>🎤</span>
        </div>
      </header>

      <main className="docbox-main">
        {results ? (
          <div>
            <p className="docbox-muted">{results.length} results</p>
            {results.map((it) => (
              <ItemRow key={it.id} item={it} onClick={() => {
                if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); }
              }} />
            ))}
          </div>
        ) : (
          <div className={gridMode === 'grid' ? 'docbox-grid' : 'docbox-single'}>
            {roots.length === 0 ? (
              <p className="docbox-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                No DocBoxes yet. Tap + or create a folder.
              </p>
            ) : (
              roots.map((f) => {
                const kids = getChildren(f.id);
                const firstImg = kids.find((k) => k.type === 'image' && (k.thumbnail || k.content));
                return (
                  <DocBoxCard
                    key={f.id}
                    title={f.title || 'Empty box'}
                    count={kids.length}
                    thumb={firstImg?.thumbnail || firstImg?.content}
                    onOpen={() => { setCurrentFolder(f.id); navigate(`/folder/${f.id}`); }}
                    onCart={() => {
                      kids.forEach((k) => setShareEnabled(k.id, true));
                      navigate('/share');
                    }}
                    onShare={() => navigate('/share')}
                  />
                );
              })
            )}
          </div>
        )}
      </main>

      <BottomNav
        gridMode={gridMode}
        onToggleGrid={() => setGridMode((m) => (m === 'grid' ? 'single' : 'grid'))}
        onPlus={() => setShowSheet(true)}
      />

      {showSheet && (
        <div className="action-sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-title">Add</div>
            {[
              { icon: '📁', title: 'New DocBox', desc: 'Empty box', action: () => { setShowSheet(false); setFolderDialog(true); } },
              { icon: '📤', title: 'Upload File', desc: 'Photos, PDFs…', action: async () => { setShowSheet(false); await pickFile(); } },
              { icon: '📷', title: 'Take Photo', desc: 'Camera', action: async () => { setShowSheet(false); await takePhoto(); } },
            ].map((opt) => (
              <button key={opt.title} className="action-option" onClick={opt.action}>
                <div className="action-option-icon">{opt.icon}</div>
                <div className="action-option-text">
                  <div className="action-option-title">{opt.title}</div>
                  <div className="action-option-desc">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {folderDialog && (
        <div className="dialog-overlay" onClick={() => setFolderDialog(false)}>
          <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">New DocBox</div>
            <input className="glass-input" placeholder="Name (optional)" value={folderName} onChange={(e) => setFolderName(e.target.value)} style={{ marginTop: 12 }} />
            <button className="glass-button" style={{ width: '100%', marginTop: 16 }} onClick={() => {
              void addItem({ type: 'folder', title: folderName.trim() || 'Box', parentId: null });
              setFolderDialog(false); setFolderName('');
            }}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FolderScreen() {
  const navigate = useNavigate();
  const id = useLocation().pathname.split('/folder/')[1] || null;
  const { getItem, getChildren, setShareEnabled, setCurrentFolder, addItem } = useDogKeyStore();
  const [folderDialog, setFolderDialog] = useState(false);
  const folder = id ? getItem(id) : null;
  const children = getChildren(id);
  return (
    <div className="docbox-app screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => { setCurrentFolder(folder?.parentId ?? null); navigate(-1); }}><Icon.Back /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>{folder?.title || 'DocBox'}</div>
        <div style={{ width: 40 }} />
      </div>
      {children.length === 0 ? (
        <div className="empty-state"><div className="icon">📁</div><p>Empty — upload or camera</p></div>
      ) : (
        children.map((it) => (
          <ItemRow key={it.id} item={it} onClick={() => { if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); } }}
            trailing={<Toggle on={it.shareEnabled} onChange={(v) => setShareEnabled(it.id, v)} />} />
        ))
      )}
      <button className="glass-button" style={{ width: '100%', marginTop: 20 }} onClick={() => setFolderDialog(true)}>+ Subfolder</button>
      <GlassDialog open={folderDialog} title="Create Folder" placeholder="Folder name" confirmLabel="Create"
        onConfirm={(name) => { if (name) void addItem({ type: 'folder', title: name, parentId: id }); setFolderDialog(false); }}
        onCancel={() => setFolderDialog(false)} />
      <BottomNav />
    </div>
  );
}

export function AddNewScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const [busy, setBusy] = useState(false);
  const handleMedia = async (kind: 'file' | 'photo') => {
    if (busy) return;
    setBusy(true);
    try {
      const media = kind === 'photo' ? await takePhoto() : await pickFile();
      if (!media) return;
      const isImage = media.mimeType.startsWith('image/');
      const isVideo = media.mimeType.startsWith('video/');
      const isPdf = media.mimeType === 'application/pdf' || media.fileName.toLowerCase().endsWith('.pdf');
      const type = isImage ? 'image' as const : isVideo ? 'video' as const : isPdf ? 'pdf' as const : 'file' as const;
      void addItem({ type, title: media.fileName, mimeType: media.mimeType, size: media.size, content: media.dataUrl, thumbnail: isImage ? media.dataUrl : undefined, shareEnabled: false });
      navigate('/home');
    } finally { setBusy(false); }
  };
  const options = [
    { label: 'Upload File', desc: 'Photos, Videos, PDF…', action: () => handleMedia('file'), emoji: '📄' },
    { label: 'Take Photo', desc: 'Camera', action: () => handleMedia('photo'), emoji: '📷' },
    { label: 'Add Contact', desc: 'Name, Mobile…', path: '/add-contact', emoji: '👤' },
    { label: 'Add Link', desc: 'Website…', path: '/add-link', emoji: '🔗' },
    { label: 'Add Note', desc: 'Text', path: '/add-note', emoji: '📝' },
  ];
  return (
    <div className="docbox-app screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>Add New</div>
        <div style={{ width: 40 }} />
      </div>
      {busy && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Working…</p>}
      {options.map((o) => (
        <div key={o.label} className="list-item" onClick={() => { if ('path' in o && o.path) navigate(o.path!); else if ('action' in o) o.action?.(); }}>
          <div className="list-item-icon" style={{ fontSize: 20 }}>{o.emoji}</div>
          <div><div style={{ fontWeight: 600 }}>{o.label}</div>{o.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.desc}</div>}</div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}

export function AddContactScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const [form, setForm] = useState({ name: '', mobile: '', whatsapp: '', email: '', address: '', website: '', notes: '', share: false });
  return (
    <div className="docbox-app screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Add Contact</div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(['name', 'mobile', 'whatsapp', 'email', 'address', 'website', 'notes'] as const).map((f) => (
          <input key={f} className="glass-input" placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: 15 }}>Share via DogKey</span>
          <Toggle on={form.share} onChange={(v) => setForm({ ...form, share: v })} />
        </div>
        <button className="glass-button" style={{ width: '100%' }} onClick={() => {
          if (!form.name.trim()) return;
          void addItem({ type: 'contact', title: form.name, mobile: form.mobile, whatsapp: form.whatsapp, email: form.email, address: form.address, website: form.website, notes: form.notes, shareEnabled: form.share, parentId: 'folder-contacts' });
          navigate('/home');
        }}>Save Contact</button>
      </div>
    </div>
  );
}

export function AddLinkScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const [form, setForm] = useState({ title: '', url: '', description: '', share: false });
  return (
    <div className="docbox-app screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Add Link</div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="glass-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="glass-input" placeholder="URL (https://)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input className="glass-input" placeholder="Description (Optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Share via DogKey</span>
          <Toggle on={form.share} onChange={(v) => setForm({ ...form, share: v })} />
        </div>
        <button className="glass-button" style={{ width: '100%' }} onClick={() => {
          if (!form.title || !form.url) return;
          void addItem({ type: 'link', title: form.title, url: form.url, description: form.description, shareEnabled: form.share, parentId: 'folder-links' });
          navigate('/home');
        }}>Save Link</button>
      </div>
    </div>
  );
}

export function AddNoteScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const [content, setContent] = useState('');
  const [share, setShare] = useState(false);
  return (
    <div className="docbox-app screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Add Note</div>
        <div style={{ width: 40 }} />
      </div>
      <textarea className="glass-input" style={{ minHeight: 180, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Write your note…" value={content} onChange={(e) => setContent(e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        <span>Share via DogKey</span>
        <Toggle on={share} onChange={setShare} />
      </div>
      <button className="glass-button" style={{ width: '100%' }} onClick={() => {
        if (!content.trim()) return;
        void addItem({ type: 'note', title: content.slice(0, 40) || 'Note', content, shareEnabled: share, parentId: 'folder-notes' });
        navigate('/home');
      }}>Save Note</button>
    </div>
  );
}
