import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useTodo } from "@/contexts/TodoContext";

export function TodoCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { todos } = useTodo();

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Tasks for {date?.toLocaleDateString()}
        </h3>
        <div className="space-y-2">
          {todos
            .filter(
              (todo) =>
                new Date(todo.createdAt).toDateString() ===
                date?.toDateString()
            )
            .map((todo) => (
              <div
                key={todo.id}
                className="text-sm text-gray-600 flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${getActivityColor(
                    todo.activity
                  )}`}
                />
                {todo.text}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function getActivityColor(activity: string) {
  switch (activity) {
    case "work":
      return "bg-blue-500";
    case "personal":
      return "bg-green-500";
    case "shopping":
      return "bg-purple-500";
    case "health":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}