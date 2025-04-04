
import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Todo, Step } from "@/types/todo";

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, activity: string, steps?: string[]) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  addStep: (todoId: string, stepText: string) => void;
  toggleStep: (todoId: string, stepId: string) => void;
  deleteStep: (todoId: string, stepId: string) => void;
}

export const TodoContext = createContext<TodoContextType>({
  todos: [],
  addTodo: () => {},
  deleteTodo: () => {},
  toggleTodo: () => {},
  addStep: () => {},
  toggleStep: () => {},
  deleteStep: () => {},
});

export const useTodo = (): TodoContextType => useContext(TodoContext);

interface TodoProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "todos";

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, activity: string, steps: string[] = []) => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      activity,
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
