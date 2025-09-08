import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: number;
  number: string;
  name: string;
  brand?: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState({
    number: '',
    name: '',
    brand: '',
    type: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate number field - only digits
    if (!/^\d+$/.test(departmentForm.number)) {
      toast({
        title: "Ошибка",
        description: "Поле '№' должно содержать только цифры",
        variant: "destructive",
      });
      return;
    }

    if (!departmentForm.number || !departmentForm.name) {
      toast({
        title: "Ошибка",
        description: "Поля '№' и 'Наименование' обязательны для заполнения",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingDepartment) {
        // Update existing department
        const { error } = await supabase
          .from('departments' as any)
          .update({
            number: departmentForm.number,
            name: departmentForm.name,
            brand: departmentForm.brand || null,
            type: departmentForm.type || null,
          })
          .eq('id', editingDepartment.id);

        if (error) throw error;

        toast({
          title: "Подразделение обновлено",
          description: "Данные подразделения успешно обновлены",
        });
      } else {
        // Create new department
        const { error } = await supabase
          .from('departments' as any)
          .insert({
            number: departmentForm.number,
            name: departmentForm.name,
            brand: departmentForm.brand || null,
            type: departmentForm.type || null,
          });

        if (error) throw error;

        toast({
          title: "Подразделение создано",
          description: "Новое подразделение успешно добавлено",
        });
      }

      resetForm();
      fetchDepartments();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Ошибка",
          description: "Подразделение с таким номером уже существует",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      number: department.number,
      name: department.name,
      brand: department.brand || '',
      type: department.type || '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
    if (!confirm(`Вы уверены, что хотите удалить подразделение "${department.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('departments' as any)
        .delete()
        .eq('id', department.id);

      if (error) throw error;

      toast({
        title: "Подразделение удалено",
        description: "Подразделение успешно удалено",
      });

      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setDepartmentForm({
      number: '',
      name: '',
      brand: '',
      type: '',
    });
    setEditingDepartment(null);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Department */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Управление подразделениями
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить подразделение
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? 'Редактирование подразделения' : 'Создание подразделения'}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните информацию о подразделении
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">№ *</Label>
                    <Input
                      id="number"
                      value={departmentForm.number}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        setDepartmentForm({...departmentForm, number: value});
                      }}
                      placeholder="123"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Только цифры</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Наименование *</Label>
                    <Input
                      id="name"
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                      placeholder="Отдел продаж"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Бренд</Label>
                    <Input
                      id="brand"
                      value={departmentForm.brand}
                      onChange={(e) => setDepartmentForm({...departmentForm, brand: e.target.value})}
                      placeholder="Название бренда"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Тип</Label>
                    <Input
                      id="type"
                      value={departmentForm.type}
                      onChange={(e) => setDepartmentForm({...departmentForm, type: e.target.value})}
                      placeholder="Тип подразделения"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      {editingDepartment ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список подразделений</CardTitle>
          <CardDescription>Управление структурой подразделений компании</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-mono font-medium">{department.number}</TableCell>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.brand || '-'}</TableCell>
                  <TableCell>{department.type || '-'}</TableCell>
                  <TableCell>{new Date(department.created_at).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(department)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Подразделения не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};