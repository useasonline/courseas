import React, { useState } from 'react';
import { 
  Star, 
  Clock, 
  Users, 
  CheckCircle, 
  BookOpen, 
  Award, 
  PlayCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  CheckSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';

export default function CourseDetail({ course, onEnroll, onLearn }) {
  const { getEnrollment } = useCourses();
  const enrollment = getEnrollment(course.id);

  const [openModuleIndex, setOpenModuleIndex] = useState(0);

  const toggleModule = (index) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  return (
    <div className="animate-fade-in">
      
      {/* Hero Header */}
      <div style={{ backgroundColor: 'var(--navy)', color: '#FFF', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            <div>
              {/* Partner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.4rem' }}>{course.partnerLogo}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase' }}>
                  {course.partner}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
                {course.title}
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '24px' }}>
                {course.subtitle || course.description}
              </p>

              {/* Rating & Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.9rem', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#F4A100' }}>{course.rating}</span>
                  <Star size={16} fill="#F4A100" color="#F4A100" />
                  <span style={{ color: '#94A3B8' }}>({course.reviewsCount?.toLocaleString()} reviews)</span>
                </div>

                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                  <Users size={16} />
                  <span>{course.enrolledCount?.toLocaleString()} Enrolled</span>
                </div>

                <span>•</span>
                <div style={{ color: '#CBD5E1' }}>
                  Level: <strong>{course.level}</strong>
                </div>
              </div>

              {/* Instructor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {course.instructor?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Taught by {course.instructor}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{course.instructorRole}</div>
                </div>
              </div>

              {/* Enroll Action */}
              <div>
                {enrollment ? (
                  <button onClick={() => onLearn(course)} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                    <PlayCircle size={20} /> Go to Course Workspace ({enrollment.progress}%)
                  </button>
                ) : (
                  <button onClick={() => onEnroll(course)} className="btn-primary" style={{ padding: '14px 36px', fontSize: '1.1rem' }}>
                    Enroll for {course.price === 0 ? 'FREE' : `$${course.price}`}
                  </button>
                )}
              </div>

            </div>

            {/* Course Card Preview Right */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--card-border)'
            }}>
              <img 
                src={course.image} 
                alt={course.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
              />

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <Award size={18} color="var(--primary)" />
                  <span>Shareable Certificate upon completion</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  <span>{course.duration} flexible learning</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <BookOpen size={18} color="var(--primary)" />
                  <span>{course.modules?.length || 0} Comprehensive Modules & Quizzes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} color="#137333" />
                  <span>Firebase Progress & Grade Tracking</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
          
          {/* Left Column: What you'll learn & Syllabus */}
          <div>
            
            {/* What You Will Learn Card */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              marginBottom: '40px'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--navy)' }}>
                What You Will Learn
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {course.skills?.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Master practical application of <strong>{skill}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus breakdown */}
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: 'var(--navy)' }}>
                Course Syllabus ({course.modules?.length || 0} Modules)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {course.modules?.map((mod, idx) => (
                  <div key={mod.id} style={{
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-main)'
                  }}>
                    {/* Module Accordion Bar */}
                    <div 
                      onClick={() => toggleModule(idx)}
                      style={{
                        padding: '20px',
                        backgroundColor: openModuleIndex === idx ? 'var(--primary-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                          Module {idx + 1}
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                          {mod.title}
                        </h4>
                      </div>
                      {openModuleIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {/* Module Details (Lessons & Quiz) */}
                    {openModuleIndex === idx && (
                      <div style={{ padding: '20px', borderTop: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                          {mod.description}
                        </p>

                        {/* Lessons List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                          {mod.lessons?.map((les) => (
                            <div key={les.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--bg-secondary)',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {les.type === 'video' ? <PlayCircle size={16} color="var(--primary)" /> : <FileText size={16} color="var(--text-muted)" />}
                                <span style={{ fontWeight: 600 }}>{les.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quiz Pill */}
                        {mod.quiz && (
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#FFF3D6',
                            border: '1px solid #F4A100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.85rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <CheckSquare size={18} color="#B25900" />
                              <span style={{ fontWeight: 700, color: '#B25900' }}>{mod.quiz.title}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: '#B25900', fontSize: '0.78rem' }}>
                              {mod.quiz.questions?.length || 0} Questions • Pass {mod.quiz.passingScore}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Instructor & Skills */}
          <div>
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              position: 'sticky',
              top: '90px'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--navy)' }}>
                Skills You Gain
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {course.skills?.map((s, idx) => (
                  <span key={idx} style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--navy)' }}>
                  Offered By
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>{course.partnerLogo}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{course.partner}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Educational Partner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
