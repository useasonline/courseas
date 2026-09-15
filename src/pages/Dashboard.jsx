import React from 'react';
import { Award, BookOpen, CheckCircle, Clock, PlayCircle, Star, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';

export default function Dashboard({ setActivePage, onLearn, onSelectCourse }) {
  const { currentUser } = useAuth();
  const { courses, enrollments } = useCourses();

  // Filter enrollments for current user
  const userEnrollments = Object.entries(enrollments || {})
    .filter(([key, data]) => data && currentUser?.uid && data.userId === currentUser.uid)
    .map(([key, data]) => {
      const course = (courses || []).find(c => c && c.id === data.courseId);
      return { ...data, course };
    })
    .filter(item => item.course !== undefined);

  const completedCount = userEnrollments.filter(e => e.isCompleted || e.progress >= 100).length;

  const avgProgress = userEnrollments.length > 0
    ? Math.round(userEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / userEnrollments.length)
    : 0;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        
        {/* Welcome Header Banner - Coursera Premium Glassmorphism */}
        <div style={{
          background: 'linear-gradient(135deg, #001E3D 0%, #00254D 50%, #003875 100%)',
          color: '#FFF',
          borderRadius: '20px',
          padding: '36px 40px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '30px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 36px rgba(0, 37, 77, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ zIndex: 2, maxWidth: '580px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#93C5FD',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '12px',
              backdropFilter: 'blur(4px)'
            }}>
              <Sparkles size={14} /> Learner Dashboard
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.3rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '10px',
              letterSpacing: '-0.5px'
            }}>
              Welcome back, <span style={{ color: '#38BDF8' }}>{currentUser?.displayName || 'Learner'}</span>! 👋
            </h1>

            <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: 1.5 }}>
              Track your course progress, interactive test scores, and verified Useera graduation certificates.
            </p>
          </div>

          {/* Premium Glassmorphism Stat Cards Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            zIndex: 2
          }}>
            {/* Stat Card 1: Enrolled */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '16px 22px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '150px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                  {userEnrollments.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginTop: '4px' }}>
                  Enrolled Paths
                </div>
              </div>
            </div>

            {/* Stat Card 2: Certificates Earned */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '16px 22px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '165px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                  {completedCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginTop: '4px' }}>
                  Certificates Earned
                </div>
              </div>
            </div>

            {/* Stat Card 3: Avg Progress */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '16px 22px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '150px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 161, 0, 0.18)',
                color: '#FBBF24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                  {avgProgress}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginTop: '4px' }}>
                  Avg Completion
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '20px' }}>
            My Enrolled Learning Paths ({userEnrollments.length})
          </h2>

          {userEnrollments.length > 0 ? (
            <div className="grid-courses">
              {userEnrollments.map(({ course, progress, completedLessons, quizResults }) => (
                <div key={course.id} className="course-card">
                  <div style={{ position: 'relative', height: '150px' }}>
                    <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge-certificate" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      {course.category}
                    </span>
                  </div>

                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Taught by {course.instructor}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Overall Completion</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress >= 100 ? '#137333' : 'var(--primary)' }} />
                      </div>

                      <button 
                        onClick={() => onLearn(course)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                      >
                        <PlayCircle size={16} /> Continue Course Workspace
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <BookOpen size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No courses enrolled yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>Explore our catalog and enroll in your first specialization.</p>
              <button onClick={() => setActivePage('catalog')} className="btn-primary">
                Browse Courses <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
