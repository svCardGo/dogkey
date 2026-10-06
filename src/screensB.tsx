import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { Toggle } from './components/Toggle';
import Icon from './lib/icons';
import { takePhoto, pickFile } from './lib/media';
import { GlassDialog } from './components/GlassDialog';
import { BottomNav, ItemRow } from './screensA';

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, getChildren, setCurrentFolder, searchQuery, setSearchQuery, searchItems, addItem } = useDogKeyStore();
  const [showSheet, setShowSheet] = useState(false);
  const [folderDialog, setFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const roots = getChildren(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const meta: Record<string, { accent: string; emoji: string }> = {
    Documents: { accent: 'rgba(138,155,176,0.25)', emoji: '📄' },
    Photos: { accent: 'rgba(196,160,160,0.25)', emoji: '🖼️' },
    Videos: { accent: 'rgba(122,154,126,0.25)', emoji: '🎬' },
    Contacts: { accent: 'rgba(212,184,150,0.25)', emoji: '👤' },
    Links: { accent: 'rgba(168,155,184,0.25)', emoji: '🔗' },
    Notes: { accent: 'rgba(196,160,112,0.25)', emoji: '📝' },
  };
  const results = searchQuery ? searchItems(searchQuery) : null;
  return (
    <div className="app-bg screen fade-in">
      <div className="home-top">
        <div>
          <div className="serif-title" style={{ fontSize: 22 }}>{greeting}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.displayName || 'User'}</div>
        </div>
        <div className="avatar-ring" onClick={() => navigate('/profile')}>
          {user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <span style={{ fontSize: 18 }}>🐕</span>}
        </div>
      </div>
      <div className="hero-dog-wrap rise-in">
        <div className="hero-dog-glow" />
        <div className="dog-portrait-lg">🐕</div>
      </div>
      <div className="feature-card glass-card rise-in">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Your private locker</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Everything stays encrypted. Share only what you choose.</div>
      </div>
      <div className="search-capsule rise-in">
        <span style={{ opacity: 0.7, fontSize: 18, marginRight: 8 }}>+</span>
        <input placeholder="Search your DogKey..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button className="ai-pill" onClick={() => navigate('/ai')}>DogKey AI ✦</button>
      </div>
      {results ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{results.length} results</p>
          {results.map((it) => (
            <ItemRow key={it.id} item={it} onClick={() => { if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); } }} />
          ))}
        </div>
      ) : (
        <>
          <div className="category-grid rise-in">
            {roots.map((f) => {
              const m = meta[f.title] || { accent: 'rgba(212,184,150,0.2)', emoji: '📁' };
              return (
                <div key={f.id} className="category-card glass-card" onClick={() => { setCurrentFolder(f.id); navigate(`/folder/${f.id}`); }}>
                  <div className="category-icon" style={{ background: m.accent }}>{m.emoji}</div>
                  <div className="category-name">{f.title}</div>
                  <div className="category-count">{getChildren(f.id).length}</div>
                </div>
              );
            })}
          </div>
          <div className="carousel-track rise-in">
            {['Photos', 'Notes', 'Links'].map((t) => (
              <div key={t} className="carousel-card glass-card">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{meta[t]?.emoji || '📁'}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <BottomNav onPlus={() => setShowSheet(true)} />
      {showSheet && (
        <div className="action-sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-title">Add to DogKey</div>
            {[
              { icon: '📁', title: 'New Folder', desc: 'Organize your items', bg: 'rgba(212,184,150,0.2)', action: () => { setShowSheet(false); setFolderDialog(true); } },
              { icon: '📤', title: 'Upload File', desc: 'Photos, PDFs, Docs…', bg: 'rgba(138,155,176,0.2)', action: async () => { setShowSheet(false); await pickFile(); } },
              { icon: '📷', title: 'Take Photo', desc: 'Open camera', bg: 'rgba(196,160,160,0.2)', action: async () => { setShowSheet(false); await takePhoto(); } },
              { icon: '👤', title: 'Add Contact', desc: 'Name, mobile, email', bg: 'rgba(122,154,126,0.2)', action: () => { setShowSheet(false); navigate('/add-contact'); } },
              { icon: '🔗', title: 'Add Link', desc: 'Website, YouTube, Maps', bg: 'rgba(168,155,184,0.2)', action: () => { setShowSheet(false); navigate('/add-link'); } },
              { icon: '📝', title: 'Add Note', desc: 'Text & important info', bg: 'rgba(196,160,112,0.2)', action: () => { setShowSheet(false); navigate('/add-note'); } },
            ].map((opt) => (
              <button key={opt.title} className="action-option" onClick={opt.action}>
                <div className="action-option-icon" style={{ background: opt.bg }}>{opt.icon}</div>
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
            <div className="dialog-title">New Folder</div>
            <input className="glass-input" placeholder="Folder Name" value={folderName} onChange={(e) => setFolderName(e.target.value)} style={{ marginTop: 12 }} />
            <button className="glass-button" style={{ width: '100%', marginTop: 16 }} onClick={() => {
              if (folderName.trim()) void addItem({ type: 'folder', title: folderName.trim(), parentId: null });
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
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => { setCurrentFolder(folder?.parentId ?? null); navigate(-1); }}><Icon.Back /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>{folder?.title || 'Folder'}</div>
        <div style={{ width: 40 }} />
      </div>
      {children.length === 0 ? (
        <div className="empty-state"><div className="icon">📁</div><p>No items yet</p></div>
      ) : (
        children.map((it) => (
          <ItemRow key={it.id} item={it} onClick={() => { if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); } }}
            trailing={<Toggle on={it.shareEnabled} onChange={(v) => setShareEnabled(it.id, v)} />} />
        ))
      )}
      <button className="glass-button" style={{ width: '100%', marginTop: 20 }} onClick={() => setFolderDialog(true)}>+ Create Folder</button>
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
    { label: 'Upload File', desc: 'Photos, Videos, PDF, Docs…', action: () => handleMedia('file'), emoji: '📄' },
    { label: 'Take Photo', desc: 'Open Camera', action: () => handleMedia('photo'), emoji: '📷' },
    { label: 'Add Contact', desc: 'Name, Mobile, Email…', path: '/add-contact', emoji: '👤' },
    { label: 'Add Link', desc: 'Website, YouTube, Maps…', path: '/add-link', emoji: '🔗' },
    { label: 'Add Note', desc: 'Text / Important Info', path: '/add-note', emoji: '📝' },
  ];
  return (
    <div className="app-bg screen fade-in">
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
    <div className="app-bg screen fade-in">
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
    <div className="app-bg screen fade-in">
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
    <div className="app-bg screen fade-in">
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
