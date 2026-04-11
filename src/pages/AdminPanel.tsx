import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PromptManagement } from '@/components/admin/PromptManagement';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prompts');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackToAnalytics = () => {
    navigate('/');
  };

  const handleTriggerProcessing = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://n8n.entechai.ru/webhook/run', {
        method: 'GET',
      });
      
      if (response.ok) {
        toast.success('Обработка звонков успешно запущена');
      } else {
        toast.error('Ошибка при запуске обработки звонков');
      }
    } catch (error) {
      console.error('Error triggering processing:', error);
      toast.error('Не удалось запустить обработку звонков');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToAnalytics}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к аналитике
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
                <p className="text-muted-foreground">
                  Управление системными настройками
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Trigger Button */}
        <div className="mb-6 flex justify-end">
          <Button 
            onClick={handleTriggerProcessing}
            disabled={isProcessing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Запуск обработки...' : 'Запустить обработку звонков'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="prompts" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Промпты</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="space-y-6">
            <PromptManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
