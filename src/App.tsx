import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen, WelcomeScreen, CreatePinScreen, UnlockScreen, ConnectDriveScreen } from './screensA';
import { HomeScreen, FolderScreen, AddNewScreen, AddContactScreen, AddLinkScreen, AddNoteScreen } from './screensB';
import { ShareSettingsScreen, QRCardScreen, SharedScreen, SettingsScreen, SecurityScreen, AboutScreen, ReceiverPinScreen, SharedContentScreen, RequireAuth } from './screensC';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/create-pin" element={<CreatePinScreen />} />
        <Route path="/connect-drive" element={<ConnectDriveScreen />} />
        <Route path="/unlock" element={<UnlockScreen />} />
        <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
        <Route path="/folder/:id" element={<RequireAuth><FolderScreen /></RequireAuth>} />
        <Route path="/add" element={<RequireAuth><AddNewScreen /></RequireAuth>} />
        <Route path="/add-contact" element={<RequireAuth><AddContactScreen /></RequireAuth>} />
        <Route path="/add-link" element={<RequireAuth><AddLinkScreen /></RequireAuth>} />
        <Route path="/add-note" element={<RequireAuth><AddNoteScreen /></RequireAuth>} />
        <Route path="/share" element={<RequireAuth><ShareSettingsScreen /></RequireAuth>} />
        <Route path="/qr-card" element={<RequireAuth><QRCardScreen /></RequireAuth>} />
        <Route path="/shared" element={<RequireAuth><SharedScreen /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
        <Route path="/security" element={<RequireAuth><SecurityScreen /></RequireAuth>} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/receive" element={<ReceiverPinScreen />} />
        <Route path="/shared-content" element={<SharedContentScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
