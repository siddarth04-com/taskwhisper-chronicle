
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
        let suggestedCategory = activity;
        let suggestedSteps: string[] = [];
        
        try {
          // Get AI suggestion for category
          suggestedCategory = await aiService.suggestCategory(text);
        } catch (categoryError) {
          console.error('Error suggesting category:', categoryError);
          if (categoryError instanceof Error && categoryError.message.includes("quota exceeded")) {
            toast({
              variant: "destructive",
              title: "API Quota Exceeded",
              description: "AI features are temporarily unavailable. Adding task with selected category.",
              duration: 5000,
            });
          }
        }
        
        try {
          // Get AI suggestions for steps
          suggestedSteps = await aiService.suggestSteps(text);
        } catch (stepsError) {
          console.error('Error suggesting steps:', stepsError);
          if (stepsError instanceof Error && !stepsError.message.includes("quota exceeded")) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to get AI step suggestions. Adding task with basic details.",
              duration: 3000,
            });
          }
        }
        
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
      } catch (error) {
        console.error('Error processing AI suggestions:', error);
        let errorMessage = "Failed to get AI suggestions. Adding task with selected category.";
        
        if (error instanceof Error && error.message.includes("quota exceeded")) {
          errorMessage = "AI quota exceeded. Adding task with selected category.";
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
          duration: 3000,
        });
        onAdd(text, activity);
      } finally {
        setIsLoading(false);
        setText("");
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
