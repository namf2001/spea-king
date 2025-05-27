export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  conversation: Message[];
}

export const scenarios: Scenario[] = [
  {
    id: 'restaurant',
    title: 'At a Restaurant',
    description: 'Practice ordering food and making special requests',
    conversation: [
      {
        role: 'assistant',
        content: 'Hello! Welcome to our restaurant. Do you have a reservation?',
      },
    ],
  },
  {
    id: 'interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions',
    conversation: [
      {
        role: 'assistant',
        content:
          'Thanks for coming in today. Could you tell me a little about yourself?',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Practice asking for help and making purchases',
    conversation: [
      {
        role: 'assistant',
        content: 'Hi there! How can I help you today?',
      },
    ],
  },
];
