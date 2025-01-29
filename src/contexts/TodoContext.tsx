import React, { createContext, useContext, useEffect, useState } from "react";
import { Todo } from "@/types/todo";
import { useToast } from "@/hooks/use-toast";

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, tag?: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
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

  const addTodo = (text: string, tag?: string) => {
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        tag,
        createdAt: Date.now(),
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

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo, toggleTodo }}>
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