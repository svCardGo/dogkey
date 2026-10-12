import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { unlockVault } from './lib/secureVault';

/** Bottom nav — mockup: Home | DocBox count | Grid | ScanQr */
export function BottomNav({ onPlus, gridMode, onToggleGrid }: { onPlus?: () => void; gridMode?: 'grid' | 'single'; onToggleGrid?: () => void }) {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const { getChildren } = useDogKeyStore();
  const boxCount = getChildren(null).length;
  return (
    <nav className="docbox-dock" aria-label="Primary">
      <button type="button" className={`docbox-dock-item ${path.startsWith('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
        <Icon.Home /><span>Home</span>
      </button>
      <button type="button" className={`docbox-dock-item ${path.startsWith('/shared') ? 'active' : ''}`} onClick={() => navigate('/shared')}>
        <span className="docbox-dock-count">{boxCount}</span>
        <span>DocBox</span>
      </button>
      <button type="button" className={`docbox-dock-item ${gridMode === 'grid' ? 'active' : ''}`} onClick={() => onToggleGrid?.()}>
        <Icon.Shared /><span>Grid</span>
      </button>
      <button type="button" className={`docbox-dock-item ${path.startsWith('/receive') ? 'active' : ''}`} onClick={() => navigate('/receive')}>
        <Icon.Card /><span>ScanQr</span>
      </button>
    </nav>
  );
}

export function ItemRow({ item, onClick, trailing }: { item: DogKeyItem; onClick?: () => void; trailing?: React.ReactNode }) {
  const iconMap: Record<string, React.ReactNode> = {
    folder: <Icon.Folder />, contact: <Icon.Contact />, link: <Icon.Link />, note: <Icon.Note />,
    pdf: <Icon.File />, file: <Icon.File />, image: '🖼️', video: '🎬',
  };
  return (
    <div className="item-row" onClick={onClick}>
      <div className="item-row-icon">{iconMap[item.type] || <Icon.File />}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="item-row-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        <div className="item-row-meta">
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
    }, 1200);
    return () => clearTimeout(t);
  }, [hasOnboarded, isUnlocked, navigate]);
  return (
    <div className="docbox-app screen-center fade-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="docbox-brand rise-in">Dogkey</div>
      <p className="subtext rise-in" style={{ marginTop: 12 }}>Documents on this device</p>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-app screen fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', paddingBottom: 40 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 24 }}>
        <div className="docbox-brand rise-in" style={{ marginBottom: 20 }}>Dogkey</div>
        <h1 className="heading rise-in" style={{ fontSize: 24, marginBottom: 12, lineHeight: 1.3 }}>
          Keep files here.<br />Share only from Cart.
        </h1>
        <p className="subtext rise-in" style={{ maxWidth: 300, marginBottom: 24 }}>
          DocBox cards, QR card, scan — no server required for core.
        </p>
      </div>
      <div style={{ maxWidth: 340, margin: '0 auto', width: '100%', padding: '0 8px' }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/create-pin')}>Get Started</button>
        <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/home')}>Skip — open Home</button>
      </div>
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
      if (p === pin) { await createUser(name.trim() || 'User', p); await unlockVault(true); navigate('/home'); }
      else { setError('PINs do not match'); setStep('enter'); setPin(''); setConfirm(''); }
    }
  };
  return (
    <div className="docbox-app screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      <div className="docbox-brand" style={{ marginBottom: 8 }}>Dogkey</div>
      <h1 className="heading" style={{ fontSize: 22, marginTop: 12 }}>Set PIN (optional later)</h1>
      <p className="subtext" style={{ marginBottom: 16, textAlign: 'center' }}>
        {step === 'enter' ? '4-digit PIN for this device' : 'Confirm PIN'}
      </p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      {step === 'enter' && (
        <input className="input" style={{ marginBottom: 16, maxWidth: 280 }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <PinPad value={step === 'enter' ? pin : confirm} onChange={step === 'enter' ? setPin : setConfirm} maxLength={4} onComplete={(p) => { void handleComplete(p); }} />
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/home')}>Skip</button>
    </div>
  );
}

export function UnlockScreen() {
  const navigate = useNavigate();
  const { verifyLoginPin, setUnlocked, user } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handle = async (p: string) => {
    if (await verifyLoginPin(p)) { await unlockVault(true); setUnlocked(true); navigate('/home'); }
    else { setError('Incorrect PIN'); setPin(''); }
  };
  const initial = (user?.displayName || 'U').charAt(0).toUpperCase();
  return (
    <div className="docbox-app screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" className="avatar-lg" style={{ marginBottom: 12 }} />
      ) : (
        <div className="avatar avatar-lg" style={{ marginBottom: 12 }}>{initial}</div>
      )}
      <div className="docbox-brand" style={{ marginBottom: 4 }}>Dogkey</div>
      <h1 className="heading" style={{ fontSize: 22, marginTop: 8 }}>Welcome back</h1>
      <p className="subtext" style={{ marginBottom: 8 }}>Enter PIN</p>
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
    <div className="docbox-app screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      <div className="docbox-brand" style={{ marginBottom: 16 }}>Dogkey</div>
      <h1 className="heading" style={{ fontSize: 22 }}>Google Drive</h1>
      <p className="subtext" style={{ maxWidth: 300, textAlign: 'center', marginBottom: 16 }}>
        Optional. Your Drive, your backup.
      </p>
      {msg && <p className="muted" style={{ marginBottom: 12 }}>{msg}</p>}
      <button className="btn btn-primary btn-block" style={{ maxWidth: 320 }} onClick={() => { connectGoogle(); setMsg('Continuing…'); setTimeout(() => navigate('/home'), 800); }}>Connect Google Drive</button>
      <button className="btn btn-secondary btn-block" style={{ maxWidth: 320, marginTop: 12 }} onClick={() => navigate('/home')}>Skip</button>
    </div>
  );
}
