import React, { useEffect, useRef, useState } from 'react';
import './AnimatedBackground.css';

// Custom hook for smooth counting
function useCountUp(endValue, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(progress === 1 ? endValue : endValue * ease);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return count;
}

const StatCard = ({ title, value, suffix = '', delay = 0 }) => {
  const [show, setShow] = useState(false);
  const displayValue = useCountUp(show ? value : 0, 2500);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`ab-stat-card ${show ? 'ab-fade-in' : ''}`}>
      <div className="ab-stat-title">{title}</div>
      <div className="ab-stat-value">
        {Math.round(displayValue)}{suffix}
      </div>
    </div>
  );
};

export default function AnimatedBackground({ children }) {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Fetch live stats
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats(data);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (err) {
        // Graceful fallback mock data if API fails
        if (isMounted) {
          setStats({
            totalUnitsToday: 2450,
            activeMachines: 12,
            overallUptime: 96.4
          });
        }
      }
    };
    
    fetchStats();
    
    // Auto-update every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Mouse Parallax listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Node particle system
    const isMobile = width < 768;
    const nodeCount = isMobile ? 30 : 60;
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.2
      });
    }

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Parallax shift calculation
      const parallaxX = (mousePos.x - width / 2) * 0.05;
      const parallaxY = (mousePos.y - height / 2) * 0.05;

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        
        n.x += n.vx;
        n.y += n.vy;

        // Bounce off edges
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const drawX = n.x - parallaxX * (n.radius * 0.5);
        const drawY = n.y - parallaxY * (n.radius * 0.5);

        // Pulse effect
        const pulse = Math.sin(Date.now() * 0.002 + i) * 0.2;
        const currentAlpha = Math.max(0, Math.min(1, n.baseAlpha + pulse));

        ctx.beginPath();
        ctx.arc(drawX, drawY, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 195, 74, ${currentAlpha})`; // Country Garden Green
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          let n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const connectDist = isMobile ? 100 : 150;
          if (dist < connectDist) {
            const drawX2 = n2.x - parallaxX * (n2.radius * 0.5);
            const drawY2 = n2.y - parallaxY * (n2.radius * 0.5);
            
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(drawX2, drawY2);
            // Opacity falls off based on distance
            const lineAlpha = (1 - dist / connectDist) * 0.15;
            ctx.strokeStyle = `rgba(76, 175, 80, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <div className="ab-wrapper">
      <canvas ref={canvasRef} className="ab-canvas" />
      
      {/* Decorative Wave at the bottom */}
      <div className="ab-wave-container">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="ab-wave">
          <path fill="rgba(139, 195, 74, 0.05)" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Floating Stat Cards */}
      {stats && (
        <div className="ab-stats-container">
          <div className="ab-stat-pos ab-pos-1">
            <StatCard title="Active Machines" value={stats.activeMachines} delay={200} />
          </div>
          <div className="ab-stat-pos ab-pos-2">
            <StatCard title="Uptime (24h)" value={stats.overallUptime} suffix="%" delay={600} />
          </div>
          <div className="ab-stat-pos ab-pos-3">
            <StatCard title="Total Units Today" value={stats.totalUnitsToday} delay={1000} />
          </div>
        </div>
      )}

      {/* Main Content (Login/Register Form) */}
      <div className="ab-content-layer">
        {children}
      </div>
    </div>
  );
}
