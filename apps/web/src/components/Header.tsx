import { ExternalLink, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const rejectedLeadsUrl = 'https://bi.entechai.ru/public/dashboard/26e07d8c-2451-4608-950b-bce04dce9a58';

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm md:flex">
              <span className="font-medium">{user.name}</span>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="h-5">
                {user.role}
              </Badge>
            </div>
          ) : null}
          <Button asChild variant="secondary" size="sm">
            <a href={rejectedLeadsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Отклоненные лиды
            </a>
          </Button>
          {user?.role === 'admin' ? (
            <Button variant="secondary" size="sm" onClick={handleAdminPanel}>
              <Settings className="w-4 h-4 mr-2" />
              Админ-панель
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
};
