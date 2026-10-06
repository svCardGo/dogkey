import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import { Toggle } from './components/Toggle';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';

function BottomNav() {
  const navigate = useNavigate();
  const loc = useLocation();
  const path = loc.pathname;
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

function ItemRow({ item, onClick, trailing }: { item: DogKeyItem; onClick?: () => void; trailing?: import("react").ReactNode }) {
  const iconMap: Record<string, import("react").ReactNode> = {
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
          {item.type === 'pdf' && 'PDF document'}
          {item.type === 'folder' && 'Folder'}
          {item.type === 'note' && 'Note'}
        </div>
      </div>
      {trailing}
    </div>
  );
}

function SplashScreen() {
  const navigate = useNavigate();
  const { hasOnboarded, isUnlocked } = useDogKeyStore();
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasOnboarded) navigate('/welcome');
      else if (!isUnlocked) navigate('/unlock');
      else navigate('/home');
    }, 2200);
    return () => clearTimeout(t);
  }, [hasOnboarded, isUnlocked, navigate]);
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(196,165,116,0.45)', boxShadow: '0 12px 40px rgba(92,64,51,0.15)', marginBottom: 28, background: 'linear-gradient(145deg,#f0e6d8,#e8d9c4)' }}>
        <svg viewBox="0 0 200 200" width="160" height="160">
          <ellipse cx="100" cy="130" rx="55" ry="45" fill="#d4b896" />
          <ellipse cx="100" cy="85" rx="48" ry="50" fill="#c9a87c" />
          <ellipse cx="70" cy="55" rx="18" ry="28" fill="#c9a87c" />
          <ellipse cx="130" cy="55" rx="18" ry="28" fill="#c9a87c" />
          <circle cx="82" cy="80" r="6" fill="#5c4033" />
          <circle cx="118" cy="80" r="6" fill="#5c4033" />
          <ellipse cx="100" cy="95" rx="10" ry="7" fill="#8b6b4a" />
          <path d="M90 108 Q100 118 110 108" fill="none" stroke="#5c4033" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        DogKey<span style={{ fontSize: 18, verticalAlign: 'super' }}>™</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 15 }}>Your Everything Locker</p>
    </div>
  );
}

function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 40 }}>
        <div style={{ width: 120, height: 100, marginBottom: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', width: 70, height: 55, background: 'rgba(255,252,247,0.9)', borderRadius: 8, border: '1px solid var(--card-border)', left: 10, top: 20, transform: 'rotate(-8deg)', boxShadow: 'var(--shadow-card)' }} />
          <div style={{ position: 'absolute', width: 70, height: 55, background: 'rgba(255,252,247,0.95)', borderRadius: 8, border: '1px solid var(--card-border)', left: 40, top: 10, transform: 'rotate(6deg)', boxShadow: 'var(--shadow-card)' }} />
        </div>
        <h1 className="screen-title" style={{ fontSize: 28, lineHeight: 1.3 }}>Keep Everything<br />Share Only<br />What You Choose</h1>
        <div style={{ marginTop: 28, textAlign: 'left', maxWidth: 300 }}>
          {['Store all types of data', 'Secure with your PIN', 'Sync with your Google Drive', 'Share by QR with full control'].map((t) => (
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

function CreatePinScreen() {
  const navigate = useNavigate();
  const { createUser } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const handleComplete = (p: string) => {
    if (step === 'enter') { setPin(p); setStep('confirm'); setConfirm(''); }
    else {
      if (p === pin) { createUser('Radhakishan', p); navigate('/connect-drive'); }
      else { setError('PINs do not match. Try again.'); setStep('enter'); setPin(''); setConfirm(''); }
    }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(196,165,116,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon.Lock /></div>
      <h1 className="screen-title">Set Your DogKey Login PIN</h1>
      <p className="screen-subtitle">{step === 'enter' ? 'This PIN will open your private locker.' : 'Confirm your DogKey Login PIN'}</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      <PinPad value={step === 'enter' ? pin : confirm} onChange={step === 'enter' ? setPin : setConfirm} maxLength={4} onComplete={handleComplete} />
    </div>
  );
}

function UnlockScreen() {
  const navigate = useNavigate();
  const { verifyLoginPin, setUnlocked, user } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handle = (p: string) => {
    if (verifyLoginPin(p)) { setUnlocked(true); navigate('/home'); }
    else { setError('Incorrect DogKey Login PIN'); setPin(''); }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', marginBottom: 16 }} />
      <h1 className="screen-title">Welcome back</h1>
      <p className="screen-subtitle">{user?.displayName || 'Enter your DogKey Login PIN'}</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      <PinPad value={pin} onChange={setPin} maxLength={4} onComplete={handle} />
    </div>
  );
}

function ConnectDriveScreen() {
  const navigate = useNavigate();
  const { connectGoogle } = useDogKeyStore();
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <div style={{ marginBottom: 20 }}><Icon.Drive /></div>
      <h1 className="screen-title">Connect Google Drive</h1>
      <p className="screen-subtitle" style={{ maxWidth: 300 }}>Your data will be stored in your Google Drive. Your files remain yours. No extra storage cost. Secure and private.</p>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        {['Your data will be stored in your Google Drive', 'Your files remain yours', 'No extra storage cost', 'Secure and private'].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {t}
          </div>
        ))}
      </div>
      <button className="glass-button" style={{ width: '100%', maxWidth: 320, marginTop: 36 }} onClick={() => { connectGoogle(); navigate('/home'); }}>Connect Google Drive</button>
      <button className="glass-button secondary" style={{ width: '100%', maxWidth: 320, marginTop: 12 }} onClick={() => navigate('/home')}>Skip for now</button>
    </div>
  );
}

export { BottomNav, ItemRow, SplashScreen, WelcomeScreen, CreatePinScreen, UnlockScreen, ConnectDriveScreen };
