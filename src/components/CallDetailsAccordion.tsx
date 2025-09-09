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
  Calendar
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
      {/* Общая информация */}
      <AccordionItem value="general" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Общая информация</span>
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm font-medium ${getScoreColor(completed, total)}`}>
                {completed}/{total}
              </span>
              <CheckCircle className={`h-4 w-4 ${getScoreColor(completed, total)}`} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Критерии выполнения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Правильное приветствие</span>
                  {call.greeting_correct ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Назвал имя</span>
                  {call.operator_said_name ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Выяснил причину</span>
                  {call.cause_identified ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Определил причину</span>
                  {call.cause_clarified ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Уточнение адреса</span>
                  {call.address_clarified ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Работа с клиентом</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Первичный звонок</span>
                  {call.is_first_contact ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Активное слушание</span>
                  {call.active_listening_done ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Полнота ответа</span>
                  {call.answer_complete ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Поблагодарил</span>
                  {call.operator_thanked ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Помощь клиенту</span>
                  {call.client_helped ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Соответствие регламенту</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оценка</span>
                    <Badge className={`text-xs ${
                      (call.compliance_score || 0) >= 4 ? 'bg-success/10 text-success border-success/20' :
                      (call.compliance_score || 0) >= 3 ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {call.compliance_score || 0}/5
                    </Badge>
                  </div>
                  <Progress 
                    value={((call.compliance_score || 0) / 5) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Этапы разговора */}
      <AccordionItem value="stages" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Этапы разговора</span>
            <div className="ml-auto flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatDuration(call.conversation_duration_total)}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Длительность этапов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Приветствие</span>
                  <span className="text-sm font-medium">{call.conversation_stage_greeting || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Выяснение</span>
                  <span className="text-sm font-medium">{call.conversation_stage_request || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Решение</span>
                  <span className="text-sm font-medium">{call.conversation_stage_solution || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Завершение</span>
                  <span className="text-sm font-medium">{call.conversation_stage_closing || '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Общая информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Общая длительность:</span>
                  <span className="text-sm font-medium">{formatDuration(call.conversation_duration_total)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Дата звонка:</span>
                  <span className="text-sm font-medium">
                    {new Date(call.call_datetime).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Тип звонка:</span>
                  <Badge variant="secondary" className="text-xs">
                    {call.call_type || 'Не указан'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Качественные показатели */}
      <AccordionItem value="quality" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Качественные показатели</span>
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm font-medium ${getRiskColor(call.conflict_risk_score)}`}>
                {getRiskLevel(call.conflict_risk_score)}
              </span>
              <AlertTriangle className={`h-4 w-4 ${getRiskColor(call.conflict_risk_score)}`} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Тональность и поведение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Тональность оператора:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {call.operator_tonality || 'Не указана'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Признаки выгорания:</span>
                  <Badge className={`ml-2 text-xs ${
                    call.burnout_level === 'Не выявлено' ? 'bg-success/10 text-success border-success/20' :
                    call.burnout_level === 'Легкие признаки' ? 'bg-warning/10 text-warning border-warning/20' :
                    call.burnout_level === 'Явные признаки' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-muted/10 text-muted-foreground border-muted/20'
                  }`}>
                    {call.burnout_level || 'Не определен'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Конфликты и решения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Разрешение конфликта</span>
                  {call.conflict_resolved ? 
                    <CheckCircle className="h-4 w-4 text-success" /> : 
                    <XCircle className="h-4 w-4 text-destructive" />
                  }
                </div>
                <div>
                  <span className="text-sm font-medium">Уровень риска конфликта:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress 
                      value={((call.conflict_risk_score || 0) / 10) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className={`text-sm font-medium ${getRiskColor(call.conflict_risk_score)}`}>
                      {call.conflict_risk_score || 0}/10
                    </span>
                  </div>
                </div>
                {call.conflict_moments && (
                  <div>
                    <span className="text-sm font-medium">Конфликтные моменты:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {call.conflict_moments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Анализ качества */}
      <AccordionItem value="analysis" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Анализ качества</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Итоговое заключение</CardTitle>
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
        </AccordionContent>
      </AccordionItem>

      {/* Балльная система */}
      <AccordionItem value="scoring" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Балльная система</span>
            <div className="ml-auto flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              <span className={`text-sm font-medium ${getScoreColor(call.overall_score, 10)}`}>
                {call.overall_score || 0}/10 баллов
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Баллы за этапы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Текущий балл</span>
                    <span className={`text-lg font-bold ${getScoreColor(call.stages_score, 6)}`}>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Баллы за качество</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Текущий балл</span>
                    <span className={`text-lg font-bold ${getScoreColor(call.quality_score, 4)}`}>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Общий балл</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Итоговая оценка</span>
                    <span className={`text-xl font-bold ${getScoreColor(call.overall_score, 10)}`}>
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
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Транскрипция */}
      <AccordionItem value="transcript" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Транскрипция</span>
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
                  Транскрипция недоступна
                </p>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};