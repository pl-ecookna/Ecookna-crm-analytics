import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Building2, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { DepartmentManagement } from '@/components/admin/DepartmentManagement';
import { UserLogs } from '@/components/admin/UserLogs';
import { PromptManagement } from '@/components/admin/PromptManagement';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

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
                  Управление пользователями и системными настройками
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Подразделения</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Промпты</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Логи действий</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>
                  Создание приглашений, редактирование профилей и управление доступом
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Справочник подразделений</CardTitle>
                <CardDescription>
                  Управление структурой подразделений компании
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <PromptManagement />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Логи действий пользователей</CardTitle>
                <CardDescription>
                  История изменений и действий в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}