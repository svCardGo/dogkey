import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDogKeyStore } from './store/useDogKeyStore';
import { PinPad } from './components/PinPad';
import { Toggle } from './components/Toggle';
import Icon from './lib/icons';
import { DogLogo } from './lib/DogLogo';
import { BottomNav, ItemRow } from './screensA';

export function ShareSettingsScreen() {
  const navigate = useNavigate();
  const { masterShare, setMasterShare, items, setShareEnabled, createShareSession, stopSharing, shareSession, isShareActive } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [validity, setValidity] = useState(60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const categories = [
    { key: 'Documents', id: 'folder-documents' }, { key: 'Photos', id: 'folder-photos' },
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
          <p style={{ fontSize: 14, marginBottom: 16 }}>Turn on Master Share for all enabled content?</p>
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
      {isShareActive() && shareSession && (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--success)', marginTop: 12 }}>
          Active · PIN {shareSession.sharePinDisplay || '••••'} · until {new Date(shareSession.expiresAt).toLocaleString()}
        </p>
      )}
      <button className="glass-button" style={{ width: '100%', marginTop: 20 }} disabled={pin.length !== 4 || busy} onClick={async () => {
        setBusy(true);
        try { await createShareSession(pin, validity); navigate('/qr-card'); }
        finally { setBusy(false); }
      }}>Generate QR</button>
      {isShareActive() && (
        <button className="glass-button secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => stopSharing()}>Stop All Sharing</button>
      )}
      <BottomNav />
    </div>
  );
}

export function QRCardScreen() {
  const navigate = useNavigate();
  const { user, shareSession, isShareActive } = useDogKeyStore();
  const active = isShareActive();
  const payload = shareSession?.qrPayload || `dogkey://card/${user?.id || 'unknown'}`;
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>DogKey Card</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card fade-in" style={{ padding: 24, textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '2px solid var(--accent-gold)' }} />
        ) : (
          <div style={{ margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}><DogLogo size={64} color="var(--accent-deep)" /></div>
        )}
        <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.displayName || 'User'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>DogKey</div>
        <div style={{ width: 200, height: 200, margin: '0 auto 16px', background: '#fff', padding: 12, borderRadius: 12, border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QRCodeSVG value={payload} size={176} level="M" bgColor="#ffffff" fgColor="#1a120c" />
        </div>
        {active && shareSession && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Share PIN: <strong>{shareSession.sharePinDisplay || '••••'}</strong><br />
            Until {new Date(shareSession.expiresAt).toLocaleString()}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <DogLogo size={22} color="var(--accent-brown)" />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--accent-brown)' }}>DogKey · Your Everything Locker</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
        <button className="glass-button secondary" style={{ flex: 1 }} onClick={() => window.print()}>Print</button>
        <button className="glass-button" style={{ flex: 1 }} onClick={() => navigate('/share')}>Share</button>
      </div>
      <BottomNav />
    </div>
  );
}

export function SharedScreen() {
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

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, disconnectGoogle, connectGoogle } = useDogKeyStore();
  const rows = [
    { label: 'Profile', desc: 'Name, Photo', path: '/profile' },
    { label: 'Google Drive', desc: user?.googleConnected ? `Connected · ${user.googleEmail || ''}` : 'Not connected — needs OAuth client', action: () => user?.googleConnected ? disconnectGoogle() : connectGoogle() },
    { label: 'Security', desc: 'PIN, Lock, Privacy', path: '/security' },
    { label: 'Backup & Sync', desc: user?.googleConnected ? 'Drive linked' : 'Local only until Drive connected', path: null as string | null },
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

export function SecurityScreen() {
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
        <p className="screen-subtitle">{step === 0 ? 'Current Login PIN' : step === 1 ? 'New Login PIN' : 'Confirm new PIN'}</p>
        <PinPad value={step === 0 ? oldPin : newPin} onChange={step === 0 ? setOldPin : setNewPin} maxLength={4} onComplete={async (p) => {
          if (step === 0) { setOldPin(p); setStep(1); setNewPin(''); }
          else if (step === 1) { setNewPin(p); setStep(2); }
          else {
            if (p === newPin && (await changeLoginPin(oldPin, newPin))) { setMode('menu'); }
            else { setStep(0); setOldPin(''); setNewPin(''); }
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
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Change Login PIN</div></div>
        <span>›</span>
      </div>
      <div className="list-item" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Biometric Lock</div></div>
        <Toggle on={settings.biometricLock} onChange={(v) => updateSettings({ biometricLock: v })} />
      </div>
      <div className="list-item" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>Hide App Content</div></div>
        <Toggle on={settings.hideAppContent} onChange={(v) => updateSettings({ hideAppContent: v })} />
      </div>
    </div>
  );
}

export function AboutScreen() {
  const navigate = useNavigate();
  return (
    <div className="app-bg screen fade-in" style={{ textAlign: 'center', paddingTop: 48 }}>
      <DogLogo size={72} color="var(--accent-deep)" />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginTop: 12 }}>DogKey™</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your Everything Locker</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>Version 1.1.0</p>
      <button className="glass-button secondary" style={{ marginTop: 24 }} onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export function ReceiverPinScreen() {
  const navigate = useNavigate();
  const { user, verifySharePin, isShareActive, shareSession } = useDogKeyStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handle = async (p: string) => {
    if (!isShareActive()) { setError(shareSession?.revokedAt ? 'Sharing Disabled' : 'Share Expired'); setPin(''); return; }
    if (await verifySharePin(p)) navigate('/shared-content');
    else { setError('Incorrect Share PIN'); setPin(''); }
  };
  return (
    <div className="app-bg screen full fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: '2px solid var(--accent-gold)' }} />
      ) : (
        <DogLogo size={72} color="var(--accent-deep)" />
      )}
      <div style={{ fontWeight: 600, fontSize: 18, marginTop: 8 }}>{user?.displayName || 'Owner'}</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>is sharing with you</p>
      <p className="screen-subtitle">Enter Share PIN</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 8 }}>{error}</p>}
      <PinPad value={pin} onChange={setPin} maxLength={4} onComplete={(p) => { void handle(p); }} />
      <button className="glass-button" style={{ marginTop: 24, width: 240 }} onClick={() => pin.length === 4 && void handle(pin)}>Open Shared Content</button>
    </div>
  );
}

export function SharedContentScreen() {
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

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, updateProfile } = useDogKeyStore();
  const [name, setName] = useState(user?.displayName || '');
  const [photo, setPhoto] = useState<string | null>(user?.profilePhoto || null);
  const pickPhoto = async () => {
    const { pickFromGallery, takePhoto } = await import('./lib/media');
    const useCam = window.confirm('OK = Camera · Cancel = Gallery');
    const media = useCam ? await takePhoto() : await pickFromGallery();
    if (media) setPhoto(media.dataUrl);
  };
  return (
    <div className="app-bg screen fade-in">
      <div className="app-header">
        <button className="header-back" onClick={() => navigate(-1)}><Icon.Back /></button>
        <div style={{ fontWeight: 600 }}>Profile</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div onClick={() => void pickPhoto()} style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', border: '2px solid var(--accent-gold)', cursor: 'pointer', background: 'linear-gradient(145deg,#e8d9c4,#d4b896)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <DogLogo size={48} color="var(--accent-deep)" />}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Tap photo to change</p>
        <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
        {photo && <button className="glass-button secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => setPhoto(null)}>Remove photo</button>}
        <button className="glass-button" style={{ width: '100%', marginTop: 16 }} onClick={() => { updateProfile(name.trim() || 'User', photo); navigate(-1); }}>Save Profile</button>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { hasOnboarded, isUnlocked } = useDogKeyStore();
  if (!hasOnboarded) return <Navigate to="/welcome" replace />;
  if (!isUnlocked) return <Navigate to="/unlock" replace />;
  return <>{children}</>;
}
