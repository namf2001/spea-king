'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, X, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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

const BATCH_SIZE = 5; // Số từ hiển thị mỗi lần
const MAX_LIVES = 5; // Số mạng tối đa

export function MatchingPairs({
  pairs,
  onComplete,
  className,
}: MatchingPairsProps) {
  const [allEnglishWords, setAllEnglishWords] = useState<PairItem[]>([]);
  const [allVietnameseWords, setAllVietnameseWords] = useState<PairItem[]>([]);
  const [visibleEnglishWords, setVisibleEnglishWords] = useState<PairItem[]>(
    [],
  );
  const [visibleVietnameseWords, setVisibleVietnameseWords] = useState<
    PairItem[]
  >([]);
  const [selectedItem, setSelectedItem] = useState<PairItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completedPairs, setCompletedPairs] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);

  // Initialize và shuffle words
  useEffect(() => {
    const englishWords = pairs
      .map((p) => p.english)
      .sort(() => Math.random() - 0.5);
    const vietnameseWords = pairs
      .map((p) => p.vietnamese)
      .sort(() => Math.random() - 0.5);

    setAllEnglishWords(englishWords);
    setAllVietnameseWords(vietnameseWords);

    // Hiển thị batch đầu tiên
    setVisibleEnglishWords(englishWords.slice(0, BATCH_SIZE));
    setVisibleVietnameseWords(vietnameseWords.slice(0, BATCH_SIZE));
  }, [pairs]);

  // Function để thêm từ mới vào visible list
  const addNewWordsToVisible = (
    matchedEnglishId: string,
    matchedVietnameseId: string,
  ) => {
    const totalPairs = pairs.length;
    const remainingPairs = totalPairs - completedPairs - 1; // -1 vì sắp complete 1 pair

    // Nếu còn ít hơn BATCH_SIZE pairs thì không thêm từ mới, chỉ ẩn từ đã match
    if (remainingPairs < BATCH_SIZE) {
      return;
    }

    // Tìm từ tiếng Anh mới để thêm vào
    const nextEnglishWord = allEnglishWords.find(
      (word) =>
        !visibleEnglishWords.some((visible) => visible.id === word.id) &&
        !matchedPairs.has(word.id),
    );

    // Tìm từ tiếng Việt mới để thêm vào
    const nextVietnameseWord = allVietnameseWords.find(
      (word) =>
        !visibleVietnameseWords.some((visible) => visible.id === word.id) &&
        !matchedPairs.has(word.id),
    );

    // Thay thế từ đã match bằng từ mới tại cùng vị trí
    if (nextEnglishWord) {
      setVisibleEnglishWords((prev) =>
        prev.map((word) =>
          word.id === matchedEnglishId ? nextEnglishWord : word,
        ),
      );
    } else {
      // Nếu không có từ mới, loại bỏ từ đã match
      setVisibleEnglishWords((prev) =>
        prev.filter((word) => word.id !== matchedEnglishId),
      );
    }

    if (nextVietnameseWord) {
      setVisibleVietnameseWords((prev) =>
        prev.map((word) =>
          word.id === matchedVietnameseId ? nextVietnameseWord : word,
        ),
      );
    } else {
      // Nếu không có từ mới, loại bỏ từ đã match
      setVisibleVietnameseWords((prev) =>
        prev.filter((word) => word.id !== matchedVietnameseId),
      );
    }
  };

  const handleItemClick = (item: PairItem) => {
    // Ignore if item is already matched
    if (matchedPairs.has(item.id)) return;

    // Clear incorrect feedback
    if (incorrectPairs.has(item.id)) {
      setIncorrectPairs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }

    if (!selectedItem) {
      // First selection
      setSelectedItem(item);
    } else if (selectedItem.id !== item.id) {
      // Check if trying to select same language type
      if (selectedItem.isEnglish === item.isEnglish) {
        // Same language type - replace selection
        setSelectedItem(item);
        return;
      }

      // Different language types - check for match
      setAttempts((prev) => prev + 1);

      if (
        selectedItem.matchId === item.id ||
        item.matchId === selectedItem.id
      ) {
        // Match found
        const newMatchedPairs = new Set([
          ...matchedPairs,
          selectedItem.id,
          item.id,
        ]);
        setMatchedPairs(newMatchedPairs);

        const newCompletedPairs = completedPairs + 1;
        setCompletedPairs(newCompletedPairs);

        // Check if exercise is complete
        if (newCompletedPairs >= pairs.length) {
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const score = Math.max(0, Math.floor(100 - attempts * 5)); // Deduct 5 points per incorrect attempt
          setTimeout(() => {
            onComplete(score, timeSpent, attempts + 1);
          }, 1000);
        } else {
          // Add new words to visible list and remove matched ones - no delay
          addNewWordsToVisible(selectedItem.id, item.id);
        }
      } else {
        // Incorrect match - show feedback and reduce lives
        setIncorrectPairs(
          (prev) => new Set([...prev, selectedItem.id, item.id]),
        );

        // Reduce lives
        const newLives = lives - 1;
        setLives(newLives);

        // Check if game over
        if (newLives <= 0) {
          setGameOver(true);
          setTimeout(() => {
            onComplete(
              0,
              Math.floor((Date.now() - startTime) / 1000),
              attempts + 1,
            );
          }, 1500);
        }

        setTimeout(() => {
          setIncorrectPairs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(selectedItem.id);
            newSet.delete(item.id);
            return newSet;
          });
        }, 1000);
      }

      // Reset selection
      setTimeout(() => setSelectedItem(null), 500);
    } else {
      // Clicking the same item - deselect
      setSelectedItem(null);
    }
  };

  const getItemStyle = (item: PairItem) => {
    if (matchedPairs.has(item.id)) {
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
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center gap-4">
        {/* Progress Bar with 3 sections */}
        <div className="relative flex-1">
          <div className="h-3.5 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#4755FB] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* 3 checkpoint indicators */}
          <div className="absolute top-0 left-0 flex w-full items-center justify-between">
            {[0, 50, 100].map((checkpoint, index) => {
              const isCompleted = progressPercentage >= checkpoint;

              return (
                <div
                  key={index}
                  className={`-mt-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-[#4755FB] text-white' : 'bg-gray-200'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </div>
              );
            })}
          </div>
          {/* Current progress indicator */}
          <div className="absolute -top-2.5 -right-2">
            <div className="flex h-8 w-12 items-center justify-center rounded-lg border-2 border-[#4755FB] bg-white text-sm font-medium text-[#4755FB]">
              {completedPairs}/{pairs.length}
            </div>
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
              {Array.from({ length: MAX_LIVES }).map((_, index) => (
                <Heart
                  key={index}
                  className={cn(
                    'h-6 w-6 transition-all duration-300',
                    index < lives
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-300',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 items-center justify-center gap-4">
        {/* English Column */}
        <div className="space-y-3">
          <AnimatePresence>
            {visibleEnglishWords.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-all duration-200',
                  'flex min-h-[60px] items-center justify-between text-lg font-medium',
                  getItemStyle(item),
                )}
                disabled={matchedPairs.has(item.id)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  scale: selectedItem?.id === item.id ? 1.02 : 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1,
                  transition: { duration: 0 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                  mass: 0.5,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{item.text}</span>
                {matchedPairs.has(item.id) && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {incorrectPairs.has(item.id) && (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Vietnamese Column */}
        <div className="space-y-3">
          <AnimatePresence>
            {visibleVietnameseWords.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-all duration-200',
                  'flex min-h-[60px] items-center justify-between text-lg font-medium',
                  getItemStyle(item),
                )}
                disabled={matchedPairs.has(item.id)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  scale: selectedItem?.id === item.id ? 1.02 : 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1,
                  transition: { duration: 0 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                  mass: 0.5,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{item.text}</span>
                {matchedPairs.has(item.id) && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {incorrectPairs.has(item.id) && (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {/* Game Over Message */}
      {gameOver && (
        <div className="bg-opacity-50 absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Game Over</h2>
            <p className="mb-4 text-gray-700">
              Bạn đã hết mạng. Vui lòng thử lại.
            </p>
            <button
              onClick={() => {
                setGameOver(false);
                setAttempts(0);
                setCompletedPairs(0);
                setLives(MAX_LIVES);
                setMatchedPairs(new Set());
                setIncorrectPairs(new Set());
                setVisibleEnglishWords(allEnglishWords.slice(0, BATCH_SIZE));
                setVisibleVietnameseWords(
                  allVietnameseWords.slice(0, BATCH_SIZE),
                );
              }}
              className="rounded-lg bg-[#4755FB] px-4 py-2 text-white transition-all duration-200 hover:bg-[#3748a1]"
            >
              Chơi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
