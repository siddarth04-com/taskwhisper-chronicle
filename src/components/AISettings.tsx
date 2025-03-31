
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/utils/aiService";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AISettings() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const [testPrompt, setTestPrompt] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey.trim());
      toast({
        description: "API key saved successfully",
        duration: 2000,
      });
    }
  };

  const testAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiService.getApiKey()) {
      toast({
        title: "Error",
        description: "Please save an API key first",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResponse("");
    
    try {
      const prompt = testPrompt || "Say hello in three different languages";
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiService.getApiKey()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 100,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setTestResponse(`Error: ${data.error.message}`);
        toast({
          title: "API Test Failed",
          description: data.error.message,
          variant: "destructive",
        });
      } else {
        setTestResponse(data.choices[0].message.content);
        toast({
          title: "API Test Successful",
          description: "Your API key is working correctly!",
        });
      }
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "API Test Failed",
        description: "Could not connect to OpenAI API",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const savedKey = aiService.getApiKey();
  const hasKey = Boolean(savedKey);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          AI Settings {hasKey && "✓"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AI Settings</SheetTitle>
          <SheetDescription>
            Configure AI features by adding your OpenAI API key.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                OpenAI API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "••••••••••••••••••••••" : "sk-..."}
              />
              <p className="text-xs text-gray-500">
                Get your API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  OpenAI dashboard
                </a>
              </p>
            </div>
            <Button type="submit">Save API Key</Button>
          </form>

          {hasKey && (
            <form onSubmit={testAPIKey} className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <label htmlFor="testPrompt" className="text-sm font-medium">
                  Test Your API Key (Optional)
                </label>
                <Textarea
                  id="testPrompt"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a prompt to test (e.g., Say hello in three different languages)"
                  className="min-h-[60px]"
                />
              </div>
              <Button type="submit" variant="secondary" disabled={testing}>
                {testing ? "Testing..." : "Test Connection"}
              </Button>

              {testResponse && (
                <div className="mt-4">
                  <label className="text-sm font-medium">Response:</label>
                  <div className="bg-gray-50 p-3 rounded border text-sm mt-1">
                    {testResponse}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
