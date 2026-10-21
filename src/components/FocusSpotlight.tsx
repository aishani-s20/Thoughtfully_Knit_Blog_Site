import React, { useEffect, useRef } from 'react';
import { useExperience } from '../context/ExperienceContext.tsx';

interface FocusSpotlightProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const FocusSpotlight: React.FC<FocusSpotlightProps> = () => {
  const { spotlightEnabled, spotlightRadius, isFeatureEnabled } = useExperience();

  const mouseX = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 400);
  const mouseY = useRef(typeof window !== 'undefined' ? 300 : 300);

  const targetRelX = useRef(350);
  const targetRelY = useRef(200);
  const currentRelX = useRef(350);
  const currentRelY = useRef(200);

  const animFrameId = useRef<number | null>(null);
  const active = spotlightEnabled && isFeatureEnabled('focus_spotlight');

  useEffect(() => {
    if (!active) {
      const targetEl = document.getElementById('reading-prose') || document.documentElement;
      targetEl.style.setProperty('--focus-radius', '99999px');
      return;
    }

    const computeTargetCoordinates = () => {
      const readingEl = document.getElementById('reading-prose');
      if (readingEl) {
        const rect = readingEl.getBoundingClientRect();
        targetRelX.current = mouseX.current - rect.left;
        targetRelY.current = mouseY.current - rect.top;
      } else {
        targetRelX.current = mouseX.current;
        targetRelY.current = mouseY.current;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      computeTargetCoordinates();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        mouseX.current = e.touches[0].clientX;
        mouseY.current = e.touches[0].clientY;
        computeTargetCoordinates();
      }
    };

    const handleScroll = () => {
      computeTargetCoordinates();
    };

    // Smooth 60fps LERP loop
    const updatePosition = () => {
      const lerpFactor = 0.18;
      currentRelX.current += (targetRelX.current - currentRelX.current) * lerpFactor;
      currentRelY.current += (targetRelY.current - currentRelY.current) * lerpFactor;

      const targetEl = document.getElementById('reading-prose') || document.documentElement;
      targetEl.style.setProperty('--focus-x', `${Math.round(currentRelX.current)}px`);
      targetEl.style.setProperty('--focus-y', `${Math.round(currentRelY.current)}px`);
      targetEl.style.setProperty('--focus-radius', `${spotlightRadius}px`);

      animFrameId.current = requestAnimationFrame(updatePosition);
    };

    computeTargetCoordinates();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    animFrameId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [active, spotlightRadius]);

  return null;
};
