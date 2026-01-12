import React, { useEffect, useRef } from 'react';
import { ParticleConfig, AppState, EmotionState } from '../types';

interface ParticleCanvasProps {
  config: ParticleConfig;
  state: AppState;
  mousePos: { x: number; y: number };
  energy: number;
  onStatusChange?: (status: EmotionState) => void;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  canvas: HTMLCanvasElement;
  opacity: number = 1;
  isProtagonist: boolean = false;
  pulse: number = 0;
  hasArrived: boolean = false;
  
  wobbleAmount: number = 0;
  currentSpeed: number = 0;

  constructor(canvas: HTMLCanvasElement, size: number, speed: number, isProtagonist: boolean = false) {
    this.canvas = canvas;
    this.isProtagonist = isProtagonist;
    this.size = isProtagonist ? size * 1.8 : size;
    
    if (isProtagonist) {
      this.x = canvas.width / 2;
      this.y = -100;
      this.vx = 0;
      this.vy = 0;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
    }
  }

  update(speed: number, state: AppState, mouseX: number, mouseY: number, energy: number, onStatusChange?: (status: EmotionState) => void) {
    if (state === 'TRANSITIONING' && !this.isProtagonist) {
      const dx = this.x - this.canvas.width / 2;
      const dy = this.y - this.canvas.height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.vx += (dx / dist) * 0.05;
      this.vy += (dy / dist) * 0.05;
      this.opacity -= 0.003;
      this.x += this.vx;
      this.y += this.vy;
    } else if (state === 'GAME' && this.isProtagonist) {
      if (!this.hasArrived) {
        this.y += 0.4; 
        if (this.y >= this.canvas.height * 0.45) this.hasArrived = true;
      } else {
        if (energy <= 0) {
          // Motionless at energy 0
          this.currentSpeed *= 0.95;
          this.wobbleAmount *= 0.95;
          return;
        }

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let status: EmotionState = 'Tranquil';
        let targetWobble = 0;

        // Proximity-based emotions
        if (dist < 120) {
          status = 'Comfort';
          targetWobble = 0.05;
        } else if (dist < 280) {
          status = 'Tranquil';
          targetWobble = 0.15;
        } else if (dist < 500) {
          status = 'Anxiety';
          targetWobble = 0.6;
        } else if (dist < 750) {
          status = 'Fear';
          targetWobble = 1.2;
        } else {
          status = 'Panic';
          targetWobble = 2.5;
        }
        
        if (onStatusChange) onStatusChange(status);

        // Slow down as energy decreases
        const energyFactor = Math.max(0.1, energy / 100);
        const maxSpeed = 0.6 * energyFactor;
        const brakingDistance = 150;
        let targetSpeed = dist < brakingDistance ? (dist / brakingDistance) * maxSpeed : maxSpeed;
        if (dist < 2) targetSpeed = 0;

        this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.04;
        
        if (dist > 1) {
          this.x += (dx / dist) * this.currentSpeed;
          this.y += (dy / dist) * this.currentSpeed;
        }

        this.wobbleAmount += (targetWobble - this.wobbleAmount) * 0.05;
        const time = Date.now() * 0.0006;
        this.x += Math.sin(time * 2.1) * this.wobbleAmount * 0.15;
        this.y += Math.cos(time * 1.7) * this.wobbleAmount * 0.15;
        
        const pulseIncrement = (status === 'Panic' ? 0.08 : status === 'Fear' ? 0.04 : 0.02) * energyFactor;
        this.pulse += pulseIncrement;
      }
    } else {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > this.canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > this.canvas.height) this.vy = -this.vy;
    }
  }

  draw(ctx: CanvasRenderingContext2D, baseOpacity: number, mouseX: number, mouseY: number, energy: number) {
    if (this.opacity <= 0) return;
    
    if (this.isProtagonist) {
      const energyFactor = energy / 100;
      const breathingSize = this.size + Math.sin(this.pulse) * (0.4 * energyFactor);
      
      // Tether Ray
      const dist = Math.sqrt((mouseX - this.x)**2 + (mouseY - this.y)**2);
      if (this.hasArrived && dist < 300 && energy > 0) {
        const tetherAlpha = (1 - dist / 300) * 0.1 * energyFactor;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${tetherAlpha})`;
        ctx.setLineDash([3, 6]);
        ctx.lineWidth = 0.5;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Glow / Aura
      const glowAlpha = 0.03 * energyFactor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, breathingSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
      ctx.fill();

      // Core
      const coreAlpha = 0.3 + 0.6 * energyFactor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, breathingSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
      ctx.fill();
      
    } else {
      const finalOpacity = this.opacity * baseOpacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
      ctx.fill();
    }
  }
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ config, state, mousePos, energy, onStatusChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const protagonistRef = useRef<Particle | null>(null);
  const mouseRef = useRef(mousePos);

  useEffect(() => { mouseRef.current = mousePos; }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      const distLimit = config.connectionDistance;
      
      ctx.lineWidth = config.lineThickness;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distLimit) {
            const alpha = (1 - dist / distLimit) * config.baseOpacity * p1.opacity * p2.opacity;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const m = mouseRef.current;

      if (state !== 'GAME') {
        drawConnections();
        particlesRef.current.forEach(p => {
          p.update(config.speed, state, m.x, m.y, 100);
          p.draw(ctx, config.baseOpacity, m.x, m.y, 100);
        });
      }

      if (state === 'GAME') {
        if (!protagonistRef.current) protagonistRef.current = new Particle(canvas, config.particleSize, config.speed, true);
        protagonistRef.current.update(config.speed, state, m.x, m.y, energy, onStatusChange);
        protagonistRef.current.draw(ctx, config.baseOpacity, m.x, m.y, energy);
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: config.count }, () => new Particle(canvas, config.particleSize, config.speed));
    }
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [config, state, energy, onStatusChange]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default ParticleCanvas;