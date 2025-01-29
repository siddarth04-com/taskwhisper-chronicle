import { useState } from "react";
import { Plus } from "lucide-react";

interface TodoInputProps {
  onAdd: (text: string, tag?: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), tag.trim() || undefined);
      setText("");
      setTag("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-lg focus:border-todo-primary focus:outline-none focus:ring-1 focus:ring-todo-primary"
        />
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag (optional)"
          className="w-40 rounded-lg border border-gray-200 px-4 py-3 text-lg focus:border-todo-primary focus:outline-none focus:ring-1 focus:ring-todo-primary"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-todo-primary px-6 py-3 text-white transition-colors hover:bg-todo-primary/90"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>
    </form>
  );
}