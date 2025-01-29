import { TodoProvider } from "@/contexts/TodoContext";
import { TodoList } from "@/components/TodoList";
import { TodoCalendar } from "@/components/TodoCalendar";

const Index = () => {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-todo-background p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-center text-4xl font-bold text-todo-primary">
            Todo List
          </h1>
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