import { useTodo } from "@/contexts/TodoContext";
import { TodoInput } from "./TodoInput";
import { TodoItem } from "./TodoItem";

export function TodoList() {
  const { todos, addTodo, deleteTodo, toggleTodo } = useTodo();

  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-xl">No todos yet!</p>
            <p>Add a new todo to get started</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={deleteTodo}
              onToggle={toggleTodo}
            />
          ))
        )}
      </div>
    </div>
  );
}