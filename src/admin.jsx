import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Portal Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          backgroundColor: '#F8FAFC',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '550px',
            backgroundColor: '#FFF',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
            <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>
              Admin Studio Recovered
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '20px' }}>
              An unexpected render issue occurred. Click reload below to refresh the Admin Studio workspace.
            </p>
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              marginBottom: '20px',
              textAlign: 'left',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#0056D2',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Reload Admin Studio
              </button>
              <a 
                href="/"
                style={{
                  backgroundColor: '#E2E8F0',
                  color: '#1E293B',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Go to Main Site
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminApp() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Admin Top Header Navigation Bar */}
      <header style={{
        backgroundColor: '#001933',
        color: '#FFF',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#FFF'
          }}>
            U
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
              USEERA
            </span>
            <span style={{ marginLeft: '10px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#D97706', color: '#FFF', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href="/" 
            style={{ 
              color: '#93C5FD', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Learner Website
          </a>
        </div>
      </header>

      {/* Admin Dashboard */}
      <main>
        <AdminDashboard />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminErrorBoundary>
      <AuthProvider>
        <CourseProvider>
          <AdminApp />
        </CourseProvider>
      </AuthProvider>
    </AdminErrorBoundary>
  </React.StrictMode>
);
