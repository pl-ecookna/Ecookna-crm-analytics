import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getAuthErrorMessage = (message?: string) => {
    if (!message) return "Не удалось выполнить вход. Попробуйте снова.";

    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
      return 'Неверный email или пароль';
    }

    // Safari and some network stacks can return this for cross-site/auth transport failures.
    if (normalized.includes('load failed') || normalized.includes('failed to fetch')) {
      return 'Нет соединения с сервером авторизации. Проверьте интернет/VPN и попробуйте снова.';
    }

    if (normalized.includes('email not confirmed')) {
      return 'Email не подтвержден. Обратитесь к администратору.';
    }

    return message;
  };

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await signIn(normalizedEmail, password);

      if (error) {
        console.error('Login error details:', error);
        toast({
          title: "Ошибка входа",
          description: getAuthErrorMessage(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Вход выполнен",
          description: "Добро пожаловать в систему аналитики звонков",
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Unexpected login exception:', error);
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка при входе",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитика звонков</h1>
          <p className="text-muted-foreground mt-2">
            Комплексный анализ качества обслуживания клиентов
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Вход в систему</CardTitle>
            <CardDescription>
              Введите ваши учетные данные для доступа к системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
