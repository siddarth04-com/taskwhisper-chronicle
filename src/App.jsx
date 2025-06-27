import React, { createContext, useState, useEffect, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Loader2,
  HelpCircle,
  Send,
  Bot,
  User,
  Search,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// AI Service with Claude API
const ANTHROPIC_API_KEY = "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";

const aiService = {
  async makeAnthropicRequest(messages, systemPrompt = "", maxTokens = 300) {
    const requestBody = {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: maxTokens,
      messages: messages,
      temperature: 0.7
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    console.log('Making Anthropic API request:', requestBody);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', response.status, errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    console.log('Anthropic API response:', data);
    return data;
  },

  async suggestCategory(text) {
    try {
      const data = await this.makeAnthropicRequest([{
        role: 'user',
        content: `Categorize this task into one of these categories: work, personal, health, other. Just respond with the category name in lowercase: "${text}"`
      }], "", 10);
      
      const category = data.content[0].text.trim().toLowerCase();
      
      if (['work', 'personal', 'health', 'other'].includes(category)) {
        return category;
      }
      return 'other';
    } catch (error) {
      console.error('Error suggesting category:', error);
      return 'other';
    }
  },

  async suggestSteps(text) {
    try {
      const data = await this.makeAnthropicRequest([{
        role: 'user',
        content: `Break down this task into 2-4 concrete steps. Respond with just the steps, one per line: "${text}"`
      }], "", 150);
      
      return data.content[0].text
        .split('\n')
        .map(step => step.trim().replace(/^\d+\.\s*/, '').replace(/^-\s*/, ''))
        .filter(step => step.length > 0);
    } catch (error) {
      console.error('Error suggesting steps:', error);
      return [];
    }
  },

  async getChatResponse(taskText, messages) {
    try {
      const systemPrompt = `You are a helpful AI assistant helping someone with their task: "${taskText}". 
      
Provide helpful, practical advice and suggestions. Be conversational and supportive. 
Keep responses concise but informative. Focus on actionable advice related to completing this specific task.
Be encouraging and provide specific next steps when possible.`;
      
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const data = await this.makeAnthropicRequest(conversationHistory, systemPrompt, 400);
      return data.content[0].text;
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      throw error;
    }
  }
};

// Context
const TodoContext = createContext({
  todos: [],
  addTodo: () => {},
  deleteTodo: () => {},
  toggleTodo: () => {},
  addStep: () => {},
  toggleStep: () => {},
  deleteStep: () => {},
});

const useTodo = () => useContext(TodoContext);

// Category colors and icons
const getCategoryColor = (activity) => {
  switch (activity) {
    case 'work':
      return 'bg-blue-500';
    case 'personal':
      return 'bg-purple-500';
    case 'health':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getCategoryIcon = (activity) => {
  switch (activity) {
    case 'work':
      return '💼';
    case 'personal':
      return '👤';
    case 'health':
      return '🏥';
    default:
      return '📋';
  }
};

// Components
const TodoInput = ({ onAdd }) => {
  const [text, setText] = useState("");
  const [activity, setActivity] = useState("other");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      setIsLoading(true);
      try {
        let suggestedCategory = activity;
        let suggestedSteps = [];
        
        try {
          suggestedCategory = await aiService.suggestCategory(text);
        } catch (categoryError) {
          console.error('Error suggesting category:', categoryError);
        }
        
        try {
          suggestedSteps = await aiService.suggestSteps(text);
        } catch (stepsError) {
          console.error('Error suggesting steps:', stepsError);
        }
        
        onAdd(text, suggestedCategory, suggestedSteps);
        
        if (suggestedSteps.length > 0) {
          toast({
            description: `AI added ${suggestedSteps.length} suggested steps to your task`,
            duration: 3000,
          });
        }
        
        if (suggestedCategory !== activity && suggestedCategory !== "other") {
          toast({
            description: `AI suggested category: ${suggestedCategory}`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error processing AI suggestions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get AI suggestions. Adding task with selected category.",
          duration: 3000,
        });
        onAdd(text, activity);
      } finally {
        setIsLoading(false);
        setText("");
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search Context"
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="work" className="text-white hover:bg-gray-700">Work</SelectItem>
            <SelectItem value="personal" className="text-white hover:bg-gray-700">Personal</SelectItem>
            <SelectItem value="health" className="text-white hover:bg-gray-700">Health</SelectItem>
            <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </form>
    </div>
  );
};

const ChatbotInterface = ({ taskText, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm here to help you with your task: "${taskText}". 

I can provide specific advice, break down complex steps, suggest resources, or help you overcome any challenges you're facing. What would you like to know or discuss about this task?`
      }]);
    }
  }, [isOpen, taskText, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.getChatResponse(taskText, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      setRetryCount(0);
    } catch (error) {
      console.error('Error getting chat response:', error);
      setError('Failed to get AI response. Please try again.');
      setRetryCount(prev => prev + 1);
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to get AI response. Please check your connection and try again.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await aiService.getChatResponse(taskText, messages);
          setMessages([...messages, { role: 'assistant', content: response }]);
          setRetryCount(0);
        } catch (error) {
          console.error('Retry failed:', error);
          setError('Retry failed. Please try again.');
          setRetryCount(prev => prev + 1);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-2xl h-[80vh] bg-gray-900 border-gray-700 text-white flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            AI Assistant for: "{taskText}"
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Get personalized help and advice for your task
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-400" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-900/50 border border-red-700 p-3 rounded-lg flex items-center gap-2 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-2 h-6 px-2 text-red-200 hover:text-white hover:bg-red-800"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about this task..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CategoryCard = ({ activity, count }) => {
  const colorClass = getCategoryColor(activity);
  const icon = getCategoryIcon(activity);
  
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-lg", colorClass)}>
          {icon}
        </div>
        <div>
          <h3 className="text-white font-medium capitalize">{activity}</h3>
          <p className="text-gray-400 text-sm">+{count} Task</p>
        </div>
      </div>
    </div>
  );
};

const TodoItem = ({ todo, onDelete, onToggle }) => {
  const [newStep, setNewStep] = useState("");
  const [showStepInput, setShowStepInput] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { addStep, toggleStep, deleteStep } = useTodo();

  const handleAddStep = (e) => {
    e.preventDefault();
    if (newStep.trim()) {
      addStep(todo.id, newStep.trim());
      setNewStep("");
      setShowStepInput(false);
    }
  };

  const steps = todo.steps || [];
  const completedSteps = steps.filter(step => step.completed).length;

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(todo.id)}
            className="flex items-center justify-center transition-colors mt-1"
          >
            {todo.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-blue-400" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryIcon(todo.activity)}</span>
              <span
                className={cn(
                  "text-white font-medium",
                  todo.completed && "text-gray-400 line-through"
                )}
              >
                {todo.text}
              </span>
            </div>
            
            {steps.length > 0 && (
              <div className="text-sm text-gray-400 mb-2">
                {completedSteps} Completed
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{completedSteps}/{steps.length}</span>
              {steps.length > 0 && (
                <div className="flex-1 bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full transition-all"
                    style={{ width: `${steps.length > 0 ? (completedSteps / steps.length) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Steps section */}
        {steps.length > 0 && (
          <div className="mt-4 ml-8 space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleStep(todo.id, step.id)}
                  className="flex items-center justify-center transition-colors"
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-400 hover:text-blue-400" />
                  )}
                </button>
                <span
                  className={cn(
                    "text-sm text-gray-300",
                    step.completed && "text-gray-500 line-through"
                  )}
                >
                  {step.text}
                </span>
                <button
                  onClick={() => deleteStep(todo.id, step.id)}
                  className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showStepInput && (
          <form onSubmit={handleAddStep} className="mt-3 ml-8 flex items-center gap-2">
            <Input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a step..."
              className="h-8 text-sm bg-gray-700 border-gray-600 text-white"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowStepInput(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}

        {!showStepInput && (
          <button
            onClick={() => setShowStepInput(true)}
            className="mt-3 ml-8 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
          >
            <Plus className="h-4 w-4" /> Add step
          </button>
        )}

        {!todo.completed && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
              onClick={() => setIsChatOpen(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Get AI Help
            </Button>
          </div>
        )}
      </div>

      <ChatbotInterface
        taskText={todo.text}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

const TodoCalendar = () => {
  const { todos } = useTodo();
  const todaysTodos = todos.filter(todo => {
    const todoDate = new Date(todo.createdAt).toDateString();
    const today = new Date().toDateString();
    return todoDate === today;
  });

  const currentTodo = todaysTodos.find(todo => !todo.completed);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Design</h2>
          <p className="text-gray-400 text-sm">Assign</p>
        </div>
        <div className="text-right">
          <p className="text-white text-sm">{todaysTodos.length} Remaining</p>
          <p className="text-gray-400 text-xs">Due Date</p>
          <p className="text-white text-xs">Fri, 25 Dec</p>
        </div>
      </div>

      {currentTodo && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4">{currentTodo.text}</h3>
          <div className="space-y-2">
            {currentTodo.steps?.slice(0, 4).map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300 text-sm">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Attachment</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg h-16"></div>
          <div className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg h-16"></div>
          <div className="bg-gradient-to-br from-green-400 to-blue-400 rounded-lg h-16"></div>
        </div>
      </div>
    </div>
  );
};

const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text, activity, steps = []) => {
    const newTodo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      activity: activity,
      steps: steps.map((stepText) => ({
        id: uuidv4(),
        text: stepText,
        completed: false
      })),
    };
    setTodos([newTodo, ...todos]);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const addStep = (todoId, stepText) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId) {
          const newStep = {
            id: uuidv4(),
            text: stepText,
            completed: false
          };
          return {
            ...todo,
            steps: [...(todo.steps || []), newStep]
          };
        }
        return todo;
      })
    );
  };

  const toggleStep = (todoId, stepId) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId && todo.steps) {
          return {
            ...todo,
            steps: todo.steps.map(step =>
              step.id === stepId ? { ...step, completed: !step.completed } : step
            )
          };
        }
        return todo;
      })
    );
  };

  const deleteStep = (todoId, stepId) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId && todo.steps) {
          return {
            ...todo,
            steps: todo.steps.filter(step => step.id !== stepId)
          };
        }
        return todo;
      })
    );
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        deleteTodo,
        toggleTodo,
        addStep,
        toggleStep,
        deleteStep
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

const TodoList = () => {
  const { todos, addTodo, deleteTodo, toggleTodo } = useTodo();
  
  // Group todos by category for stats
  const todosByCategory = todos.reduce((acc, todo) => {
    acc[todo.activity] = (acc[todo.activity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">😊</span>
          <div>
            <h1 className="text-white text-2xl font-bold">Welcome</h1>
            <p className="text-gray-400">Manage your task very easily!</p>
          </div>
        </div>
        
        <TodoInput onAdd={addTodo} />
        
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryCard activity="work" count={todosByCategory.work || 0} />
            <CategoryCard activity="personal" count={todosByCategory.personal || 0} />
            <CategoryCard activity="health" count={todosByCategory.health || 0} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-white text-lg font-semibold mb-4">Today's Task</h2>
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-xl">No tasks yet!</p>
              <p>Add a new task to get started</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDelete={deleteTodo}
                onToggle={toggleTodo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TodoProvider>
          <div className="min-h-screen bg-gray-900 p-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TodoList />
                </div>
                <div>
                  <TodoCalendar />
                </div>
              </div>
            </div>
          </div>
        </TodoProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
