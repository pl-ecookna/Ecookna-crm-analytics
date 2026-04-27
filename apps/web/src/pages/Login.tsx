import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@ecookna/api-client";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);

    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setServerError("Неверный email или пароль");
        return;
      }

      setServerError("Не удалось выполнить вход");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.25)_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur">
              <Shield className="h-4 w-4 text-primary" />
              Простая авторизация для CRM-аналитики
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Вход в систему
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Один логин, две роли. Администратор видит админку и управление пользователями,
                колл-центр работает только с аналитикой.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">admin</Badge>
              <Badge variant="secondary">call_center</Badge>
              <Badge variant="outline">httpOnly cookie</Badge>
            </div>
          </div>

          <Card className="border shadow-xl">
            <CardHeader>
              <CardTitle>Авторизация</CardTitle>
              <CardDescription>
                Используйте корпоративный email и пароль, который выдали при создании учетной записи.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.ru"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                {serverError && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {serverError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Входим...
                    </span>
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
