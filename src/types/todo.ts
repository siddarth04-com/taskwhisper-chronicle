export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
  createdAt: number;
  activity: "work" | "personal" | "shopping" | "health" | "other";
}