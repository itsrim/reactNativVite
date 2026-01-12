import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, User, Search, MessageCircle, Plus, Crown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import './index.css';

import { EventProvider } from './context/EventContext';
import { FeatureFlagProvider, useFeatureFlags } from './context/FeatureFlagContext';
import { VisitProvider } from './context/VisitContext';
import { MessageProvider } from './context/MessageContext';

// Components
import EventList from './components/EventList';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';
import EventDetail from './components/EventDetail';
import EventSearch from './components/EventSearch';
import SocialPage from './components/SocialPage';
import UserProfile from './components/UserProfile';
import Chat from './components/Chat';
import { ThemeProvider } from './context/ThemeContext';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isPremiumLocked?: boolean;
}

function Navigation() {
  const location = useLocation();
  const { t } = useTranslation();
  const { isRestricted } = useFeatureFlags();
  const isActive = (path: string): boolean => location.pathname === path;

  // Hide nav on Detail pages, User profiles and Chat
  if (location.pathname.startsWith('/event/') || location.pathname.startsWith('/user/') || location.pathname.startsWith('/chat/')) return null;

  const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isPremiumLocked }) => {
    const active = isActive(to);
    return (
      <Link to={to} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: active ? '#be185d' : 'var(--color-text-muted)',
        gap: '4px',
        flex: 1,
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          <Icon size={24} strokeWidth={active ? 2.5 : 2} />
          {isPremiumLocked && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-8px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
            }}>
              <Crown size={10} color="white" />
            </div>
          )}
        </div>
        <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 'var(--max-width)',
      height: '80px',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      {/* Curved Background Shape */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 10px',
        alignItems: 'center',
        paddingBottom: '10px'
      }}>
        {/* Left Side */}
        <NavItem to="/search" icon={Search} label={t('nav.explore')} />
        <NavItem to="/" icon={MessageCircle} label={t('nav.messages')} />

        {/* Middle Spacer for Pulse Button */}
        <div style={{ width: '60px' }}></div>

        {/* Right Side */}
        <NavItem to="/calendar" icon={Calendar} label={t('nav.agenda')} />
        <NavItem to="/profile" icon={User} label={t('nav.profile')} />
      </div>

      {/* Floating Action Button (FAB) */}
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto'
      }}>
        <Link to="/create" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#be185d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(190, 24, 93, 0.4)',
          border: '4px solid var(--color-background)',
        }}>
          <Plus size={32} />
        </Link>
      </div>
    </div>
  );
}

// Wrapper to handle AnimatePresence logic which needs access to useLocation
function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SocialPage />} />
      <Route path="/search" element={<EventSearch />} />
      <Route path="/calendar" element={<EventList />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="/chat/:id" element={<Chat />} />
    </Routes>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isFullScreen = location.pathname.startsWith('/event/') || 
                       location.pathname.startsWith('/user/') || 
                       location.pathname.startsWith('/chat/');

  return (
    <div style={{ paddingBottom: isFullScreen ? '0' : '70px' }}>
      {children}
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <EventProvider>
          <VisitProvider>
            <MessageProvider>
              <Toaster position="top-center" richColors theme="system" />
              <Router>
                <Layout>
                  <AnimatedRoutes />
                </Layout>
              </Router>
            </MessageProvider>
          </VisitProvider>
        </EventProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}

export default App;

