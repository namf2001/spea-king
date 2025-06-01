'use client';

import { startTransition, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import { Loader2, Plus, Save, Trash2, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DialogFooter } from '@/components/ui/dialog';
import {
  vocabularyExerciseSchema,
  VocabularyExerciseFormValues,
} from '@/schemas/vocabulary';
import {
  createVocabularyExercise,
  updateVocabularyExercise,
} from '@/app/actions/vocabulary';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VocabularyPair {
  id?: string;
  englishWord: string;
  vietnameseWord: string;
}

interface VocabularyExercise {
  id: string;
  title: string;
  description: string | null;
  pairs: VocabularyPair[];
}

interface VocabularyFormProps {
  mode?: 'create' | 'edit';
  exercise?: VocabularyExercise;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VocabularyForm({
  mode = 'create',
  exercise,
  onSuccess,
  onCancel,
}: VocabularyFormProps) {
  const isEditMode = mode === 'edit' && exercise;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Initialize the form
  const form = useForm<VocabularyExerciseFormValues>({
    resolver: zodResolver(vocabularyExerciseSchema),
    defaultValues: isEditMode
      ? {
          title: exercise.title,
          description: exercise.description || '',
          pairs: exercise.pairs.map((pair) => ({
            id: pair.id,
            englishWord: pair.englishWord,
            vietnameseWord: pair.vietnameseWord,
          })),
        }
      : {
          title: '',
          description: '',
          pairs: [{ id: nanoid(), englishWord: '', vietnameseWord: '' }],
        },
  });

  // Setup field array for vocabulary pairs
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'pairs',
  });

  // Add a new word pair field
  const addWordPair = () => {
    append({ id: nanoid(), englishWord: '', vietnameseWord: '' });
  };

  // Handle form submission
  const onSubmit = (data: VocabularyExerciseFormValues) => {
    startTransition(async () => {
      try {
        // Process the data for submission
        const pairs = data.pairs.map((pair) => ({
          id: pair.id,
          englishWord: pair.englishWord.trim(),
          vietnameseWord: pair.vietnameseWord.trim(),
        }));

        let response;
        if (isEditMode && exercise) {
          response = await updateVocabularyExercise(
            exercise.id,
            data.title.trim(),
            data.description?.trim() || null,
            pairs,
          );
        } else {
          response = await createVocabularyExercise(
            data.title.trim(),
            data.description?.trim() || null,
            pairs,
          );
        }

        if (!response.success) {
          throw new Error(response.error?.message || 'Đã xảy ra lỗi không xác định');
        }

        // Handle success
        const message = isEditMode
          ? 'Đã cập nhật bài tập từ vựng'
          : 'Đã tạo bài tập từ vựng mới';
        const description = isEditMode
          ? 'Bài tập từ vựng của bạn đã được cập nhật thành công'
          : 'Bài tập từ vựng của bạn đã được tạo thành công';

        toast.success(message, { description });

        if (!isEditMode) {
          form.reset();
        }

        if (onSuccess) {
          onSuccess();
        }

        router.refresh();
      } catch (error) {
        const errorTitle = isEditMode
          ? 'Lỗi khi cập nhật bài tập từ vựng'
          : 'Lỗi khi tạo bài tập từ vựng';

        toast.error(errorTitle, {
          description:
            error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề bài tập</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: Từ vựng về thời tiết"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả về bài tập từ vựng này"
                  className="min-h-[80px] resize-none"
                  {...field}
                  value={field.value || ''}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Các cặp từ vựng</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addWordPair}
              disabled={isPending}
            >
              <Plus className="mr-1 h-4 w-4" /> Thêm cặp từ
            </Button>
          </div>

          {form.formState.errors.pairs?.message && (
            <p className="text-destructive text-sm">
              {form.formState.errors.pairs.message}
            </p>
          )}

          <ScrollArea className="h-[300px] rounded-md border pr-4">
            <div className="space-y-4 p-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-start gap-3"
                >
                  <FormField
                    control={form.control}
                    name={`pairs.${index}.englishWord`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Từ tiếng Anh"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`pairs.${index}.vietnameseWord`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Từ tiếng Việt"
                            {...field}
                            disabled={isPending}
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
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1 || isPending}
                    className="mt-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" /> Hủy
            </Button>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Tạo bài tập
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
