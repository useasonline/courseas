import React, { useState } from 'react';
import { Shield, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ setActivePage }) {
  const { signInWithGoogle, loginWithFirebase, registerWithFirebase, resetPassword } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false); // false = Sign In tab, true = Create Account tab
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMsg('');
    try {
      await signInWithGoogle();
      setActivePage('home');
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithFirebase(name, email, password, role);
      } else {
        await loginWithFirebase(email, password);
      }
      setActivePage('home');
    } catch (err) {
      let msg = 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials or click "Forgot password?".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please click "Sign In" tab to log in.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address above to reset password.');
      return;
    }
    setError('');
    try {
      await resetPassword(email);
      setInfoMsg('Password reset email sent! Check your inbox to reset password.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div style={{ padding: '60px 20px', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '460px' }}>
        
        {/* Main Authentication Card */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          
          {/* Header Brand */}
          <div style={{ backgroundColor: 'var(--navy)', color: '#FFF', padding: '24px', textAlign: 'center' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--primary)', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.4rem', 
              fontWeight: 800,
              margin: '0 auto 10px auto' 
            }}>
              U
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
              Useera Account Access
            </h2>
            <p style={{ color: '#93C5FD', fontSize: '0.82rem', marginTop: '2px' }}>
              Firebase Authentication & Cloud Sync
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In vs Register) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => { setIsRegister(false); setError(''); setInfoMsg(''); }}
              style={{
                padding: '14px',
                fontSize: '0.92rem',
                fontWeight: 700,
                backgroundColor: !isRegister ? 'var(--bg-main)' : 'transparent',
                color: !isRegister ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: !isRegister ? '2.5px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign In (Existing User)
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); setInfoMsg(''); }}
              style={{
                padding: '14px',
                fontSize: '0.92rem',
                fontWeight: 700,
                backgroundColor: isRegister ? 'var(--bg-main)' : 'transparent',
                color: isRegister ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isRegister ? '2.5px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ padding: '28px' }}>
            
            {/* Official Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--card-border)',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                marginBottom: '20px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <div style={{ flex: 1, borderBottom: '1px solid var(--card-border)' }} />
              <span style={{ padding: '0 10px', textTransform: 'uppercase', fontWeight: 600 }}>Or email & password</span>
              <div style={{ flex: 1, borderBottom: '1px solid var(--card-border)' }} />
            </div>

            {error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {infoMsg && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#E6F4EA',
                color: '#137333',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isRegister && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      required
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--card-border)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Password
                  </label>
                  {!isRegister && (
                    <button 
                      type="button" 
                      onClick={handleResetPassword}
                      style={{ background: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '10px', fontWeight: 700 }}
              >
                {loading ? 'Authenticating with Firebase...' : isRegister ? 'Create New Account' : 'Sign In with Email & Password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '16px', fontSize: '0.85rem' }}>
              {isRegister ? (
                <span>Already have an account? <button onClick={() => setIsRegister(false)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 700 }}>Sign In</button></span>
              ) : (
                <span>Don't have an account yet? <button onClick={() => setIsRegister(true)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 700 }}>Create an Account</button></span>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
