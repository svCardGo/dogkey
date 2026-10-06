import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { DogLogo } from './lib/DogLogo';

export function BottomNav() {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const items = [
    { path: '/home', label: 'Home', icon: <Icon.Home /> },
    { path: '/shared', label: 'Shared', icon: <Icon.Shared /> },
    { path: '/add', label: 'Add', icon: <Icon.Add />, center: true },
    { path: '/qr-card', label: 'QR Card', icon: <Icon.Card /> },
    { path: '/settings', label: 'Settings', icon: <Icon.Settings /> },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) =>
        it.center ? (
          <button key={it.path} className="nav-add" onClick={() => navigate(it.path)} aria-label="Add">{it.icon}</button>
        ) : (
          <button key={it.path} className={`nav-item ${path.startsWith(it.path) ? 'active' : ''}`} onClick={() => navigate(it.path)}>
            <span className="nav-icon">{it.icon}</span>{it.label}
          </button>
        )
      )}
    </nav>
  );
}

export function ItemRow({ item, onClick, trailing }: { item: DogKeyItem; onClick?: () => void; trailing?: React.ReactNode }) {
  const iconMap: Record<string, React.ReactNode> = {
    folder: <Icon.Folder />, contact: <Icon.Contact />, link: <Icon.Link />, note: <Icon.Note />,
    pdf: <Icon.File />, file: <Icon.File />, image: '🖼️', video: '🎬',
  };
  return (
    <div className="list-item" onClick={onClick}>
      <div className="list-item-icon">{iconMap[item.type] || <Icon.File />}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {item.type === 'contact' && item.mobile}
          {item.type === 'link' && item.url}
          {item.type === 'pdf' && 'PDF'}
          {item.type === 'folder' && 'Folder'}
          {item.type === 'note' && 'Note'}
          {(item.type === 'image' || item.type === 'video' || item.type === 'file') && (item.mimeType || item.type)}
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function SplashScreen() {
  const navigate = useNavigate();
  const { hasOnboarded, isUnlocked } = useDogKeyStore();
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasOnboarded) navigate('/welcome');
      else if (!isUnlocked) navigate('/unlock');
      else navigate('/home');
    }, 2000);
    return () => clearTimeout(t);
  }, [hasOnboarded, isUnlocked, navigate]);
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <DogLogo size={120} color="var(--accent-deep)" />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 600, marginTop: 24 }}>DogKey<span style={{ fontSize: 18, verticalAlign: 'super' }}>™</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Your Everything Locker</p>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 40 }}>
        <DogLogo size={88} color="var(--accent-deep)" />
        <h1 className="screen-title" style={{ fontSize: 28, lineHeight: 1.3, marginTop: 20 }}>Keep Everything<br />Share Only<br />What You Choose</h1>
        <div style={{ marginTop: 28, textAlign: 'left', maxWidth: 300 }}>
          {['Store all types of data', 'Secure with your PIN', 'Sync with Google Drive', 'Share by QR with full control'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 15 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)', flexShrink: 0 }} />{t}
            </div>
          ))}
        </div>
      </div>
      <button className="glass-button" style={{ width: '100%', maxWidth: 320, margin: '0 auto' }} onClick={() => navigate('/create-pin')}>Get Started</button>
    </div>
  );
}

export function CreatePinScreen() {
  const navigate = useNavigate();
  const { createUser } = useDogKeyStore();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const handleComplete = async (p: string) => {
    if (step === 'enter') { setPin(p); setStep('confirm'); setConfirm(''); }
    else {
      if (p === pin) { await createUser(name.trim() || 'User', p); navigate('/connect-drive'); }
      else { setError('PINs do not match'); setStep('enter'); setPin(''); setConfirm(''); }
    }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <DogLogo size={56} color="var(--accent-deep)" />
      <h1 className="screen-title" style={{ marginTop: 16 }}>Set Your Login PIN</h1>
      <p className="screen-subtitle">{step === 'enter' ? 'Private owner authentication only' : 'Confirm your Login PIN'}</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      {step === 'enter' && (
        <input className="glass-input" style={{ marginBottom: 16, maxWidth: 280 }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <PinPad value={step === 'enter' ? pin : confirm} onChange={step === 'enter' ? setPin : setConfirm} maxLength={4} onComplete={(p) => { void handleComplete(p); }} />
    </div>
  );
}

export function UnlockScreen() {
  const navigate = useNavigate();
  const { verifyLoginPin, setUnlocked, user } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handle = async (p: string) => {
    if (await verifyLoginPin(p)) { setUnlocked(true); navigate('/home'); }
    else { setError('Incorrect Login PIN'); setPin(''); }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '2px solid var(--accent-gold)' }} />
      ) : (
        <DogLogo size={72} color="var(--accent-deep)" />
      )}
      <h1 className="screen-title" style={{ marginTop: 12 }}>Welcome back</h1>
      <p className="screen-subtitle">{user?.displayName || 'Enter your Login PIN'}</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      <PinPad value={pin} onChange={setPin} maxLength={4} onComplete={(p) => { void handle(p); }} />
    </div>
  );
}

export function ConnectDriveScreen() {
  const navigate = useNavigate();
  const { connectGoogle } = useDogKeyStore();
  const [msg, setMsg] = useState('');
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <Icon.Drive />
      <h1 className="screen-title" style={{ marginTop: 16 }}>Connect Google Drive</h1>
      <p className="screen-subtitle" style={{ maxWidth: 300 }}>Requires a valid Android OAuth client in Google Cloud (package com.dogkey.app + SHA-1).</p>
      {msg && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
      <button className="glass-button" style={{ width: '100%', maxWidth: 320, marginTop: 24 }} onClick={() => { connectGoogle(); setMsg('Configure Android OAuth client first. Skipping for now.'); setTimeout(() => navigate('/home'), 1200); }}>Connect Google Drive</button>
      <button className="glass-button secondary" style={{ width: '100%', maxWidth: 320, marginTop: 12 }} onClick={() => navigate('/home')}>Skip for now</button>
    </div>
  );
}
