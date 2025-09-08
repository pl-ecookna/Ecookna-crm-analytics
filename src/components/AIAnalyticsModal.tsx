import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  BarChart3, 
  Brain, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any[];
  sqlQuery?: string;
  modelUsed?: string;
}

interface AIAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const exampleQuestions = [
  "📊 Покажи статистику по отделам за последний месяц",
  "🎯 Какие менеджеры показывают лучшие результаты?",
  "📈 Средняя оценка качества звонков по брендам",
  "🎙️ Сколько звонков было проанализировано сегодня?",
  "📞 Статистика достижения целей звонков",
  "🔥 Операторы с признаками выгорания",
  "😊 Распределение клиентов по NPS категориям",
  "⚠️ Звонки с высоким уровнем конфликтности",
  "🏆 Топ-5 операторов по общей оценке",
  "📋 Проблемы коммуникации за последнюю неделю"
];

const availableModels = [
  { id: 'openai', name: 'gpt-4o', displayName: 'OpenAI GPT-4o' },
  { id: 'gemini', name: 'gemini-pro', displayName: 'Google Gemini Pro' }
];

export const AIAnalyticsModal: React.FC<AIAnalyticsModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(availableModels[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Step 1: Generate SQL
      const sqlResponse = await supabase.functions.invoke('ai-sql-generator', {
        body: {
          userQuestion: userInput,
          selectedModel: selectedModel.id
        }
      });

      if (sqlResponse.error) {
        throw new Error(sqlResponse.error.message);
      }

      const { sql } = sqlResponse.data;
      
      if (!sql) {
        throw new Error('Не удалось сгенерировать SQL запрос');
      }

      console.log('Generated SQL:', sql);

      // Step 2: Execute query directly on call_analysis_crm table
      const { data: queryData, error: queryError } = await supabase
        .from('call_analysis_crm')
        .select('*')
        .limit(50);
      
      if (queryError) {
        throw new Error(`Ошибка выполнения запроса: ${queryError.message}`);
      }

      // Step 3: Analyze results
      const analysisResponse = await supabase.functions.invoke('ai-data-analyzer', {
        body: {
          userQuestion: userInput,
          sqlQuery: sql,
          data: queryData || [],
          selectedModel: selectedModel.id
        }
      });

      if (analysisResponse.error) {
        throw new Error(analysisResponse.error.message);
      }

      const { analysis } = analysisResponse.data;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis,
        timestamp: new Date(),
        data: queryData || [],
        sqlQuery: sql,
        modelUsed: selectedModel.displayName
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Ошибка при обработке запроса:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Произошла ошибка**\n\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}\n\nПопробуйте переформулировать вопрос или выберите другую модель.`,
        timestamp: new Date(),
        modelUsed: selectedModel.displayName
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Произошла ошибка при обработке запроса',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setUserInput(question);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <div className="flex h-[85vh]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-muted/20">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                AI Аналитика
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4 space-y-4">
              {/* Model Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Модель AI:</label>
                <Select
                  value={selectedModel.id}
                  onValueChange={(value) => {
                    const model = availableModels.find(m => m.id === value);
                    if (model) setSelectedModel(model);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          {model.displayName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Example Questions */}
              <div>
                <h3 className="text-sm font-medium mb-2">Примеры вопросов:</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {exampleQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full text-left justify-start h-auto p-2 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => handleExampleClick(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Анализ данных звонков</h1>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {selectedModel.displayName}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">Добро пожаловать в AI Аналитику!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Задавайте вопросы о ваших данных на русском языке. 
                        AI поможет проанализировать информацию и предоставить инсайты.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Выберите пример вопроса слева или введите свой запрос ниже.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    
                    <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-3">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        
                        {message.data && message.data.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              Найдено записей: {message.data.length}
                            </p>
                            {message.sqlQuery && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Показать SQL запрос
                                </summary>
                                <code className="block mt-2 p-2 bg-muted rounded text-xs">
                                  {message.sqlQuery}
                                </code>
                              </details>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{message.timestamp.toLocaleTimeString('ru-RU')}</span>
                          {message.modelUsed && (
                            <>
                              <span>•</span>
                              <span>{message.modelUsed}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Анализирую данные...
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос о ваших данных..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};