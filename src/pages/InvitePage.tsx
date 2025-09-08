import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface InviteData {
  email: string;
  name: string;
  role: string;
  department_id: number | null;
  token: string;
  id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  created_by: string;
}

interface SignUpForm {
  password: string;
  confirmPassword: string;
}

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>();
  const password = watch("password");

  useEffect(() => {
    const validateInvite = async () => {
      if (!token) {
        console.log("Token missing:", token);
        setError("Неверная ссылка приглашения");
        setLoading(false);
        return;
      }

      console.log("Validating token:", token);

      try {
        const { data, error } = await supabase
          .from('user_invitations' as any)
          .select('*')
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        console.log("Query result:", { data, error });

        if (error) {
          console.error("Database error:", error);
          setError("Ошибка базы данных: " + error.message);
        } else if (!data) {
          console.log("No data found for token");
          setError("Ссылка приглашения недействительна или истекла");
        } else {
          console.log("Invitation found:", data);
          setInviteData(data as any);
        }
      } catch (err) {
        console.error("Validation error:", err);
        setError("Ошибка при проверке приглашения");
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const onSubmit = async (data: SignUpForm) => {
    if (!inviteData) return;

    setLoading(true);
    try {
      // Создание пользователя
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: inviteData.name,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Создание профиля
        const { error: profileError } = await supabase
          .from('profiles' as any)
          .insert({
            id: authData.user.id,
            email: inviteData.email,
            name: inviteData.name,
            role: inviteData.role,
            department_id: inviteData.department_id,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Отметка приглашения как использованного
        await supabase
          .from('user_invitations' as any)
          .update({ used_at: new Date().toISOString() } as any)
          .eq('token', token);

        toast({
          title: "Успешно!",
          description: "Аккаунт создан. Проверьте почту и перейдите по ссылке подтверждения, затем войдите в систему.",
        });

        // Показываем инструкции вместо перенаправления
        setError("Аккаунт создан! Проверьте почту " + inviteData.email + " и перейдите по ссылке подтверждения. После этого вы сможете войти в систему.");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось создать аккаунт",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка приглашения...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Ошибка</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Button onClick={() => navigate("/login")}>
              Перейти на страницу входа
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Приглашение в систему</CardTitle>
          <CardDescription>
            Создайте пароль для аккаунта: {inviteData?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name" 
                value={inviteData?.name || ""} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={inviteData?.email || ""} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Пароль обязателен",
                  minLength: {
                    value: 6,
                    message: "Пароль должен быть не менее 6 символов"
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Подтверждение пароля обязательно",
                  validate: (value) =>
                    value === password || "Пароли не совпадают"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Создание аккаунта..." : "Создать аккаунт"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;