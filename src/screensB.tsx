import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import { Toggle } from './components/Toggle';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { BottomNav, ItemRow } from './screensA';

function HomeScreen() {
  const navigate = useNavigate();
  const { user, getChildren, setCurrentFolder, searchQuery, setSearchQuery, searchItems } = useDogKeyStore();
  const roots = getChildren(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const categoryMeta: Record<string, { color: string; emoji: string }> = {
    Documents: { color: '#e8f0fe', emoji: '📄' }, Photos: { color: '#fce8e6', emoji: '🖼️' },
    Videos: { color: '#e6f4ea', emoji: '🎬' }, Contacts: { color: '#fef7e0', emoji: '👤' },
    Links: { color: '#e8f0fe', emoji: '🔗' }, Notes: { color: '#f3e8fd', emoji: '📝' },
  };
  const results = searchQuery ? searchItems(searchQuery) : null;
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>DogKey</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{greeting}, {user?.displayName || 'User'}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', cursor: 'pointer' }} onClick={() => navigate('/settings')} />
      </div>
      <div className="search-bar">
        <Icon.Search />
        <input placeholder="Search files, folders, contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {results ? (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{results.length} results</p>
          {results.map((it) => (
            <ItemRow key={it.id} item={it} onClick={() => { if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); } }} />
          ))}
        </div>
      ) : (
        <div className="category-grid">
          {roots.map((f) => {
            const meta = categoryMeta[f.title] || { color: '#f5f0e8', emoji: '📁' };
            const count = getChildren(f.id).length;
            return (
              <div key={f.id} className="category-card" onClick={() => { setCurrentFolder(f.id); navigate(`/folder/${f.id}`); }}>
                <div className="category-icon" style={{ background: meta.color }}>{meta.emoji}</div>
                <div className="category-name">{f.title}</div>
                <div className="category-count">{count} items</div>
              </div>
            );
          })}
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function FolderScreen() {
  const navigate = useNavigate();
  const loc = useLocation();
  const id = loc.pathname.split('/folder/')[1] || null;
  const { getItem, getChildren, setShareEnabled, setCurrentFolder, addItem } = useDogKeyStore();
  const folder = id ? getItem(id) : null;
  const children = getChildren(id);
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => { setCurrentFolder(folder?.parentId ?? null); navigate(-1); }}><Icon.Back /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>{folder?.title || 'Folder'}</div>
        <button className="header-back" onClick={() => navigate('/home')}><Icon.Search /></button>
      </div>
      {children.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <p>No items yet</p>
          <button className="glass-button" style={{ marginTop: 16 }} onClick={() => navigate('/add')}>+ Add Content</button>
        </div>
      ) : (
        children.map((it) => (
          <ItemRow key={it.id} item={it} onClick={() => {
            if (it.type === 'folder') { setCurrentFolder(it.id); navigate(`/folder/${it.id}`); }
          }} trailing={<Toggle on={it.shareEnabled} onChange={(v) => setShareEnabled(it.id, v)} />} />
        ))
      )}
      <button className="glass-button" style={{ width: '100%', marginTop: 20 }} onClick={() => {
        const name = prompt('Folder name');
        if (name) addItem({ type: 'folder', title: name, parentId: id });
      }}>+ Create Folder</button>
      <BottomNav />
    </div>
  );
}

function AddNewScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const options = [
    { label: 'Upload File', desc: 'Photos, Videos, PDF, Docs…', path: null, emoji: '📄' },
    { label: 'Take Photo', desc: 'Open Camera', path: null, emoji: '📷' },
    { label: 'Scan Document', desc: '', path: null, emoji: '📠' },
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
      {options.map((o) => (
        <div key={o.label} className="list-item" onClick={() => {
          if (o.path) navigate(o.path);
          else {
            const title = prompt('File name', 'New Document.pdf');
            if (title) { addItem({ type: title.endsWith('.pdf') ? 'pdf' : 'file', title, shareEnabled: false }); navigate('/home'); }
          }
        }}>
          <div className="list-item-icon" style={{ fontSize: 20 }}>{o.emoji}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{o.label}</div>
            {o.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.desc}</div>}
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}

function AddContactScreen() {
  const navigate = useNavigate();
  const { addItem } = useDogKeyStore();
  const [form, setForm] = useState({ name: '', mobile: '', whatsapp: '', email: '', address: '', website: '', notes: '', share: false });
  const save = () => {
    if (!form.name.trim()) return;
    addItem({ type: 'contact', title: form.name, mobile: form.mobile, whatsapp: form.whatsapp, email: form.email, address: form.address, website: form.website, notes: form.notes, shareEnabled: form.share, parentId: 'folder-contacts' });
    navigate('/home');
  };
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
        <button className="glass-button" style={{ width: '100%', marginTop: 8 }} onClick={save}>Save Contact</button>
      </div>
    </div>
  );
}

function AddLinkScreen() {
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
        <input className="glass-input" placeholder="Title (e.g. Website)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="glass-input" placeholder="URL (https://)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input className="glass-input" placeholder="Description (Optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Share via DogKey</span>
          <Toggle on={form.share} onChange={(v) => setForm({ ...form, share: v })} />
        </div>
        <button className="glass-button" style={{ width: '100%' }} onClick={() => {
          if (!form.title || !form.url) return;
          addItem({ type: 'link', title: form.title, url: form.url, description: form.description, shareEnabled: form.share, parentId: 'folder-links' });
          navigate('/home');
        }}>Save Link</button>
      </div>
    </div>
  );
}

function AddNoteScreen() {
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
      <textarea className="glass-input" style={{ minHeight: 180, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Write your note here…" value={content} onChange={(e) => setContent(e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        <span>Share via DogKey</span>
        <Toggle on={share} onChange={setShare} />
      </div>
      <button className="glass-button" style={{ width: '100%' }} onClick={() => {
        if (!content.trim()) return;
        addItem({ type: 'note', title: content.slice(0, 40) || 'Note', content, shareEnabled: share, parentId: 'folder-notes' });
        navigate('/home');
      }}>Save Note</button>
    </div>
  );
}

export { HomeScreen, FolderScreen, AddNewScreen, AddContactScreen, AddLinkScreen, AddNoteScreen };
