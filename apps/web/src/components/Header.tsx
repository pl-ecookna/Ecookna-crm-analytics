import { BarChart3, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleRejectedLeads = () => {
    navigate('/rejected-leads');
  };
  const isRejectedLeadsPage = location.pathname === '/rejected-leads';

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
          {isRejectedLeadsPage ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              К звонкам
            </Button>
          ) : null}
          {!isRejectedLeadsPage ? (
            <Button variant="secondary" size="sm" onClick={handleRejectedLeads}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Отклоненные лиды
            </Button>
          ) : null}
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
