
import { Todo } from "@/types/todo";

// Use a fixed API key instead of requiring user input
const OPENAI_API_KEY = "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";

export const aiService = {
  setApiKey: (key: string) => {
    // Retain this method for backward compatibility
    console.log("Custom API keys are no longer needed - using the provided API key");
  },

  getApiKey: () => {
    return OPENAI_API_KEY;
  },

  async suggestCategory(text: string): Promise<Todo['activity']> {
    try {
      console.log("Suggesting category for:", text);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        return 'other';
      }
      
      const data = await response.json();
      console.log("Category suggestion response:", data);
      
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
    try {
      console.log("Suggesting steps for:", text);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error Response:', errorData);
        return [];
      }
      
      const data = await response.json();
      console.log("Steps suggestion response:", data);
      
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
    try {
      console.log("Getting task help for:", taskText);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error Response:', errorData);
        return {
          suggestions: ["Error getting AI suggestions. Please try again later."],
          questions: [],
          resources: [],
        };
      }
      
      const data = await response.json();
      console.log("Task help response:", data);
      
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return {
          suggestions: ["Error getting AI suggestions. Please try again later."],
          questions: [],
          resources: [],
        };
      }
      
      try {
        const content = JSON.parse(data.choices[0].message.content);
        
        return {
          suggestions: content.suggestions || [],
          questions: content.questions || [],
          resources: content.resources || [],
        };
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.log('Raw response content:', data.choices[0].message.content);
        
        // Attempt to handle non-JSON responses
        const rawContent = data.choices[0].message.content;
        return {
          suggestions: ["AI provided a response but it wasn't in the expected format."],
          questions: [],
          resources: [{
            title: "Raw AI Response",
            description: rawContent.substring(0, 200) + (rawContent.length > 200 ? "..." : "")
          }],
        };
      }
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
