import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COURSES } from '../data/seedCourses';
import { db, collection, getDocs, setDoc, doc, deleteDoc } from '../firebase';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Load initial state from LocalStorage if available, fallback to INITIAL_COURSES
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('useera_courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse stored courses", e);
      }
    }
    return INITIAL_COURSES;
  });

  // Enrollments state keyed by `userId_courseId`
  const [enrollments, setEnrollments] = useState(() => {
    const saved = localStorage.getItem('useera_enrollments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse stored enrollments", e);
      }
    }
    return {
      "demo-learner-123_useera-ai-01": {
        courseId: "useera-ai-01",
        userId: "demo-learner-123",
        enrolledAt: new Date().toISOString(),
        completedLessons: ["l1_1"],
        completedModules: [],
        quizResults: {
          "q1": { score: 100, passed: true, totalQuestions: 3, correctAnswers: 3, date: new Date().toISOString() }
        },
        progress: 35,
        isCompleted: false
      }
    };
  });

  // Save courses and enrollments to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('useera_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('useera_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  // Sync across tabs in real-time when localStorage updates in admin.html or index.html
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'useera_courses' && e.newValue) {
        try {
          setCourses(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Error syncing courses cross-tab:", err);
        }
      }
      if (e.key === 'useera_enrollments' && e.newValue) {
        try {
          setEnrollments(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Error syncing enrollments cross-tab:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync courses with Firebase Firestore on mount (merge with local custom courses)
  useEffect(() => {
    const syncFirestoreCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        if (!querySnapshot.empty) {
          const firestoreCoursesMap = new Map();
          querySnapshot.forEach((docSnap) => {
            firestoreCoursesMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });

          // Merge local custom courses so non-synced local edits are preserved
          setCourses(prevCourses => {
            const mergedMap = new Map();
            // First load firestore docs
            firestoreCoursesMap.forEach((val, key) => mergedMap.set(key, val));
            // Layer local courses on top
            prevCourses.forEach(c => mergedMap.set(c.id, c));
            
            const mergedList = Array.from(mergedMap.values());
            localStorage.setItem('useera_courses', JSON.stringify(mergedList));
            return mergedList;
          });
        } else {
          // Seed Firestore with initial courses if Firestore is empty
          INITIAL_COURSES.forEach(async (course) => {
            try {
              const cleanDoc = JSON.parse(JSON.stringify(course));
              await setDoc(doc(db, 'courses', course.id), cleanDoc);
            } catch (err) {
              console.warn(`Failed seeding course ${course.id} to Firestore:`, err);
            }
          });
        }
      } catch (e) {
        console.warn("Firestore sync running in local resilient mode:", e);
      }
    };

    syncFirestoreCourses();
  }, []);

  // Sync enrollments from Firebase Firestore when user changes
  useEffect(() => {
    if (!currentUser) return;
    const syncFirestoreEnrollments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'enrollments'));
        if (!querySnapshot.empty) {
          const userFirestoreEnrollments = {};
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.userId === currentUser.uid) {
              const key = `${data.userId}_${data.courseId}`;
              userFirestoreEnrollments[key] = data;
            }
          });

          setEnrollments(prev => {
            const merged = { ...prev, ...userFirestoreEnrollments };
            localStorage.setItem('useera_enrollments', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn("Firestore enrollments sync offline fallback:", err);
      }
    };
    syncFirestoreEnrollments();
  }, [currentUser]);

  const saveEnrollmentToFirestore = async (key, enrollmentData) => {
    try {
      const cleanData = JSON.parse(JSON.stringify(enrollmentData));
      await setDoc(doc(db, 'enrollments', key), cleanData, { merge: true });
    } catch (e) {
      console.warn("Firestore enrollment save fallback:", e);
    }
  };

  const enrollCourse = (courseId) => {
    if (!currentUser) return false;
    const key = `${currentUser.uid}_${courseId}`;
    if (enrollments[key]) return true;

    const newEnrollment = {
      courseId,
      userId: currentUser.uid,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      completedModules: [],
      quizResults: {},
      videoTimestamps: {},
      lastActiveLesson: null,
      progress: 0,
      isCompleted: false
    };

    const updated = {
      ...enrollments,
      [key]: newEnrollment
    };

    setEnrollments(updated);
    localStorage.setItem('useera_enrollments', JSON.stringify(updated));
    saveEnrollmentToFirestore(key, newEnrollment);
    return true;
  };

  const getEnrollment = (courseId) => {
    if (!currentUser) return null;
    return enrollments[`${currentUser.uid}_${courseId}`] || null;
  };

  const updateVideoProgress = (courseId, { moduleIndex, lessonId, timestamp }) => {
    if (!currentUser) return;
    const key = `${currentUser.uid}_${courseId}`;
    const enrollment = enrollments[key] || {
      courseId,
      userId: currentUser.uid,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      completedModules: [],
      quizResults: {},
      videoTimestamps: {},
      lastActiveLesson: null,
      progress: 0,
      isCompleted: false
    };

    const roundedTs = Math.floor(timestamp || 0);
    const updatedVideoTimestamps = {
      ...(enrollment.videoTimestamps || {}),
      [lessonId]: roundedTs
    };

    const updatedLastActiveLesson = {
      moduleIndex,
      lessonId,
      timestamp: roundedTs,
      updatedAt: new Date().toISOString()
    };

    const updatedEnrollment = {
      ...enrollment,
      videoTimestamps: updatedVideoTimestamps,
      lastActiveLesson: updatedLastActiveLesson
    };

    const updatedEnrollments = {
      ...enrollments,
      [key]: updatedEnrollment
    };

    setEnrollments(updatedEnrollments);
    localStorage.setItem('useera_enrollments', JSON.stringify(updatedEnrollments));
    saveEnrollmentToFirestore(key, updatedEnrollment);
  };

  const toggleLessonComplete = (courseId, lessonId) => {
    if (!currentUser) return;
    const key = `${currentUser.uid}_${courseId}`;
    const enrollment = enrollments[key];
    if (!enrollment) return;

    const currentLessons = enrollment.completedLessons || [];
    const isDone = currentLessons.includes(lessonId);
    const updatedLessons = isDone
      ? currentLessons.filter(id => id !== lessonId)
      : [...currentLessons, lessonId];

    const course = courses.find(c => c.id === courseId);
    let totalLessonsCount = 0;
    course?.modules?.forEach(m => {
      totalLessonsCount += m.lessons?.length || 0;
    });

    const progressPercentage = totalLessonsCount > 0 
      ? Math.min(100, Math.round((updatedLessons.length / totalLessonsCount) * 100))
      : 100;

    const isCompleted = progressPercentage >= 100;

    const updatedEnrollment = {
      ...enrollment,
      completedLessons: updatedLessons,
      progress: progressPercentage,
      isCompleted: isCompleted
    };

    const updatedEnrollments = {
      ...enrollments,
      [key]: updatedEnrollment
    };

    setEnrollments(updatedEnrollments);
    localStorage.setItem('useera_enrollments', JSON.stringify(updatedEnrollments));
    saveEnrollmentToFirestore(key, updatedEnrollment);
  };

  const submitQuizResult = (courseId, quizId, score, passed, detail) => {
    if (!currentUser) return;
    const key = `${currentUser.uid}_${courseId}`;
    const enrollment = enrollments[key] || {
      courseId,
      userId: currentUser.uid,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      completedModules: [],
      quizResults: {},
      videoTimestamps: {},
      lastActiveLesson: null,
      progress: 0,
      isCompleted: false
    };

    const updatedQuizResults = {
      ...(enrollment.quizResults || {}),
      [quizId]: {
        score,
        passed,
        ...detail,
        date: new Date().toISOString()
      }
    };

    const updatedEnrollment = {
      ...enrollment,
      quizResults: updatedQuizResults
    };

    const updatedEnrollments = {
      ...enrollments,
      [key]: updatedEnrollment
    };

    setEnrollments(updatedEnrollments);
    localStorage.setItem('useera_enrollments', JSON.stringify(updatedEnrollments));
    saveEnrollmentToFirestore(key, updatedEnrollment);
  };

  const saveCourse = async (courseData) => {
    // Sanitize course object to remove any undefined fields before saving
    const cleanCourseData = JSON.parse(JSON.stringify(courseData));

    const existingIndex = courses.findIndex(c => c.id === cleanCourseData.id);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...courses];
      updatedList[existingIndex] = cleanCourseData;
    } else {
      updatedList = [cleanCourseData, ...courses];
    }

    setCourses(updatedList);
    localStorage.setItem('useera_courses', JSON.stringify(updatedList));

    // Save directly to Firebase Firestore
    try {
      await setDoc(doc(db, 'courses', cleanCourseData.id), cleanCourseData);
      console.log(`Course ${cleanCourseData.id} saved to Firestore successfully.`);
    } catch (e) {
      console.warn("Firestore save course offline fallback:", e);
    }
  };

  const removeCourse = async (courseId) => {
    const updatedList = courses.filter(c => c.id !== courseId);
    setCourses(updatedList);
    localStorage.setItem('useera_courses', JSON.stringify(updatedList));

    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (e) {
      console.warn("Firestore delete course offline fallback:", e);
    }
  };

  return (
    <CourseContext.Provider value={{
      courses,
      enrollments,
      enrollCourse,
      getEnrollment,
      updateVideoProgress,
      toggleLessonComplete,
      submitQuizResult,
      saveCourse,
      removeCourse
    }}>
      {children}
    </CourseContext.Provider>
  );
};
