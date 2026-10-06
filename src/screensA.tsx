import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import type { DogKeyItem } from './types';
import Icon from './lib/icons';
import { unlockVault } from './lib/secureVault';

export function BottomNav({ onPlus }: { onPlus?: () => void }) {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  return (
    <nav className="bottom-dock">
      <button className={`dock-item ${path.startsWith('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
        <Icon.Home />Home
      </button>
      <button className={`dock-item ${path.startsWith('/shared') ? 'active' : ''}`} onClick={() => navigate('/shared')}>
        <Icon.Shared />Shared
      </button>
      <button className="dock-center" onClick={() => (onPlus ? onPlus() : navigate('/add'))} aria-label="Add">+</button>
      <button className={`dock-item ${path.startsWith('/qr-card') ? 'active' : ''}`} onClick={() => navigate('/qr-card')}>
        <Icon.Card />QR Card
      </button>
      <button className={`dock-item ${path.startsWith('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
        <Icon.Settings />Settings
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
    }, 1800);
    return () => clearTimeout(t);
  }, [hasOnboarded, isUnlocked, navigate]);
  return (
    <div className="app-bg screen-center fade-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="brand brand-xl rise-in">DogKey<span className="brand-tm">™</span></div>
      <p className="subtext rise-in" style={{ marginTop: 12 }}>Your Everything Locker</p>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="app-bg screen fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', paddingBottom: 40 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 24 }}>
        <div className="brand brand-lg rise-in" style={{ marginBottom: 20 }}>DogKey<span className="brand-tm">™</span></div>
        <h1 className="heading rise-in" style={{ fontSize: 26, marginBottom: 12, lineHeight: 1.3 }}>
          Keep Everything.<br />Share Only What<br />You Choose.
        </h1>
        <p className="subtext rise-in" style={{ maxWidth: 300, marginBottom: 24 }}>
          Your private digital locker — share only what you choose, with full control.
        </p>
        <div className="rise-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 320 }}>
          {['Private Locker', 'Selective Sharing', 'QR Access'].map((t) => (
            <span key={t} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 340, margin: '0 auto', width: '100%', padding: '0 8px' }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/create-pin')}>Get Started</button>
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
      if (p === pin) { await createUser(name.trim() || 'User', p); await unlockVault(true); navigate('/connect-drive'); }
      else { setError('PINs do not match'); setStep('enter'); setPin(''); setConfirm(''); }
    }
  };
  return (
    <div className="app-bg screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      <div className="brand brand-lg" style={{ marginBottom: 8 }}>DogKey<span className="brand-tm">™</span></div>
      <h1 className="heading" style={{ fontSize: 22, marginTop: 12 }}>Set Your Login PIN</h1>
      <p className="subtext" style={{ marginBottom: 16, textAlign: 'center' }}>
        {step === 'enter' ? 'This PIN opens your private locker' : 'Confirm your Login PIN'}
      </p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
      {step === 'enter' && (
        <input className="input" style={{ marginBottom: 16, maxWidth: 280 }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
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
    if (await verifyLoginPin(p)) { await unlockVault(true); setUnlocked(true); navigate('/home'); }
    else { setError('Incorrect Login PIN'); setPin(''); }
  };
  const initial = (user?.displayName || 'U').charAt(0).toUpperCase();
  return (
    <div className="app-bg screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" className="avatar-lg" style={{ marginBottom: 12 }} />
      ) : (
        <div className="avatar avatar-lg" style={{ marginBottom: 12 }}>{initial}</div>
      )}
      <div className="brand" style={{ marginBottom: 4 }}>DogKey<span className="brand-tm">™</span></div>
      <h1 className="heading" style={{ fontSize: 22, marginTop: 8 }}>Welcome back</h1>
      <p className="subtext" style={{ marginBottom: 8 }}>Enter Your 4-Digit PIN</p>
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
    <div className="app-bg screen fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, minHeight: '100dvh' }}>
      <div className="brand brand-lg" style={{ marginBottom: 16 }}>DogKey<span className="brand-tm">™</span></div>
      <h1 className="heading" style={{ fontSize: 22 }}>Connect Google Drive</h1>
      <p className="subtext" style={{ maxWidth: 300, textAlign: 'center', marginBottom: 16 }}>
        Your files stay yours. Requires a valid Android OAuth client (package <strong>com.dogkey.app</strong>).
      </p>
      <div style={{ marginBottom: 20, textAlign: 'left', maxWidth: 300 }}>
        {['Your data stays in your Google Drive', 'Your files remain yours', 'No extra storage cost', 'Secure and private'].map((t) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</span>
            {t}
          </div>
        ))}
      </div>
      {msg && <p className="muted" style={{ marginBottom: 12, textAlign: 'center' }}>{msg}</p>}
      <button className="btn btn-primary btn-block" style={{ maxWidth: 320 }} onClick={() => { connectGoogle(); setMsg('OAuth client not configured yet — continuing without Drive.'); setTimeout(() => navigate('/home'), 1100); }}>Connect Google Drive</button>
      <button className="btn btn-secondary btn-block" style={{ maxWidth: 320, marginTop: 12 }} onClick={() => navigate('/home')}>Skip for now</button>
    </div>
  );
}
