
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/utils/aiService";
import { Loader2, BookOpen, Link, Headphones, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface TaskHelpProps {
  taskText: string;
}

export function TaskHelp({ taskText }: TaskHelpProps) {
  const [loading, setLoading] = useState(false);
  const [helpData, setHelpData] = useState<{
    suggestions: string[];
    questions: string[];
    resources: {
      title: string;
      link?: string;
      description?: string;
    }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHelp = async () => {
    if (!aiService.getApiKey()) {
      setError("Please set your API key in AI Settings first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await aiService.getTaskHelp(taskText);
      setHelpData(data);
    } catch (err) {
      setError("Failed to get AI suggestions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("podcast") || lowerTitle.includes("audio")) {
      return <Headphones className="h-4 w-4" />;
    } else if (lowerTitle.includes("book")) {
      return <BookOpen className="h-4 w-4" />;
    } else {
      return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-4 border-t pt-3">
      {!helpData && !loading && (
        <Button
          variant="outline"
          size="sm"
          onClick={getHelp}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Get AI Help for This Task
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Getting AI suggestions...
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {helpData && !loading && (
        <Accordion type="single" collapsible className="w-full">
          {helpData.suggestions.length > 0 && (
            <AccordionItem value="suggestions">
              <AccordionTrigger className="text-sm font-medium">
                Suggestions
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-5 text-sm">
                  {helpData.suggestions.map((suggestion, index) => (
                    <li key={index} className="list-disc">{suggestion}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {helpData.questions.length > 0 && (
            <AccordionItem value="questions">
              <AccordionTrigger className="text-sm font-medium">
                Questions to Consider
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-5 text-sm">
                  {helpData.questions.map((question, index) => (
                    <li key={index} className="list-disc">{question}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {helpData.resources.length > 0 && (
            <AccordionItem value="resources">
              <AccordionTrigger className="text-sm font-medium">
                Helpful Resources
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 text-sm">
                  {helpData.resources.map((resource, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-0.5 text-gray-500">
                        {getResourceIcon(resource.title)}
                      </span>
                      <div>
                        {resource.link ? (
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {resource.title}
                          </a>
                        ) : (
                          <span className="font-medium">{resource.title}</span>
                        )}
                        {resource.description && (
                          <p className="text-gray-600">{resource.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
}
