import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Printer, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CertificateModal({ course, onClose }) {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fire festive confetti animation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = `USEERA-${course.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const recipientName = currentUser?.displayName || 'Marceline Anderson';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        backgroundColor: '#1E293B',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '96vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        
        {/* Action Header Bar */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F172A',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F3E5AB', fontWeight: 700, fontSize: '0.95rem' }}>
            <Award size={22} color="#D4AF37" />
            <span>Official Useera Specialization Certificate</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem', backgroundColor: '#C5A059', color: '#0F172A', fontWeight: 800 }}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Container */}
        <div style={{ padding: '24px', backgroundColor: '#0F172A' }}>
          <div 
            id="printable-certificate"
            style={{
              padding: '60px 48px 48px 48px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '2px solid #D4AF37',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              position: 'relative',
              textAlign: 'center',
              color: '#1E293B',
              overflow: 'hidden',
              fontFamily: "'Playfair Display', 'Georgia', serif"
            }}
          >

            {/* Top Left Corner Gold Wave Ribbon Artwork */}
            <svg style={{ position: 'absolute', top: '-10px', left: '-10px', width: '260px', height: '260px', pointerEvents: 'none' }} viewBox="0 0 200 200" fill="none">
              <path d="M-60,70 C20,-40 120,-10 210,50 C300,110 320,190 280,240" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.75" />
              <path d="M-60,85 C20,-25 120,5 210,65 C300,125 320,205 280,255" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.65" />
              <path d="M-60,100 C20,-10 120,20 210,80 C300,140 320,220 280,270" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.55" />
              <path d="M-60,115 C20,5 120,35 210,95 C300,155 320,235 280,285" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.45" />
              <path d="M-60,130 C20,20 120,50 210,110 C300,170 320,250 280,300" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.35" />
              <path d="M-60,145 C20,35 120,65 210,125 C300,185 320,265 280,315" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.25" />
              <path d="M-60,160 C20,50 120,80 210,140 C300,200 320,280 280,330" stroke="url(#goldGradientTL)" strokeWidth="1.2" opacity="0.15" />
              <defs>
                <linearGradient id="goldGradientTL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#F3E5AB" />
                  <stop offset="100%" stopColor="#AA771C" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom Right Corner Gold Wave Ribbon Artwork */}
            <svg style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '270px', height: '270px', pointerEvents: 'none', transform: 'rotate(180deg)' }} viewBox="0 0 200 200" fill="none">
              <path d="M-60,70 C20,-40 120,-10 210,50 C300,110 320,190 280,240" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.75" />
              <path d="M-60,85 C20,-25 120,5 210,65 C300,125 320,205 280,255" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.65" />
              <path d="M-60,100 C20,-10 120,20 210,80 C300,140 320,220 280,270" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.55" />
              <path d="M-60,115 C20,5 120,35 210,95 C300,155 320,235 280,285" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.45" />
              <path d="M-60,130 C20,20 120,50 210,110 C300,170 320,250 280,300" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.35" />
              <path d="M-60,145 C20,35 120,65 210,125 C300,185 320,265 280,315" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.25" />
              <path d="M-60,160 C20,50 120,80 210,140 C300,200 320,280 280,330" stroke="url(#goldGradientBR)" strokeWidth="1.2" opacity="0.15" />
              <defs>
                <linearGradient id="goldGradientBR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#F3E5AB" />
                  <stop offset="100%" stopColor="#AA771C" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Gold Thin Border Frame */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              right: '14px',
              bottom: '14px',
              border: '1px solid #E6CA65',
              pointerEvents: 'none'
            }} />

            {/* Main Certificate Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              
              {/* Header Title */}
              <h1 style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: '2.8rem',
                fontWeight: 700,
                color: '#222222',
                letterSpacing: '6px',
                margin: 0,
                lineHeight: 1.1
              }}>
                CERTIFICATE
              </h1>

              {/* Sub-header Title */}
              <div style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#C5A059',
                letterSpacing: '5px',
                marginTop: '6px',
                marginBottom: '36px'
              }}>
                OF APPRECIATION & COMPLETION
              </div>

              {/* Award Given To */}
              <div style={{
                fontFamily: "'Cinzel', 'Inter', serif",
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#475569',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                THE FOLLOWING AWARD IS GIVEN TO
              </div>

              {/* Recipient Calligraphy Name */}
              <div style={{
                fontFamily: "'Great Vibes', 'Alex Brush', cursive",
                fontSize: '3.8rem',
                color: '#1E293B',
                lineHeight: 1.1,
                padding: '0 10px',
                display: 'inline-block'
              }}>
                {recipientName}
              </div>

              {/* Gold Accent Divider Bar with End Circles */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '12px auto 28px auto',
                maxWidth: '460px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #C5A059', backgroundColor: '#FFF' }} />
                <div style={{ flex: 1, height: '1.5px', backgroundColor: '#C5A059' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #C5A059', backgroundColor: '#FFF' }} />
              </div>

              {/* Certificate Statement Paragraph */}
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.94rem',
                color: '#475569',
                maxWidth: '620px',
                margin: '0 auto 44px auto',
                lineHeight: 1.6
              }}>
                This certificate is given to <strong style={{ color: '#1E293B', fontWeight: 700 }}>{recipientName}</strong> for achievement in the field of <strong style={{ color: '#C5A059', fontWeight: 700 }}>"{course.title}"</strong> and proves that competence is demonstrated in this field.
              </p>

              {/* Signatures & Center Gold Medal Seal */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 20px',
                marginTop: '20px'
              }}>
                
                {/* Left Signature: Head of Event / Instructor */}
                <div style={{ width: '200px', textAlign: 'center' }}>
                  <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.7rem', color: '#1E293B' }}>
                      {course.instructor || 'Dr. Andrew Lin'}
                    </span>
                  </div>
                  <div style={{ height: '1.5px', backgroundColor: '#C5A059', marginBottom: '8px', width: '100%' }} />
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', fontWeight: 700, color: '#C5A059' }}>
                    Head of Event
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: '2px' }}>
                    {course.instructorRole || 'Lead Faculty'}
                  </div>
                </div>

                {/* Center 3D Gold Medal Seal with Ribbons */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: '-15px' }}>
                  <svg width="86" height="86" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0px 4px 10px rgba(184, 134, 11, 0.35))' }}>
                    <defs>
                      <radialGradient id="goldMedalGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#FFE885" />
                        <stop offset="35%" stopColor="#F4C430" />
                        <stop offset="70%" stopColor="#C59B27" />
                        <stop offset="100%" stopColor="#7A580B" />
                      </radialGradient>
                      <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FAF0CA" />
                        <stop offset="50%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#996515" />
                      </linearGradient>
                    </defs>

                    {/* Outer Starburst Scalloped Edges */}
                    <g fill="url(#goldRimGrad)">
                      {[...Array(24)].map((_, i) => (
                        <circle key={i} cx={50 + 44 * Math.cos((i * 15 * Math.PI) / 180)} cy={50 + 44 * Math.sin((i * 15 * Math.PI) / 180)} r="4.5" />
                      ))}
                    </g>

                    {/* Medal Main Body */}
                    <circle cx="50" cy="50" r="43" fill="url(#goldRimGrad)" />
                    <circle cx="50" cy="50" r="37" fill="url(#goldMedalGrad)" stroke="#FFE885" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="#7A580B" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />

                    {/* Starburst Facets */}
                    <polygon points="50,18 55,42 78,35 60,50 78,65 55,58 50,82 45,58 22,65 40,50 22,35 45,42" fill="#FFE885" opacity="0.35" />
                    <polygon points="50,22 54,44 74,38 58,50 74,62 54,56 50,78 46,56 26,62 42,50 26,38 46,44" fill="url(#goldMedalGrad)" />

                    {/* Inner Emblem Star */}
                    <circle cx="50" cy="50" r="14" fill="url(#goldRimGrad)" stroke="#FFF" strokeWidth="1" />
                    <path d="M50 40 L53 46 L60 47 L55 52 L56 59 L50 55 L44 59 L45 52 L40 47 L47 46 Z" fill="#FFE885" />
                  </svg>

                  {/* Ribbon Tails */}
                  <svg width="60" height="36" viewBox="0 0 60 36" style={{ marginTop: '-8px' }}>
                    <defs>
                      <linearGradient id="ribbonGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F4C430" />
                        <stop offset="100%" stopColor="#8A5A00" />
                      </linearGradient>
                      <linearGradient id="ribbonGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE885" />
                        <stop offset="100%" stopColor="#C59B27" />
                      </linearGradient>
                    </defs>
                    <polygon points="12,0 28,0 22,36 15,29 8,36" fill="url(#ribbonGradLeft)" />
                    <polygon points="32,0 48,0 52,36 45,29 38,36" fill="url(#ribbonGradRight)" />
                  </svg>
                </div>

                {/* Right Signature: Mentor / Academic Authority */}
                <div style={{ width: '200px', textAlign: 'center' }}>
                  <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.7rem', color: '#1E293B' }}>
                      {course.partner || 'Useera Academy'}
                    </span>
                  </div>
                  <div style={{ height: '1.5px', backgroundColor: '#C5A059', marginBottom: '8px', width: '100%' }} />
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', fontWeight: 700, color: '#C5A059' }}>
                    Mentor
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: '2px' }}>
                    {course.partner}
                  </div>
                </div>

              </div>

              {/* Bottom Verification Footer Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', fontSize: '0.72rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                <div>Issue Date: <strong style={{ color: '#1E293B' }}>{issueDate}</strong></div>
                <div>Certificate ID: <strong style={{ color: '#1E293B' }}>{certId}</strong></div>
                <div>Verify: <strong style={{ color: '#0056D2' }}>useera.org/verify/{certId}</strong></div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
