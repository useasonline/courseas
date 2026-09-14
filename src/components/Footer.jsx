import React from 'react';
import { Globe, Award, Shield, CheckCircle } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer style={{ backgroundColor: 'var(--navy)', color: '#FFFFFF', paddingTop: '60px', paddingBottom: '40px', marginTop: '80px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px' }}>
          
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>U</span> USEERA
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              Useera provides universal access to the world's best education, partnering with top universities and organizations to offer courses online.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <Globe size={16} /> English (US)
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>Top Subjects</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('catalog')}>Artificial Intelligence</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('catalog')}>Web Development</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('catalog')}>Data Science & Analytics</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('catalog')}>Cloud Computing</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>Useera Resources</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('dashboard')}>My Enrolled Learning</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setActivePage('admin')}>Admin Studio</li>
              <li>Certificates Verification</li>
              <li>Help & Support</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>Guaranteed Excellence</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <CheckCircle size={16} color="#10B981" /> Accredited Certificates
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <Award size={16} color="#F59E0B" /> World-Class Instructors
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <Shield size={16} color="#3B82F6" /> 100% Online & Self-Paced
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '30px', fontSize: '0.8rem', color: '#64748B' }}>
          <div>© 2026 Useera Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
