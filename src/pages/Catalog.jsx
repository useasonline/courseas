import React, { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useCourses } from '../context/CourseContext';

export default function Catalog({ searchQuery, setSearchQuery, onSelectCourse, onEnroll, onLearn }) {
  const { courses } = useCourses();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const dynamicCategories = Array.from(new Set((courses || []).map(c => c.category).filter(Boolean)));
  const categories = ["All", ...dynamicCategories];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = searchQuery === "" || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
            Course Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Explore {courses.length} high-impact courses, complete modules, and earn certificates.
          </p>
        </div>

        {/* Filters Bar */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Category Pills */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Category
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`badge-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Difficulty Level:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {levels.map((lvl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLevel(lvl)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: selectedLevel === lvl ? 'var(--navy)' : 'transparent',
                    color: selectedLevel === lvl ? '#FFF' : 'var(--text-muted)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#DC2626', background: 'none' }}
              >
                Clear search filter "{searchQuery}"
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredCourses.length}</strong> courses available
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid-courses">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse}
                onEnroll={onEnroll}
                onLearn={onLearn}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No matching courses found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Try relaxing your search query or filters.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All'); }} className="btn-primary">
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
