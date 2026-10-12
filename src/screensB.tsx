import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { Toggle } from './components/Toggle';
import Icon from './lib/icons';
import { takePhoto, pickFile } from './lib/media';
import { GlassDialog } from './components/GlassDialog';
import { BottomNav, ItemRow } from './screensA';

function DocBoxCard({
  title,
  count,
  thumb,
  onOpen,
  onDelete,
  onCamera,
  onUpload,
  onDownload,
  onCart,
  onShare,
}: {
  title: string;
  count: number;
  thumb?: string;
  onOpen: () => void;
  onDelete?: () => void;
  onCamera?: () => void;
  onUpload?: () => void;
  onDownload?: () => void;
  onCart?: () => void;
  onShare?: () => void;
}) {
  return (
    <article className="db-card">
      <div className="db-card-media" onClick={onOpen}>
        <span className="db-badge">{count}</span>
        <button type="button" className="db-eye" onClick={(e) => { e.stopPropagation(); onOpen(); }} aria-label="View">👁</button>
        {thumb ? <img src={thumb} alt="" /> : <div className="db-empty">Empty · Camera / Upload</div>}
        <div className="db-side">
          <button type="button" aria-label="Email" onClick={(e) => e.stopPropagation()}>✉</button>
          <button type="button" aria-label="WhatsApp" onClick={(e) => e.stopPropagation()}>💬</button>
        </div>
      </div>
      <div className="db-foot">
        <p className="db-title">{title}</p>
        <div className="db-row">
          <button type="button" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>🗑</button>
          <button type="button" title="Camera" onClick={(e) => { e.stopPropagation(); onCamera?.(); }}>📷</button>
          <button type="button" title="Download" onClick={(e) => { e.stopPropagation(); onDownload?.(); }}>⬇</button>
          <button type="button" title="Upload" onClick={(e) => { e.stopPropagation(); onUpload?.(); }}>⬆</button>
          <button type="button" title="Cart" onClick={(e) => { e.stopPropagation(); onCart?.(); }}>🛒</button>
          <button type="button" title="Share" onClick={(e) => { e.stopPropagation(); onShare?.(); }}>↗</button>
        </div>
      </div>
    </article>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const {
    user, getChildren, setCurrentFolder, searchQuery, setSearchQuery, searchItems,
    addItem, deleteItem, setShareEnabled,
  } = useDogKeyStore();
  const [showSheet, setShowSheet] = useState(false);
  const [folderDialog, setFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [gridMode, setGridMode] = useState<'grid' | 'single'>('grid');
  const roots = getChildren(null);
  const results = searchQuery ? searchItems(searchQuery) : null;
  const sharedCount = useDogKeyStore((s) => s.items.filter((i) => i.shareEnabled && i.type !== 'folder').length);

  return (
    <div className="docbox-root">
      <header className="docbox-top">
        <div className="docbox-top-row">
          <div className="docbox-brand-wrap">
            <span className="docbox-key" aria-hidden>🔑</span>
            <span className="docbox-logo">Dogkey</span>
          </div>
          <div className="docbox-actions">
            <button type="button" className="docbox-icon-btn" aria-label="Settings" onClick={() => navigate('/settings')}>⚙</button>
            <button type="button" className="docbox-icon-btn" aria-label="QR Card" onClick={() => navigate('/qr-card')}>▦</button>
            <button type="button" className="docbox-icon-btn" aria-label="Cart" onClick={() => navigate('/share')}>
              🛒{sharedCount > 0 ? <span style={{ fontSize: 10, marginLeft: 2 }}>{sharedCount}</span> : null}
            </button>
            <button type="button" className="docbox-avatar" onClick={() => navigate('/profile')}>
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="" />
                : <span style={{ color: '#fff', fontSize: 14 }}>{(user?.displayName || 'U').charAt(0)}</span>}
            </button>
          </div>
        </div>
        <div className="docbox-search">
          <span aria-hidden>🔍</span>
          <input
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span aria-hidden>🎤</span>
        </div>
      </header>

      <main className="docbox-body">
        {results ? (
          <div>
            <p style={{ color: 'var(--db-muted)', fontSize: 13, marginBottom: 12 }}>{results.length} results</p>
            {results.map((it) => (
              <ItemRow
                key={it.id}
                item={it}
                onClick={() => {
                  if (it.type === 'folder') {
                    setCurrentFolder(it.id);
                    navigate(`/folder/${it.id}`);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className={gridMode === 'grid' ? 'docbox-grid' : 'docbox-grid single'}>
            {roots.map((f) => {
              const kids = getChildren(f.id);
              const firstImg = kids.find((k) => k.type === 'image' && (k.thumbnail || k.content));
              return (
                <DocBoxCard
                  key={f.id}
                  title={f.title || 'Empty box'}
                  count={kids.length}
                  thumb={firstImg?.thumbnail || firstImg?.content}
                  onOpen={() => { setCurrentFolder(f.id); navigate(`/folder/${f.id}`); }}
                  onDelete={() => {
                    if (window.confirm('Delete this DocBox?')) deleteItem(f.id);
                  }}
                  onCamera={() => {
                    setCurrentFolder(f.id);
                    void takePhoto();
                  }}
                  onUpload={() => {
                    setCurrentFolder(f.id);
                    void pickFile();
                  }}
                  onDownload={() => {
                    const img = kids.find((k) => k.content);
                    if (img?.content) {
                      const a = document.createElement('a');
                      a.href = img.content;
                      a.download = img.title || 'file';
                      a.click();
                    }
                  }}
                  onCart={() => {
                    kids.filter((k) => k.type !== 'folder').forEach((k) => setShareEnabled(k.id, true));
                    navigate('/share');
                  }}
                  onShare={() => navigate('/share')}
                />
              );
            })}
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
            <button className="action-option" onClick={() => { setShowSheet(false); setFolderDialog(true); }}>
              <div className="action-option-icon">📁</div>
              <div className="action-option-text"><div className="action-option-title">New DocBox</div></div>
            </button>
            <button className="action-option" onClick={() => { setShowSheet(false); void pickFile(); }}>
              <div className="action-option-icon">📤</div>
              <div className="action-option-text"><div className="action-option-title">Upload File</div></div>
            </button>
            <button className="action-option" onClick={() => { setShowSheet(false); void takePhoto(); }}>
              <div className="action-option-icon">📷</div>
              <div className="action-option-text"><div className="action-option-title">Camera</div></div>
            </button>
          </div>
        </div>
      )}

      {folderDialog && (
        <div className="dialog-overlay" onClick={() => setFolderDialog(false)}>
          <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">New DocBox</div>
            <input className="glass-input" placeholder="Name" value={folderName} onChange={(e) => setFolderName(e.target.value)} style={{ marginTop: 12 }} />
            <button className="glass-button" style={{ width: '100%', marginTop: 16 }} onClick={() => {
              void addItem({ type: 'folder', title: folderName.trim() || 'Box', parentId: null });
              setFolderDialog(false);
              setFolderName('');
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
    <div className="docbox-root" style={{ padding: 16 }}>
      <div className="app-header" style={{ marginBottom: 16 }}>
        <button className="header-back" onClick={() => { setCurrentFolder(folder?.parentId ?? null); navigate(-1); }}><Icon.Back /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>{folder?.title || 'DocBox'}</div>
        <div style={{ width: 40 }} />
      </div>
      {children.length === 0 ? (
        <div className="empty-state"><p style={{ color: 'var(--db-muted)' }}>Empty — upload or camera</p></div>
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
  return (
    <div className="docbox-root" style={{ padding: 16 }}>
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Add New</div>
        <div style={{ width: 40 }} />
      </div>
      {busy && <p style={{ textAlign: 'center' }}>Working…</p>}
      {[{
        label: 'Upload File', action: () => handleMedia('file'), emoji: '📄',
      }, {
        label: 'Take Photo', action: () => handleMedia('photo'), emoji: '📷',
      }].map((o) => (
        <div key={o.label} className="list-item" onClick={() => o.action()}>
          <div className="list-item-icon">{o.emoji}</div>
          <div style={{ fontWeight: 600 }}>{o.label}</div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}

export function AddContactScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-root" style={{ padding: 16 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <p style={{ color: 'var(--db-muted)' }}>Contact form — use Home DocBox upload for files.</p>
      <BottomNav />
    </div>
  );
}

export function AddLinkScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-root" style={{ padding: 16 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <BottomNav />
    </div>
  );
}

export function AddNoteScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-root" style={{ padding: 16 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <BottomNav />
    </div>
  );
}
