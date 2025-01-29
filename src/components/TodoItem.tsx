import { Todo } from "@/types/todo";
import { Trash2, CheckCircle2, Circle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./ui/input";
import { useTodo } from "@/contexts/TodoContext";

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function TodoItem({ todo, onDelete, onToggle }: TodoItemProps) {
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

  // Ensure steps is always an array
  const steps = todo.steps || [];

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-lg border p-4 transition-all hover:border-todo-primary",
        "animate-slideIn",
        todo.completed && "bg-gray-50"
      )}
    >
      <div className="flex items-center gap-3">
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

      {/* Steps section */}
      <div className="ml-8 space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <button
              onClick={() => toggleStep(todo.id, step.id)}
              className="flex items-center justify-center transition-colors"
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 hover:text-todo-primary" />
              )}
            </button>
            <span
              className={cn(
                "text-sm",
                step.completed && "text-gray-400 line-through"
              )}
            >
              {step.text}
            </span>
            <button
              onClick={() => deleteStep(todo.id, step.id)}
              className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}

        {showStepInput ? (
          <form onSubmit={handleAddStep} className="flex items-center gap-2">
            <Input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a step..."
              className="h-8 text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowStepInput(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowStepInput(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <Plus className="h-4 w-4" /> Add step
          </button>
        )}
      </div>
    </div>
  );
}