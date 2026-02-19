import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const patientLinks = [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/appointments', icon: '📅', label: 'Appointments' },
    { to: '/medications', icon: '💊', label: 'Medications' },
    { to: '/reminders', icon: '🔔', label: 'Reminders' },
    { to: '/chat', icon: '💬', label: 'AI Assistant' },
  ];

  const staffLinks = [
    { to: '/staff', icon: '⊞', label: 'Dashboard' },
    { to: '/staff/appointments', icon: '📅', label: 'Appointments' },
    { to: '/staff/patients', icon: '👥', label: 'Patients' },
    { to: '/staff/risk', icon: '📊', label: 'Risk Analytics' },
  ];

  const links = user?.role === 'patient' ? patientLinks : staffLinks;
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <>
      {/* Mobile hamburger button — rendered inside topbar via CSS */}
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Open menu"
        id="mobile-menu-toggle"
      >
        ☰
      </button>

      {/* Overlay backdrop for mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <button
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">🏥</div>
            <div>
              <div className="logo-text">ClinicAI</div>
              <div className="logo-sub">Care Platform</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/staff'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Sign out">↪</button>
          </div>
        </div>
      </aside>
    </>
  );
}
