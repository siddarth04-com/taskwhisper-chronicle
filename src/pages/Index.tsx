import { TodoProvider } from "@/contexts/TodoContext";
import { TodoList } from "@/components/TodoList";

const Index = () => {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-todo-background p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-center text-4xl font-bold text-todo-primary">
            Todo List
          </h1>
          <TodoList />
        </div>
      </div>
    </TodoProvider>
  );
};

export default Index;