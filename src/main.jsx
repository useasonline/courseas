import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class MainErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Main Application Error Caught:", error, errorInfo);
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
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎓</div>
            <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>
              USEERA Learning Workspace Recovered
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '20px' }}>
              An unexpected render issue occurred. Click reload below to refresh your learning workspace.
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
                🔄 Reload Workspace
              </button>
              <button 
                onClick={() => {
                  try {
                    localStorage.removeItem('useera_user');
                    localStorage.removeItem('useera_courses');
                    localStorage.removeItem('useera_enrollments');
                  } catch(e) {}
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#E2E8F0',
                  color: '#1E293B',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainErrorBoundary>
      <App />
    </MainErrorBoundary>
  </React.StrictMode>,
)

