'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, CheckCircle, Loader2, Edit } from 'lucide-react';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { lessonSchema } from '@/schemas/pronunciation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  createPronunciationLesson,
  updatePronunciationLesson,
} from '@/app/actions/pronunciation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  PronunciationLesson,
  PronunciationWord,
  PronunciationLessonWord,
} from '@prisma/client';
import { WordAutocomplete } from './word-autocomplete';

type FormValues = z.infer<typeof lessonSchema>;

type LessonWithWords = PronunciationLesson & {
  words: (PronunciationLessonWord & {
    word: PronunciationWord;
  })[];
};

interface LessonFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  lesson?: LessonWithWords;
  mode?: 'create' | 'edit';
}

// Rename the component to reflect its dual purpose
export default function LessonForm({
  onCancel,
  onSuccess,
  lesson,
  mode = 'create',
}: LessonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = mode === 'edit' && lesson;

  // Initialize form with default values or existing lesson data if in edit mode
  const form = useForm<FormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: isEditMode ? lesson.title : '',
      words: isEditMode
        ? lesson.words.map((lessonWord) => ({
            id: lessonWord.id,
            word: lessonWord.word.word,
          }))
        : [{ id: nanoid(), word: '' }],
    },
  });

  // Update form when lesson changes (important for modal reopening)
  useEffect(() => {
    if (isEditMode) {
      form.reset({
        title: lesson.title,
        words: lesson.words.map((lessonWord) => ({
          id: lessonWord.id,
          word: lessonWord.word.word,
        })),
      });
    }
  }, [lesson, isEditMode, form]);

  // Function to add a new word field
  const addWord = () => {
    const currentWords = form.getValues('words') || [];
    form.setValue('words', [...currentWords, { id: nanoid(), word: '' }], {
      shouldValidate: true,
    });
  };

  // Function to remove a word field
  const removeWord = (id: string) => {
    const currentWords = form.getValues('words') || [];
    if (currentWords.length <= 1) return; // Always keep at least one word

    form.setValue(
      'words',
      currentWords.filter((word) => word.id !== id),
      { shouldValidate: true },
    );
  };

  // Handle form submission - either create or update based on mode
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      let response;

      if (isEditMode) {
        response = await updatePronunciationLesson(lesson.id, data);
      } else {
        response = await createPronunciationLesson(data);
      }

      if (response.success) {
        toast.success(
          response.error?.message ??
            (isEditMode ? 'Đã cập nhật bài học' : 'Đã tạo bài học'),
          {
            description: isEditMode
              ? 'Bài học đã được cập nhật thành công'
              : 'Đang chuyển hướng đến trang bài học...',
          },
        );

        // Reset the form
        form.reset();

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Refresh the page data to show the updated lesson
        router.refresh();
      } else {
        toast.error(
          isEditMode ? 'Không thể cập nhật bài học' : 'Không thể tạo bài học',
          {
            description:
              response.error?.message || 'Đã xảy ra lỗi không xác định',
          },
        );
      }
    } catch (error) {
      toast.error(
        isEditMode ? 'Lỗi khi cập nhật bài học' : 'Lỗi khi tạo bài học',
        {
          description:
            error instanceof Error
              ? error.message
              : 'Đã xảy ra lỗi không xác định',
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề bài học</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: 'Các âm nguyên khó phát âm'"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Từ vựng</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addWord}
              disabled={isSubmitting}
            >
              <Plus className="mr-1 h-4 w-4" /> Thêm từ
            </Button>
          </div>

          {form.formState.errors.words?.message && (
            <p className="text-destructive text-sm">
              {form.formState.errors.words.message}
            </p>
          )}

          {form.watch('words')?.map((wordItem, index) => (
            <div key={wordItem.id} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name={`words.${index}.word`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <WordAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Nhập một từ"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeWord(wordItem.id)}
                disabled={
                  (form.watch('words')?.length || 0) <= 1 || isSubmitting
                }
                className="mt-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Cập nhật bài học
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Thêm bài học
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
