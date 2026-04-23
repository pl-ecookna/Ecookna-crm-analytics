import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PromptManagement } from '@/components/admin/PromptManagement';

export default function AdminPanel() {
  const navigate = useNavigate();

  const handleBackToAnalytics = () => {
    navigate('/');
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
        <PromptManagement />
      </div>
    </div>
  );
}
