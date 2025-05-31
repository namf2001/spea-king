'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchVocabularyExercises } from '@/app/actions/vocabulary';
import type { VocabularyExercise, VocabularyPair, ExerciseResult } from '@prisma/client';

interface VocabularySearchProps {
    onSearchResults: (results: Array<VocabularyExercise & {
        pairs: VocabularyPair[];
        results: ExerciseResult[];
    }> | null) => void;
}

export function VocabularySearch({ onSearchResults }: VocabularySearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isMountedRef = useRef(true);

    // Set up cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Perform search when debounced search term changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchTerm.trim().length === 0) {
                onSearchResults(null);
                return;
            }

            setIsSearching(true);
            try {
                const response = await searchVocabularyExercises(debouncedSearchTerm);
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    onSearchResults(response.success ? response.data || [] : []);
                }
            } catch (error) {
                console.error('Error searching exercises:', error);
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    onSearchResults([]);
                }
            } finally {
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    setIsSearching(false);
                }
            }
        };

        performSearch();
    }, [debouncedSearchTerm, onSearchResults]);

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        onSearchResults(null);
    };

    return (
        <div className="relative mb-6">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Tìm kiếm bài tập từ vựng..."
                    className="pl-8 pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 px-2"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {isSearching && (
                <div className="absolute right-3 top-2.5 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            )}
        </div>
    );
}