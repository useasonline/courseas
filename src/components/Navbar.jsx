import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  User, 
  LogOut, 
  Award, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, searchQuery, setSearchQuery }) {
  const { currentUser, logout } = useAuth();
  const [showExplore, setShowExplore] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories = [
    "Artificial Intelligence",
    "Web Development",
    "Data Science",
    "Computer Science",
    "Business & Management"
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActivePage('catalog');
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div 
            onClick={() => setActivePage('home')}
            className="brand-container"
          >
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0056D2 0%, #00254D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(0,86,210,0.3)'
              }}
            >
              U
            </div>
            <span 
              className="brand-text-animated"
              style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.65rem', 
                fontWeight: '800', 
                letterSpacing: '-0.5px'
              }}
            >
              USEERA
            </span>
          </div>

          {/* Explore Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExplore(!showExplore)}
              className="btn-navy"
              style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '6px' }}
            >
              <BookOpen size={16} />
              Explore
              <ChevronDown size={14} />
            </button>

            {showExplore && (
              <div 
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: 0,
                  width: '260px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px 0',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '4px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Top Categories
                </div>
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(cat);
                      setActivePage('catalog');
                      setShowExplore(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-light)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            flex: 1, 
            maxWidth: '460px', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="What do you want to learn today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: '24px',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
          />
        </form>

        {/* Desktop Nav Links (Clean Learner Only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setActivePage('catalog')}
            style={{ 
              background: 'none', 
              color: activePage === 'catalog' ? 'var(--primary)' : 'var(--text-main)', 
              fontWeight: 600, 
              fontSize: '0.9rem' 
            }}
          >
            Find Courses
          </button>

          {currentUser && (
            <button 
              onClick={() => setActivePage('dashboard')}
              style={{ 
                background: 'none', 
                color: activePage === 'dashboard' ? 'var(--primary)' : 'var(--text-main)', 
                fontWeight: 600, 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Award size={16} />
              My Learning
            </button>
          )}

          {/* User Auth Profile Dropdown */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  border: '1px solid var(--card-border)'
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.displayName} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.displayName}</span>
                <ChevronDown size={14} />
              </div>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '220px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px',
                  zIndex: 200
                }}>
                  <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser.displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                  </div>

                  <button 
                    onClick={() => { setActivePage('dashboard'); setShowUserMenu(false); }}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '8px', 
                      fontSize: '0.85rem', 
                      background: 'none', 
                      color: 'var(--text-main)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <Award size={16} /> My Enrolled Courses
                  </button>

                  <div style={{ borderTop: '1px solid var(--card-border)', marginTop: '8px', paddingTop: '8px' }}>
                    <button 
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '8px', 
                        fontSize: '0.85rem', 
                        background: 'none', 
                        color: '#DC2626', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setActivePage('login')} 
              className="btn-primary"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
