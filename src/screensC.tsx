import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import { Toggle } from './components/Toggle';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { BottomNav, ItemRow } from './screensA';

function ShareSettingsScreen() {
  const navigate = useNavigate();
  const { masterShare, setMasterShare, items, setShareEnabled, createShareSession, stopSharing, shareSession, isShareActive } = useDogKeyStore();
  const [pin, setPin] = useState('4827');
  const [validity, setValidity] = useState(60);
  const [showConfirm, setShowConfirm] = useState(false);
  const categories = [
    { key: 'Documents', id: 'folder-docs' }, { key: 'Photos', id: 'folder-photos' },
    { key: 'Contacts', id: 'folder-contacts' }, { key: 'Links', id: 'folder-links' }, { key: 'Notes', id: 'folder-notes' },
  ];
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Share with QR</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Master Share</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>All enabled content</div>
          </div>
          <Toggle on={masterShare} onChange={(v) => { if (v) setShowConfirm(true); else setMasterShare(false); }} />
        </div>
      </div>
      {showConfirm && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 16, border: '1px solid var(--accent-gold)' }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Turn on Master Share? This may make your enabled DogKey content available through the active sharing method.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="glass-button secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>Cancel</button>
            <button className="glass-button" style={{ flex: 1 }} onClick={() => { setMasterShare(true); setShowConfirm(false); }}>Turn On</button>
          </div>
        </div>
      )}
      {categories.map((c) => {
        const folder = items.find((i) => i.id === c.id);
        return (
          <div key={c.id} className="list-item" style={{ cursor: 'default' }}>
            <div className="list-item-icon"><Icon.Folder /></div>
            <div style={{ flex: 1, fontWeight: 500 }}>{c.key}</div>
            <Toggle on={!!folder?.shareEnabled} onChange={(v) => setShareEnabled(c.id, v)} />
          </div>
        );
      })}
      <div className="glass-card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Share PIN (4 Digit)</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="glass-input" style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 600, maxWidth: 140 }} value={pin} maxLength={4} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          <button className="glass-button secondary" style={{ padding: '10px 16px', fontSize: 13 }} onClick={() => setPin(String(Math.floor(1000 + Math.random() * 9000)))}>Regenerate</button>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 16, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Valid For</div>
        {[{ label: '10 Minutes', m: 10 }, { label: '1 Hour', m: 60 }, { label: '6 Hours', m: 360 }, { label: '24 Hours', m: 1440 }, { label: '7 Days', m: 10080 }].map((o) => (
          <label key={o.m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
            <input type="radio" name="validity" checked={validity === o.m} onChange={() => setValidity(o.m)} />{o.label}
          </label>
        ))}
      </div>
      {isShareActive() && (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--success)', marginTop: 12 }}>
          Share active · PIN {shareSession?.sharePinDisplay || '••••'} · expires {shareSession ? new Date(shareSession.expiresAt).toLocaleTimeString() : ''}
        </p>
      )}
      <button className="glass-button" style={{ width: '100%', marginTop: 20 }} onClick={() => { createShareSession(pin, validity); navigate('/qr-card'); }} disabled={pin.length !== 4}>Generate QR</button>
      {isShareActive() && (
        <button className="glass-button secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => stopSharing()}>Stop Sharing</button>
      )}
      <BottomNav />
    </div>
  );
}

function QRCardScreen() {
  const navigate = useNavigate();
  const { user, shareSession, isShareActive } = useDogKeyStore();
  const active = isShareActive();
  const qrCells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21; const y = Math.floor(i / 21);
    const isFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const seed = ((x * 7 + y * 13 + (shareSession?.id?.charCodeAt(0) || 0)) % 3) === 0;
    return isFinder || seed;
  });
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>DogKey Card</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card fade-in" style={{ padding: 24, textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.displayName || 'User'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>DogKey User</div>
        <div style={{ width: 180, height: 180, margin: '0 auto 16px', display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: 1, background: '#fff', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)' }}>
          {qrCells.map((on, i) => <div key={i} style={{ background: on ? '#1a1a1a' : 'transparent', aspectRatio: 1 }} />)}
        </div>
        {active && shareSession && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Share PIN: <strong>{shareSession.sharePinDisplay || '••••'}</strong><br />
            Valid until {new Date(shareSession.expiresAt).toLocaleString()}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--accent-brown)', marginTop: 8 }}>DogKey · Your Everything Locker</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
        <button className="glass-button secondary" style={{ flex: 1 }}>Save</button>
        <button className="glass-button secondary" style={{ flex: 1 }}>Print</button>
        <button className="glass-button" style={{ flex: 1 }} onClick={() => navigate('/share')}>Share</button>
      </div>
      <BottomNav />
    </div>
  );
}

function SharedScreen() {
  const navigate = useNavigate();
  const { getSharedItems, isShareActive, shareSession, stopSharing } = useDogKeyStore();
  const items = getSharedItems();
  const active = isShareActive();
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <div style={{ fontWeight: 600, fontSize: 18 }}>Shared Items</div>
        <button className="glass-button secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/share')}>Manage</button>
      </div>
      {!active ? (
        <div className="empty-state">
          <div className="icon">🔒</div>
          <p>No active share session</p>
          <button className="glass-button" style={{ marginTop: 16 }} onClick={() => navigate('/share')}>Start Sharing</button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Active · expires {shareSession ? new Date(shareSession.expiresAt).toLocaleString() : ''}</p>
          {items.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No items marked for sharing</p> : items.map((it) => <ItemRow key={it.id} item={it} />)}
          <button className="glass-button secondary" style={{ width: '100%', marginTop: 16 }} onClick={stopSharing}>Stop Sharing</button>
        </>
      )}
      <BottomNav />
    </div>
  );
}

function SettingsScreen() {
  const navigate = useNavigate();
  const { user, disconnectGoogle, connectGoogle } = useDogKeyStore();
  const rows = [
    { label: 'Profile', desc: 'Name, Photo', path: null },
    { label: 'Google Drive', desc: user?.googleConnected ? 'Connected' : 'Not connected', path: null, action: () => user?.googleConnected ? disconnectGoogle() : connectGoogle() },
    { label: 'Security', desc: 'PIN, Lock, Privacy', path: '/security' },
    { label: 'Backup & Sync', desc: '', path: null },
    { label: 'About DogKey', desc: '', path: '/about' },
  ];
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header"><div style={{ fontWeight: 600, fontSize: 18 }}>Settings</div></div>
      {rows.map((r) => (
        <div key={r.label} className="list-item" onClick={() => { if (r.path) navigate(r.path); else if (r.action) r.action(); }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{r.label}</div>
            {r.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>}
          </div>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}

function SecurityScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings, changeLoginPin } = useDogKeyStore();
  const [mode, setMode] = useState<'menu' | 'login-pin'>('menu');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [step, setStep] = useState(0);
  if (mode === 'login-pin') {
    return (
      <div className="app-bg screen full fade-in" style={{ paddingTop: 40 }}>
        <div className="app-header">
          <button className="header-back" onClick={() => setMode('menu')}><Icon.Back /></button>
          <div style={{ fontWeight: 600 }}>Change Login PIN</div>
          <div style={{ width: 40 }} />
        </div>
        <p className="screen-subtitle">{step === 0 ? 'Enter current DogKey Login PIN' : step === 1 ? 'Enter new DogKey Login PIN' : 'Confirm new PIN'}</p>
        <PinPad value={step === 0 ? oldPin : newPin} onChange={step === 0 ? setOldPin : setNewPin} maxLength={4} onComplete={(p) => {
          if (step === 0) { setOldPin(p); setStep(1); setNewPin(''); }
          else if (step === 1) { setNewPin(p); setStep(2); }
          else {
            if (p === newPin && changeLoginPin(oldPin, newPin)) { alert('DogKey Login PIN updated'); setMode('menu'); }
            else { alert('Failed — check current PIN or confirmation'); setStep(0); setOldPin(''); setNewPin(''); }
          }
        }} />
      </div>
    );
  }
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Security</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="list-item" onClick={() => setMode('login-pin')}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Change Login PIN</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>DogKey Login PIN</div></div>
        <span>›</span>
      </div>
      <div className="list-item" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Biometric Lock</div></div>
        <Toggle on={settings.biometricLock} onChange={(v) => updateSettings({ biometricLock: v })} />
      </div>
      <div className="list-item" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Auto Lock</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{settings.autoLockMinutes} Minute</div></div>
      </div>
      <div className="list-item" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Hide App Content</div></div>
        <Toggle on={settings.hideAppContent} onChange={(v) => updateSettings({ hideAppContent: v })} />
      </div>
    </div>
  );
}

function AboutScreen() {
  const navigate = useNavigate();
  return (
    <div className="app-bg screen fade-in" style={{ textAlign: 'center', paddingTop: 48 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', margin: '0 auto 16px' }} />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28 }}>DogKey™</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your Everything Locker</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>Version 1.0.0</p>
      {['Privacy Policy', 'Terms & Conditions', 'Help & Support'].map((t) => (
        <div key={t} className="list-item" style={{ textAlign: 'left' }}><div style={{ flex: 1, fontWeight: 500 }}>{t}</div><span>›</span></div>
      ))}
      <button className="glass-button secondary" style={{ marginTop: 24 }} onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

function ReceiverPinScreen() {
  const navigate = useNavigate();
  const { user, verifySharePin, isShareActive, shareSession } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handle = (p: string) => {
    if (!isShareActive()) { setError(shareSession?.revokedAt ? 'Sharing Disabled' : 'Share Expired'); setPin(''); return; }
    if (verifySharePin(p)) navigate('/shared-content');
    else { setError('Incorrect Share PIN'); setPin(''); }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', marginBottom: 12 }} />
      <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.displayName || 'Owner'}</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>is sharing with you</p>
      <p className="screen-subtitle">Enter Share PIN</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 8 }}>{error}</p>}
      <PinPad value={pin} onChange={setPin} maxLength={4} onComplete={handle} />
      <button className="glass-button" style={{ marginTop: 24, width: 240 }} onClick={() => pin.length === 4 && handle(pin)}>Open Shared Content</button>
    </div>
  );
}

function SharedContentScreen() {
  const navigate = useNavigate();
  const { getSharedItems } = useDogKeyStore();
  const items = getSharedItems();
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate('/receive')}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Shared Items</div>
        <div style={{ width: 40 }} />
      </div>
      {items.length === 0 ? <div className="empty-state"><p>No content shared</p></div> : items.map((it) => <ItemRow key={it.id} item={it} />)}
    </div>
  );
}

function RequireAuth({ children }: { children: import("react").ReactNode }) {
  const { hasOnboarded, isUnlocked } = useDogKeyStore();
  if (!hasOnboarded) return <Navigate to="/welcome" replace />;
  if (!isUnlocked) return <Navigate to="/unlock" replace />;
  return <>{children}</>;
}

export { ShareSettingsScreen, QRCardScreen, SharedScreen, SettingsScreen, SecurityScreen, AboutScreen, ReceiverPinScreen, SharedContentScreen, RequireAuth };
