import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Phone, CheckCircle, Loader2, MoreVertical, Trash2, XCircle, Clock, Calendar, User, Building, Briefcase } from "lucide-react";

interface CrmCallCardProps {
  call: {
    id: number | string;
    call_id: string;
    call_datetime: string;
    user_name: string;
    department: string;
    brand: string;
    overall_score: number;
    call_success: string;
    conversation_duration_minutes: number;
    call_type: string;
    file_status: string;
    client_phone: string | null;
  };
  onClick: (id: number | string) => void;
  onDelete: (id: number | string) => Promise<void>;
}

// Утилитарные функции
const getSuccessColor = (callSuccess: string) => {
  switch (callSuccess) {
    case 'Успешный':
      return 'border-success bg-success/5 text-success';
    case 'Средний':
      return 'border-warning bg-warning/5 text-warning';
    case 'Неуспешный':
      return 'border-destructive bg-destructive/5 text-destructive';
    default:
      return 'border-muted bg-muted/5 text-muted-foreground';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-success';
  if (score >= 5) return 'text-warning';
  return 'text-destructive';
};

const getSuccessIndicatorColor = (callSuccess: string) => {
  switch (callSuccess) {
    case 'Успешный':
      return 'bg-success';
    case 'Средний':
      return 'bg-warning';
    case 'Неуспешный':
      return 'bg-destructive';
    default:
      return 'bg-muted';
  }
};

const decodeUserName = (name: string) => {
  try {
    return decodeURIComponent(escape(name));
  } catch {
    return name;
  }
};

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (minutes: number) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getFileStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-3 w-3 text-success" />;
    case 'processing':
      return <Loader2 className="h-3 w-3 text-warning animate-spin" />;
    case 'failed':
      return <XCircle className="h-3 w-3 text-destructive" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
};

export const CrmCallCard: React.FC<CrmCallCardProps> = ({ call, onClick, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const stopAll = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const stopPropagationOnly = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={`${getSuccessColor(call.call_success)} relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border`}
      onClick={() => onClick(call.id)}
    >
      <CardContent className="p-4 pr-12">
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={stopPropagationOnly}
                onPointerDown={stopPropagationOnly}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDeleting}
                onClick={(e) => {
                  stopAll(e);
                  setDeleteDialogOpen(false);
                }}
              >
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={async (e) => {
                  stopAll(e);
                  if (isDeleting) return;
                  setIsDeleting(true);
                  try {
                    await onDelete(call.id);
                  } finally {
                    setIsDeleting(false);
                    setDeleteDialogOpen(false);
                  }
                }}
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Удаляем...
                  </span>
                ) : (
                  "Удалить"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Верхняя часть */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              {/* Цветной индикатор статуса */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full ${getSuccessIndicatorColor(call.call_success)}`} />
                <span className="font-mono font-semibold text-foreground truncate">{call.call_id}</span>
              </div>

              {/* Оценка (перенесена в левую часть, чтобы не пересекаться с меню) */}
              <div className={`text-lg font-bold ${getScoreColor(call.overall_score)} shrink-0`}>
                {call.overall_score}/10
              </div>
            </div>
            
            {/* Дата */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(call.call_datetime)}</span>
            </div>
            
            {/* Имя оператора */}
            <div className="flex items-center gap-1.5 font-medium text-sm mb-1 truncate">
              <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{decodeUserName(call.user_name)}</span>
            </div>
            
            {/* Бренд */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5 truncate">
              <Building className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{call.brand}</span>
            </div>
            
            {/* Отдел */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Briefcase className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{call.department}</span>
            </div>
          </div>
          
          {/* Правая верхняя часть */}
          <div className="flex items-center ml-3 mt-1">
            {getFileStatusIcon(call.file_status)}
          </div>
        </div>
        
        {/* Нижняя часть */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Длительность */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(call.conversation_duration_minutes)}</span>
            </div>
            
            {/* Телефон клиента */}
            {call.client_phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{call.client_phone}</span>
              </div>
            )}
          </div>
          
          {/* Тип звонка */}
          <Badge variant="secondary" className="text-xs h-5">
            {call.call_type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
