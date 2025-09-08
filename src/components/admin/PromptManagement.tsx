import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye, MessageSquare } from 'lucide-react';

const promptSchema = z.object({
  prompt_name: z.string().min(1, 'Название промпта обязательно'),
  prompt_key: z.string().min(1, 'Ключ промпта обязателен'),
  prompt_text: z.string().min(1, 'Текст промпта не может быть пустым'),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface Prompt {
  id: number;
  prompt_name: string;
  prompt_key: string;
  prompt_text: string;
  created_at: string;
}

export const PromptManagement = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
  });

  const watchedText = watch('prompt_text', '');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить промпты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PromptFormData) => {
    try {
      if (editingPrompt) {
        const { error } = await supabase
          .from('prompts')
          .update(data)
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast({
          title: 'Успешно',
          description: 'Промпт обновлен',
        });

        await fetchPrompts();
        handleCloseDialog();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: `Не удалось сохранить промпт: ${ (error as any)?.message || '' }`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Промпт удален',
      });
      
      await fetchPrompts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить промпт',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    reset({
      prompt_name: prompt.prompt_name,
      prompt_key: prompt.prompt_key,
      prompt_text: prompt.prompt_text,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    reset();
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering - можно заменить на более продвинутую библиотеку
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Загрузка...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Управление промптами
        </CardTitle>
        <CardDescription>
          Редактирование промптов для анализа звонков
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Поиск по названию или ключу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактировать промпт</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="prompt_name">Название промпта</Label>
                  <Input
                    id="prompt_name"
                    {...register('prompt_name')}
                    placeholder="Введите название промпта"
                  />
                  {errors.prompt_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.prompt_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prompt_key">Ключ агента</Label>
                  <Input
                    id="prompt_key"
                    {...register('prompt_key')}
                    placeholder="Введите ключ агента"
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  {errors.prompt_key && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.prompt_key.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Поле недоступно для редактирования
                  </p>
                </div>

                <div>
                  <Label htmlFor="prompt_text">Текст промпта</Label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Редактирование</TabsTrigger>
                      <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        id="prompt_text"
                        {...register('prompt_text')}
                        placeholder="Введите текст промпта (поддерживается Markdown)"
                        className="min-h-[300px] font-mono"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Поддерживается Markdown: **жирный**, *курсив*, `код`
                      </p>
                    </TabsContent>
                    <TabsContent value="preview">
                      <div
                        className="min-h-[300px] p-3 border rounded-md bg-muted/50"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(watchedText || ''),
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                  {errors.prompt_text && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.prompt_text.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Отмена
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" disabled={isSubmitting}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Сохранить изменения?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите сохранить изменения в этом промпте?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSubmit(onSubmit)()}>
                          Подтвердить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Ключ агента</TableHead>
              <TableHead>Фрагмент текста</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.prompt_name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-muted rounded text-sm">
                    {prompt.prompt_key}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  {truncateText(prompt.prompt_text)}
                </TableCell>
                <TableCell>
                  {new Date(prompt.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingPrompt(prompt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{prompt.prompt_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Ключ агента:</Label>
                            <p className="text-sm text-muted-foreground">
                              {prompt.prompt_key}
                            </p>
                          </div>
                          <div>
                            <Label>Текст промпта:</Label>
                            <div
                              className="mt-2 p-4 border rounded-md bg-muted/50 whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdown(prompt.prompt_text),
                              }}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить промпт?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Промпт "{prompt.prompt_name}"
                            будет удален навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(prompt.id)}
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Промпты не найдены' : 'Нет созданных промптов'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
