import React, { useEffect, useRef } from 'react';

export type AuraState = 'idle' | 'typing' | 'verifying' | 'rejected' | 'accepted';

interface SentientAuthAuraProps {
  state: AuraState;
  keystrokeCount: number;
  lastKeystrokeTime: number;
  onAnimationComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  angle: number;
  speed: number;
  crystal: boolean;
  shatterVx?: number;
  shatterVy?: number;
}

export const SentientAuthAura: React.FC<SentientAuthAuraProps> = ({
  state,
  keystrokeCount,
  lastKeystrokeTime,
  onAnimationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<AuraState>(state);
  const keystrokeRef = useRef({ count: keystrokeCount, time: lastKeystrokeTime });
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  stateRef.current = state;
  keystrokeRef.current = { count: keystrokeCount, time: lastKeystrokeTime };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      mouseRef.current.vx = nx - mouseRef.current.lastX;
      mouseRef.current.vy = ny - mouseRef.current.lastY;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
      mouseRef.current.lastX = nx;
      mouseRef.current.lastY = ny;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize particle pool
    const count = 90;
    const particles: Particle[] = [];
    const colors = ['#3b82f6', '#60a5fa', '#06b6d4', '#6366f1', '#10b981'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const radius = Math.random() * 80 + 40;
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 2,
        baseRadius: Math.random() * 3 + 2,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.7 + 0.3,
        angle,
        speed: 0.02 + Math.random() * 0.03,
        crystal: false
      });
    }

    let frame = 0;
    let phaseProgress = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;
      const cx = width / 2;
      const cy = height / 2;

      // Draw glowing background aura
      const auraGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
      if (currentState === 'rejected') {
        auraGradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        auraGradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
        auraGradient.addColorStop(1, 'transparent');
      } else if (currentState === 'accepted') {
        auraGradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        auraGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
        auraGradient.addColorStop(1, 'transparent');
      } else {
        auraGradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        auraGradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.12)');
        auraGradient.addColorStop(1, 'transparent');
      }

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      // Render connected fluid lines
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            ctx.strokeStyle = currentState === 'rejected'
              ? `rgba(239, 68, 68, ${0.4 * (1 - dist / 55)})`
              : currentState === 'accepted'
              ? `rgba(16, 185, 129, ${0.4 * (1 - dist / 55)})`
              : `rgba(96, 165, 250, ${0.35 * (1 - dist / 55)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and render individual particles based on state
      const isTyping = Date.now() - keystrokeRef.current.time < 500;
      const speedMultiplier = isTyping ? 2.5 : currentState === 'verifying' ? 4 : 1;

      particles.forEach((p, idx) => {
        if (currentState === 'rejected') {
          // Freeze into crystals then shatter violently outward
          if (!p.crystal) {
            p.crystal = true;
            p.shatterVx = (Math.random() - 0.5) * 16;
            p.shatterVy = (Math.random() - 0.5) * 16;
            p.color = '#ef4444';
          }
          p.x += p.shatterVx || 0;
          p.y += p.shatterVy || 0;
          p.alpha = Math.max(0, p.alpha - 0.015);

          // Draw sharp crystalline polygon
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(frame * 0.1);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, -p.radius * 2);
          ctx.lineTo(p.radius * 1.5, p.radius);
          ctx.lineTo(-p.radius * 1.5, p.radius);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

        } else if (currentState === 'accepted') {
          // Burst outward in a glowing wave towards top-right corner
          phaseProgress += 0.005;
          const targetX = width - 40;
          const targetY = 20;

          p.x += (targetX - p.x) * 0.08;
          p.y += (targetY - p.y) * 0.08;
          p.radius = Math.max(1, p.radius * 0.96);
          p.color = '#10b981';

          ctx.fillStyle = '#10b981';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

        } else {
          // Normal fluid wave & cadence movement
          p.angle += p.speed * (isTyping ? 2 : 1);
          const orbitRadius = 60 + Math.sin(frame * 0.05 + idx) * 20;

          // Influence by cursor micro-movements
          const mouseDistX = mouseRef.current.x - p.x;
          const mouseDistY = mouseRef.current.y - p.y;
          const distToMouse = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);

          if (distToMouse < 90) {
            p.x -= (mouseDistX / distToMouse) * 3;
            p.y -= (mouseDistY / distToMouse) * 3;
          }

          p.x += (cx + Math.cos(p.angle) * orbitRadius - p.x) * 0.05 * speedMultiplier;
          p.y += (cy + Math.sin(p.angle) * orbitRadius - p.y) * 0.05 * speedMultiplier;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (currentState === 'accepted' && onAnimationComplete && phaseProgress > 1.5) {
        onAnimationComplete();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onAnimationComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: 28,
        zIndex: 1
      }}
    />
  );
};
