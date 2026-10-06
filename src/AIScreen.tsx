import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';

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
        <div className="brand" style={{ fontSize: 18 }}>DogKey AI</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <p className="subtext" style={{ lineHeight: 1.5 }}>
          Search your encrypted locker with natural language. Results stay on-device.
        </p>
      </div>
      <div className="search-capsule">
        <input
          placeholder="Ask DogKey anything..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) run(q.trim()); }}
        />
        <button className="ai-pill" onClick={() => q.trim() && run(q.trim())}>Ask</button>
      </div>
      <div className="ai-suggestions">
        {suggestions.map((s) => (
          <button key={s} className="ai-chip" onClick={() => run(s)}>{s}</button>
        ))}
      </div>
      {reply && (
        <div className="glass-card" style={{ padding: 16, marginTop: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--green)', marginBottom: 6, fontWeight: 600 }}>DogKey AI</div>
          <div style={{ fontSize: 14.5, color: 'var(--text)' }}>{reply}</div>
        </div>
      )}
    </div>
  );
}
