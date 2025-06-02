'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2, Save, X } from 'lucide-react';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import {
  createReflexQuestion,
  updateReflexQuestion,
} from '@/app/actions/reflex';
import { suggestUserAnswer } from '@/app/actions/speech';
import { ReflexQuestion } from '@prisma/client';
import { reflexSchema } from '@/schemas/reflex';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface QuestionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  question?: ReflexQuestion;
  mode: 'create' | 'edit';
}

export default function QuestionForm({
  onSuccess,
  onCancel,
  question,
  mode,
}: QuestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [wordLimit, setWordLimit] = useState(75);

  const form = useForm<z.infer<typeof reflexSchema>>({
    resolver: zodResolver(reflexSchema),
    defaultValues: {
      question: question?.question || '',
      answer: question?.answer || '',
    },
  });

  // Function to handle AI-generated answer
  const handleGenerateAnswer = async () => {
    const currentQuestion = form.getValues('question');

    if (!currentQuestion || currentQuestion.length < 5) {
      form.setError('question', {
        type: 'manual',
        message: 'Vui lòng nhập câu hỏi hợp lệ (ít nhất 5 ký tự)',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await suggestUserAnswer(
        currentQuestion,
        wordLimit,
        brandPoint,
      );

      if (response.success && response.data) {
        form.setValue('answer', response.data.response);
      } else {
        setError(
          'Không thể tạo câu trả lời. Vui lòng thử lại hoặc viết câu trả lời của riêng bạn.',
        );
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      setError('Đã xảy ra lỗi khi tạo câu trả lời. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add brand point selection
  const [brandPoint, setBrandPoint] = useState<string>('6.0');

  // Function to handle brand point change
  const handleBrandPointChange = (value: string) => {
    setBrandPoint(value);
  };

  const onSubmit = (values: z.infer<typeof reflexSchema>) => {
    setError('');

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const response = await createReflexQuestion({
            question: values.question,
            answer: values.answer,
          });

          if (!response.success) {
            throw new Error(response.error?.message || 'Không thể tạo câu hỏi');
          }
        } else if (mode === 'edit' && question) {
          const response = await updateReflexQuestion(question.id, {
            question: values.question,
            answer: values.answer,
          });

          if (!response.success) {
            throw new Error(
              response.error?.message || 'Không thể cập nhật câu hỏi',
            );
          }
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Đã xảy ra lỗi không mong muốn');
        }
      }
    });
  };

  return (
    <div className="space-y-4 pt-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Câu hỏi</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập câu hỏi bạn muốn luyện tập trả lời"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setQuestionText(e.target.value);
                    }}
                    disabled={isPending || isGenerating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleGenerateAnswer}
                  disabled={isPending || isGenerating || !questionText.trim()}
                  title={
                    !questionText.trim()
                      ? 'Vui lòng nhập câu hỏi trước'
                      : 'Tạo câu trả lời bằng AI'
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Đang tạo câu trả lời {wordLimit} từ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>Tạo câu trả lời {wordLimit} từ với AI</span>
                    </>
                  )}
                </Button>
              </div>
              <Slider
                value={[wordLimit]}
                min={70}
                max={100}
                step={5}
                onValueChange={(value) => setWordLimit(value[0])}
                disabled={isPending || isGenerating || !questionText.trim()}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-primary text-xs font-medium">ĐIỂM IELTS</p>
                <div className="flex items-center gap-2">
                  <Select
                    value={brandPoint}
                    onValueChange={handleBrandPointChange}
                    disabled={isPending || isGenerating || !questionText.trim()}
                  >
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue placeholder="6.0" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.0">4.0</SelectItem>
                      <SelectItem value="5.0">5.0</SelectItem>
                      <SelectItem value="6.0">6.0</SelectItem>
                      <SelectItem value="6.5">6.5</SelectItem>
                      <SelectItem value="7.0">7.0</SelectItem>
                      <SelectItem value="7.5">7.5</SelectItem>
                      <SelectItem value="8.0">8.0</SelectItem>
                      <SelectItem value="8.5">8.5</SelectItem>
                      <SelectItem value="9.0">9.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Câu trả lời</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhấp 'Tạo với AI' hoặc viết câu trả lời của riêng bạn"
                    className="min-h-[150px]"
                    {...field}
                    disabled={isPending || isGenerating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending || isGenerating}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || isGenerating}
              className="gap-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu câu hỏi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
