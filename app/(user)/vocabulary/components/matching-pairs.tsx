'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, X, Heart, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

export interface PairItem {
  id: string;
  text: string;
  matchId: string;
  isEnglish: boolean;
}

interface MatchingPairsProps {
  readonly pairs: { english: PairItem; vietnamese: PairItem }[];
  readonly onComplete: (
    score: number,
    timeSpent: number,
    attempts: number,
  ) => void;
  readonly className?: string;
}

// Enhanced pair management interface
interface ManagedPair {
  id: string; // Unique pair identifier
  english: PairItem;
  vietnamese: PairItem;
  isMatched: boolean;
  isVisible: boolean;
}

const BATCH_SIZE = 5; // Số từ hiển thị mỗi lần
const MAX_LIVES = 5; // Số mạng tối đa

export function MatchingPairs({
  pairs,
  onComplete,
  className,
}: MatchingPairsProps) {
  // Enhanced state management with proper pair tracking
  const [managedPairs, setManagedPairs] = useState<ManagedPair[]>([]);
  const [selectedItem, setSelectedItem] = useState<PairItem | null>(null);
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [lives, setLives] = useState(MAX_LIVES);

  // Enhanced state for tracking shuffled order
  const [shuffledEnglishOrder, setShuffledEnglishOrder] = useState<string[]>([]);
  const [shuffledVietnameseOrder, setShuffledVietnameseOrder] = useState<string[]>([]);

  // Celebration animation state
  const [celebrationItems, setCelebrationItems] = useState<Array<{id: string, x: number, y: number}>>([]);

  // Utility function for proper array shuffling (Fisher-Yates algorithm)
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create a reliable matching lookup map
  const matchingMap = useMemo(() => {
    const map = new Map<string, string>();
    pairs.forEach(({ english, vietnamese }) => {
      // Ensure bidirectional mapping for reliable lookups
      map.set(english.id, vietnamese.id);
      map.set(vietnamese.id, english.id);
    });
    return map;
  }, [pairs]);

  // Initialize managed pairs with proper shuffling and validation
  useEffect(() => {
    // Validate input pairs first
    const validatedPairs = pairs.filter(({ english, vietnamese }) => {
      const isValid = english?.id && vietnamese?.id && english.text && vietnamese.text;
      if (!isValid) {
        console.warn('Invalid pair detected:', { english, vietnamese });
      }
      return isValid;
    });

    if (validatedPairs.length === 0) {
      console.error('No valid pairs found');
      return;
    }

    // Shuffle the pairs first BEFORE creating managed pairs
    const shuffledValidatedPairs = shuffleArray(validatedPairs);

    // Create managed pairs with unique identifiers
    const initialManagedPairs: ManagedPair[] = shuffledValidatedPairs.map((pair, index) => ({
      id: `pair-${Date.now()}-${index}`, // More unique pair identifier
      english: pair.english,
      vietnamese: pair.vietnamese,
      isMatched: false,
      isVisible: index < BATCH_SIZE, // First batch is visible (now from shuffled order)
    }));

    setManagedPairs(initialManagedPairs);

    // Create separate shuffled orders for display
    const visiblePairs = initialManagedPairs.filter(pair => pair.isVisible);
    const initialEnglishIds = visiblePairs.map(pair => pair.english.id);
    const initialVietnameseIds = visiblePairs.map(pair => pair.vietnamese.id);
    
    // Shuffle the display order independently
    setShuffledEnglishOrder(shuffleArray(initialEnglishIds));
    setShuffledVietnameseOrder(shuffleArray(initialVietnameseIds));
  }, [pairs]);

  // Update shuffled orders when new words become visible
  useEffect(() => {
    const currentVisiblePairs = managedPairs.filter(pair => pair.isVisible && !pair.isMatched);
    if (currentVisiblePairs.length > 0) {
      // Get current English and Vietnamese IDs
      const englishIds = currentVisiblePairs.map(pair => pair.english.id);
      const vietnameseIds = currentVisiblePairs.map(pair => pair.vietnamese.id);
      
      // Only update if the visible items have changed
      const prevEnglishSet = new Set(shuffledEnglishOrder);
      const prevVietnameseSet = new Set(shuffledVietnameseOrder);
      
      const englishChanged = englishIds.length !== shuffledEnglishOrder.length || 
        !englishIds.every(id => prevEnglishSet.has(id));
      const vietnameseChanged = vietnameseIds.length !== shuffledVietnameseOrder.length || 
        !vietnameseIds.every(id => prevVietnameseSet.has(id));
      
      if (englishChanged) {
        setShuffledEnglishOrder(shuffleArray(englishIds));
      }
      if (vietnameseChanged) {
        setShuffledVietnameseOrder(shuffleArray(vietnameseIds));
      }
    }
  }, [managedPairs, shuffledEnglishOrder, shuffledVietnameseOrder]);

  // Computed values based on managed pairs with proper shuffling
  const visibleEnglishWords = useMemo(() => {
    const visiblePairs = managedPairs.filter(pair => pair.isVisible && !pair.isMatched);
    const pairMap = new Map(visiblePairs.map(pair => [pair.english.id, pair.english]));
    
    // Return words in the shuffled order
    return shuffledEnglishOrder
      .map(id => pairMap.get(id))
      .filter(Boolean) as PairItem[];
  }, [managedPairs, shuffledEnglishOrder]);

  const visibleVietnameseWords = useMemo(() => {
    const visiblePairs = managedPairs.filter(pair => pair.isVisible && !pair.isMatched);
    const pairMap = new Map(visiblePairs.map(pair => [pair.vietnamese.id, pair.vietnamese]));
    
    // Return words in the shuffled order
    return shuffledVietnameseOrder
      .map(id => pairMap.get(id))
      .filter(Boolean) as PairItem[];
  }, [managedPairs, shuffledVietnameseOrder]);

  const completedPairs = useMemo(() => {
    return managedPairs.filter(pair => pair.isMatched).length;
  }, [managedPairs]);

  const matchedItemIds = useMemo(() => {
    return new Set(
      managedPairs
        .filter(pair => pair.isMatched)
        .flatMap(pair => [pair.english.id, pair.vietnamese.id])
    );
  }, [managedPairs]);

  // Enhanced function to manage word visibility with proper pair relationships
  const updateWordVisibility = (matchedPairId: string) => {
    setManagedPairs(prev => {
      const updatedPairs = [...prev];
      
      // Mark the matched pair as completed
      const matchedPairIndex = updatedPairs.findIndex(pair => pair.id === matchedPairId);
      if (matchedPairIndex !== -1) {
        updatedPairs[matchedPairIndex] = {
          ...updatedPairs[matchedPairIndex],
          isMatched: true,
        };
      }

      // Calculate how many pairs should be visible
      const remainingUnmatchedPairs = updatedPairs.filter(pair => !pair.isMatched);
      const currentVisibleCount = updatedPairs.filter(pair => pair.isVisible && !pair.isMatched).length - 1; // -1 for the just matched pair
      
      // If we need more visible pairs and have remaining pairs
      if (currentVisibleCount < BATCH_SIZE && remainingUnmatchedPairs.length > currentVisibleCount) {
        // Find the next unmatched, invisible pair to make visible
        const nextPairToShow = updatedPairs.find(pair => !pair.isMatched && !pair.isVisible);
        if (nextPairToShow) {
          const nextPairIndex = updatedPairs.findIndex(pair => pair.id === nextPairToShow.id);
          if (nextPairIndex !== -1) {
            updatedPairs[nextPairIndex] = {
              ...updatedPairs[nextPairIndex],
              isVisible: true,
            };
          }
        }
      }

      return updatedPairs;
    });
  };

  // Helper function to handle correct matches with celebration
  const handleCorrectMatch = (selectedItem: PairItem, item: PairItem) => {
    const matchedPair = managedPairs.find(pair => 
      (pair.english.id === selectedItem.id && pair.vietnamese.id === item.id) ||
      (pair.english.id === item.id && pair.vietnamese.id === selectedItem.id)
    );

    if (matchedPair) {
      // Trigger celebration animation
      triggerCelebration();
      
      updateWordVisibility(matchedPair.id);

      // Check if exercise is complete
      const newCompletedCount = completedPairs + 1;
      if (newCompletedCount >= pairs.length) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const score = Math.max(0, Math.floor(100 - (attempts * 5)));
        setTimeout(() => {
          onComplete(score, timeSpent, attempts + 1);
        }, 1000);
      }
    }
  };

  // Celebration animation function
  const triggerCelebration = () => {
    const newItems = Array.from({ length: 8 }, (_, i) => ({
      id: `celebration-${Date.now()}-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    
    setCelebrationItems(newItems);
    
    // Remove celebration items after animation
    setTimeout(() => {
      setCelebrationItems([]);
    }, 2000);
  };

  // Helper function to handle incorrect matches
  const handleIncorrectMatch = (selectedItem: PairItem, item: PairItem) => {
    setIncorrectPairs(prev => new Set([...prev, selectedItem.id, item.id]));

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      onComplete(
        0,
        Math.floor((Date.now() - startTime) / 1000),
        attempts + 1,
      );
      return;
    }

    setTimeout(() => {
      setIncorrectPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedItem.id);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1000);
  };

  // Helper function to validate if two items match
  const validateMatch = (selectedItem: PairItem, item: PairItem): boolean => {
    const expectedMatchId = matchingMap.get(selectedItem.id);
    return expectedMatchId === item.id;
  };

  // Enhanced item click handler with reduced complexity
  const handleItemClick = (item: PairItem) => {
    // Ignore if item is already matched
    if (matchedItemIds.has(item.id)) return;

    // Clear incorrect feedback for this item
    if (incorrectPairs.has(item.id)) {
      setIncorrectPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.id === item.id) {
      setSelectedItem(null);
      return;
    }

    // Check if trying to select same language type
    if (selectedItem.isEnglish === item.isEnglish) {
      setSelectedItem(item);
      return;
    }

    // Different language types - validate match
    setAttempts(prev => prev + 1);
    const isCorrectMatch = validateMatch(selectedItem, item);

    if (isCorrectMatch) {
      handleCorrectMatch(selectedItem, item);
      setTimeout(() => setSelectedItem(null), 500);
    } else {
      handleIncorrectMatch(selectedItem, item);
      setTimeout(() => setSelectedItem(null), 1000);
    }
  };

  // Enhanced styling function with celebration animation
  const getItemStyle = (item: PairItem) => {
    if (matchedItemIds.has(item.id)) {
      return 'border-green-500 bg-green-50 text-green-700 opacity-50';
    }
    if (incorrectPairs.has(item.id)) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    if (selectedItem?.id === item.id) {
      return 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200';
    }
    return 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md';
  };

  const progressPercentage = (completedPairs / pairs.length) * 100;
  const isMobile = useIsMobile();

  return (
    <div className={cn('flex flex-col gap-6 relative', className)}>
      {/* Celebration Animation Overlay */}
      <AnimatePresence>
        {celebrationItems.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {celebrationItems.map((item) => (
              <motion.div
                key={item.id}
                className="absolute"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                initial={{ 
                  scale: 0, 
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{ 
                  scale: [0, 1.5, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [1, 1, 1, 0],
                  y: [-20, -60, -40, 20],
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut",
                }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* Progress Bar with 3 sections */}
        <div className="relative flex-1">
          <div className="h-3.5 w-full rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-[#4755FB]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* 3 checkpoint indicators */}
          <div className="absolute top-0 left-0 flex w-full items-center justify-between">
            {[0, 50, 100].map((checkpoint) => {
              const isCompleted = progressPercentage >= checkpoint;

              return (
                <motion.div
                  key={`checkpoint-${checkpoint}`}
                  className={`-mt-2.5 flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted ? 'bg-[#4755FB] text-white' : 'bg-gray-200'
                  }`}
                  animate={isCompleted ? {
                    scale: [1, 1.2, 1],
                    backgroundColor: '#4755FB'
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* Current progress indicator */}
          <div className="absolute -top-2.5 -right-2">
            <motion.div 
              className="flex h-8 w-12 items-center justify-center rounded-lg border-2 border-[#4755FB] bg-white text-sm font-medium text-[#4755FB]"
              animate={completedPairs > 0 ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {completedPairs}/{pairs.length}
            </motion.div>
          </div>
        </div>
        {/* Lives Display */}
        <div className="flex gap-2">
          {isMobile ? (
            <div className="relative flex items-center justify-center">
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
              <span className="absolute font-medium text-white">{lives}</span>
            </div>
          ) : (
            <div className="flex gap-1">
              {Array.from({ length: MAX_LIVES }, (_, index) => (
                <motion.div
                  key={`life-${index + 1}`}
                  animate={index >= lives ? {
                    scale: [1, 0.8, 1],
                    opacity: [1, 0.3, 0.3]
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={cn(
                      'h-6 w-6',
                      index < lives
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-300',
                    )}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 items-center justify-center gap-4">
        {/* English Column */}
        <div className="space-y-3">
          {visibleEnglishWords.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full rounded-lg border p-4 text-left',
                'flex min-h-[60px] items-center justify-between text-lg font-medium',
                getItemStyle(item),
              )}
              disabled={matchedItemIds.has(item.id)}
              whileHover={!matchedItemIds.has(item.id) ? { scale: 1.02 } : {}}
              whileTap={!matchedItemIds.has(item.id) ? { scale: 0.98 } : {}}
              animate={matchedItemIds.has(item.id) ? {
                scale: [1, 1.1, 1],
                backgroundColor: 'rgb(240 253 244)'
              } : {}}
              transition={{ duration: 0.3 }}
            >
              <span>{item.text}</span>
              <div>
                {matchedItemIds.has(item.id) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </motion.div>
                )}
                {incorrectPairs.has(item.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="h-5 w-5 text-red-600" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Vietnamese Column */}
        <div className="space-y-3">
          {visibleVietnameseWords.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full rounded-lg border p-4 text-left',
                'flex min-h-[60px] items-center justify-between text-lg font-medium',
                getItemStyle(item),
              )}
              disabled={matchedItemIds.has(item.id)}
              whileHover={!matchedItemIds.has(item.id) ? { scale: 1.02 } : {}}
              whileTap={!matchedItemIds.has(item.id) ? { scale: 0.98 } : {}}
              animate={matchedItemIds.has(item.id) ? {
                scale: [1, 1.1, 1],
                backgroundColor: 'rgb(240 253 244)'
              } : {}}
              transition={{ duration: 0.3 }}
            >
              <span>{item.text}</span>
              <div>
                {matchedItemIds.has(item.id) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </motion.div>
                )}
                {incorrectPairs.has(item.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="h-5 w-5 text-red-600" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
