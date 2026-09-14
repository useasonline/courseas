import React from 'react';
import { Star, Clock, BookOpen, Users, Award, PlayCircle } from 'lucide-react';
import { useCourses } from '../context/CourseContext';

export default function CourseCard({ course, onSelectCourse, onEnroll, onLearn }) {
  const { getEnrollment } = useCourses();
  const enrollment = getEnrollment(course.id);

  return (
    <div className="course-card">
      {/* Thumbnail Header */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
        <img 
          src={course.image} 
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {course.badge && (
          <span 
            className={course.badge === 'Bestseller' ? 'badge-bestseller' : 'badge-certificate'}
            style={{ position: 'absolute', top: '12px', left: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          >
            {course.badge}
          </span>
        )}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#FFF',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={12} /> {course.duration}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Partner & Instructor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1rem' }}>{course.partnerLogo || '🏛️'}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {course.partner}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectCourse(course)}
            style={{ 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              lineHeight: 1.35, 
              marginBottom: '8px',
              cursor: 'pointer',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {course.title}
          </h3>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Instructor: <strong style={{ color: 'var(--text-main)' }}>{course.instructor}</strong>
          </p>
        </div>

        <div>
          {/* Rating & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span style={{ fontWeight: 800, color: '#B25900' }}>{course.rating}</span>
            <div style={{ display: 'flex', color: '#F4A100' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(course.rating) ? '#F4A100' : 'none'} />
              ))}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({course.reviewsCount?.toLocaleString()})</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> {course.enrolledCount?.toLocaleString()}
            </span>
          </div>

          {/* Progress or Action Button */}
          {enrollment ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Progress</span>
                <span>{enrollment.progress}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${enrollment.progress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
              </div>
              <button 
                onClick={() => onLearn(course)}
                className="btn-primary" 
                style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
              >
                <PlayCircle size={16} /> Continue Learning
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--card-border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Course Fee</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)' }}>
                  {course.price === 0 ? 'FREE' : `$${course.price}`}
                </span>
              </div>
              <button 
                onClick={() => onEnroll(course)}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
