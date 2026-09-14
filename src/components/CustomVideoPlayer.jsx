import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Maximize2,
  Minimize, 
  Settings,
  PictureInPicture
} from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

export default function CustomVideoPlayer({ videoUrl, title, initialTime = 0, onTimeUpdate, onEnded }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastReportedTimeRef = useRef(0);
  const loadedVideoUrlRef = useRef(null);
  const pipWindowRef = useRef(null);
  const parentContainerRef = useRef(null);

  // Preserve initial start parameter for iframe src so it doesn't reload during playback
  const [initialStartSec, setInitialStartSec] = useState(() => Math.floor(initialTime || 0));

  const extractedId = extractYouTubeId(videoUrl);
  const isDirectVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm'));
  const isYouTube = !isDirectVideo;
  const ytVideoId = extractedId || 'aircAruvnKk';

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(0); // Dynamic duration detected from video metadata
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Send PostMessage command to YouTube iframe
  const sendYtCommand = (func, args = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const argArray = Array.isArray(args) ? args : (args !== '' ? [args] : []);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: argArray }),
        '*'
      );
    }
  };

  // Ping YouTube iframe with listening handshake and request duration
  const pingYtIframe = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'getDuration', args: [] }),
        '*'
      );
    }
  };

  // Periodically query YouTube iframe for video duration & listening handshake
  useEffect(() => {
    if (!isYouTube) return;

    pingYtIframe();
    const interval = setInterval(() => {
      pingYtIframe();
    }, 1000);

    return () => clearInterval(interval);
  }, [isYouTube, ytVideoId, videoUrl]);

  // Handle mouse movement for auto-hiding controls (like YouTube/Netflix)
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSpeedMenu(false);
      }, 2500); // Auto-hide after 2.5 seconds of inactivity
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      handleMouseMove();
    }
  }, [isPlaying]);

  // Initialize or reset player position ONLY when video URL changes (or on initial mount)
  useEffect(() => {
    if (loadedVideoUrlRef.current === videoUrl) return;
    loadedVideoUrlRef.current = videoUrl;

    setIsPlaying(false);
    setDuration(0);
    const startSec = initialTime || 0;
    setInitialStartSec(Math.floor(startSec));
    setCurrentTime(startSec);
    lastReportedTimeRef.current = startSec;
    setControlsVisible(true);

    if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = startSec;
      videoRef.current.pause();
    } else if (isYouTube) {
      const timer = setTimeout(() => {
        sendYtCommand('seekTo', [startSec, true]);
        sendYtCommand('pauseVideo');
        pingYtIframe();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [videoUrl, initialTime, isDirectVideo, isYouTube]);

  // Report time updates to parent component for Firebase persistence (debounced every 5 seconds)
  useEffect(() => {
    if (onTimeUpdate && Math.abs(currentTime - lastReportedTimeRef.current) >= 5) {
      lastReportedTimeRef.current = currentTime;
      onTimeUpdate(currentTime);
    }
  }, [currentTime, onTimeUpdate]);

  // Listen to postMessage responses from YouTube iframe
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) {
            setCurrentTime(data.info.currentTime);
          }
          if (data.info.duration !== undefined && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (data.info.playerState !== undefined) {
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
            if (data.info.playerState === 0) {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded]);

  // Smooth local timer ticker while playing
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (onEnded) onEnded();
            return duration;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, onEnded]);

  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    setControlsVisible(true);

    if (isYouTube) {
      sendYtCommand(nextPlaying ? 'playVideo' : 'pauseVideo');
    } else if (videoRef.current) {
      if (nextPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const seekRelative = (seconds) => {
    const targetTime = Math.min(Math.max(0, currentTime + seconds), duration);
    setCurrentTime(targetTime);
    handleMouseMove();

    if (isYouTube) {
      sendYtCommand('seekTo', [targetTime, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetTime = (clickX / rect.width) * duration;
    setCurrentTime(targetTime);
    handleMouseMove();

    if (isYouTube) {
      sendYtCommand('seekTo', [targetTime, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    handleMouseMove();

    if (isYouTube) {
      sendYtCommand('setVolume', [val * 100]);
      if (val === 0) sendYtCommand('mute');
      else sendYtCommand('unMute');
    } else if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    handleMouseMove();

    if (isYouTube) {
      sendYtCommand(nextMute ? 'mute' : 'unMute');
    } else if (videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    handleMouseMove();

    if (isYouTube) {
      sendYtCommand('setPlaybackRate', [speed]);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePip = async () => {
    // 1. Exit HTML5 video PiP if active
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (e) {}
      setIsPipActive(false);
      return;
    }

    // 2. Direct MP4 video files can use browser native HTML5 Picture-in-Picture
    if (isDirectVideo && videoRef.current && videoRef.current.requestPictureInPicture) {
      try {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
        return;
      } catch (err) {
        console.log('HTML5 video PiP error:', err);
      }
    }

    // 3. YouTube Embeds: Toggle Docked Floating Mini-Player (keeps iframe in main DOM tree, avoiding YouTube Error 153)
    setIsPipActive(prev => !prev);
  };

  useEffect(() => {
    const handlePipLeave = () => setIsPipActive(false);
    document.addEventListener('leavepictureinpicture', handlePipLeave);
    return () => document.removeEventListener('leavepictureinpicture', handlePipLeave);
  }, []);

  // Keyboard Shortcuts: Spacebar / K to play/pause, Arrow keys to seek 10s, M to mute, F to fullscreen, P to PiP
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keyboard shortcuts when typing in inputs or textareas
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, isMuted, isYouTube]);

  const formatTime = (secs) => {
    if (isNaN(secs) || !secs || secs <= 0) return '0:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Placeholder in original position when video is popped out to Picture-in-Picture */}
      {isPipActive && (
        <div style={{
          width: '100%',
          height: '480px',
          backgroundColor: '#F8FAFC',
          border: '2px dashed #CBD5E1',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          color: '#1E293B',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)'
          }}>
            <PictureInPicture size={32} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>
            Playing in Picture-in-Picture
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '-4px 0 6px 0' }}>
            Video is running in a floating mini-player
          </p>

          <button
            onClick={() => setIsPipActive(false)}
            style={{
              backgroundColor: '#0056D2',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 86, 210, 0.3)',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>Return to video</span>
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {/* Main Video Player Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          position: isPipActive ? 'fixed' : 'relative',
          bottom: isPipActive ? '24px' : 'auto',
          right: isPipActive ? '24px' : 'auto',
          width: isPipActive ? '420px' : '100%',
          zIndex: isPipActive ? 9999 : 1,
          backgroundColor: '#000',
          borderRadius: isFullscreen || isPipActive ? '14px' : 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: isPipActive ? '0 24px 60px rgba(0,0,0,0.85), 0 0 0 2px #0056D2' : '0 10px 30px rgba(0,0,0,0.3)',
          userSelect: 'none',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
      {/* Mini-player close title bar when docked in floating corner mode */}
      {isPipActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '32px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: '#38BDF8',
          fontSize: '0.78rem',
          fontWeight: 700,
          zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span>📺 Picture-in-Picture Mini-Player</span>
          <button
            onClick={() => setIsPipActive(false)}
            style={{
              background: 'none',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}
            title="Exit Mini-Player"
          >
            ✕
          </button>
        </div>
      )}

      {/* Video Container Area - Cropped to hide YouTube Title Bar & Watermark Logo */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: isFullscreen ? '100vh' : (isPipActive ? '236px' : '480px'), 
        marginTop: isPipActive ? '32px' : '0px',
        overflow: 'hidden' 
      }}>
        {isYouTube ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&autohide=1&start=${initialStartSec}`}
            title={title || 'Course Lesson Video'}
            onLoad={() => {
              pingYtIframe();
              setTimeout(pingYtIframe, 500);
              setTimeout(pingYtIframe, 1200);
            }}
            style={{ 
              position: 'absolute', 
              top: '-48px', 
              left: '-2px', 
              width: 'calc(100% + 4px)', 
              height: 'calc(100% + 96px)', 
              border: 'none',
              transform: 'scale(1.05)',
              pointerEvents: isPlaying ? 'auto' : 'none' 
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
          />
        )}
      </div>

      {/* Invisible Click Surface over Video to Toggle Play/Pause & Show Controls */}
      <div 
        onClick={togglePlay}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '50px',
          cursor: 'pointer',
          zIndex: 5
        }}
      />

      {/* Big Center Play Overlay Button when paused */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#0056D2',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 26px rgba(0,86,210,0.6)',
            zIndex: 10,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
        >
          <Play size={36} style={{ marginLeft: '4px' }} />
        </div>
      )}

      {/* Custom Coursera Bottom Controls Bar with YouTube Auto-Hide Idle Animation */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 0) 100%)',
        padding: '12px 20px 14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: isPlaying ? (controlsVisible ? 1 : 0) : 1,
        pointerEvents: isPlaying && !controlsVisible ? 'none' : 'auto',
        transition: 'opacity 0.3s ease',
        zIndex: 20
      }}>

        {/* Scrub / Progress Bar */}
        <div 
          onClick={handleSeek}
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            backgroundColor: '#0056D2',
            borderRadius: '3px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
              boxShadow: '0 0 6px rgba(56, 189, 248, 0.8)'
            }} />
          </div>
        </div>

        {/* Player Controls Bar Row matching user screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFF', fontSize: '0.9rem', paddingTop: '4px' }}>
          
          {/* Left Controls: Play/Pause, Volume, Rewind 10s, Time Counter, Forward 10s */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            <button 
              onClick={togglePlay}
              style={{ background: 'none', color: '#FFF', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={toggleMute} style={{ background: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '60px', accentColor: '#0056D2', cursor: 'pointer' }}
              />
            </div>

            <button 
              onClick={() => seekRelative(-10)}
              style={{ 
                background: 'none', 
                color: '#FFF', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
              title="Rewind 10 seconds"
            >
              <RotateCcw size={16} /> 10
            </button>

            {/* Time Counter matching screenshot e.g. 0:02 / 6:55 */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace', color: '#F1F5F9' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button 
              onClick={() => seekRelative(10)}
              style={{ 
                background: 'none', 
                color: '#FFF', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
              title="Forward 10 seconds"
            >
              10 <RotateCw size={16} />
            </button>
          </div>

          {/* Right Controls: Playback Speed, Settings Gear, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FFF',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '36px',
                  right: 0,
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '6px 0',
                  width: '90px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  zIndex: 50
                }}>
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <div
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: playbackSpeed === spd ? 700 : 400,
                        color: playbackSpeed === spd ? '#38BDF8' : '#FFF',
                        cursor: 'pointer',
                        backgroundColor: playbackSpeed === spd ? 'rgba(56, 189, 248, 0.15)' : 'transparent'
                      }}
                    >
                      {spd}x {spd === 1 ? '(Normal)' : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              style={{ background: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <button 
              onClick={togglePip}
              style={{ 
                background: isPipActive ? 'rgba(56, 189, 248, 0.25)' : 'none', 
                color: isPipActive ? '#38BDF8' : '#FFF', 
                border: 'none',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center' 
              }}
              title="Picture-in-Picture (PiP)"
            >
              <PictureInPicture size={18} />
            </button>

            <button 
              onClick={toggleFullscreen}
              style={{ background: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

          </div>

        </div>

      </div>
    </div>
  </>
);
}
