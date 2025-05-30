'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchPronunciationWords } from '@/app/actions/pronunciation';

interface WordSuggestion {
  id: string;
  word: string;
}

interface WordAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function WordAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = 'Nhập một từ',
  disabled = false,
  className,
}: WordAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search - chỉ search khi input được focus và có value
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (value && value.length >= 1 && isFocused) {
        setIsLoading(true);
        try {
          const response = await searchPronunciationWords(value);
          if (response.success && response.data) {
            setSuggestions(response.data);
            setIsOpen(response.data.length > 0);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        } catch (error) {
          console.error('Error searching words:', error);
          setSuggestions([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [value, isFocused]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          selectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: WordSuggestion) => {
    onChange(suggestion.word);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setIsFocused(false);
        onBlur?.();
      }
    }, 200);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Chỉ mở suggestions nếu đã có value và suggestions
    if (suggestions.length > 0 && value) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-8',
            isOpen && 'border-blue-500 ring-1 ring-blue-500',
          )}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          ) : (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180',
              )}
            />
          )}
        </div>
      </div>

      {/* Danh sách gợi ý - chỉ hiển thị khi input được focus và có suggestions */}
      {isOpen && suggestions.length > 0 && isFocused && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg dark:bg-gray-800">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                index === highlightedIndex && 'bg-blue-50 dark:bg-blue-900/20',
                'focus:bg-blue-50 focus:outline-none dark:focus:bg-blue-900/20',
              )}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="font-medium">{suggestion.word}</span>
              {index === highlightedIndex && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
