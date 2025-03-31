
import { Todo } from "@/types/todo";

const API_KEY_STORAGE_KEY = 'openai_api_key_temp';

export const aiService = {
  setApiKey: (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  },

  getApiKey: () => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  },

  async suggestCategory(text: string): Promise<Todo['activity']> {
    const apiKey = aiService.getApiKey();
    if (!apiKey) return 'other';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a task categorization assistant. Categorize the given task into one of these categories: work, personal, shopping, health, other. Respond with just the category name in lowercase.'
          }, {
            role: 'user',
            content: text
          }],
          max_tokens: 10,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return 'other';
      }
      
      const category = data.choices[0].message.content.trim().toLowerCase();
      
      if (['work', 'personal', 'shopping', 'health', 'other'].includes(category)) {
        return category as Todo['activity'];
      }
      return 'other';
    } catch (error) {
      console.error('Error suggesting category:', error);
      return 'other';
    }
  },

  async suggestSteps(text: string): Promise<string[]> {
    const apiKey = aiService.getApiKey();
    if (!apiKey) return [];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a task breakdown assistant. Break down the given task into 2-4 concrete steps. Respond with just the steps, one per line.'
          }, {
            role: 'user',
            content: text
          }],
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return [];
      }
      
      return data.choices[0].message.content
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);
    } catch (error) {
      console.error('Error suggesting steps:', error);
      return [];
    }
  },

  async getTaskHelp(taskText: string): Promise<{
    suggestions: string[];
    questions: string[];
    resources: {
      title: string;
      link?: string;
      description?: string;
    }[];
  }> {
    const apiKey = aiService.getApiKey();
    if (!apiKey) {
      return {
        suggestions: ["Set up your API key in AI Settings to get personalized suggestions."],
        questions: [],
        resources: [],
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: `You are a helpful assistant for people working on tasks. For the given task, generate:
            1. 2-3 helpful suggestions related to completing the task
            2. 2-3 reflective questions that might help the user think about the task better
            3. 2-4 resources (websites, apps, books, podcasts) that would be useful for the task
            
            Format your response as a JSON object with three properties: suggestions (array of strings), questions (array of strings), and resources (array of objects with title, link (optional), and description (optional) properties).`
          }, {
            role: 'user',
            content: `I'm working on this task: "${taskText}". Please provide suggestions, questions, and resources.`
          }],
          max_tokens: 500,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return {
          suggestions: ["Error getting AI suggestions. Check your API key in AI Settings."],
          questions: [],
          resources: [],
        };
      }
      
      const content = JSON.parse(data.choices[0].message.content);
      
      return {
        suggestions: content.suggestions || [],
        questions: content.questions || [],
        resources: content.resources || [],
      };
    } catch (error) {
      console.error('Error getting task help:', error);
      return {
        suggestions: ["Error processing AI suggestions. Please try again later."],
        questions: [],
        resources: [],
      };
    }
  }
};
