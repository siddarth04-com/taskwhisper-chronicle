import { TodoProvider } from "@/contexts/TodoContext";
import { TodoList } from "@/components/TodoList";
import { TodoCalendar } from "@/components/TodoCalendar";
import { AISettings } from "@/components/AISettings";

const Index = () => {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-todo-background p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-todo-primary">
              Todo List
            </h1>
            <AISettings />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <TodoList />
            </div>
            <div>
              <TodoCalendar />
            </div>
          </div>
        </div>
      </div>
    </TodoProvider>
  );
};

export default Index;