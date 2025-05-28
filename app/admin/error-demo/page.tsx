'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Bug,
  Mic,
  Volume2,
  Zap,
  Wifi,
  Database,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// Demo component để test error boundaries
export default function ErrorBoundaryDemo() {
  const [errorType, setErrorType] = useState<string | null>(null);

  const triggerError = (type: string) => {
    setErrorType(type);

    switch (type) {
      case 'speech':
        throw new Error('NotAllowedError: Microphone permission denied');
      case 'pronunciation':
        throw new Error('Network error: Failed to fetch pronunciation data');
      case 'reflex':
        throw new Error('Performance error: Timer resolution too low');
      case 'generic':
        throw new Error('Generic application error occurred');
      case 'network':
        throw new Error('NetworkError: fetch failed to connect');
      case 'permission':
        throw new Error('PermissionError: Camera access denied');
      case 'timeout':
        throw new Error('TimeoutError: Request took too long');
      default:
        throw new Error('Unknown error type');
    }
  };

  const errorScenarios = [
    {
      id: 'speech',
      title: 'Speech Recognition Error',
      description: 'Simulates microphone permission error',
      icon: Mic,
      color: 'orange',
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation Assessment Error',
      description: 'Simulates network connection error',
      icon: Volume2,
      color: 'blue',
    },
    {
      id: 'reflex',
      title: 'Reflex Training Error',
      description: 'Simulates performance/timing error',
      icon: Zap,
      color: 'purple',
    },
    {
      id: 'network',
      title: 'Network Error',
      description: 'Simulates connection failure',
      icon: Wifi,
      color: 'red',
    },
    {
      id: 'permission',
      title: 'Permission Error',
      description: 'Simulates device access denied',
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'timeout',
      title: 'Timeout Error',
      description: 'Simulates request timeout',
      icon: Clock,
      color: 'gray',
    },
    {
      id: 'generic',
      title: 'Generic Error',
      description: 'Simulates general application error',
      icon: Bug,
      color: 'red',
    },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Error Boundary Demo</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Test các error boundaries với retry functionality. Mỗi error sẽ
          trigger một specialized error boundary với retry logic phù hợp cho
          từng loại lỗi.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Chú ý:</strong> Đây là demo để test error handling. Các lỗi
          được trigger sẽ được catch bởi error boundaries và có thể retry. Mở
          DevTools để xem error logging chi tiết.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {errorScenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <Card
              key={scenario.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 bg-${scenario.color}-100 dark:bg-${scenario.color}-900/30`}
                  >
                    <Icon
                      className={`h-5 w-5 text-${scenario.color}-600 dark:text-${scenario.color}-400`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium">
                      {scenario.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {scenario.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => triggerError(scenario.id)}
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Trigger Error
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Error Boundary Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Implemented Features</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Retry functionality với max attempts</li>
                <li>• Context-aware error messages</li>
                <li>• Visual loading states during retry</li>
                <li>• Error type detection và specific handling</li>
                <li>• Development error details</li>
                <li>• Color-coded error boundaries</li>
                <li>• Error reporting integration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Error Types Handled</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Microphone Errors</Badge>
                <Badge variant="outline">Network Errors</Badge>
                <Badge variant="outline">Permission Errors</Badge>
                <Badge variant="outline">Performance Errors</Badge>
                <Badge variant="outline">Timeout Errors</Badge>
                <Badge variant="outline">Generic Errors</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm">
          Error boundaries đã được implement trong:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">/app/error.tsx</Badge>
          <Badge variant="secondary">/app/(user)/conversation/error.tsx</Badge>
          <Badge variant="secondary">/app/(user)/pronunciation/error.tsx</Badge>
          <Badge variant="secondary">/app/(user)/reflex/error.tsx</Badge>
          <Badge variant="secondary">/components/error-boundary.tsx</Badge>
        </div>
      </div>
    </div>
  );
}
