import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { DogLogo } from './lib/DogLogo';

export function AIScreen() {
  const navigate = useNavigate();
  const { searchItems, setSearchQuery } = useDogKeyStore();
  const [q, setQ] = useState('');
  const [reply, setReply] = useState('');
  const suggestions = [
    'Find my contacts',
    'Show recent notes',
    'What can I share?',
    'Open Photos folder',
  ];
  const run = (text: string) => {
    setQ(text);
    setSearchQuery(text);
    const hits = searchItems(text);
    setReply(hits.length ? `Found ${hits.length} item(s) matching “${text}”.` : `No locker matches for “${text}”. Try another phrase.`);
  };
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DogLogo size={22} color="var(--accent-champagne)" />
          <span className="serif-title" style={{ fontSize: 18 }}>DogKey AI</span>
        </div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
          Search your encrypted locker with natural language. Results stay on-device.
        </p>
      </div>
      <div className="search-capsule">
        <input
          placeholder="Ask DogKey AI…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) run(q.trim()); }}
        />
        <button className="ai-pill" onClick={() => q.trim() && run(q.trim())}>Ask ✦</button>
      </div>
      <div className="ai-suggestions">
        {suggestions.map((s) => (
          <button key={s} className="ai-chip" onClick={() => run(s)}>{s}</button>
        ))}
      </div>
      {reply && (
        <div className="glass-card" style={{ padding: 16, marginTop: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--accent-champagne)', marginBottom: 6 }}>DogKey AI</div>
          <div style={{ fontSize: 14.5, color: 'var(--text-primary)' }}>{reply}</div>
        </div>
      )}
    </div>
  );
}
