import React, { createContext, useContext, useEffect, useState } from "react";
import { Todo } from "@/types/todo";
import { useToast } from "@/hooks/use-toast";

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, activity: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  addStep: (todoId: string, stepText: string) => void;
  toggleStep: (todoId: string, stepId: string) => void;
  deleteStep: (todoId: string, stepId: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, activity: string) => {
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        activity: activity as Todo["activity"],
        createdAt: Date.now(),
        steps: [],
      },
      ...prev,
    ]);
    toast({
      description: "Todo added successfully",
      duration: 2000,
    });
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    toast({
      description: "Todo deleted",
      duration: 2000,
    });
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const addStep = (todoId: string, stepText: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              steps: [
                ...todo.steps,
                {
                  id: crypto.randomUUID(),
                  text: stepText,
                  completed: false,
                },
              ],
            }
          : todo
      )
    );
    toast({
      description: "Step added successfully",
      duration: 2000,
    });
  };

  const toggleStep = (todoId: string, stepId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              steps: todo.steps.map((step) =>
                step.id === stepId
                  ? { ...step, completed: !step.completed }
                  : step
              ),
            }
          : todo
      )
    );
  };

  const deleteStep = (todoId: string, stepId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              steps: todo.steps.filter((step) => step.id !== stepId),
            }
          : todo
      )
    );
    toast({
      description: "Step deleted",
      duration: 2000,
    });
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
        deleteStep,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}