import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  ScanHeart,
  History,
  Info,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  User,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Prevention from './pages/Prevention';
import ChatWidget from './components/ChatWidget';

const App = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <Router>
      <div className={`app-shell ${isMinimized ? 'minimized' : ''}`}>
        <aside className={`sidebar glass-panel ${isMinimized ? 'minimized' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isMinimized ? 'center' : 'space-between', padding: '0 0.5rem' }}>
            <div className="logo-section" style={{ padding: 0, gap: '0.75rem' }}>
              <div className="logo-badge" style={{ width: 36, height: 36, minWidth: 36 }}>
                <ScanHeart color="white" size={18} />
              </div>
              {!isMinimized && <h2 className="gradient-text font-heading" style={{ fontSize: '1.1rem' }}>OculoCardia</h2>}
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="minimize-btn"
              title={isMinimized ? "Maximize Sidebar" : "Minimize Sidebar"}
            >
              {isMinimized ? <ChevronRight size={16} /> : <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
            </button>
          </div>

          <nav className="nav-links">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Home" minimized={isMinimized} />
            <NavLink to="/dashboard" icon={<ScanHeart size={20} />} label="Diagnostics" minimized={isMinimized} />
            <NavLink to="/about" icon={<Info size={20} />} label="Research" minimized={isMinimized} />
            <div style={{ marginTop: 'auto' }}>
              <NavLink to="/settings" icon={<Settings size={20} />} label="System Config" minimized={isMinimized} />
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/prevention" element={<Prevention />} />
              <Route path="/settings" element={
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                  <Settings size={48} color="var(--text-dim)" style={{ marginBottom: '1.5rem' }} />
                  <h2 className="font-heading">System Configuration</h2>
                  <p style={{ color: 'var(--text-muted)' }}>AI Model parameters and API endpoints.</p>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <ChatWidget />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .app-shell {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-dark);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar {
          width: 260px;
          height: calc(100vh - 2rem);
          margin: 1rem;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: fixed;
          left: 0;
          z-index: 100;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar.minimized {
          width: 80px;
        }
        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          width: calc(100% - 280px);
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-shell.minimized .main-content {
          margin-left: 100px;
          width: calc(100% - 100px);
        }
        .minimize-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-dim);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .minimize-btn:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s ease;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-link.minimized {
          justify-content: center;
          padding: 0.75rem 0;
          gap: 0;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }
        .nav-link.active {
          background: rgba(0, 242, 254, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(0, 242, 254, 0.1);
        }
        
        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0 !important; width: 100% !important; }
        }
      `}} />
    </Router>
  );
};

const NavLink = ({ to, icon, label, minimized }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''} ${minimized ? 'minimized' : ''}`} title={minimized ? label : ''}>
      {icon}
      {!minimized && <span>{label}</span>}
    </Link>
  );
};

export default App;
