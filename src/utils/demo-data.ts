// Demo data and utilities for the AI Voice Assistant prototype

export interface ConversationScript {
  id: string;
  title: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  animation?: string;
}

export interface DemoFlow {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: DemoStep[];
  autoAdvance: boolean;
}

export interface DemoStep {
  id: string;
  type: 'user-input' | 'assistant-response' | 'ui-interaction';
  content: string;
  duration: number;
  animation?: string;
}

// Sample conversation scripts
export const weatherConversation: ConversationScript = {
  id: 'weather-demo',
  title: 'Weather Query Demo',
  messages: [
    {
      id: '1',
      role: 'user',
      content: "What's the weather like today?",
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'assistant',
      content: "Today's weather is sunny with a high of 75°F and a low of 58°F. Perfect for outdoor activities! Would you like me to check the forecast for the rest of the week?",
      timestamp: Date.now() + 1000,
    },
  ],
};

export const planningConversation: ConversationScript = {
  id: 'planning-demo',
  title: 'Dinner Party Planning Demo',
  messages: [
    {
      id: '1',
      role: 'user',
      content: "Help me plan a dinner party for 8 people",
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'assistant',
      content: "I'd love to help you plan a dinner party for 8! Let me ask a few questions to make this perfect. What's the occasion, and do you have any dietary restrictions or preferences I should know about?",
      timestamp: Date.now() + 1000,
    },
    {
      id: '3',
      role: 'user',
      content: "It's a birthday celebration, and two guests are vegetarian",
      timestamp: Date.now() + 2000,
    },
    {
      id: '4',
      role: 'assistant',
      content: "Perfect! For a birthday celebration with vegetarian guests, I recommend a menu with both options. Here's what I suggest:\n\n**Appetizers:** Caprese skewers, vegetarian spring rolls\n**Main:** Grilled chicken with herb vegetables, and stuffed portobello mushrooms for vegetarians\n**Dessert:** Birthday cake with fresh berry toppings\n\nWould you like me to create a shopping list and timeline for preparation?",
      timestamp: Date.now() + 3000,
    },
  ],
};

// Demo flow configurations
export const onboardingFlow: DemoFlow = {
  id: 'onboarding',
  title: 'Voice Assistant Onboarding',
  description: 'Introduction to the AI voice assistant capabilities',
  duration: 90,
  autoAdvance: true,
  steps: [
    {
      id: 'welcome',
      type: 'ui-interaction',
      content: 'Welcome to your AI Voice Assistant',
      duration: 5,
      animation: 'fade-in',
    },
    {
      id: 'voice-permission',
      type: 'ui-interaction',
      content: 'Voice permission request',
      duration: 10,
      animation: 'slide-up',
    },
    {
      id: 'personality-intro',
      type: 'assistant-response',
      content: 'Hello! I\'m your AI assistant. I\'m here to help you with tasks, answer questions, and have natural conversations.',
      duration: 15,
      animation: 'voice-pulse',
    },
    {
      id: 'voice-test',
      type: 'user-input',
      content: 'Try saying "Hello" to test your microphone',
      duration: 20,
      animation: 'listening',
    },
    {
      id: 'feature-preview',
      type: 'ui-interaction',
      content: 'Feature showcase',
      duration: 15,
      animation: 'slide-up',
    },
  ],
};

export const chatDemoFlow: DemoFlow = {
  id: 'chat-demo',
  title: 'AI Chat Demonstration',
  description: 'Showcase of natural conversation capabilities',
  duration: 180,
  autoAdvance: false,
  steps: [
    {
      id: 'weather-query',
      type: 'user-input',
      content: "What's the weather like today?",
      duration: 30,
    },
    {
      id: 'weather-response',
      type: 'assistant-response',
      content: "Today's weather is sunny with a high of 75°F and a low of 58°F. Perfect for outdoor activities!",
      duration: 30,
    },
    {
      id: 'planning-query',
      type: 'user-input',
      content: "Help me plan a dinner party for 8 people",
      duration: 30,
    },
    {
      id: 'planning-response',
      type: 'assistant-response',
      content: "I'd love to help you plan a dinner party for 8! Let me ask a few questions to make this perfect.",
      duration: 30,
    },
  ],
};

// Utility functions
export const createMockConversation = (scenario: string): ConversationScript => {
  const baseId = `mock-${scenario}-${Date.now()}`;
  return {
    id: baseId,
    title: `Mock ${scenario} Conversation`,
    messages: [
      {
        id: `${baseId}-1`,
        role: 'user',
        content: `Sample user message for ${scenario}`,
        timestamp: Date.now(),
      },
      {
        id: `${baseId}-2`,
        role: 'assistant',
        content: `Sample assistant response for ${scenario}`,
        timestamp: Date.now() + 1000,
      },
    ],
  };
};

export const getRandomDelay = (min: number = 500, max: number = 2000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
}; 