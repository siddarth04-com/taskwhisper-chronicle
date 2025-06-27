
import React, { createContext, useState, useEffect, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  Lightbulb,
  MessageSquare,
  ExternalLink,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
  createdAt: string;
  activity: "work" | "personal" | "health" | "other";
  steps: Step[];
}

// AI Service with new API key
const OPENAI_API_KEY = "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";

const aiService = {
  async suggestCategory(text: string): Promise<Todo['activity']> {
    try {
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
            content: 'You are a task categorization assistant. Categorize the given task into one of these categories: work, personal, health, other. Respond with just the category name in lowercase.'
          }, {
            role: 'user',
            content: text
          }],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        return 'other';
      }
      
      const data = await response.json();
      const category = data.choices[0].message.content.trim().toLowerCase();
      
      if (['work', 'personal', 'health', 'other'].includes(category)) {
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
        return [];
      }
      
      const data = await response.json();
      
      return data.choices[0].message.content
        .split('\n')
        .map((step: string) => step.trim())
        .filter((step: string) => step.length > 0);
    } catch (error) {
      console.error('Error suggesting steps:', error);
      return [];
    }
  },

  async getTaskHelp(taskText: string): Promise<{
    suggestions: string[];
    questions: string[];
    resources: { title: string; link?: string; description?: string; }[];
  }> {
    try {
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
        return {
          suggestions: ["Error getting AI suggestions. Please try again later."],
          questions: [],
          resources: [],
        };
      }
      
      const data = await response.json();
      
      try {
        const content = JSON.parse(data.choices[0].message.content);
        return {
          suggestions: content.suggestions || [],
          questions: content.questions || [],
          resources: content.resources || [],
        };
      } catch (parseError) {
        return {
          suggestions: ["AI provided a response but it wasn't in the expected format."],
          questions: [],
          resources: [],
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

// Context
interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, activity: string, steps?: string[]) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  addStep: (todoId: string, stepText: string) => void;
  toggleStep: (todoId: string, stepId: string) => void;
  deleteStep: (todoId: string, stepId: string) => void;
}

const TodoContext = createContext<TodoContextType>({
  todos: [],
  addTodo: () => {},
  deleteTodo: () => {},
  toggleTodo: () => {},
  addStep: () => {},
  toggleStep: () => {},
  deleteStep: () => {},
});

const useTodo = (): TodoContextType => useContext(TodoContext);

// Category colors and icons
const getCategoryColor = (activity: string) => {
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

const getCategoryIcon = (activity: string) => {
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
const TodoInput = ({ onAdd }: { onAdd: (text: string, activity: string, steps?: string[]) => void }) => {
  const [text, setText] = useState("");
  const [activity, setActivity] = useState("other");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      setIsLoading(true);
      try {
        let suggestedCategory = activity;
        let suggestedSteps: string[] = [];
        
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

const TaskHelp = ({ taskText }: { taskText: string }) => {
  const [help, setHelp] = useState<{
    suggestions: string[];
    questions: string[];
    resources: { title: string; link?: string; description?: string; }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchHelp = async () => {
    setIsLoading(true);
    try {
      const helpData = await aiService.getTaskHelp(taskText);
      setHelp(helpData);
    } catch (error) {
      console.error('Error fetching task help:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI help. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
          onClick={fetchHelp}
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Get AI Help
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900 border-gray-700 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">AI Task Help</SheetTitle>
          <SheetDescription className="text-gray-300">
            Get suggestions, questions, and resources for: "{taskText}"
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : help ? (
          <div className="mt-6 space-y-6">
            {help.suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <h3 className="font-semibold text-white">Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {help.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-yellow-400">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {help.questions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <h3 className="font-semibold text-white">Questions to Consider</h3>
                </div>
                <ul className="space-y-2">
                  {help.questions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-blue-400">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {help.resources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="h-4 w-4 text-green-400" />
                  <h3 className="font-semibold text-white">Helpful Resources</h3>
                </div>
                <ul className="space-y-3">
                  {help.resources.map((resource, index) => (
                    <li key={index} className="text-sm pl-4 border-l-2 border-green-400">
                      <div className="font-medium text-white">{resource.title}</div>
                      {resource.description && (
                        <div className="text-gray-300 mt-1">{resource.description}</div>
                      )}
                      {resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-xs mt-1 inline-block"
                        >
                          Visit resource →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-400">
            Click "Get AI Help" to fetch suggestions
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const CategoryCard = ({ activity, count }: { activity: string; count: number }) => {
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

const TodoItem = ({ todo, onDelete, onToggle }: {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) => {
  const [newStep, setNewStep] = useState("");
  const [showStepInput, setShowStepInput] = useState(false);
  const { addStep, toggleStep, deleteStep } = useTodo();

  const handleAddStep = (e: React.FormEvent) => {
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
            <span>{completedSteps}/{steps.length + completedSteps}</span>
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
          <TaskHelp taskText={todo.text} />
        </div>
      )}
    </div>
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

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, activity: string, steps: string[] = []) => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      activity: activity as "work" | "personal" | "health" | "other",
      steps: steps.map((stepText) => ({
        id: uuidv4(),
        text: stepText,
        completed: false
      })),
    };
    setTodos([newTodo, ...todos]);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const addStep = (todoId: string, stepText: string) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId) {
          const newStep: Step = {
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

  const toggleStep = (todoId: string, stepId: string) => {
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

  const deleteStep = (todoId: string, stepId: string) => {
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
  }, {} as Record<string, number>);

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
