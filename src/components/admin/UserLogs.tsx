import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

const actionLabels = {
  INSERT: 'Создание',
  UPDATE: 'Редактирование',
  DELETE: 'Удаление',
};

const resourceLabels = {
  call_analysis: 'Анализ звонков КЦ',
  sales_calls_analysis: 'Анализ звонков продаж',
  crm_analytics: 'Звонки из CRM',
  profiles: 'Профили пользователей',
  departments: 'Подразделения',
};

export const UserLogs = () => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Сначала пробуем загрузить со связью
      const { data, error } = await supabase
        .from('user_logs' as any)
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        // Если ошибка связи (PGRST200), пробуем загрузить без неё
        if ((error as any).code === 'PGRST200') {
          console.warn('Relationship not found, fetching logs without profiles');
          const { data: simpleData, error: simpleError } = await supabase
            .from('user_logs' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (simpleError) throw simpleError;
          setLogs(simpleData || []);
          return;
        }
        throw error;
      }

      let filteredData = (data as any) || [];

      // Apply text search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((log: any) =>
          log.profiles?.name?.toLowerCase().includes(searchLower) ||
          log.profiles?.email?.toLowerCase().includes(searchLower) ||
          log.resource_id?.toLowerCase().includes(searchLower)
        );
      }

      setLogs(filteredData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      action: 'all',
      resource: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const exportLogs = () => {
    const csv = [
      ['Дата', 'Пользователь', 'Email', 'Действие', 'Ресурс', 'ID ресурса'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('ru-RU'),
        (log as any).profiles?.name || 'Неизвестно',
        (log as any).profiles?.email || 'Неизвестно',
        actionLabels[log.action as keyof typeof actionLabels] || log.action,
        resourceLabels[log.resource as keyof typeof resourceLabels] || log.resource,
        log.resource_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Настройте параметры поиска логов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Поиск</Label>
              <Input
                id="search"
                placeholder="Имя, email, ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Действие</Label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Все действия" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все действия</SelectItem>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource">Ресурс</Label>
              <Select value={filters.resource} onValueChange={(value) => setFilters({ ...filters, resource: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Все ресурсы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все ресурсы</SelectItem>
                  {Object.entries(resourceLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Дата от</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Дата до</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>&nbsp;</Label>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetFilters} size="sm">
                  Сбросить
                </Button>
                <Button variant="outline" onClick={fetchLogs} size="sm" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Логи действий
            <Button variant="outline" onClick={exportLogs} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Экспорт CSV
            </Button>
          </CardTitle>
          <CardDescription>
            История действий пользователей в системе (последние 100 записей)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Загрузка логов...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Ресурс</TableHead>
                  <TableHead>ID ресурса</TableHead>
                  <TableHead>IP адрес</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {new Date(log.created_at).toLocaleString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {(log as any).profiles?.name || 'Неизвестно'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(log as any).profiles?.email || 'Неизвестно'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(log.action) as any}>
                        {actionLabels[log.action as keyof typeof actionLabels] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resourceLabels[log.resource as keyof typeof resourceLabels] || log.resource}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.resource_id || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Логи не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};