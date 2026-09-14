import React, { useState } from 'react';
import { 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Award, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  CheckSquare, 
  Clock, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import QuizEngine from '../components/QuizEngine';
import CertificateModal from '../components/CertificateModal';

export default function LearnView({ course, onBack }) {
  const { getEnrollment, toggleLessonComplete, updateVideoProgress } = useCourses();
  const enrollment = getEnrollment(course.id) || {
    completedLessons: [],
    quizResults: {},
    videoTimestamps: {},
    lastActiveLesson: null,
    progress: 0
  };

  // Helper to determine initial lesson position (from Firebase saved last active state or next incomplete lesson)
  const getInitialActiveItem = () => {
    if (enrollment?.lastActiveLesson?.lessonId && course?.modules) {
      const savedModIdx = enrollment.lastActiveLesson.moduleIndex;
      const savedLessonId = enrollment.lastActiveLesson.lessonId;

      if (course.modules[savedModIdx]) {
        const found = course.modules[savedModIdx].lessons?.find(l => l.id === savedLessonId);
        if (found) {
          return { type: 'lesson', moduleIndex: savedModIdx, lesson: found };
        }
      }

      for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
        const found = course.modules[mIdx].lessons?.find(l => l.id === savedLessonId);
        if (found) {
          return { type: 'lesson', moduleIndex: mIdx, lesson: found };
        }
      }
    }

    // Fallback: resume from first incomplete lesson across modules
    if (course?.modules && enrollment?.completedLessons?.length > 0) {
      for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
        const mod = course.modules[mIdx];
        const incomplete = mod.lessons?.find(l => !enrollment.completedLessons.includes(l.id));
        if (incomplete) {
          return { type: 'lesson', moduleIndex: mIdx, lesson: incomplete };
        }
      }
    }

    const firstModule = course.modules?.[0];
    const firstLesson = firstModule?.lessons?.[0];
    return { type: 'lesson', moduleIndex: 0, lesson: firstLesson };
  };

  const [activeItem, setActiveItem] = useState(getInitialActiveItem);
  const [openModuleIndices, setOpenModuleIndices] = useState(() => [activeItem.moduleIndex || 0]);
  const [certModuleOpen, setCertModuleOpen] = useState(true);

  const toggleModuleAccordion = (modIdx) => {
    setOpenModuleIndices(prev => 
      prev.includes(modIdx) ? prev.filter(i => i !== modIdx) : [...prev, modIdx]
    );
  };

  const [activeQuizModal, setActiveQuizModal] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [completionToast, setCompletionToast] = useState('');

  const completedLessons = enrollment.completedLessons || [];
  const quizResults = enrollment.quizResults || {};

  const handleLessonSelect = (modIdx, les) => {
    setActiveItem({
      type: 'lesson',
      moduleIndex: modIdx,
      lesson: les
    });
    // Immediately save current module & lesson selection position
    updateVideoProgress(course.id, {
      moduleIndex: modIdx,
      lessonId: les.id,
      timestamp: enrollment.videoTimestamps?.[les.id] || 0
    });
  };

  const handleVideoTimeUpdate = (currentTime) => {
    if (activeItem.lesson && activeItem.type === 'lesson') {
      updateVideoProgress(course.id, {
        moduleIndex: activeItem.moduleIndex,
        lessonId: activeItem.lesson.id,
        timestamp: currentTime
      });
    }
  };

  const getInitialTimeForActiveLesson = () => {
    if (!activeItem.lesson) return 0;
    const savedTs = enrollment.videoTimestamps?.[activeItem.lesson.id];
    if (savedTs !== undefined) return savedTs;
    if (enrollment.lastActiveLesson?.lessonId === activeItem.lesson.id) {
      return enrollment.lastActiveLesson.timestamp || 0;
    }
    return 0;
  };

  const handleOpenQuiz = (quiz) => {
    setActiveQuizModal(quiz);
  };

  const isLessonDone = (lesId) => completedLessons.includes(lesId);
  const getQuizScore = (quizId) => quizResults[quizId] || null;

  const isFullyCompleted = enrollment.progress >= 100;

  const handleSelectCertificateItem = () => {
    setActiveItem({ type: 'certificate' });
    if (isFullyCompleted) {
      setShowCertificateModal(true);
    }
  };

  // Auto completion when video finishes playback
  const handleVideoEnded = () => {
    if (activeItem.lesson && !isLessonDone(activeItem.lesson.id)) {
      toggleLessonComplete(course.id, activeItem.lesson.id);
      setCompletionToast(`🎉 Lesson "${activeItem.lesson.title}" completed automatically!`);
      setTimeout(() => setCompletionToast(''), 4500);
    }
  };

  // Manual completion button click
  const handleManualToggle = (lessonId, lessonTitle) => {
    const wasDone = isLessonDone(lessonId);
    toggleLessonComplete(course.id, lessonId);
    if (!wasDone) {
      setCompletionToast(`🎉 Lesson "${lessonTitle}" marked as complete!`);
      setTimeout(() => setCompletionToast(''), 4500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Top Header Navigation */}
      <div style={{
        backgroundColor: 'var(--navy)',
        color: '#FFF',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              color: '#FFF', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <ChevronLeft size={16} /> Course Catalog
          </button>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase' }}>
              {course.partner}
            </span>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{course.title}</h2>
          </div>
        </div>

        {/* Progress Status Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Overall Completion</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38BDF8' }}>{enrollment.progress}% Complete</div>
          </div>
        </div>
      </div>

      {/* Completion Toast Notification Banner */}
      {completionToast && (
        <div style={{
          backgroundColor: '#E6F4EA',
          borderBottom: '2px solid #137333',
          color: '#137333',
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle2 size={20} />
          <span>{completionToast}</span>
        </div>
      )}

      {/* Main Workspace Split Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* LEFT SIDE: Modules & Syllabus Navigation Sidebar */}
        <div style={{
          width: '360px',
          borderRight: '1px solid var(--card-border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>Course Content</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {(course.modules?.length || 0) + 1} Modules • Certificate & Tests
            </span>
          </div>

          <div style={{ padding: '12px' }}>
            {course.modules?.map((mod, modIdx) => {
              const isOpen = openModuleIndices.includes(modIdx);

              return (
                <div key={mod.id} style={{ marginBottom: '14px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  {/* Module Header Accordion Bar */}
                  <div 
                    onClick={() => toggleModuleAccordion(modIdx)}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: isOpen ? 'rgba(0,86,210,0.06)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: isOpen ? '1px solid var(--card-border)' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        Module {modIdx + 1}
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                        {mod.title}
                      </h4>
                    </div>
                    {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>

                  {/* Module Content Items (Lessons & Quiz) */}
                  {isOpen && (
                    <div style={{ padding: '6px' }}>
                      {mod.lessons?.map((les) => {
                        const done = isLessonDone(les.id);
                        const isActive = activeItem.lesson?.id === les.id;

                        return (
                          <div
                            key={les.id}
                            onClick={() => handleLessonSelect(modIdx, les)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                              borderLeft: isActive ? '3px solid #0056D2' : '3px solid transparent',
                              color: isActive ? '#0056D2' : 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                              fontSize: '0.84rem',
                              fontWeight: isActive ? 700 : 500
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                              {done ? (
                                <CheckCircle2 size={18} color="#137333" style={{ flexShrink: 0 }} />
                              ) : les.type === 'video' ? (
                                <PlayCircle size={17} color={isActive ? "#0056D2" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
                              ) : (
                                <FileText size={17} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                              )}
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {les.title}
                              </span>
                            </div>
                            
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize', flexShrink: 0 }}>
                              {les.type}
                            </span>
                          </div>
                        );
                      })}

                      {/* Module Quiz */}
                      {mod.quiz && (
                        <div 
                          onClick={() => handleOpenQuiz(mod.quiz)}
                          style={{
                            margin: '6px 4px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#FFF3D6',
                            border: '1px solid #F4A100',
                            color: '#B25900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.82rem',
                            fontWeight: 700
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckSquare size={16} />
                            <span>{mod.quiz.title}</span>
                          </div>
                          {getQuizScore(mod.quiz.id) ? (
                            <span style={{
                              backgroundColor: getQuizScore(mod.quiz.id).passed ? '#137333' : '#DC2626',
                              color: '#FFF',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '0.7rem'
                            }}>
                              {getQuizScore(mod.quiz.id).score}%
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Take Test</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Course Certificate & Graduation Module Item (Formatted identical to regular modules) */}
            <div style={{ marginBottom: '14px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {/* Module Header Accordion Bar */}
              <div 
                onClick={() => {
                  setCertModuleOpen(prev => !prev);
                  handleSelectCertificateItem();
                }}
                style={{
                  padding: '12px 14px',
                  backgroundColor: certModuleOpen || activeItem.type === 'certificate' ? 'rgba(0,86,210,0.06)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: certModuleOpen ? '1px solid var(--card-border)' : 'none',
                  transition: 'background 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Module {(course.modules?.length || 0) + 1}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                    Course Certificate & Graduation
                  </h4>
                </div>
                {certModuleOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>

              {/* Module Content Items */}
              {certModuleOpen && (
                <div style={{ padding: '6px' }}>
                  <div
                    onClick={handleSelectCertificateItem}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: activeItem.type === 'certificate' ? '#EFF6FF' : 'transparent',
                      borderLeft: activeItem.type === 'certificate' ? '3px solid #0056D2' : '3px solid transparent',
                      color: activeItem.type === 'certificate' ? '#0056D2' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                      fontSize: '0.84rem',
                      fontWeight: activeItem.type === 'certificate' ? 700 : 500
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      {isFullyCompleted ? (
                        <CheckCircle2 size={18} color="#137333" style={{ flexShrink: 0 }} />
                      ) : (
                        <Award size={18} color={activeItem.type === 'certificate' ? "#0056D2" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
                      )}
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        Verified Course Certificate
                      </span>
                    </div>
                    
                    <span style={{ fontSize: '0.72rem', color: isFullyCompleted ? '#137333' : 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
                      {isFullyCompleted ? 'Unlocked ✓' : 'Locked 🔒'}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Lesson Player & Workspace Container */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
          {activeItem.type === 'lesson' && activeItem.lesson && (
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              
              {/* Custom Coursera Video Player Component */}
              {activeItem.lesson.type === 'video' ? (
                <div style={{ marginBottom: '24px' }}>
                  <CustomVideoPlayer 
                    videoUrl={activeItem.lesson.videoUrl}
                    title={activeItem.lesson.title}
                    initialTime={getInitialTimeForActiveLesson()}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                  />
                </div>
              ) : (
                <div style={{ padding: '30px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', marginBottom: '24px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '12px' }}>
                    <FileText size={20} /> Reading Masterclass Module
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>{activeItem.lesson.title}</h2>
                  <p style={{ lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-main)' }}>{activeItem.lesson.notes}</p>
                </div>
              )}

              {/* Lesson Info Header & Manual Completion Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>
                    {activeItem.lesson.title}
                  </h2>
                </div>

                <button 
                  onClick={() => handleManualToggle(activeItem.lesson.id, activeItem.lesson.title)}
                  className={isLessonDone(activeItem.lesson.id) ? "btn-secondary" : "btn-primary"}
                  style={{
                    backgroundColor: isLessonDone(activeItem.lesson.id) ? '#E6F4EA' : 'var(--primary)',
                    color: isLessonDone(activeItem.lesson.id) ? '#137333' : '#FFF',
                    borderColor: isLessonDone(activeItem.lesson.id) ? '#A7F3D0' : 'transparent',
                    padding: '10px 20px',
                    fontWeight: 700
                  }}
                >
                  <CheckCircle size={18} />
                  {isLessonDone(activeItem.lesson.id) ? 'Completed ✓' : 'Mark as Completed'}
                </button>
              </div>

              {/* Notes / Summary */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--navy)' }}>
                  Lesson Key Takeaways & Transcript
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {activeItem.lesson.notes}
                </p>
              </div>

            </div>
          )}

          {/* Certificate Workspace View when Final Certificate Module is selected */}
          {activeItem.type === 'certificate' && (
            <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', padding: '30px 20px' }}>
              {isFullyCompleted ? (
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '2px solid #F4A100', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'linear-gradient(135deg, #F4A100 0%, #D97706 100%)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 8px 24px rgba(244,161,0,0.4)' }}>
                    <Award size={40} />
                  </div>
                  
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Graduation Requirement Satisfied
                  </span>
                  
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', margin: '10px 0 14px 0' }}>
                    Congratulations! Your Certificate has been Generated 🎉
                  </h2>
                  
                  <p style={{ fontSize: '1rem', color: 'var(--text-main)', maxWidth: '600px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
                    You have successfully completed all lessons, masterclasses, and module tests for <strong>{course.title}</strong>.
                  </p>

                  <button 
                    onClick={() => setShowCertificateModal(true)}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #F4A100 0%, #D97706 100%)', color: '#FFF', padding: '14px 32px', fontSize: '1.05rem', fontWeight: 800 }}
                  >
                    <Award size={22} /> View & Print Verified Certificate
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', padding: '40px', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <Award size={32} />
                  </div>

                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px' }}>
                    Course Certificate Locked 🔒
                  </h2>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                    Your official course certificate will automatically generate once you finish 100% of all video lessons, reading materials, and module tests.
                  </p>

                  <div style={{ display: 'inline-block', backgroundColor: 'rgba(0,86,210,0.1)', padding: '12px 24px', borderRadius: '30px', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    Current Progress: {enrollment.progress}% Complete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal Render */}
      {activeQuizModal && (
        <QuizEngine 
          courseId={course.id}
          courseTitle={course.title}
          quiz={activeQuizModal}
          onClose={() => setActiveQuizModal(null)}
        />
      )}

      {/* Certificate Modal Render */}
      {showCertificateModal && (
        <CertificateModal 
          course={course}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

    </div>
  );
}
