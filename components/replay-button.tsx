'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Repeat, Loader2 } from 'lucide-react';

interface ReplayButtonProps {
  readonly onReplay: () => void;
  readonly disabled?: boolean;
  readonly label?: string;
}

export function ReplayButton({
  onReplay,
  disabled = false,
  label = 'Replay My Voice',
}: ReplayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReplay = () => {
    setIsPlaying(true);
    onReplay();

    // Reset playing state after a short delay
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000); // Assuming most recordings are short
  };

  return (
    <Button
      onClick={handleReplay}
      variant="ghost"
      size="sm"
      disabled={disabled || isPlaying}
      className="flex items-center gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900"
    >
      {isPlaying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Playing...</span>
        </>
      ) : (
        <>
          <Repeat className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
