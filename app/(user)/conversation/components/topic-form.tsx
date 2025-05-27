'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { conversationTopicSchema } from '@/schemas/conversation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  createConversationTopic,
  updateConversationTopic,
} from '@/app/actions/conversation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConversationTopic } from '@prisma/client';

type FormValues = z.infer<typeof conversationTopicSchema>;

// Define the props for the form component
interface TopicFormProps {
  userId: string;
  onCancel: () => void;
  onSuccess: () => void;
  topic?: ConversationTopic;
  mode?: 'create' | 'edit';
}

export default function TopicForm({
  userId,
  onCancel,
  onSuccess,
  topic,
  mode = 'create',
}: TopicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditMode = mode === 'edit';

  // Initialize form with default values or existing topic data
  const form = useForm<FormValues>({
    resolver: zodResolver(conversationTopicSchema),
    defaultValues: {
      title: topic?.title || '',
      description: topic?.description || '',
    },
  });

  // Reset the form when topic changes (for edit mode)
  useEffect(() => {
    if (topic) {
      form.reset({
        title: topic.title,
        description: topic.description ?? '', // Convert null to empty string
      });
    }
  }, [topic, form]);

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      let response;

      if (isEditMode && topic) {
        response = await updateConversationTopic(topic.id, data);
      } else {
        response = await createConversationTopic(data);
      }

      if (response.success) {
        handleSuccess(isEditMode);
      } else {
        handleError(response.error?.message);
      }
    } catch (error) {
      toast.error('Error submitting form', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful form submission
  const handleSuccess = (isEdit: boolean) => {
    toast.success(
      isEdit ? 'Topic updated successfully' : 'Topic created successfully',
      {
        description: isEdit
          ? 'Your changes have been saved'
          : 'Redirecting to topics page...',
      },
    );

    // Reset the form
    form.reset();

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }

    // In create mode, redirect to the topics page after a short delay
    if (!isEdit) {
      router.push('/conversation/topics');
    }
  };

  // Handle form submission errors
  const handleError = (error?: string) => {
    const errorMessage = 'Failed to save topic';
    const errorDescription = error || 'An unknown error occurred';

    // Display different error message for "already exists" error
    if (error && error.includes('already exists')) {
      toast.error('Topic already exists', {
        description: 'Please use a different title for this topic',
      });
      return;
    }

    toast.error(errorMessage, {
      description: errorDescription,
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
              <FormLabel>Topic Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter topic title"
                  {...field}
                  disabled={isSubmitting}
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for this topic"
                  {...field}
                  disabled={isSubmitting}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Topic' : 'Create Topic'}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
