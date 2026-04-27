import { useState } from "react";
import { ArrowLeft, LayoutDashboard, MessageSquare, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { PromptManagement } from "@/components/admin/PromptManagement";
import { UserAccessManagement } from "@/components/admin/UserAccessManagement";

type AdminSection = "prompts" | "users";

const sectionMeta: Record<
  AdminSection,
  {
    title: string;
    description: string;
    icon: typeof MessageSquare;
  }
> = {
  prompts: {
    title: "Промпты",
    description: "Редактирование системных промптов для анализа звонков.",
    icon: MessageSquare,
  },
  users: {
    title: "Пользователи и доступ",
    description: "Роли, права и будущая авторизация для админки.",
    icon: Users,
  },
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("prompts");

  const handleBackToAnalytics = () => {
    navigate("/");
  };

  const activeMeta = sectionMeta[activeSection];
  const ActiveIcon = activeMeta.icon;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="bg-card/60">
          <SidebarGroup className="px-3 pt-4">
            <SidebarGroupLabel asChild>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-none">Админ-панель</p>
                  <p className="text-xs text-muted-foreground">Промпты и доступ</p>
                </div>
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Разделы</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "prompts"}
                    onClick={() => setActiveSection("prompts")}
                    tooltip="Промпты"
                  >
                    <MessageSquare />
                    <span>Промпты</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "users"}
                    onClick={() => setActiveSection("users")}
                    tooltip="Пользователи и доступ"
                  >
                    <Users />
                    <span>Пользователи</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarFooter className="mt-auto">
            <Card className="border-sidebar-border bg-sidebar-accent/30 shadow-none">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Текущая схема</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">admin</Badge>
                    <Badge variant="secondary">call_center</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Интерфейс уже готов к разделению прав на уровне ролей.
                  </p>
                </div>
              </CardContent>
            </Card>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="min-h-screen bg-background">
          <div className="border-b border-border bg-card/50 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Button variant="ghost" size="sm" onClick={handleBackToAnalytics}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Вернуться к аналитике
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{activeMeta.title}</h1>
                  <p className="text-muted-foreground">{activeMeta.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Новая auth-схема
                </Badge>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {activeSection === "users" ? "admin only" : "shared access"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="container mx-auto space-y-6 px-4 py-6">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <ActiveIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{activeMeta.title}</p>
                  <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
                </div>
              </CardContent>
            </Card>

            {activeSection === "prompts" ? <PromptManagement /> : <UserAccessManagement />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
