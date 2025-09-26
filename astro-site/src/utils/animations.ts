/**
 * Shared animation utilities for consistent animations across all sections
 */

export interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
}

/**
 * Initialize intersection observer for scroll animations
 */
export function initScrollAnimations(
  selector: string,
  animationClass: string,
  options: AnimationOptions = {}
): void {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Apply animation class immediately without animation
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add(animationClass);
      el.classList.add('no-animation');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove(animationClass);
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => observer.observe(el));

  // Return cleanup function
  return () => {
    elements.forEach(el => observer.unobserve(el));
    observer.disconnect();
  };
}

/**
 * Animated counter for statistics
 */
export function animateCounter(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 2000,
  suffix: string = ''
): void {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = end + suffix;
    return;
  }

  const range = end - start;
  const increment = range / (duration / 16); // 60 FPS
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + suffix;
  }, 16);
}

/**
 * Stagger animation for lists
 */
export function staggerAnimation(
  selector: string,
  animationClass: string,
  delay: number = 100
): void {
  const elements = document.querySelectorAll(selector);

  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add(animationClass);
    }, delay * index);
  });
}

/**
 * Floating animation for decorative elements
 */
export function createFloatingAnimation(
  element: HTMLElement,
  amplitude: number = 20,
  duration: number = 3
): void {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  element.style.animation = `floating ${duration}s ease-in-out infinite`;

  // Add the keyframes if they don't exist
  if (!document.querySelector('#floating-animation')) {
    const style = document.createElement('style');
    style.id = 'floating-animation';
    style.textContent = `
      @keyframes floating {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-${amplitude}px); }
        100% { transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Performance-optimized particle system
 */
export class ParticleSystem {
  private particles: HTMLElement[] = [];
  private container: HTMLElement;
  private animationFrame: number | null = null;
  private maxParticles: number;

  constructor(container: HTMLElement, maxParticles: number = 10) {
    this.container = container;
    this.maxParticles = maxParticles;

    // Reduce particles if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.maxParticles = Math.max(3, Math.floor(maxParticles / 3));
    }
  }

  start(): void {
    this.createParticles();
    this.animate();
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.particles.forEach(p => p.remove());
    this.particles = [];
  }

  private createParticles(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(99, 102, 241, 0.5);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `;
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  private animate = (): void => {
    this.particles.forEach(particle => {
      const currentTop = parseFloat(particle.style.top);
      let newTop = currentTop - 0.5;

      if (newTop < -5) {
        newTop = 105;
        particle.style.left = `${Math.random() * 100}%`;
      }

      particle.style.top = `${newTop}%`;
    });

    this.animationFrame = requestAnimationFrame(this.animate);
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}