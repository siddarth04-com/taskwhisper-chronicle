import { Todo } from "@/types/todo";
import { Trash2 } from "lucide-react";
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
        "animate-slideIn"
      )}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-5 w-5 rounded-full border-2 border-todo-primary text-todo-primary focus:ring-todo-primary"
      />
      <span
        className={cn(
          "flex-1 text-lg transition-all",
          todo.completed && "text-gray-400 line-through"
        )}
      >
        {todo.text}
      </span>
      {todo.tag && (
        <span className="rounded-full bg-todo-accent px-3 py-1 text-sm text-todo-primary">
          {todo.tag}
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