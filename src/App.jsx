import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider, useCourses } from './context/CourseContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import LearnView from './pages/LearnView';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function MainAppContent() {
  const [activePage, setActivePage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { enrollCourse } = useCourses();
  const { currentUser } = useAuth();

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnroll = (course) => {
    if (!currentUser) {
      setActivePage('login');
      return;
    }
    enrollCourse(course.id);
    setSelectedCourse(course);
    setActivePage('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLearn = (course) => {
    setSelectedCourse(course);
    setActivePage('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {activePage !== 'learn' && (
        <Navbar 
          activePage={activePage}
          setActivePage={setActivePage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <Home 
            setActivePage={setActivePage}
            setSearchQuery={setSearchQuery}
            onSelectCourse={handleSelectCourse}
            onEnroll={handleEnroll}
            onLearn={handleLearn}
          />
        )}

        {activePage === 'catalog' && (
          <Catalog 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectCourse={handleSelectCourse}
            onEnroll={handleEnroll}
            onLearn={handleLearn}
          />
        )}

        {activePage === 'detail' && selectedCourse && (
          <CourseDetail 
            course={selectedCourse}
            onEnroll={handleEnroll}
            onLearn={handleLearn}
          />
        )}

        {activePage === 'learn' && selectedCourse && (
          <LearnView 
            course={selectedCourse}
            onBack={() => setActivePage('catalog')}
          />
        )}

        {activePage === 'dashboard' && (
          <Dashboard 
            setActivePage={setActivePage}
            onLearn={handleLearn}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {activePage === 'login' && (
          <Login setActivePage={setActivePage} />
        )}
      </main>

      {activePage !== 'learn' && (
        <Footer setActivePage={setActivePage} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <MainAppContent />
      </CourseProvider>
    </AuthProvider>
  );
}
