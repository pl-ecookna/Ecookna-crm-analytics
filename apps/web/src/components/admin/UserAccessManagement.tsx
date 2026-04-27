import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle,
  WandSparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { createApiClient } from '@ecookna/api-client';
import type { AuthUser, CreateAuthUserRequest, UserRole, UpdateAuthUserRequest } from '@ecookna/shared-types';
import { useAuth } from '@/components/auth/AuthProvider';

const api = createApiClient(import.meta.env.VITE_API_BASE_URL || '');

const userSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Введите корректный email'),
  role: z.enum(['admin', 'call_center']),
  password: z.string().optional(),
  is_active: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

type RoleInfo = {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
  variant: 'default' | 'secondary';
};

const roleMatrix: RoleInfo[] = [
  {
    role: 'admin',
    label: 'Админ',
    description: 'Полный доступ к аналитике, пользователям и настройкам.',
    permissions: [
      'Просмотр аналитики звонков',
      'Управление промптами',
      'Управление пользователями',
      'Изменение ролей и активности',
    ],
    variant: 'default',
  },
  {
    role: 'call_center',
    label: 'Колл-центр',
    description: 'Работа только с аналитикой без админки.',
    permissions: [
      'Просмотр аналитики звонков',
      'Доступ к карточкам звонков',
      'Без доступа к админке',
      'Без управления пользователями',
    ],
    variant: 'secondary',
  },
];

const PASSWORD_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_';

const generatePassword = (length = 14) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => PASSWORD_CHARSET[value % PASSWORD_CHARSET.length]).join('');
};

export const UserAccessManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'call_center',
      password: '',
      is_active: true,
    },
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password') || '';
  const isEditingCurrentUser = editingUser?.id === currentUser?.id;

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setShowPassword(false);
    reset({
      name: '',
      email: '',
      role: 'call_center',
      password: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleGeneratePassword = () => {
    const password = generatePassword();
    setValue('password', password, { shouldDirty: true, shouldValidate: true });
    setShowPassword(true);
    toast({
      title: 'Пароль сгенерирован',
      description: 'Пароль подставлен в поле и готов к сохранению.',
    });
  };

  const handleCopyPassword = async () => {
    if (!watchedPassword.trim()) {
      toast({
        title: 'Пароль пустой',
        description: 'Сначала сгенерируйте или введите пароль.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(watchedPassword);
      toast({
        title: 'Пароль скопирован',
        description: 'Пароль находится в буфере обмена.',
      });
    } catch {
      toast({
        title: 'Не удалось скопировать пароль',
        description: 'Попробуйте еще раз или скопируйте пароль вручную.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (user: AuthUser) => {
    setEditingUser(user);
    setShowPassword(false);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setShowPassword(false);
    reset();
  };

  const handleSave = async (values: UserFormValues) => {
    try {
      if (!editingUser) {
        if (!values.password || values.password.trim().length < 8) {
          toast({
            title: 'Ошибка',
            description: 'Пароль должен быть не короче 8 символов',
            variant: 'destructive',
          });
          return;
        }

        const payload: CreateAuthUserRequest = {
          email: values.email,
          name: values.name,
          password: values.password,
          role: values.role,
          is_active: values.is_active,
        };

        await api.createUser(payload);
        toast({
          title: 'Успешно',
          description: 'Пользователь создан',
        });
      } else {
        const payload: UpdateAuthUserRequest = {
          email: values.email,
          name: values.name,
          role: values.role,
          is_active: values.is_active,
        };

        if (values.password && values.password.trim().length > 0) {
          if (values.password.trim().length < 8) {
            toast({
              title: 'Ошибка',
              description: 'Пароль должен быть не короче 8 символов',
              variant: 'destructive',
            });
            return;
          }
          payload.password = values.password;
        }

        await api.updateUser(editingUser.id, payload);
        toast({
          title: 'Успешно',
          description: 'Пользователь обновлен',
        });
      }

      await fetchUsers();
      closeDialog();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: (error as Error)?.message || 'Не удалось сохранить пользователя',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.deleteUser(deleteTarget.id);
      toast({
        title: 'Успешно',
        description: 'Пользователь удален',
      });
      await fetchUsers();
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: (error as Error)?.message || 'Не удалось удалить пользователя',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.role.toLowerCase().includes(term)
    );
  });

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Модель доступа
          </CardTitle>
          <CardDescription>
            Простая схема авторизации с двумя ролями, которую можно расширить позже без перестройки интерфейса.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {roleMatrix.map((item) => (
            <div key={item.role} className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.variant}>{item.label}</Badge>
                    <span className="text-sm font-medium text-muted-foreground">{item.role}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                {item.permissions.map((permission) => (
                  <li key={permission} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Пользователи
              </CardTitle>
              <CardDescription>
                Управляйте доступом к аналитике, ролями и активностью пользователей.
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить пользователя
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по имени, email или роли"
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Всего пользователей: {users.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="border-success/20 text-success">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Активен
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive/20 text-destructive">
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Отключен
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Изменить
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Сброс пароля
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={user.id === currentUser?.id}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Измените имя, email, роль или пароль. Для сброса пароля просто задайте новый.'
                : 'Создайте новый доступ с ролью admin или call_center.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(handleSave)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select
                  value={watchedRole}
                  onValueChange={(value) => {
                    if (value === 'admin' || value === 'call_center') {
                      setValue('role', value as UserRole, { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                  disabled={isEditingCurrentUser}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="call_center">call_center</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                {isEditingCurrentUser ? (
                  <p className="text-xs text-muted-foreground">Собственную роль менять нельзя.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль {editingUser ? '(необязательно)' : ''}</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-9 pr-40"
                    {...register('password')}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Сгенерировать
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={!watchedPassword.trim()}
                  >
                    {showPassword ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {showPassword ? 'Скрыть' : 'Показать'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    disabled={!watchedPassword.trim()}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div>
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Активен
                </Label>
                <p className="text-xs text-muted-foreground">
                  Неактивный пользователь не сможет войти в систему.
                </p>
              </div>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isEditingCurrentUser}
                  />
                )}
              />
            </div>

            {editingUser && isEditingCurrentUser ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Текущему пользователю нельзя менять собственную роль или статус активности.
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохраняем...
                  </span>
                ) : editingUser ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  Пользователь <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) будет удален из системы.
                  Действие нельзя отменить.
                </>
              ) : (
                'Это действие нельзя отменить.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
