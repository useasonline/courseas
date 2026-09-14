import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  RotateCcw,
  User,
  Mail,
  X,
  Check,
  Mic,
  ShieldAlert,
  BookOpen,
  FileText,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';

export default function QuizEngine({ courseId, courseTitle, quiz, onClose, onQuizComplete }) {
  const { submitQuizResult, getEnrollment } = useCourses();
  const { currentUser } = useAuth();

  // Candidate details from logged in user (or fallback placeholders)
  const candidateName = currentUser?.displayName || 'DURGA GOWTHAM KOTA';
  const candidateEmail = currentUser?.email || 'gowthamkota005@gmail.com';

  // Stages: 'instructions' | 'active' | 'results'
  const [stage, setStage] = useState('instructions');
  const [activeTab, setActiveTab] = useState('exam'); // 'user' | 'exam'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [language, setLanguage] = useState('ENGLISH');

  // Answers state: { [qId]: optionIndex }
  const [answers, setAnswers] = useState({});
  // Question states: { [qId]: { visited: boolean, markedReview: boolean } }
  const [qMeta, setQMeta] = useState({});

  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit || 60) * 60);
  const [scoreResult, setScoreResult] = useState(null);

  // AI Audio Proctoring States
  const [micActive, setMicActive] = useState(true);
  const [voiceFoulCount, setVoiceFoulCount] = useState(0);
  const [warningToast, setWarningToast] = useState('');
  const [cancellationReason, setCancellationReason] = useState(null);

  const streamRef = useRef(null);
  const voiceLoudFramesRef = useRef(0);
  const lastVoiceFoulTimeRef = useRef(0);

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx] || null;

  // Initialize question metadata when component mounts
  useEffect(() => {
    const initialMeta = {};
    questions.forEach((q, idx) => {
      initialMeta[q.id] = {
        visited: idx === 0,
        markedReview: false
      };
    });
    setQMeta(initialMeta);
  }, [quiz]);

  // Anti-Cheating Security: Block F12, Inspect Element (Ctrl/Cmd+Shift/Alt+I/J/C/K), Ctrl/Cmd+U, and Right-Click Context Menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShiftOrAlt = e.shiftKey || e.altKey;
      const isInspectKey = ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key);

      const isInspect = isCtrlOrCmd && isShiftOrAlt && isInspectKey;
      const isViewSource = isCtrlOrCmd && (e.key === 'U' || e.key === 'u');

      if (isF12 || isInspect || isViewSource) {
        e.preventDefault();
        e.stopPropagation();
        setWarningToast('🚫 Security Violation: Developer Options (F12 / Inspect Element) are strictly disabled during exam!');
        setTimeout(() => setWarningToast(''), 4000);
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      setWarningToast('🚫 Security Violation: Right-click context menu is disabled during examination!');
      setTimeout(() => setWarningToast(''), 4000);
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Mark current question as visited whenever currentIdx changes
  useEffect(() => {
    if (stage === 'active' && currentQ) {
      setQMeta(prev => ({
        ...prev,
        [currentQ.id]: {
          ...(prev[currentQ.id] || { markedReview: false }),
          visited: true
        }
      }));
    }
  }, [currentIdx, stage]);

  // Timer countdown when exam is active
  useEffect(() => {
    if (stage !== 'active') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // Request Microphone Audio Stream & Web Audio Monitoring when exam starts
  useEffect(() => {
    if (stage === 'active') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            streamRef.current = stream;
            setMicActive(true);
          })
          .catch((err) => {
            console.warn('Microphone permission not granted:', err);
            setMicActive(true); // fallback mode
          });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stage]);

  // Real-Time Web Audio Voice Analysis Engine
  useEffect(() => {
    if (stage !== 'active') return;

    let audioContext = null;
    let analyserNode = null;
    let sourceNode = null;

    const setupAudio = () => {
      if (streamRef.current && streamRef.current.getAudioTracks().length > 0) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          audioContext = new AudioCtx();
          analyserNode = audioContext.createAnalyser();
          analyserNode.fftSize = 512;
          sourceNode = audioContext.createMediaStreamSource(streamRef.current);
          sourceNode.connect(analyserNode);
        } catch (err) {
          console.warn('Audio Context initialization:', err);
        }
      }
    };

    setupAudio();

    const checkInterval = setInterval(() => {
      if (!analyserNode && streamRef.current && streamRef.current.getAudioTracks().length > 0) {
        setupAudio();
      }

      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        if (audioTracks.length === 0 || audioTracks[0].readyState === 'ended' || !audioTracks[0].enabled) {
          setMicActive(false);
        } else {
          setMicActive(true);
        }
      }

      if (analyserNode) {
        const audioBuffer = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(audioBuffer);
        let audioSum = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
          audioSum += audioBuffer[i];
        }
        const avgAudio = audioSum / audioBuffer.length;

        if (avgAudio > 35) {
          voiceLoudFramesRef.current += 1;
        } else {
          voiceLoudFramesRef.current = Math.max(0, voiceLoudFramesRef.current - 1);
        }

        const nowAudio = Date.now();
        if (voiceLoudFramesRef.current >= 3 && (nowAudio - lastVoiceFoulTimeRef.current > 5000)) {
          lastVoiceFoulTimeRef.current = nowAudio;
          voiceLoudFramesRef.current = 0;
          setVoiceFoulCount(prev => {
            const nextVoice = prev + 1;
            setWarningToast(`⚠️ AI Proctor Alert: Candidate voice / reading questions aloud detected! (Voice Foul ${nextVoice}/2)`);
            setTimeout(() => setWarningToast(''), 4500);
            return nextVoice;
          });
        }
      }
    }, 450);

    return () => {
      clearInterval(checkInterval);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stage]);

  // Check voice foul limit threshold
  useEffect(() => {
    if (voiceFoulCount >= 2 && stage === 'active') {
      handleCancelExam("AI Proctor detected candidate loudly reading exam questions aloud for external AI assistance.");
    }
  }, [voiceFoulCount, stage]);

  const handleStartExam = () => {
    setVoiceFoulCount(0);
    setCancellationReason(null);
    setStage('active');
  };

  const handleStartExamFromInstructions = () => {
    handleStartExam();
  };

  const handleCancelExam = (reason) => {
    setCancellationReason(reason);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleResetExamFromModal = () => {
    setAnswers({});
    const resetMeta = {};
    questions.forEach((q, idx) => {
      resetMeta[q.id] = { visited: idx === 0, markedReview: false };
    });
    setQMeta(resetMeta);
    setScoreResult(null);
    setCurrentIdx(0);
    setVoiceFoulCount(0);
    setCancellationReason(null);
    setTimeLeft((quiz.timeLimit || 60) * 60);
    setStage('instructions');
  };

  const handleSelectOption = (optIdx) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setQMeta(prev => {
      const current = prev[currentQ.id] || { visited: true, markedReview: false };
      return {
        ...prev,
        [currentQ.id]: {
          ...current,
          markedReview: !current.markedReview
        }
      };
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    let correctCount = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= (quiz.passingScore || 75);

    const resultObj = {
      score: scorePercentage,
      passed,
      correctCount,
      totalQuestions: questions.length
    };

    setScoreResult(resultObj);
    setStage('results');

    // Save result to Context / Database
    submitQuizResult(courseId, quiz.id, scorePercentage, passed, resultObj);

    if (onQuizComplete) {
      onQuizComplete(passed, scorePercentage);
    }
  };

  const handleRetry = () => {
    handleResetExamFromModal();
  };

  const formatTimer = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainder = secs % 60;
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${pad(hrs)}:${pad(mins)}:${pad(remainder)}`;
  };

  // Helper to determine question palette button status & color using Coursera Web theme
  const getQuestionStatus = (qId) => {
    const meta = qMeta[qId] || { visited: false, markedReview: false };
    const hasAnswer = answers[qId] !== undefined;

    if (meta.markedReview && hasAnswer) return 'answered_review'; // Blue #0056D2
    if (meta.markedReview && !hasAnswer) return 'marked_review';   // Gold #F4A100
    if (hasAnswer) return 'answered';                              // Green #137333
    if (meta.visited) return 'not_answered';                       // Red #DC2626
    return 'not_visited';                                          // Grey #94A3B8
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return '#137333';        // Coursera Success Green
      case 'not_answered': return '#DC2626';    // Coursera Red
      case 'marked_review': return '#F4A100';   // Coursera Accent Gold
      case 'answered_review': return '#0056D2'; // Coursera Primary Blue
      default: return '#94A3B8';                // Coursera Grey
    }
  };

  // -------------------------------------------------------------
  // STAGE 1: INSTRUCTIONS & USER VERIFICATION SCREEN
  // -------------------------------------------------------------
  if (stage === 'instructions') {
    const enrollment = getEnrollment ? getEnrollment(courseId) : null;
    const previousAttempt = enrollment?.quizResults?.[quiz.id] || null;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-secondary)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        overflowY: 'auto'
      }}>
        {/* Top Header Bar */}
        <div style={{
          backgroundColor: 'var(--navy)',
          color: '#FFF',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Online Examination Portal
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{quiz.title}</h2>
          </div>

          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Instructions Body Grid */}
        <div style={{
          flex: 1,
          maxWidth: '1240px',
          width: '100%',
          margin: '30px auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '30px',
          alignItems: 'start'
        }}>
          
          {/* LEFT: Rules and Regulations Card */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '14px 20px',
              borderBottom: '1px solid var(--card-border)',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldAlert size={18} color="var(--primary)" /> Rules and Regulations
            </div>

            <div style={{ padding: '20px' }}>
              
              {/* Mandatory AI Audio Proctoring Rules List */}
              <div style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '0.86rem',
                color: 'var(--navy)',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                  <AlertCircle size={16} color="var(--primary)" /> Mandatory Audio Proctoring Rules:
                </div>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Microphone Required:</strong> Must keep the microphone turned <strong>ON</strong> during the examination.</li>
                  <li><strong>Audio & Speech Prohibition:</strong> Do not speak or read questions aloud. The AI Proctor detects microphone audio; reading questions aloud for external assistance will trigger an automatic exam cancellation.</li>
                </ul>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5, fontWeight: 600 }}>
                The Question Palette on the exam screen will display the status of each question using the following symbols:
              </p>

              {/* Symbol Legend Table Styled in Web Colors */}
              <div style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--card-border)', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#94A3B8', color: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    1
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>You have not visited the question yet.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--card-border)', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#DC2626', color: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    3
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>You have not answered the question.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--card-border)', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#137333', color: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    4
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>You have answered the question.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--card-border)', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#F4A100', color: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    7
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>You have NOT answered the question, but have marked the question for review.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#0056D2', color: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    9
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>You have answered the question, but marked it for review.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Details Tab Card & Start Exam Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Interactive Tab Card (User Details & Exam Details) */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden'
            }}>
              {/* Tab Navigation Header */}
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--card-border)'
              }}>
                <button
                  onClick={() => setActiveTab('user')}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    backgroundColor: activeTab === 'user' ? 'var(--bg-main)' : 'transparent',
                    color: activeTab === 'user' ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: activeTab === 'user' ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <User size={18} /> Candidate Info
                </button>

                <button
                  onClick={() => setActiveTab('exam')}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    backgroundColor: activeTab === 'exam' ? 'var(--bg-main)' : 'transparent',
                    color: activeTab === 'exam' ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: activeTab === 'exam' ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <BookOpen size={18} /> Exam Details
                </button>
              </div>

              {/* Tab Content Panel */}
              <div style={{ padding: '20px' }}>
                {activeTab === 'user' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Registered User Profile
                    </div>

                    {/* Candidate Name Pill Input */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      border: '1px solid var(--card-border)',
                      borderRadius: '30px',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <User size={18} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>
                        {candidateName}
                      </span>
                    </div>

                    {/* Candidate Email Pill Input */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      border: '1px solid var(--card-border)',
                      borderRadius: '30px',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <Mail size={18} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {candidateEmail}
                      </span>
                    </div>

                    <div style={{
                      marginTop: '6px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#E6F4EA',
                      border: '1px solid #A8DADC',
                      color: '#137333',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Check size={16} /> Account Verified & Eligible for Certification Exam
                    </div>
                  </div>
                )}

                {activeTab === 'exam' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Examination & Course Specifications
                    </div>

                    {courseTitle && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Enrolled Course:</span>
                        <strong style={{ color: 'var(--navy)', textAlign: 'right', maxWidth: '200px' }}>{courseTitle}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Test Module:</span>
                      <strong style={{ color: 'var(--primary)' }}>{quiz.title}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Questions:</span>
                      <strong style={{ color: 'var(--navy)' }}>{questions.length} Questions</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Duration Allowed:</span>
                      <strong style={{ color: 'var(--navy)' }}>{quiz.timeLimit || 60} Minutes</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Passing Threshold:</span>
                      <strong style={{ color: '#137333' }}>{quiz.passingScore || 75}%</strong>
                    </div>

                    {/* Written Test Attempts Details */}
                    <div style={{
                      marginTop: '8px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: previousAttempt ? (previousAttempt.passed ? '#E6F4EA' : '#FEE2E2') : '#EEF4FF',
                      border: `1px solid ${previousAttempt ? (previousAttempt.passed ? '#A8DADC' : '#FCA5A5') : '#BFDBFE'}`,
                      fontSize: '0.84rem'
                    }}>
                      <div style={{ fontWeight: 800, color: previousAttempt ? (previousAttempt.passed ? '#137333' : '#DC2626') : '#0056D2', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} />
                        {previousAttempt ? `Previous Test Result: ${previousAttempt.score}% (${previousAttempt.passed ? 'PASSED ✓' : 'FAILED ✗'})` : 'Test Status: Ready to Begin'}
                      </div>
                      {previousAttempt ? (
                        <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>
                          Score Recorded: <strong>{previousAttempt.correctAnswers} / {previousAttempt.totalQuestions}</strong> questions correct
                          {previousAttempt.date && ` • ${new Date(previousAttempt.date).toLocaleDateString()}`}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          You have not written this test module yet. Click below when ready.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Start Exam Action Button (Always Ready) */}
                <button 
                  onClick={handleStartExamFromInstructions}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '14px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #0056D2 0%, #003875 100%)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 86, 210, 0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>Start Examination Now</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 2: REAL TEST PORTAL ENVIRONMENT (ACTIVE EXAM VIEW)
  // -------------------------------------------------------------
  if (stage === 'active') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-main)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)'
      }}>
        
        {/* Warning Toast Floating Overlay */}
        {warningToast && (
          <div style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#DC2626',
            color: '#FFF',
            padding: '12px 24px',
            borderRadius: '30px',
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 10px 25px rgba(220,38,38,0.4)',
            zIndex: 10005,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <ShieldAlert size={20} />
            <span>{warningToast}</span>
          </div>
        )}

        {/* Cancellation Modal Overlay */}
        {cancellationReason && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 10010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
              border: '2px solid #DC2626'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <ShieldAlert size={36} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991B1B', marginBottom: '10px' }}>
                Examination Cancelled & Reset
              </h2>

              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: '#991B1B',
                lineHeight: 1.5,
                fontWeight: 600
              }}>
                <strong>Reason: </strong> {cancellationReason}
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Due to an AI Proctoring violation, your current examination session has been reset. Please review the Rules & Regulations and restart the exam when ready.
              </p>

              <button 
                onClick={handleResetExamFromModal}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '30px',
                  backgroundColor: '#DC2626',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
              >
                Return to Rules & Restart Exam
              </button>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--card-border)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Candidate Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="var(--primary)" />
            </div>
            <span>{candidateName}</span>
          </div>

          {/* Language Selector Dropdown */}
          <div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '4px 16px',
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-main)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--navy)',
                cursor: 'pointer'
              }}
            >
              <option value="ENGLISH">ENGLISH</option>
              <option value="HINDI">HINDI</option>
            </select>
          </div>

          {/* Timer Countdown & Voice Foul Indicator Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: voiceFoulCount > 0 ? '#FEE2E2' : '#FEF3C7',
              color: voiceFoulCount > 0 ? '#DC2626' : '#B45309',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: `1px solid ${voiceFoulCount > 0 ? '#FCA5A5' : '#FCD34D'}`
            }}>
              <Mic size={14} /> Voice Fouls: {voiceFoulCount} / 2
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 800, color: '#D97706' }}>
              <Clock size={18} color="#D97706" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Main Test Layout (Sidebar Palette + Right Question View) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT SIDEBAR: Microphone Proctoring Panel & Question Palette */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--card-border)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px'
          }}>
            <div>
              {/* Microphone Proctoring Active Status Box */}
              <div style={{
                marginBottom: '14px',
                borderRadius: '12px',
                padding: '14px',
                border: '1.5px solid #A7F3D0',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#065F46',
                  fontWeight: 800,
                  fontSize: '0.88rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(16,185,129,0.5)'
                  }}>
                    <Mic size={18} />
                  </div>
                  <span>Mic Proctor Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                    <span>Audio Detector: Monitoring</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span>Anti-Cheating Shield: Engaged</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0056D2', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0056D2' }} />
                    <span>Developer Locks: Active</span>
                  </div>
                </div>

                <div style={{ color: '#064E3B', fontSize: '0.68rem', lineHeight: 1.4, borderTop: '1px dashed #A7F3D0', paddingTop: '8px' }}>
                  Notice: Speaking or reading questions aloud triggers automatic proctoring alerts.
                </div>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--card-border)' }}>
                Question Palette
              </div>

              {/* Question Number Buttons Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const statusColor = getStatusColor(status);
                  const isCurrent = idx === currentIdx;

                  return (
                    <button 
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        height: '32px',
                        backgroundColor: statusColor,
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: isCurrent ? '2px solid #000' : 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 0 0 2px #38BDF8' : 'none'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sidebar Status Legend */}
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#94A3B8', borderRadius: '2px' }} />
                <span>Not Visited</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#DC2626', borderRadius: '2px' }} />
                <span>Not Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#137333', borderRadius: '2px' }} />
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#0056D2', borderRadius: '2px' }} />
                <span>Answered Review</span>
              </div>
            </div>
          </div>

          {/* RIGHT WORKSPACE: Question & Options View */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
            
            {currentQ && (
              <div>
                {/* Question Statement */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '24px', lineHeight: 1.6 }}>
                  {currentIdx + 1}. {currentQ.question}
                </h3>

                {/* Option Choice Boxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '860px' }}>
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #0056D2' : '1px solid var(--card-border)',
                          backgroundColor: isSelected ? '#EFF6FF' : 'var(--bg-secondary)',
                          color: isSelected ? '#0056D2' : 'var(--text-main)',
                          fontSize: '0.95rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: isSelected ? '2px solid #0056D2' : '1.5px solid var(--text-muted)',
                          backgroundColor: isSelected ? '#0056D2' : 'var(--bg-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF'
                        }}>
                          {isSelected && <Check size={14} />}
                        </div>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid var(--card-border)',
              marginTop: '30px'
            }}>
              {/* Left Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  style={{
                    backgroundColor: 'var(--navy)',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIdx === 0 ? 0.5 : 1
                  }}
                >
                  Prev
                </button>

                <button 
                  onClick={handleClearAnswer}
                  style={{
                    backgroundColor: '#64748B',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>

              {/* Center Submit Button */}
              <div>
                <button 
                  onClick={handleSubmitExam}
                  style={{
                    backgroundColor: '#137333',
                    color: '#FFF',
                    padding: '9px 28px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(19, 115, 51, 0.3)'
                  }}
                >
                  Submit
                </button>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleToggleReview}
                  style={{
                    backgroundColor: '#F4A100',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {qMeta[currentQ?.id]?.markedReview ? 'Unmark Review' : 'Review'}
                </button>

                <button 
                  onClick={handleNext}
                  disabled={currentIdx === questions.length - 1}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentIdx === questions.length - 1 ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 3: RESULTS SUMMARY VIEW
  // -------------------------------------------------------------
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        backgroundColor: 'var(--bg-main)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        border: '1px solid var(--card-border)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: 'var(--navy)',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase' }}>
              Examination Results Summary
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{quiz.title}</h3>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {scoreResult && (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              backgroundColor: scoreResult.passed ? '#E6F4EA' : '#FEE2E2',
              border: `1px solid ${scoreResult.passed ? '#A7F3D0' : '#FCA5A5'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {scoreResult.passed ? (
                  <CheckCircle size={40} color="#137333" />
                ) : (
                  <XCircle size={40} color="#DC2626" />
                )}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: scoreResult.passed ? '#137333' : '#991B1B' }}>
                    {scoreResult.passed ? 'Congratulations! Examination Passed 🎉' : 'Passing Threshold Not Met'}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    Your Score: <strong>{scoreResult.score}%</strong> ({scoreResult.correctCount} of {scoreResult.totalQuestions} correct) — Passing score: {quiz.passingScore}%
                  </p>
                </div>
              </div>

              {!scoreResult.passed && (
                <button onClick={handleRetry} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <RotateCcw size={14} /> Retry Exam
                </button>
              )}
            </div>
          )}

          {/* Detailed Question Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)' }}>Detailed Question Analysis</h4>

            {questions.map((q, qIdx) => {
              const selectedOpt = answers[q.id];
              const isCorrect = selectedOpt === q.correctAnswer;

              return (
                <div key={q.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--card-border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '12px' }}>
                    Q{qIdx + 1}. {q.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options?.map((opt, optIdx) => {
                      let bg = 'var(--bg-main)';
                      let border = 'var(--card-border)';
                      let col = 'var(--text-main)';

                      if (optIdx === q.correctAnswer) {
                        bg = '#E6F4EA';
                        border = '#137333';
                        col = '#137333';
                      } else if (selectedOpt === optIdx && !isCorrect) {
                        bg = '#FEE2E2';
                        border = '#DC2626';
                        col = '#DC2626';
                      }

                      return (
                        <div key={optIdx} style={{ padding: '10px 14px', borderRadius: '6px', border: `1.5px solid ${border}`, backgroundColor: bg, color: col, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{opt}</span>
                          {optIdx === q.correctAnswer && <CheckCircle size={16} color="#137333" />}
                          {selectedOpt === optIdx && !isCorrect && <XCircle size={16} color="#DC2626" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ marginTop: '10px', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                      <strong>Explanation: </strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--card-border)', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
            Done & Return to Course
          </button>
        </div>
      </div>
    </div>
  );
}
