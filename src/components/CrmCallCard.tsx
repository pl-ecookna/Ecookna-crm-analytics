import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Phone, CheckCircle, Loader2, XCircle, Clock, Calendar } from "lucide-react";

interface CrmCallCardProps {
  call: {
    id: number;
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
  };
  onClick: (id: number) => void;
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

export const CrmCallCard: React.FC<CrmCallCardProps> = ({ call, onClick }) => {
  return (
    <Card 
      className={`${getSuccessColor(call.call_success)} cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border`}
      onClick={() => onClick(call.id)}
    >
      <CardContent className="p-4">
        {/* Верхняя часть */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Цветной индикатор статуса */}
              <div className={`w-2 h-2 rounded-full ${getSuccessIndicatorColor(call.call_success)}`} />
              <span className="font-mono font-semibold text-foreground">{call.call_id}</span>
            </div>
            
            {/* Дата */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(call.call_datetime)}</span>
            </div>
            
            {/* Имя оператора */}
            <div className="font-medium text-sm mb-1 truncate">
              {decodeUserName(call.user_name)}
            </div>
            
            {/* Бренд и отдел */}
            <div className="text-xs text-muted-foreground truncate">
              {call.brand} • {call.department}
            </div>
          </div>
          
          {/* Правая верхняя часть */}
          <div className="flex flex-col items-end gap-1 ml-3">
            {/* Балл */}
            <div className={`text-lg font-bold ${getScoreColor(call.overall_score)}`}>
              {call.overall_score}/10
            </div>
            
            {/* Статус обработки */}
            <div className="flex items-center">
              {getFileStatusIcon(call.file_status)}
            </div>
          </div>
        </div>
        
        {/* Нижняя часть */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {/* Длительность */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{formatDuration(call.conversation_duration_minutes)}</span>
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