import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ArrowUpRight,
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Users, 
  Star, 
  GraduationCap,
  Brain,
  Code2,
  BarChart3,
  Cpu,
  Briefcase
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useCourses } from '../context/CourseContext';

// Hero Carousel Slides Data (Rotates automatically every 5 seconds)
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    alt: "Students learning on Useera",
    badgeTitle: "Verified Credentials",
    badgeSub: "Shareable & Industry Recognized",
    badgeIcon: Award,
    badgeBg: "#EFF6FF",
    badgeColor: "#0056D2"
  },
  {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
    alt: "Interactive online developer & AI masterclass",
    badgeTitle: "Hands-on AI Masterclasses",
    badgeSub: "Real-world Projects & Coding",
    badgeIcon: Sparkles,
    badgeBg: "#FFF3D6",
    badgeColor: "#D97706"
  },
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    alt: "Students celebrating course graduation",
    badgeTitle: "94% Career Impact",
    badgeSub: "Learners report career advancement",
    badgeIcon: GraduationCap,
    badgeBg: "#E6F4EA",
    badgeColor: "#137333"
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    alt: "Tech student coding with modern tools",
    badgeTitle: "100% Online & Flexible",
    badgeSub: "Learn at your own pace anytime",
    badgeIcon: BookOpen,
    badgeBg: "#F3E8FF",
    badgeColor: "#7C3AED"
  }
];

export default function Home({ setActivePage, setSearchQuery, onSelectCourse, onEnroll, onLearn }) {
  const { courses } = useCourses();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[currentSlideIndex];
  const BadgeIcon = currentSlide.badgeIcon;

  const domainConfigs = [
    { 
      name: "Artificial Intelligence", 
      icon: Brain,
      gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      unit: "Specialization"
    },
    { 
      name: "Web Development", 
      icon: Code2,
      gradient: "linear-gradient(135deg, #0056D2 0%, #0284C7 100%)",
      unit: "Masterclass"
    },
    { 
      name: "Data Science", 
      icon: BarChart3,
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      unit: "Applied Path"
    },
    { 
      name: "Computer Science", 
      icon: Cpu,
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      unit: "Core Course"
    },
    { 
      name: "Business & Management", 
      icon: Briefcase,
      gradient: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
      unit: "Executive Track"
    }
  ];

  // Dynamically compute counts from real live courses data
  const categories = domainConfigs.map(domain => {
    const realCount = (courses || []).filter(c => 
      c.category?.toLowerCase() === domain.name.toLowerCase() ||
      c.category?.toLowerCase().includes(domain.name.toLowerCase())
    ).length;

    return {
      ...domain,
      count: `${realCount} ${realCount === 1 ? domain.unit : domain.unit + 's'}`
    };
  });

  // Dynamically include any custom categories created by admin in live data
  const defaultDomainNames = domainConfigs.map(d => d.name.toLowerCase());
  (courses || []).forEach(c => {
    if (c.category && !defaultDomainNames.some(d => c.category.toLowerCase().includes(d))) {
      const catName = c.category;
      if (!categories.some(cat => cat.name.toLowerCase() === catName.toLowerCase())) {
        const realCount = courses.filter(item => item.category === catName).length;
        categories.push({
          name: catName,
          count: `${realCount} ${realCount === 1 ? 'Course' : 'Courses'}`,
          icon: BookOpen,
          gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
        });
      }
    }
  });

  return (
    <div className="animate-fade-in">
      
      {/* Hero Section - Coursera Navy Banner */}
      <section style={{
        backgroundColor: 'var(--navy)',
        color: '#FFF',
        padding: '70px 0 90px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,86,210,0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#93C5FD',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '20px'
              }}>
                <Sparkles size={16} /> World-Class Online Learning Platform
              </div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3.2rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-1px',
                marginBottom: '20px'
              }}>
                Learn without limits with <span style={{ color: '#38BDF8' }}>USEERA</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px', maxWidth: '540px' }}>
                Build job-ready skills with certificates from top universities and leading tech institutes. Access interactive modules, hands-on tests, and video masterclasses.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActivePage('catalog')}
                  className="btn-primary" 
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  Explore All Courses <ArrowRight size={18} />
                </button>

                <button 
                  onClick={() => setActivePage('dashboard')}
                  className="btn-outline-light" 
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  <Award size={18} /> View My Learning
                </button>
              </div>
            </div>

            {/* Right Hero Image Visual (5s Auto-rotating Carousel) */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                height: '380px',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}>
                {HERO_SLIDES.map((slide, idx) => (
                  <img 
                    key={idx}
                    src={slide.image} 
                    alt={slide.alt} 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '380px',
                      objectFit: 'cover',
                      opacity: idx === currentSlideIndex ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out',
                      pointerEvents: idx === currentSlideIndex ? 'auto' : 'none'
                    }}
                  />
                ))}

                {/* Carousel Indicator Dots */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(4px)'
                }}>
                  {HERO_SLIDES.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`hero-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Stat Card (Animates per slide) */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-20px',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                padding: '14px 18px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid var(--card-border)',
                zIndex: 12,
                transition: 'all 0.4s ease'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: currentSlide.badgeBg,
                  color: currentSlide.badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.4s ease'
                }}>
                  <BadgeIcon size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{currentSlide.badgeTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{currentSlide.badgeSub}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Powered By Banner */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--card-border)', padding: '18px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', textAlign: 'center' }}>
          <Sparkles size={18} color="var(--primary)" />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
            This platform is powered with <a href="https://useas.online" target="_blank" rel="noopener noreferrer" style={{ color: '#0056D2', textDecoration: 'underline', fontWeight: 800 }}>useas.online</a>
          </span>
        </div>
      </section>

      {/* Explore Top Categories / Domains */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Curated Learning Paths
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                Explore Top Domains
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px' }}>
              Choose from {courses?.length || 0} specialized industry learning paths across {categories.length} top domains taught by world-class leaders
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '22px' }}>
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(cat.name);
                    setActivePage('catalog');
                  }}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,86,210,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: cat.gradient,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                    }}>
                      <IconComp size={26} />
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: 'var(--navy)', lineHeight: 1.3 }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 8px', borderRadius: '12px', display: 'inline-block' }}>
                      {cat.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Coursera-Grade Courses */}
      <section style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
                Featured Specializations & Courses
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Earn a certificate upon passing all module tests</p>
            </div>
            <button onClick={() => setActivePage('catalog')} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
              View All Courses <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-courses">
            {courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onSelectCourse={onSelectCourse} 
                onEnroll={onEnroll}
                onLearn={onLearn}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
