
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiService } from "@/utils/aiService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TodoInputProps {
  onAdd: (text: string, activity: string, steps?: string[]) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");
  const [activity, setActivity] = useState("other");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      setIsLoading(true);
      try {
        if (aiService.getApiKey()) {
          // Get AI suggestion for category
          const suggestedCategory = await aiService.suggestCategory(text);
          
          // Get AI suggestions for steps
          const suggestedSteps = await aiService.suggestSteps(text);
          
          // Add the todo with the suggested category and steps
          onAdd(text, suggestedCategory, suggestedSteps);
          
          // Show toast if we got steps
          if (suggestedSteps.length > 0) {
            toast({
              description: `AI added ${suggestedSteps.length} suggested steps to your task`,
              duration: 3000,
            });
          }
          
          // Show toast for category suggestion if different from default
          if (suggestedCategory !== activity && suggestedCategory !== "other") {
            toast({
              description: `AI suggested category: ${suggestedCategory}`,
              duration: 3000,
            });
          }
        } else {
          // If no API key, just add the todo with selected category
          onAdd(text, activity);
        }
        setText("");
      } catch (error) {
        console.error('Error processing AI suggestions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get AI suggestions. Adding task with selected category.",
          duration: 3000,
        });
        onAdd(text, activity);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1"
      />
      <Select value={activity} onValueChange={setActivity}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="shopping">Shopping</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </Button>
    </form>
  );
}
