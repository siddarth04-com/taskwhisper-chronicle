
export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
  createdAt: string; // Changed from number to string to match ISO string format
  activity: "work" | "personal" | "shopping" | "health" | "other";
  steps: Step[];
}
