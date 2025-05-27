'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceResponsiveButtonProps {
  readonly children: React.ReactNode;
  readonly getAudioData?: () => Uint8Array | null;
  readonly isListening?: boolean;
  readonly onClick?: () => void;
  readonly variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  readonly className?: string;
  readonly disabled?: boolean;
  readonly icon?: React.ReactNode;
}

export function VoiceResponsiveButton({
  children,
  getAudioData,
  isListening = false,
  onClick,
  variant = 'default',
  className,
  disabled = false,
  icon,
}: VoiceResponsiveButtonProps) {
  const [scale, setScale] = useState(1);
  const [glow, setGlow] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const errorRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isListening || !getAudioData) return;

    const updateButtonEffect = () => {
      try {
        const audioData = getAudioData();
        if (!audioData) {
          // If no data available, use subtle default animation
          const time = Date.now() / 1000;
          const pulseFactor = Math.sin(time * 3) * 0.01 + 1.01; // Subtle pulse between 1.0 and 1.02
          setScale(pulseFactor);
          setGlow(5);
        } else {
          // Calculate average volume
          const average =
            audioData.reduce((sum, value) => sum + value, 0) / audioData.length;

          // Normalize to 0-1 range with some amplification
          const normalizedVolume = Math.min(average / 128, 1);

          // Apply effects based on volume
          setScale(1 + normalizedVolume * 0.05); // Subtle scale effect
          setGlow(normalizedVolume * 15); // Glow effect
        }

        if (!errorRef.current) {
          animationRef.current = requestAnimationFrame(updateButtonEffect);
        }
      } catch (err) {
        console.error('Error updating button effects:', err);
        errorRef.current = true;

        // Set default animation values
        setScale(1.01);
        setGlow(5);
      }
    };

    // Reset error state when listening state changes
    errorRef.current = false;
    animationRef.current = requestAnimationFrame(updateButtonEffect);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Reset effects
      setScale(1);
      setGlow(0);
    };
  }, [isListening, getAudioData]);

  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 transition-all duration-100',
        isListening && 'animate-pulse',
        className,
      )}
      style={{
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${glow}px ${glow / 2}px rgba(59, 130, 246, ${glow / 30})`,
      }}
    >
      {icon}
      {children}
    </Button>
  );
}
