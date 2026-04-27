import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="mt-3">Доступ ограничен</CardTitle>
          <CardDescription>
            Эта часть системы доступна только администраторам.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => navigate("/")}>
            Вернуться в аналитику
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate("/login")}>
            На страницу входа
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
