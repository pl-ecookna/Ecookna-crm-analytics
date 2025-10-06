import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Award, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Phone,
  User,
  AlertTriangle,
  Star,
  Calendar,
  Timer,
  HandMetal,
  Smile,
  Frown,
  Meh,
  Volume,
  VolumeX,
  Mic,
  MicOff,
  Repeat,
  Pause,
  Activity,
  Zap
} from "lucide-react";
import TranscriptDisplay from "./TranscriptDisplay";
import type { Tables } from "@/integrations/supabase/types";

type CrmCallAnalysis = Tables<'crm_analytics'>;

interface CallDetailsAccordionProps {
  call: CrmCallAnalysis;
}

export const CallDetailsAccordion: React.FC<CallDetailsAccordionProps> = ({ call }) => {
  
  // Функция декодирования UTF-8
  const decodeUtf8 = (str: string | null): string | null => {
    if (!str) return null;
    try {
      return decodeURIComponent(escape(str));
    } catch {
      return str;
    }
  };
  
  // Утилитарные функции
  const calculateCriteriaScore = () => {
    const criteria = [
      call.greeting_correct,
      call.operator_said_name,
      call.cause_identified,
      call.cause_clarified,
      call.address_clarified,
      call.active_listening_done,
      call.answer_complete,
      call.operator_thanked,
      call.client_helped
    ];
    
    const completed = criteria.filter(Boolean).length;
    const total = criteria.length;
    return { completed, total };
  };

  const getRiskLevel = (score: number | null) => {
    if (!score) return 'Не определен';
    if (score <= 3) return 'Низкий риск';
    if (score <= 6) return 'Средний риск';
    return 'Высокий риск';
  };

  const getScoreColor = (current: number | null, max: number) => {
    if (!current) return 'text-muted-foreground';
    const percentage = (current / max) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score <= 3) return 'text-success';
    if (score <= 6) return 'text-warning';
    return 'text-destructive';
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return '—';
    return duration;
  };

  const { completed, total } = calculateCriteriaScore();

  return (
    <Accordion type="multiple" className="space-y-2">
      {/* 1. Временные характеристики */}
      <AccordionItem value="time-metrics" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Временные характеристики</span>
            <div className="ml-auto flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatDuration(call.conversation_duration_total)}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Общая длительность */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Общая длительность разговора
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{call.conversation_duration_minutes} мин</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(call.conversation_duration_total)}
                </p>
              </CardContent>
            </Card>

            {/* Этапы разговора с прогресс-барами */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Длительность этапов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Приветствие */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HandMetal className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Приветствие</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {call.conversation_stage_greeting || '—'}
                    </span>
                  </div>
                  {call.conversation_stage_greeting && (
                    <Progress 
                      value={(() => {
                        const match = call.conversation_stage_greeting?.match(/(\d+)/);
                        const seconds = match ? parseInt(match[1]) : 0;
                        const totalSeconds = (call.conversation_duration_minutes || 1) * 60;
                        return (seconds / totalSeconds) * 100;
                      })()}
                      className="h-2"
                    />
                  )}
                </div>

                {/* Выяснение */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Выяснение</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {call.conversation_stage_request || '—'}
                    </span>
                  </div>
                  {call.conversation_stage_request && (
                    <Progress 
                      value={(() => {
                        const match = call.conversation_stage_request?.match(/(\d+)/);
                        const seconds = match ? parseInt(match[1]) : 0;
                        const totalSeconds = (call.conversation_duration_minutes || 1) * 60;
                        return (seconds / totalSeconds) * 100;
                      })()}
                      className="h-2"
                    />
                  )}
                </div>

                {/* Решение */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Решение</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {call.conversation_stage_solution || '—'}
                    </span>
                  </div>
                  {call.conversation_stage_solution && (
                    <Progress 
                      value={(() => {
                        const match = call.conversation_stage_solution?.match(/(\d+)/);
                        const seconds = match ? parseInt(match[1]) : 0;
                        const totalSeconds = (call.conversation_duration_minutes || 1) * 60;
                        return (seconds / totalSeconds) * 100;
                      })()}
                      className="h-2"
                    />
                  )}
                </div>

                {/* Завершение */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Завершение</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {call.conversation_stage_closing || '—'}
                    </span>
                  </div>
                  {call.conversation_stage_closing && (
                    <Progress 
                      value={(() => {
                        const match = call.conversation_stage_closing?.match(/(\d+)/);
                        const seconds = match ? parseInt(match[1]) : 0;
                        const totalSeconds = (call.conversation_duration_minutes || 1) * 60;
                        return (seconds / totalSeconds) * 100;
                      })()}
                      className="h-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Критерии диалога */}
      <AccordionItem value="criteria" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Критерии диалога</span>
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm font-medium ${getScoreColor(completed, total)}`}>
                {completed}/{total}
              </span>
              <CheckCircle className={`h-4 w-4 ${getScoreColor(completed, total)}`} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Общий прогресс */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Общий прогресс выполнения критериев</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Выполнено</span>
                    <span className={`text-lg font-bold ${getScoreColor(completed, total)}`}>
                      {completed} из {total}
                    </span>
                  </div>
                  <Progress 
                    value={(completed / total) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Сетка критериев */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Детализация критериев</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Правильное приветствие */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Правильное приветствие</span>
                    {call.greeting_correct ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Назвал имя */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Назвал имя</span>
                    {call.operator_said_name ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Выяснил причину */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Выяснил причину</span>
                    {call.cause_identified ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Уточнил причину */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Уточнил причину</span>
                    {call.cause_clarified ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Уточнил адрес */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Уточнил адрес</span>
                    {call.address_clarified ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Активное слушание */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Активное слушание</span>
                    {call.active_listening_done ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Полнота ответа */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Полнота ответа</span>
                    {call.answer_complete ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Поблагодарил */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Поблагодарил клиента</span>
                    {call.operator_thanked ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Помог клиенту */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Помог клиенту</span>
                    {call.client_helped ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Разрешён конфликт */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Разрешён конфликт</span>
                    {call.conflict_resolved ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Первичный контакт */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Первичный контакт</span>
                    {call.is_first_contact ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Оценки и баллы */}
      <AccordionItem value="scores" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Оценки и баллы</span>
            <div className="ml-auto flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              <span className={`text-sm font-medium ${getScoreColor(call.overall_score, 10)}`}>
                {call.overall_score || 0}/10
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Общий балл */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  Общий балл
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className={`text-2xl font-bold ${getScoreColor(call.overall_score, 10)}`}>
                      {call.overall_score || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((call.overall_score || 0) / 10) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">Максимум: 10 баллов</span>
                </div>
              </CardContent>
            </Card>

            {/* Баллы за этапы */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Баллы за этапы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className={`text-2xl font-bold ${getScoreColor(call.stages_score, 6)}`}>
                      {call.stages_score || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((call.stages_score || 0) / 6) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">Максимум: 6 баллов</span>
                </div>
              </CardContent>
            </Card>

            {/* Баллы за качество */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Баллы за качество
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className={`text-2xl font-bold ${getScoreColor(call.quality_score, 4)}`}>
                      {call.quality_score || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((call.quality_score || 0) / 4) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">Максимум: 4 балла</span>
                </div>
              </CardContent>
            </Card>

            {/* Соответствие регламенту */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Соответствие регламенту
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className={`text-2xl font-bold ${getScoreColor(call.compliance_score, 5)}`}>
                      {call.compliance_score || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((call.compliance_score || 0) / 5) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">Максимум: 5 баллов</span>
                </div>
              </CardContent>
            </Card>

            {/* Риск конфликта */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Риск конфликта
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className={`text-2xl font-bold ${getRiskColor(call.conflict_risk_score)}`}>
                      {call.conflict_risk_score || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((call.conflict_risk_score || 0) / 10) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {getRiskLevel(call.conflict_risk_score)} (макс: 10)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CSI Score (плейсхолдер) */}
            <Card className="opacity-60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  CSI Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className="text-2xl font-bold text-muted-foreground">—</span>
                  </div>
                  <Progress 
                    value={0} 
                    className="h-3 opacity-50"
                  />
                  <span className="text-xs text-muted-foreground">Нет данных</span>
                </div>
              </CardContent>
            </Card>

            {/* FCR Score (плейсхолдер) */}
            <Card className="opacity-60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  FCR Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <span className="text-2xl font-bold text-muted-foreground">—</span>
                  </div>
                  <Progress 
                    value={0} 
                    className="h-3 opacity-50"
                  />
                  <span className="text-xs text-muted-foreground">Нет данных</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Качественные показатели */}
      <AccordionItem value="quality" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Качественные показатели</span>
            <div className="ml-auto flex items-center gap-2">
              <Badge className={
                call.call_success === 'Успешный' ? "bg-success/10 text-success border-success/20" : 
                call.call_success === 'Средний результат' ? "bg-warning/10 text-warning border-warning/20" :
                call.call_success === 'Неуспешный' ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-muted/10 text-muted-foreground border-muted/20"
              }>
                {call.call_success || "Не указан"}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Результат звонка */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Результат звонка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={
                  call.call_success === 'Успешный' ? "bg-success/10 text-success border-success/20 text-lg px-4 py-2" : 
                  call.call_success === 'Средний результат' ? "bg-warning/10 text-warning border-warning/20 text-lg px-4 py-2" :
                  call.call_success === 'Неуспешный' ? "bg-destructive/10 text-destructive border-destructive/20 text-lg px-4 py-2" :
                  "bg-muted/10 text-muted-foreground border-muted/20 text-lg px-4 py-2"
                }>
                  {call.call_success || "Не указан"}
                </Badge>
              </CardContent>
            </Card>

            {/* Тональность и выгорание */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    Тональность оператора
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{call.operator_tonality || 'Не указана'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Признаки выгорания
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={
                    call.burnout_level === 'Не выявлено' ? 'bg-success/10 text-success border-success/20' :
                    call.burnout_level === 'Легкие признаки' ? 'bg-warning/10 text-warning border-warning/20' :
                    call.burnout_level === 'Явные признаки' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-muted/10 text-muted-foreground border-muted/20'
                  }>
                    {call.burnout_level || 'Не определен'}
                  </Badge>
                  {call.burnout_signs && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {typeof call.burnout_signs === 'string' 
                        ? call.burnout_signs 
                        : JSON.stringify(call.burnout_signs)
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Конфликтные моменты */}
            {call.conflict_moments && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Конфликтные моменты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{call.conflict_moments}</p>
                </CardContent>
              </Card>
            )}

            {/* Итоговое заключение */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Итоговое заключение
                </CardTitle>
              </CardHeader>
              <CardContent>
                {call.final_conclusion ? (
                  <p className="text-sm leading-relaxed">{call.final_conclusion}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Итоговое заключение не предоставлено
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Тег */}
            {call.tag && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Тег</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{call.tag}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 5. Речевые метрики */}
      <AccordionItem value="speech-metrics" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Mic className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Речевые метрики</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Оператор */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Оператор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Длительность речи</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).operator_speech_duration ? `${(call as any).operator_speech_duration.toFixed(1)} сек` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Количество слов</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).operator_words_count ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Темп речи</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).operator_speech_rate ? `${(call as any).operator_speech_rate.toFixed(1)} сл/мин` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Средняя скорость</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).agent_speech_speed_words_all_call_mean ? `${(call as any).agent_speech_speed_words_all_call_mean.toFixed(1)} сл/мин` : '—'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Процент речи</span>
                    <span className="text-sm font-medium">
                      {(call as any).percentage_speech_operator ? `${((call as any).percentage_speech_operator * 100).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  {(call as any).percentage_speech_operator && (
                    <Progress value={(call as any).percentage_speech_operator * 100} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Клиент */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Клиент
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Длительность речи</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).client_speech_duration ? `${(call as any).client_speech_duration.toFixed(1)} сек` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Количество слов</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).client_words_count ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Темп речи</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(call as any).client_speech_rate ? `${(call as any).client_speech_rate.toFixed(1)} сл/мин` : '—'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Процент речи</span>
                    <span className="text-sm font-medium">
                      {(call as any).percentage_speech_client ? `${((call as any).percentage_speech_client * 100).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  {(call as any).percentage_speech_client && (
                    <Progress value={(call as any).percentage_speech_client * 100} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 6. Эмоции */}
      <AccordionItem value="emotions" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Smile className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Эмоции</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Эмоции оператора */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Эмоции оператора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Smile className="h-5 w-5 mx-auto mb-1 text-success" />
                    <p className="text-xs font-medium">Позитивные</p>
                    <p className="text-sm font-bold">
                      {(call as any).operator_emotion_positive ? `${((call as any).operator_emotion_positive * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Meh className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">Нейтральные</p>
                    <p className="text-sm font-bold">
                      {(call as any).operator_emotion_neutral ? `${((call as any).operator_emotion_neutral * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Frown className="h-5 w-5 mx-auto mb-1 text-destructive" />
                    <p className="text-xs font-medium">Негативные</p>
                    <p className="text-sm font-bold">
                      {(call as any).operator_emotion_negative ? `${((call as any).operator_emotion_negative * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">% негатива по времени</span>
                  <span className="text-sm font-medium">
                    {(call as any).agent_emotion_neg_speech_time_percentage ? `${((call as any).agent_emotion_neg_speech_time_percentage * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">% нейтрала по времени</span>
                  <span className="text-sm font-medium">
                    {(call as any).agent_emotion_neu_speech_time_percentage ? `${((call as any).agent_emotion_neu_speech_time_percentage * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Эмоции клиента */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Эмоции клиента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Smile className="h-5 w-5 mx-auto mb-1 text-success" />
                    <p className="text-xs font-medium">Позитивные</p>
                    <p className="text-sm font-bold">
                      {(call as any).client_emotion_positive ? `${((call as any).client_emotion_positive * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Meh className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">Нейтральные</p>
                    <p className="text-sm font-bold">
                      {(call as any).client_emotion_neutral ? `${((call as any).client_emotion_neutral * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <Frown className="h-5 w-5 mx-auto mb-1 text-destructive" />
                    <p className="text-xs font-medium">Негативные</p>
                    <p className="text-sm font-bold">
                      {(call as any).client_emotion_negative ? `${((call as any).client_emotion_negative * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">% негатива по времени</span>
                  <span className="text-sm font-medium">
                    {(call as any).customer_emotion_neg_speech_time_percentage ? `${((call as any).customer_emotion_neg_speech_time_percentage * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Средний эмоц. балл</span>
                  <span className="text-sm font-medium">
                    {(call as any).customer_emo_score_mean ? (call as any).customer_emo_score_mean.toFixed(2) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Динамика эмоций */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Динамика эмоций
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${(call as any).positive_emotion_delta && (call as any).positive_emotion_delta > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Дельта позитива</span>
                  </div>
                  <span className={`text-sm font-medium ${(call as any).positive_emotion_delta && (call as any).positive_emotion_delta > 0 ? 'text-success' : (call as any).positive_emotion_delta && (call as any).positive_emotion_delta < 0 ? 'text-destructive' : ''}`}>
                    {(call as any).positive_emotion_delta ? `${(call as any).positive_emotion_delta > 0 ? '+' : ''}${((call as any).positive_emotion_delta * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 rotate-180 ${(call as any).negative_emotion_delta && (call as any).negative_emotion_delta < 0 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Дельта негатива</span>
                  </div>
                  <span className={`text-sm font-medium ${(call as any).negative_emotion_delta && (call as any).negative_emotion_delta > 0 ? 'text-destructive' : (call as any).negative_emotion_delta && (call as any).negative_emotion_delta < 0 ? 'text-success' : ''}`}>
                    {(call as any).negative_emotion_delta ? `${(call as any).negative_emotion_delta > 0 ? '+' : ''}${((call as any).negative_emotion_delta * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${(call as any).emotion_stress_index ? ((call as any).emotion_stress_index > 0.6 ? 'text-destructive' : (call as any).emotion_stress_index > 0.3 ? 'text-warning' : 'text-success') : 'text-muted-foreground'}`} />
                    <span className="text-sm">Индекс стресса</span>
                  </div>
                  <span className={`text-sm font-medium ${(call as any).emotion_stress_index ? ((call as any).emotion_stress_index > 0.6 ? 'text-destructive' : (call as any).emotion_stress_index > 0.3 ? 'text-warning' : 'text-success') : ''}`}>
                    {(call as any).emotion_stress_index ? (call as any).emotion_stress_index.toFixed(2) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 7. Характеристики диалога */}
      <AccordionItem value="dialog-characteristics" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Repeat className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Характеристики диалога</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Прерывания
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Прерывания оператора</span>
                  <span className="text-sm font-medium">{(call as any).interruptions_operator ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Прерывания клиента</span>
                  <span className="text-sm font-medium">{(call as any).interruptions_client ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm">Прерываний в минуту</span>
                  </div>
                  <span className="text-sm font-medium">{(call as any).interruptions_per_min ? (call as any).interruptions_per_min.toFixed(1) : '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Распределение речи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Речь оператора</span>
                    <span className="text-sm font-medium">{(call as any).dialog_agent_speech_percentage ? `${((call as any).dialog_agent_speech_percentage * 100).toFixed(1)}%` : '—'}</span>
                  </div>
                  {(call as any).dialog_agent_speech_percentage && <Progress value={(call as any).dialog_agent_speech_percentage * 100} className="h-2" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Речь клиента</span>
                    <span className="text-sm font-medium">{(call as any).dialog_customer_speech_percentage ? `${((call as any).dialog_customer_speech_percentage * 100).toFixed(1)}%` : '—'}</span>
                  </div>
                  {(call as any).dialog_customer_speech_percentage && <Progress value={(call as any).dialog_customer_speech_percentage * 100} className="h-2" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4" />
                      <span className="text-sm">Молчание</span>
                    </div>
                    <span className="text-sm font-medium">{(call as any).dialog_silence_length_percentage ? `${((call as any).dialog_silence_length_percentage * 100).toFixed(1)}%` : '—'}</span>
                  </div>
                  {(call as any).dialog_silence_length_percentage && <Progress value={(call as any).dialog_silence_length_percentage * 100} className="h-2" />}
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 8. Паузы и молчание */}
      <AccordionItem value="pauses" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Pause className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Паузы и молчание</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Оператор */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Паузы оператора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    <span className="text-sm">Длительность пауз</span>
                  </div>
                  <span className="text-sm font-medium">{(call as any).operator_silence_duration ? `${(call as any).operator_silence_duration.toFixed(1)} сек` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Среднее время ответа</span>
                  </div>
                  <span className="text-sm font-medium">{(call as any).average_response_time_operator ? `${(call as any).average_response_time_operator.toFixed(1)} сек` : '—'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Клиент */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Паузы клиента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    <span className="text-sm">Длительность пауз</span>
                  </div>
                  <span className="text-sm font-medium">{(call as any).client_silence_duration ? `${(call as any).client_silence_duration.toFixed(1)} сек` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    <span className="text-sm">Среднее молчание между репликами</span>
                  </div>
                  <span className="text-sm font-medium">{(call as any).silence_between_turns_avg ? `${(call as any).silence_between_turns_avg.toFixed(1)} сек` : '—'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Общие характеристики пауз */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Общие характеристики
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Процент молчания</span>
                    <span className="text-sm font-medium">{(call as any).silence_ratio ? `${((call as any).silence_ratio * 100).toFixed(1)}%` : '—'}</span>
                  </div>
                  {(call as any).silence_ratio && <Progress value={(call as any).silence_ratio * 100} className="h-2" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Соотношение речи оператор/клиент</span>
                  <span className="text-sm font-medium">{(call as any).speech_ratio_operator_client ? (call as any).speech_ratio_operator_client.toFixed(2) : '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 9. Стенограмма */}
      <AccordionItem value="transcript" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Стенограмма</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Полный текст разговора</CardTitle>
            </CardHeader>
            <CardContent>
              {call.transkription ? (
                <TranscriptDisplay 
                  transcript={call.transkription} 
                  operatorName={decodeUtf8(call.user_name) || undefined}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Стенограмма недоступна
                </p>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};