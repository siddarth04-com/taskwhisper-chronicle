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
    if (!apiKey) throw new Error('API key not set');

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
    if (!apiKey) throw new Error('API key not set');

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
      return data.choices[0].message.content
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);
    } catch (error) {
      console.error('Error suggesting steps:', error);
      return [];
    }
  }
};