import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Copy, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'editor' | 'auditor' | 'call_center' | 'sales';

interface Department {
  id: number;
  number: string;
  name: string;
  brand?: string;
  type?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_id?: number;
  created_at: string;
}

interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_id?: number;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

const roleLabels = {
  admin: 'Администратор',
  editor: 'Редактор',
  auditor: 'Аудитор',
  call_center: 'Колл-центр',
  sales: 'Продажи',
};

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: '' as UserRole | '',
    department_id: 'none',
  });
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: '' as UserRole | '',
    department_id: 'none',
  });
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '' as UserRole | '',
    department_id: 'none',
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchInvitations();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as any) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments' as any)
        .select('*')
        .order('number');

      if (error) throw error;
      setDepartments((data as any) || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations' as any)
        .select('*')
        .is('used_at', null) // Показываем только неиспользованные приглашения
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as any) || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteForm.email || !inviteForm.name || !inviteForm.role || inviteForm.department_id === 'none') {
      toast({
        title: "Ошибка",
        description: "Все поля обязательны для заполнения",
        variant: "destructive",
      });
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('user_invitations' as any)
        .insert({
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
          department_id: inviteForm.department_id === 'none' ? null : parseInt(inviteForm.department_id),
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}/invite/${(data as any).token}`;
      setGeneratedInviteLink(inviteLink);

      toast({
        title: "Приглашение создано",
        description: "Ссылка-приглашение готова для отправки",
      });

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Ошибка создания приглашения",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    toast({
      title: "Скопировано",
      description: "Ссылка-приглашение скопирована в буфер обмена",
    });
  };

  const getDepartmentName = (departmentId?: number) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? `${dept.number} - ${dept.name}` : 'Не указано';
  };

  const resetForm = () => {
    setInviteForm({
      email: '',
      name: '',
      role: '',
      department_id: 'none',
    });
    setGeneratedInviteLink('');
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      department_id: user.department_id?.toString() || 'none',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser || !editForm.name || !editForm.role) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles' as any)
        .update({
          name: editForm.name,
          role: editForm.role,
          department_id: editForm.department_id === 'none' ? null : parseInt(editForm.department_id),
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно изменены",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles' as any)
        .delete()
        .eq('id', userToDelete);

      if (error) throw error;

      toast({
        title: "Пользователь удален",
        description: "Пользователь успешно удален из системы",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleRevokeInvitation = (invitationId: string) => {
    setInvitationToRevoke(invitationId);
    setIsRevokeDialogOpen(true);
  };

  const confirmRevokeInvitation = async () => {
    if (!invitationToRevoke) return;

    try {
      const { error } = await supabase
        .from('user_invitations' as any)
        .delete()
        .eq('id', invitationToRevoke);

      if (error) throw error;

      toast({
        title: "Приглашение отозвано",
        description: "Приглашение успешно удалено",
      });

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Ошибка отзыва",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRevokeDialogOpen(false);
      setInvitationToRevoke(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createUserForm.email || !createUserForm.name || !createUserForm.password || !createUserForm.role || createUserForm.department_id === 'none') {
      toast({
        title: "Ошибка",
        description: "Все поля обязательны для заполнения",
        variant: "destructive",
      });
      return;
    }

    try {
      // Сохраняем текущую сессию админа
      const { data: currentSession } = await supabase.auth.getSession();

      // Создание пользователя (триггер автоматически создаст профиль)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createUserForm.email,
        password: createUserForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: createUserForm.name,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: "Пользователь уже существует в системе Auth",
            description: "Профиль будет восстановлен автоматически, если это возможно.",
            variant: "destructive",
          });
          // Note: In a production app, you might want to call a special RPC here to link the existing user
        }
        throw authError;
      }

      if (authData.user) {
        // Восстанавливаем сессию админа
        if (currentSession?.session) {
          await supabase.auth.setSession({
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token,
          });
        }

        // Небольшая задержка для завершения работы триггера
        await new Promise(resolve => setTimeout(resolve, 500));

        // Обновляем профиль с указанными данными (профиль уже создан триггером)
        const { error: profileError } = await supabase
          .from('profiles' as any)
          .update({
            name: createUserForm.name,
            role: createUserForm.role,
            department_id: createUserForm.department_id === 'none' ? null : parseInt(createUserForm.department_id),
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        toast({
          title: "Пользователь создан",
          description: "Пользователь успешно добавлен в систему",
        });

        setIsCreateUserDialogOpen(false);
        setCreateUserForm({
          email: '',
          name: '',
          password: '',
          role: '',
          department_id: 'none',
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать пользователя",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Invitation - Hidden */}
      {false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Создать приглашение
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Пригласить пользователя
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Создание приглашения</DialogTitle>
                    <DialogDescription>
                      Заполните данные для создания приглашения нового пользователя
                    </DialogDescription>
                  </DialogHeader>

                  {generatedInviteLink ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Ссылка-приглашение:</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input value={generatedInviteLink} readOnly className="text-xs" />
                          <Button size="sm" onClick={copyInviteLink}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Отправьте эту ссылку пользователю для завершения регистрации
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(false)} className="w-full">
                        Закрыть
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateInvitation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                          id="name"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Роль</Label>
                        <Select value={inviteForm.role} onValueChange={(value: UserRole) => setInviteForm({ ...inviteForm, role: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Подразделение</Label>
                        <Select value={inviteForm.department_id} onValueChange={(value) => setInviteForm({ ...inviteForm, department_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите подразделение" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.number} - {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Создать приглашение
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Пользователи системы
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать пользователя
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Создание пользователя</DialogTitle>
                  <DialogDescription>
                    Создайте пользователя с готовым паролем
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-name">Имя</Label>
                    <Input
                      id="create-name"
                      value={createUserForm.name}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Пароль</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-role">Роль</Label>
                    <Select value={createUserForm.role} onValueChange={(value: UserRole) => setCreateUserForm({ ...createUserForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-department">Подразделение</Label>
                    <Select value={createUserForm.department_id} onValueChange={(value) => setCreateUserForm({ ...createUserForm, department_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите подразделение" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.number} - {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      Создать пользователя
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateUserDialogOpen(false)}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Список всех зарегистрированных пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Подразделение</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ожидающие приглашения</CardTitle>
            <CardDescription>Приглашения, которые еще не были использованы</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Истекает</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{invitation.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
                    </TableCell>
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Ожидает</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              Изменение данных пользователя {editingUser?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
              <Select value={editForm.role} onValueChange={(value: UserRole) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Подразделение</Label>
              <Select value={editForm.department_id} onValueChange={(value) => setEditForm({ ...editForm, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указано</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.number} - {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Сохранить
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Пользователь будет навсегда удален из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отозвать приглашение?</AlertDialogTitle>
            <AlertDialogDescription>
              Ссылка-приглашение станет недействительной.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeInvitation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Отозвать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};