import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { unlockVault } from './lib/secureVault';

/** Bottom: Home | DocBox count | Grid | ScanQr — mockup exact labels */
export function BottomNav({
  onPlus,
  gridMode,
  onToggleGrid,
}: {
  onPlus?: () => void;
  gridMode?: 'grid' | 'single';
  onToggleGrid?: () => void;
}) {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const { getChildren } = useDogKeyStore();
  const boxCount = getChildren(null).length;

  return (
    <nav className="docbox-dock" aria-label="Main">
      <button
        type="button"
        className={path.startsWith('/home') || path === '/' ? 'active' : ''}
        onClick={() => navigate('/home')}
      >
        <span className="dock-ico">⌂</span>
        <span>Home</span>
      </button>
      <button type="button" className={path.startsWith('/shared') ? 'active' : ''} onClick={() => navigate('/shared')}>
        <span className="dock-count">{boxCount}</span>
        <span>DocBox</span>
      </button>
      <button type="button" className={gridMode === 'grid' ? 'active' : ''} onClick={() => onToggleGrid?.()}>
        <span className="dock-ico">▦</span>
        <span>Grid</span>
      </button>
      <button type="button" className={path.startsWith('/receive') ? 'active' : ''} onClick={() => navigate('/receive')}>
        <span className="dock-ico">▣</span>
        <span>ScanQr</span>
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
    }, 900);
    return () => clearTimeout(t);
  }, [hasOnboarded, isUnlocked, navigate]);
  return (
    <div className="docbox-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="docbox-logo">Dogkey</div>
      <p style={{ marginTop: 12, color: 'var(--db-muted)' }}>Documents on this device</p>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-root" style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="docbox-logo" style={{ marginBottom: 16 }}>Dogkey</div>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Keep files here.<br />Share only from Cart.</h1>
        <p style={{ color: 'var(--db-muted)', maxWidth: 280 }}>DocBox · QR card · Scan — no hosting needed for core.</p>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => navigate('/create-pin')}>Get Started</button>
      <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/home')}>Open Home</button>
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
    <div className="docbox-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <div className="docbox-logo">Dogkey</div>
      <h1 style={{ fontSize: 20, marginTop: 16 }}>Set PIN</h1>
      <p style={{ color: 'var(--db-muted)', marginBottom: 12 }}>{step === 'enter' ? '4-digit PIN' : 'Confirm PIN'}</p>
      {error && <p style={{ color: '#f66' }}>{error}</p>}
      {step === 'enter' && (
        <input className="input" style={{ marginBottom: 12, maxWidth: 280 }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
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
  return (
    <div className="docbox-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      {user?.profilePhoto ? <img src={user.profilePhoto} alt="" className="docbox-avatar" style={{ width: 72, height: 72, marginBottom: 12 }} /> : null}
      <div className="docbox-logo">Dogkey</div>
      <p style={{ color: 'var(--db-muted)', margin: '8px 0 12px' }}>Enter PIN</p>
      {error && <p style={{ color: '#f66' }}>{error}</p>}
      <PinPad value={pin} onChange={setPin} maxLength={4} onComplete={(p) => { void handle(p); }} />
    </div>
  );
}

export function ConnectDriveScreen() {
  const navigate = useNavigate();
  return (
    <div className="docbox-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, paddingLeft: 24, paddingRight: 24 }}>
      <div className="docbox-logo">Dogkey</div>
      <h1 style={{ fontSize: 20, marginTop: 16 }}>Google Drive</h1>
      <p style={{ color: 'var(--db-muted)', textAlign: 'center', marginBottom: 20 }}>Optional backup to your Drive.</p>
      <button className="btn btn-primary btn-block" style={{ maxWidth: 320 }} onClick={() => navigate('/home')}>Continue</button>
      <button className="btn btn-secondary btn-block" style={{ maxWidth: 320, marginTop: 10 }} onClick={() => navigate('/home')}>Skip</button>
    </div>
  );
}
