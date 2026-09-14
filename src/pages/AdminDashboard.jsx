import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  BookOpen, 
  Layers, 
  FileText, 
  CheckSquare, 
  Users, 
  Award, 
  Save, 
  X, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { courses = [], saveCourse, removeCourse } = useCourses();
  const { currentUser } = useAuth();

  // All state hooks declared together at the top of component
  const [selectedCourse, setSelectedCourse] = useState(() => (Array.isArray(courses) && courses.length > 0 ? courses[0] : null));
  const [successToast, setSuccessToast] = useState('');

  // Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    category: 'Artificial Intelligence',
    partner: 'Useera Institute of Technology',
    partnerLogo: '🚀',
    instructor: currentUser?.displayName || 'Admin Instructor',
    instructorRole: 'Head of Curriculum',
    rating: 5.0,
    reviewsCount: 1,
    enrolledCount: 10,
    level: 'Beginner',
    duration: '4 weeks',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    badge: 'New',
    price: 49,
    skills: 'Python, Machine Learning, Web',
    description: '',
    modules: []
  });

  // Module Modal State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Lesson Modal State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    notes: ''
  });

  // Quiz Modal State (Multi-Question Builder)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    id: '',
    title: '',
    timeLimit: 15,
    passingScore: 75,
    questions: []
  });

  // Draft Question State for adding/editing individual questions inside quiz modal
  const [qDraft, setQDraft] = useState({
    question: '',
    opt1: '',
    opt2: '',
    opt3: '',
    opt4: '',
    correctAnswer: 0,
    explanation: ''
  });
  const [editingQIndex, setEditingQIndex] = useState(null);

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleOpenNewCourse = () => {
    setIsEditingCourse(false);
    setCourseForm({
      id: `useera-course-${Date.now()}`,
      title: '',
      subtitle: '',
      category: 'Artificial Intelligence',
      partner: 'Useera Tech Academy',
      partnerLogo: '⚡',
      instructor: currentUser?.displayName || 'Admin Instructor',
      instructorRole: 'Lead Professor',
      rating: 4.9,
      reviewsCount: 10,
      enrolledCount: 100,
      level: 'Beginner',
      duration: '4 weeks',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller',
      price: 49,
      skills: 'JavaScript, AI, Cloud',
      description: 'Comprehensive course covering key industry standards.',
      modules: []
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (courseToEdit = selectedCourse) => {
    if (!courseToEdit) return;
    setIsEditingCourse(true);
    setCourseForm({
      id: courseToEdit.id,
      title: courseToEdit.title || '',
      subtitle: courseToEdit.subtitle || '',
      category: courseToEdit.category || 'Artificial Intelligence',
      partner: courseToEdit.partner || 'Useera Institute of Technology',
      partnerLogo: courseToEdit.partnerLogo || '🚀',
      instructor: courseToEdit.instructor || currentUser?.displayName || 'Admin Instructor',
      instructorRole: courseToEdit.instructorRole || 'Head of Curriculum',
      rating: courseToEdit.rating || 5.0,
      reviewsCount: courseToEdit.reviewsCount || 10,
      enrolledCount: courseToEdit.enrolledCount || 100,
      level: courseToEdit.level || 'Beginner',
      duration: courseToEdit.duration || '4 weeks',
      image: courseToEdit.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      badge: courseToEdit.badge || 'Published',
      price: courseToEdit.price !== undefined ? courseToEdit.price : 49,
      skills: Array.isArray(courseToEdit.skills) ? courseToEdit.skills.join(', ') : (courseToEdit.skills || ''),
      description: courseToEdit.description || '',
      modules: courseToEdit.modules || []
    });
    setShowCourseModal(true);
  };

  const handleSaveCourseForm = (e) => {
    e.preventDefault();
    const skillsArray = typeof courseForm.skills === 'string' 
      ? courseForm.skills.split(',').map(s => s.trim()).filter(Boolean) 
      : courseForm.skills;

    const formattedCourse = {
      ...courseForm,
      price: Number(courseForm.price) || 0,
      skills: skillsArray
    };

    saveCourse(formattedCourse);
    setSelectedCourse(formattedCourse);
    setShowCourseModal(false);
    triggerToast(`Course "${formattedCourse.title}" (Fee: $${formattedCourse.price}) saved successfully!`);
  };

  // Add Module to Selected Course
  const handleAddModule = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const newModule = {
      id: `m_${Date.now()}`,
      title: moduleForm.title,
      description: moduleForm.description,
      lessons: [],
      quiz: null
    };

    const updatedCourse = {
      ...selectedCourse,
      modules: [...(selectedCourse.modules || []), newModule]
    };

    saveCourse(updatedCourse);
    setSelectedCourse(updatedCourse);
    setShowModuleModal(false);
    setModuleForm({ title: '', description: '' });
    triggerToast(`Module "${newModule.title}" added to course!`);
  };

  const handleOpenAddLesson = (modId) => {
    setSelectedModuleId(modId);
    setEditingLessonId(null);
    const defaultUrl = 'https://www.youtube.com/watch?v=aircAruvnKk';
    setLessonForm({
      title: '',
      type: 'video',
      videoUrl: defaultUrl,
      notes: ''
    });
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (modId, les) => {
    setSelectedModuleId(modId);
    setEditingLessonId(les.id);
    setLessonForm({
      title: les.title || '',
      type: les.type || 'video',
      videoUrl: les.videoUrl || '',
      notes: les.notes || ''
    });
    setShowLessonModal(true);
  };

  const handleDeleteLesson = (modId, lesId) => {
    if (!selectedCourse) return;
    const updatedModules = selectedCourse.modules.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          lessons: (mod.lessons || []).filter(l => l.id !== lesId)
        };
      }
      return mod;
    });

    const updatedCourse = { ...selectedCourse, modules: updatedModules };
    saveCourse(updatedCourse);
    setSelectedCourse(updatedCourse);
    triggerToast('Lesson deleted.');
  };

  // Add or Edit Lesson in Module
  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const lessonData = {
      id: editingLessonId || `les_${Date.now()}`,
      title: lessonForm.title,
      type: lessonForm.type,
      videoUrl: lessonForm.videoUrl,
      notes: lessonForm.notes
    };

    const updatedModules = selectedCourse.modules.map(mod => {
      if (mod.id === selectedModuleId) {
        const existingLessons = mod.lessons || [];
        let newLessons;
        if (editingLessonId) {
          newLessons = existingLessons.map(l => l.id === editingLessonId ? lessonData : l);
        } else {
          newLessons = [...existingLessons, lessonData];
        }
        return {
          ...mod,
          lessons: newLessons
        };
      }
      return mod;
    });

    const updatedCourse = { ...selectedCourse, modules: updatedModules };
    saveCourse(updatedCourse);
    setSelectedCourse(updatedCourse);
    setShowLessonModal(false);
    triggerToast(`Lesson "${lessonData.title}" saved!`);
  };

  // Open Quiz Modal for Module (Multi-Question Support)
  const handleOpenAddOrEditQuiz = (mod) => {
    setSelectedModuleId(mod.id);
    if (mod.quiz) {
      setQuizForm({
        id: mod.quiz.id || `quiz_${Date.now()}`,
        title: mod.quiz.title || `${mod.title} Assessment`,
        timeLimit: mod.quiz.timeLimit || 15,
        passingScore: mod.quiz.passingScore || 75,
        questions: mod.quiz.questions || []
      });
    } else {
      setQuizForm({
        id: `quiz_${Date.now()}`,
        title: `${mod.title} Assessment`,
        timeLimit: 15,
        passingScore: 75,
        questions: []
      });
    }
    setQDraft({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
    setEditingQIndex(null);
    setShowQuizModal(true);
  };

  // Add or Update Question in current Quiz draft
  const handleAddQuestionToQuiz = (e) => {
    if (e) e.preventDefault();
    if (!qDraft.question.trim()) {
      alert('Please enter a question prompt.');
      return;
    }
    if (!qDraft.opt1.trim() || !qDraft.opt2.trim()) {
      alert('Please provide at least Option 1 and Option 2.');
      return;
    }

    const newQuestionObj = {
      id: editingQIndex !== null && quizForm.questions[editingQIndex]?.id 
        ? quizForm.questions[editingQIndex].id 
        : `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: qDraft.question,
      options: [qDraft.opt1, qDraft.opt2, qDraft.opt3, qDraft.opt4].filter(Boolean),
      correctAnswer: parseInt(qDraft.correctAnswer) || 0,
      explanation: qDraft.explanation
    };

    let updatedQuestions = [...quizForm.questions];
    if (editingQIndex !== null) {
      updatedQuestions[editingQIndex] = newQuestionObj;
    } else {
      updatedQuestions.push(newQuestionObj);
    }

    setQuizForm({ ...quizForm, questions: updatedQuestions });
    setQDraft({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
    setEditingQIndex(null);
    triggerToast(`Question ${editingQIndex !== null ? 'updated' : 'added'}! Test now has ${updatedQuestions.length} question(s).`);
  };

  // Load question into draft form for editing
  const handleEditQuestionInQuiz = (idx) => {
    const q = quizForm.questions[idx];
    if (!q) return;
    setQDraft({
      question: q.question || '',
      opt1: q.options?.[0] || '',
      opt2: q.options?.[1] || '',
      opt3: q.options?.[2] || '',
      opt4: q.options?.[3] || '',
      correctAnswer: q.correctAnswer || 0,
      explanation: q.explanation || ''
    });
    setEditingQIndex(idx);
  };

  // Delete question from quiz draft
  const handleDeleteQuestionFromQuiz = (idx) => {
    const updated = quizForm.questions.filter((_, i) => i !== idx);
    setQuizForm({ ...quizForm, questions: updated });
    if (editingQIndex === idx) {
      setEditingQIndex(null);
      setQDraft({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
    }
  };

  // Save Complete Quiz to Module
  const handleSaveQuizToModule = (e) => {
    if (e) e.preventDefault();
    if (!selectedCourse) return;

    let finalQuestions = [...quizForm.questions];

    // If user typed a question in the draft form but didn't click "+ Add Question", auto-include it
    if (qDraft.question.trim() && qDraft.opt1.trim() && qDraft.opt2.trim()) {
      const autoQ = {
        id: `q_${Date.now()}_auto`,
        question: qDraft.question,
        options: [qDraft.opt1, qDraft.opt2, qDraft.opt3, qDraft.opt4].filter(Boolean),
        correctAnswer: parseInt(qDraft.correctAnswer) || 0,
        explanation: qDraft.explanation
      };
      finalQuestions.push(autoQ);
    }

    if (finalQuestions.length === 0) {
      alert('Please add at least 1 question to the test before saving.');
      return;
    }

    const newQuiz = {
      id: quizForm.id || `quiz_${Date.now()}`,
      title: quizForm.title || 'Module Assessment',
      timeLimit: parseInt(quizForm.timeLimit) || 15,
      passingScore: parseInt(quizForm.passingScore) || 75,
      questions: finalQuestions
    };

    const updatedModules = selectedCourse.modules.map(mod => {
      if (mod.id === selectedModuleId) {
        return {
          ...mod,
          quiz: newQuiz
        };
      }
      return mod;
    });

    const updatedCourse = { ...selectedCourse, modules: updatedModules };
    saveCourse(updatedCourse);
    setSelectedCourse(updatedCourse);
    setShowQuizModal(false);
    triggerToast(`Quiz "${newQuiz.title}" saved with ${finalQuestions.length} question(s)!`);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        
        {/* Success Toast Banner */}
        {successToast && (
          <div style={{
            padding: '14px 20px',
            backgroundColor: '#E6F4EA',
            border: '1.5px solid #137333',
            color: '#137333',
            borderRadius: 'var(--radius)',
            marginBottom: '20px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <CheckCircle2 size={20} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Admin Header */}
        <div style={{
          backgroundColor: '#00254D',
          color: '#FFF',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#D97706', color: '#FFF', padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
              <ShieldCheck size={14} /> USEERA ADMIN STUDIO
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
              Course, Module & Test Management Center
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
              Create Coursera-grade courses, add interactive modules, write module tests, and sync with Firebase.
            </p>
          </div>

          <button onClick={handleOpenNewCourse} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            <Plus size={18} /> Create New Course
          </button>
        </div>

        {/* Studio Overview Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
              <BookOpen size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Published Courses</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>{courses.length}</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D97706', marginBottom: '8px' }}>
              <Layers size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Modules</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>
              {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#137333', marginBottom: '8px' }}>
              <CheckSquare size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Tests/Quizzes</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>
              {courses.reduce((acc, c) => acc + (c.modules?.filter(m => m.quiz).length || 0), 0)}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7C3AED', marginBottom: '8px' }}>
              <Users size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Learners</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>683,400+</div>
          </div>
        </div>

        {/* Main Admin Editor Interface Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' }}>
          
          {/* Left Course Selector List */}
          <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '16px' }}>
              Courses Directory
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedCourse?.id === c.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${selectedCourse?.id === c.id ? 'var(--primary)' : 'var(--card-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {c.modules?.length || 0} Modules
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditCourse(c); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Edit Course Fee & Details"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCourse(c.id); triggerToast('Course removed.'); }}
                      style={{ background: 'none', border: 'none', color: '#DC2626', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Curriculum Builder Panel */}
          {selectedCourse ? (
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
              
              {/* Course Detail Banner Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Editing Curriculum
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#E6F4EA', color: '#137333', padding: '2px 10px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                      Fee: {selectedCourse.price === 0 ? 'FREE' : `$${selectedCourse.price}`}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                    {selectedCourse.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => handleOpenEditCourse(selectedCourse)}
                    style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 'var(--radius)', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit size={16} /> Edit Fee & Course Details
                  </button>
                  <button 
                    onClick={() => setShowModuleModal(true)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Module to Course
                  </button>
                </div>
              </div>

              {/* Modules List Accordion Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {selectedCourse.modules?.map((mod, modIdx) => (
                  <div key={mod.id} style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    
                    {/* Module Title Bar */}
                    <div style={{ padding: '16px 20px', backgroundColor: 'var(--navy)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase' }}>
                          Module {modIdx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{mod.title}</h4>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleOpenAddLesson(mod.id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', color: '#FFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          + Add Lesson
                        </button>
                        <button 
                          onClick={() => handleOpenAddOrEditQuiz(mod)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#D97706', color: '#FFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {mod.quiz ? '📝 Edit Test / Add Questions' : '+ Add Test/Quiz'}
                        </button>
                      </div>
                    </div>

                    {/* Lessons list inside module */}
                    <div style={{ padding: '20px' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{mod.description}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>
                          Lessons ({mod.lessons?.length || 0})
                        </div>

                        {mod.lessons?.map((les) => (
                          <div key={les.id} style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FileText size={16} color="var(--primary)" />
                              <span style={{ fontWeight: 600 }}>{les.title}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '10px' }}>{les.type}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                onClick={() => handleOpenEditLesson(mod.id, les)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                                title="Edit Lesson"
                              >
                                <Edit size={15} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteLesson(mod.id, les.id)}
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                                title="Delete Lesson"
                              >
                                <Trash2 size={15} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quiz indicator */}
                      {mod.quiz ? (
                        <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#FFF3D6', border: '1px solid #F4A100', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#B25900', fontSize: '0.9rem' }}>🎯 Test: {mod.quiz.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#B25900', marginTop: '2px' }}>
                              {mod.quiz.questions?.length} Question(s) • Time limit: {mod.quiz.timeLimit} mins • Pass mark: {mod.quiz.passingScore}%
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#B25900', color: '#FFF', padding: '3px 8px', borderRadius: '10px' }}>
                            ACTIVE TEST
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No test attached to this module yet. Click "+ Add Test/Quiz" to create questions.
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div>Select a course from the left menu to edit syllabus</div>
          )}

        </div>

      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {showCourseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isEditingCourse ? 'Edit Course Details & Fee' : 'Add New Specialization Course'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveCourseForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Course Title</label>
                <input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} placeholder="e.g. Fullstack React & Node Masterclass" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0056D2' }}>Course Fee / Price ($ USD)</label>
                  <input 
                    type="number" 
                    min="0"
                    required 
                    value={courseForm.price} 
                    onChange={e => setCourseForm({...courseForm, price: e.target.value})} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '2px solid #0056D2', fontWeight: 700 }} 
                    placeholder="49 ($0 for Free)" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Level</label>
                  <select value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Subtitle</label>
                <input type="text" value={courseForm.subtitle} onChange={e => setCourseForm({...courseForm, subtitle: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Category</label>
                  <input type="text" value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Partner / University</label>
                  <input type="text" value={courseForm.partner} onChange={e => setCourseForm({...courseForm, partner: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Cover Image URL</label>
                <input type="text" value={courseForm.image} onChange={e => setCourseForm({...courseForm, image: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instructor Name</label>
                <input type="text" value={courseForm.instructor} onChange={e => setCourseForm({...courseForm, instructor: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Skills (comma separated)</label>
                <input type="text" value={courseForm.skills} onChange={e => setCourseForm({...courseForm, skills: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description</label>
                <textarea rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                {isEditingCourse ? 'Update Course & Fee' : 'Save Course to Firebase & System'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODULE MODAL */}
      {showModuleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Add Module to {selectedCourse?.title}</h3>
            <form onSubmit={handleAddModule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Module Title</label>
                <input type="text" required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} placeholder="e.g. Module 3: Neural Networks Architecture" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Module Summary</label>
                <textarea rows={3} value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
              </div>
              <button type="submit" className="btn-primary">Create Module</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LESSON MODAL */}
      {showLessonModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {editingLessonId ? 'Edit Lesson' : 'Add Lesson'}
              </h3>
              <button onClick={() => setShowLessonModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lesson Title</label>
                <input type="text" required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} placeholder="e.g. Lesson 1: Introduction to Backpropagation" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lesson Type</label>
                <select value={lessonForm.type} onChange={e => setLessonForm({...lessonForm, type: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                  <option value="video">Video Lesson</option>
                  <option value="reading">Reading Material</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>YouTube Video Embed URL / Video Link</label>
                <input 
                  type="text" 
                  value={lessonForm.videoUrl} 
                  onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} 
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Notes / Summary Content</label>
                <textarea rows={3} value={lessonForm.notes} onChange={e => setLessonForm({...lessonForm, notes: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} placeholder="Lesson key takeaways and summary..." />
              </div>

              <button type="submit" className="btn-primary">
                {editingLessonId ? 'Update Lesson' : 'Add Lesson to Module'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MULTI-QUESTION QUIZ MODAL */}
      {showQuizModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                  Module Test & Question Studio
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Create & manage multiple questions for this assessment.
                </p>
              </div>
              <button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Test Global Configuration (Title, Time, Pass score) */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px' }}>
                ⚙️ Test Configuration
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Test Title</label>
                  <input 
                    type="text" 
                    required 
                    value={quizForm.title} 
                    onChange={e => setQuizForm({...quizForm, title: e.target.value})} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Time Limit (mins)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quizForm.timeLimit} 
                    onChange={e => setQuizForm({...quizForm, timeLimit: e.target.value})} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Passing Score %</label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={quizForm.passingScore} 
                    onChange={e => setQuizForm({...quizForm, passingScore: e.target.value})} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)' }} 
                  />
                </div>
              </div>
            </div>

            {/* List of Already Added Questions */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)' }}>
                  Questions in Test ({quizForm.questions.length})
                </span>
                {quizForm.questions.length === 0 && (
                  <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 600 }}>
                    ⚠️ No questions added yet. Use form below to add questions.
                  </span>
                )}
              </div>

              {quizForm.questions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {quizForm.questions.map((q, idx) => (
                    <div key={q.id || idx} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div style={{ overflow: 'hidden', paddingRight: '10px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          Q{idx + 1}. {q.question}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {q.options?.length || 0} Options • Correct Option: {q.correctAnswer + 1}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button 
                          type="button"
                          onClick={() => handleEditQuestionInQuiz(idx)}
                          style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteQuestionFromQuiz(idx)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Question Builder Form Box */}
            <div style={{ border: '2px dashed var(--primary)', borderRadius: 'var(--radius-lg)', padding: '20px', backgroundColor: 'rgba(0, 86, 210, 0.02)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> 
                  {editingQIndex !== null ? `Editing Question #${editingQIndex + 1}` : `Add Question #${quizForm.questions.length + 1} to Test`}
                </h4>

                {editingQIndex !== null && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingQIndex(null);
                      setQDraft({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)' }}>Question Text / Prompt</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Which algorithm is best suited for supervised classification?" 
                    value={qDraft.question} 
                    onChange={e => setQDraft({...qDraft, question: e.target.value})} 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--card-border)', marginTop: '4px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Multiple Choice Options</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <input type="text" placeholder="Option 1 (Required)" value={qDraft.opt1} onChange={e => setQDraft({...qDraft, opt1: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem' }} />
                    <input type="text" placeholder="Option 2 (Required)" value={qDraft.opt2} onChange={e => setQDraft({...qDraft, opt2: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem' }} />
                    <input type="text" placeholder="Option 3 (Optional)" value={qDraft.opt3} onChange={e => setQDraft({...qDraft, opt3: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem' }} />
                    <input type="text" placeholder="Option 4 (Optional)" value={qDraft.opt4} onChange={e => setQDraft({...qDraft, opt4: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Correct Answer Selection</label>
                    <select 
                      value={qDraft.correctAnswer} 
                      onChange={e => setQDraft({...qDraft, correctAnswer: e.target.value})} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', marginTop: '4px', fontWeight: 700, color: 'var(--navy)' }}
                    >
                      <option value={0}>Option 1 ({qDraft.opt1 || 'Option 1'})</option>
                      <option value={1}>Option 2 ({qDraft.opt2 || 'Option 2'})</option>
                      <option value={2}>Option 3 ({qDraft.opt3 || 'Option 3'})</option>
                      <option value={3}>Option 4 ({qDraft.opt4 || 'Option 4'})</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Explanation / Feedback</label>
                    <input 
                      type="text" 
                      placeholder="Explain why this option is correct..." 
                      value={qDraft.explanation} 
                      onChange={e => setQDraft({...qDraft, explanation: e.target.value})} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', marginTop: '4px', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleAddQuestionToQuiz}
                  className="btn-secondary"
                  style={{ marginTop: '6px', padding: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> 
                  {editingQIndex !== null ? 'Update Question in List' : '+ Add Question to Test List'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowQuizModal(false)}
                style={{ padding: '10px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)', backgroundColor: 'transparent', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveQuizToModule}
                className="btn-primary" 
                style={{ backgroundColor: '#D97706', padding: '10px 22px', fontSize: '0.92rem', fontWeight: 800 }}
              >
                💾 Save Complete Test to Module ({quizForm.questions.length + (qDraft.question.trim() ? 1 : 0)} Question(s))
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
