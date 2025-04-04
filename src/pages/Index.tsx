
import { TodoProvider } from "@/contexts/TodoContext";
import { TodoList } from "@/components/TodoList";
import { TodoCalendar } from "@/components/TodoCalendar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-todo-background p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-todo-primary">
              Todo List
            </h1>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
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
