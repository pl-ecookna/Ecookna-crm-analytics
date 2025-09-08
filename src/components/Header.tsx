import { Phone, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleLabels = {
  admin: 'Администратор',
  editor: 'Редактор',
  auditor: 'Аудитор',
  call_center: 'Колл-центр',
  sales: 'Продажи',
};

export const Header = () => {
  const { profile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/224e3147-74fc-459d-9e2a-5ae0c4f84e04.png" 
            alt="Company Logo" 
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Аналитика звонков
            </h1>
            <p className="text-sm text-muted-foreground">
              Комплексный анализ качества обслуживания клиентов
            </p>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {profile && (
            <div className="text-left">
              <p className="text-sm font-medium">{profile.name}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="text-xs h-6 px-2">
                    {roleLabels[profile.role]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-popover">
                  {hasRole('admin') && (
                    <>
                      <DropdownMenuItem onClick={handleAdminPanel}>
                        <Settings className="w-4 h-4 mr-2" />
                        Админ-панель
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};