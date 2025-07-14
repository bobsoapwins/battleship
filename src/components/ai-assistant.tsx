
'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useGame } from '@/hooks/use-game';
import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import type { Message } from '@/lib/game';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const { gameState, assistantState } = useGame();
  const { history, isLoading, setHistory, setIsLoading } = assistantState;
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: input.trim() };
    const newHistory = [...history, newUserMessage];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant({
        gameState,
        history: newHistory,
      });
      const newModelMessage: Message = { role: 'model', content: response };
      setHistory([...newHistory, newModelMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setHistory([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Neo Assistant
          </SheetTitle>
          <SheetDescription>Press TAB to close</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {history.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-xs',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <div className="bg-secondary p-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
