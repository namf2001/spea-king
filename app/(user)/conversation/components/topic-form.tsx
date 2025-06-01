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
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConversationTopic } from '@prisma/client';

type FormValues = z.infer<typeof conversationTopicSchema>;

// Define the props for the form component
interface TopicFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  topic?: ConversationTopic;
  mode?: 'create' | 'edit';
}

export default function TopicForm({
  onCancel,
  onSuccess,
  topic,
  mode = 'create',
}: TopicFormProps) {
  const [isPending, startTransition] = useTransition();
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
  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        let response;

        if (isEditMode && topic) {
          response = await updateConversationTopic(topic.id, data);
        } else {
          response = await createConversationTopic(data);
        }

        if (!response.success) {
          // Handle specific error cases
          if (
            response.error?.message &&
            response.error.message.includes('already exists')
          ) {
            throw new Error(
              'Topic already exists. Please use a different title for this topic',
            );
          }
          throw new Error(response.error?.message || 'Failed to save topic');
        }

        // Handle success
        toast.success(
          isEditMode ? 'Topic updated successfully' : 'Topic created successfully',
          {
            description: isEditMode
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
        if (!isEditMode) {
          router.push('/conversation/topics');
        }
      } catch (error) {
        const errorMessage = 'Failed to save topic';
        const errorDescription =
          error instanceof Error ? error.message : 'An unknown error occurred';

        // Display different error message for "already exists" error
        if (errorDescription.includes('already exists')) {
          toast.error('Topic already exists', {
            description: 'Please use a different title for this topic',
          });
          return;
        }

        toast.error(errorMessage, {
          description: errorDescription,
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
              <FormLabel>Topic Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter topic title"
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for this topic"
                  {...field}
                  disabled={isPending}
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
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
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
