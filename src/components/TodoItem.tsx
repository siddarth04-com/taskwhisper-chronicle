import { Todo } from "@/types/todo";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function TodoItem({ todo, onDelete, onToggle }: TodoItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-4 transition-all hover:border-todo-primary",
        "animate-slideIn",
        todo.completed && "bg-gray-50"
      )}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className="flex items-center justify-center transition-colors"
      >
        {todo.completed ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-gray-400 hover:text-todo-primary" />
        )}
      </button>
      <div className="flex-1 space-y-1">
        <span
          className={cn(
            "block text-lg transition-all",
            todo.completed && "text-gray-400 line-through"
          )}
        >
          {todo.text}
        </span>
        <span className="text-sm text-gray-500">
          Added {new Date(todo.createdAt).toLocaleDateString()}
        </span>
      </div>
      {todo.activity && (
        <span 
          className={cn(
            "rounded-full px-3 py-1 text-sm",
            {
              'bg-blue-100 text-blue-700': todo.activity === 'work',
              'bg-purple-100 text-purple-700': todo.activity === 'personal',
              'bg-yellow-100 text-yellow-700': todo.activity === 'shopping',
              'bg-green-100 text-green-700': todo.activity === 'health',
              'bg-gray-100 text-gray-700': todo.activity === 'other'
            }
          )}
        >
          {todo.activity}
        </span>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-5 w-5 text-red-500" />
      </button>
    </div>
  );
}