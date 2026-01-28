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
  
  // Функция извлечения данных из transkription_full_json
  const getCallFeature = (featureName: string): number | null => {
    try {
      const json = (call as any).transkription_full_json;
      if (!json?.insight_result?.call_features) return null;
      return json.insight_result.call_features[featureName] ?? null;
    } catch {
      return null;
    }
  };

  // Форматирование времени в читаемый формат
  const formatSeconds = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins} мин ${secs} сек` : `${secs} сек`;
  };

  // Форматирование минут (decimal) в читаемый формат
  const formatMinutes = (minutes: number | null): string => {
    if (minutes === null || minutes === undefined) return '—';
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  // Форматирование скорости речи
  const formatSpeechSpeed = (speedPerSecond: number | null): string => {
    if (speedPerSecond === null || speedPerSecond === undefined) return '—';
    const wordsPerMinute = Math.round(speedPerSecond * 60);
    return `${wordsPerMinute} сл/мин`;
  };

  // Расчёт баланса диалога
  const calculateSpeechBalance = (): string => {
    const agentPercentage = getCallFeature('dialog_agent_speech_percentage');
    const customerPercentage = getCallFeature('dialog_customer_speech_percentage');
    
    if (!agentPercentage || !customerPercentage) return '—';
    
    const ratio = agentPercentage / customerPercentage;
    return `${ratio.toFixed(1)}:1`;
  };

  // Получение цвета для доли тишины
  const getSilenceColor = (silencePercentage: number | null): string => {
    if (silencePercentage === null) return 'text-muted-foreground';
    const percentage = silencePercentage * 100;
    if (percentage > 60) return 'text-destructive';
    if (percentage > 40) return 'text-warning';
    return 'text-success';
  };

  // Получение цвета для баланса речи
  const getBalanceColor = (agentPercentage: number | null, customerPercentage: number | null): string => {
    if (!agentPercentage || !customerPercentage) return 'text-muted-foreground';
    const ratio = agentPercentage / customerPercentage;
    // Оптимальный баланс 1.5:1 - 2:1
    if (ratio >= 1.5 && ratio <= 2) return 'text-success';
    if (ratio >= 1.2 && ratio <= 2.5) return 'text-warning';
    return 'text-destructive';
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
                <p className="text-2xl font-bold">{formatMinutes(call.conversation_duration_minutes)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(call.conversation_duration_total)}
                </p>
              </CardContent>
            </Card>

            {/* Этапы разговора с прогресс-барами - СКРЫТО */}
            <Card className="hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Длительность этапов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Колонка 1: Приветствие и Выяснение */}
                  <div className="space-y-3">
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
                  </div>

                  {/* Колонка 2: Решение и Завершение */}
                  <div className="space-y-3">
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
                  </div>
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

            {/* CSI Score */}
            <Card className={(call as any).csi_score == null ? "opacity-60" : ""}>
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
                    {(call as any).csi_score != null ? (
                      <span className={`text-2xl font-bold ${(call as any).csi_score === 1 ? 'text-success' : 'text-destructive'}`}>
                        {(call as any).csi_score}
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">—</span>
                    )}
                  </div>
                  {(call as any).csi_score != null ? (
                    <Progress 
                      value={(call as any).csi_score * 100} 
                      className="h-3"
                    />
                  ) : (
                    <Progress 
                      value={0} 
                      className="h-3 opacity-50"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(call as any).csi_score != null 
                      ? ((call as any).csi_score === 1 ? 'Позитивная оценка' : 'Негативная оценка')
                      : 'Нет данных'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* FCR Score */}
            <Card className={(call as any).fcr_score == null ? "opacity-60" : ""}>
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
                    {(call as any).fcr_score != null ? (
                      <span className={`text-2xl font-bold ${Number((call as any).fcr_score) === 1 ? 'text-success' : 'text-destructive'}`}>
                        {Number((call as any).fcr_score)}
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">—</span>
                    )}
                  </div>
                  {(call as any).fcr_score != null ? (
                    <Progress 
                      value={Number((call as any).fcr_score) * 100} 
                      className="h-3"
                    />
                  ) : (
                    <Progress 
                      value={0} 
                      className="h-3 opacity-50"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(call as any).fcr_score != null 
                      ? (Number((call as any).fcr_score) === 1 ? 'Позитивная оценка' : 'Негативная оценка')
                      : 'Нет данных'
                    }
                  </span>
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
                    call.burnout_level !== null && call.burnout_level < 0.3 ? 'bg-success/10 text-success border-success/20' :
                    call.burnout_level !== null && call.burnout_level < 0.6 ? 'bg-warning/10 text-warning border-warning/20' :
                    call.burnout_level !== null && call.burnout_level >= 0.6 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-muted/10 text-muted-foreground border-muted/20'
                  }>
                    {call.burnout_level !== null 
                      ? (call.burnout_level < 0.3 ? 'Не выявлено' : call.burnout_level < 0.6 ? 'Легкие признаки' : 'Явные признаки')
                      : 'Не определен'}
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
            {/* Речь оператора */}
            <Card className={!getCallFeature('agent_speech_length_sum') ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Речь оператора
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Длительность:</span>
                      <span className="font-medium">
                        {formatSeconds(getCallFeature('agent_speech_length_sum'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Слов:</span>
                      <span className="font-medium">
                        {getCallFeature('agent_n_words_sum')?.toLocaleString() || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скорость:</span>
                      <span className="font-medium">
                        {formatSpeechSpeed(getCallFeature('agent_speech_speed_words_all_call_mean'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Реплик:</span>
                      <span className="font-medium">
                        {getCallFeature('agent_utt_count') || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Средняя реплика:</span>
                      <span className="font-medium">
                        {formatSeconds(getCallFeature('agent_utt_length_mean'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Прерываний:</span>
                      <span className="font-medium">
                        {getCallFeature('dialog_interruptions_in_agent_speech_percentage') !== null
                          ? `${((getCallFeature('dialog_interruptions_in_agent_speech_percentage') || 0) * 100).toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar для доли речи */}
                  {getCallFeature('dialog_agent_speech_percentage') !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Доля речи:</span>
                        <span className="font-medium">
                          {((getCallFeature('dialog_agent_speech_percentage') || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(getCallFeature('dialog_agent_speech_percentage') || 0) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Речь клиента */}
            <Card className={!getCallFeature('customer_speech_length_sum') ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Речь клиента
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Длительность:</span>
                      <span className="font-medium">
                        {formatSeconds(getCallFeature('customer_speech_length_sum'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Слов:</span>
                      <span className="font-medium">
                        {getCallFeature('customer_n_words_sum')?.toLocaleString() || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скорость:</span>
                      <span className="font-medium">
                        {formatSpeechSpeed(getCallFeature('customer_speech_speed_words_all_call_mean'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Реплик:</span>
                      <span className="font-medium">
                        {getCallFeature('customer_utt_count') || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Средняя реплика:</span>
                      <span className="font-medium">
                        {formatSeconds(getCallFeature('customer_utt_length_mean'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Прерываний:</span>
                      <span className="font-medium">
                        {getCallFeature('dialog_interruptions_count') !== null
                          ? getCallFeature('dialog_interruptions_count')
                          : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar для доли речи */}
                  {getCallFeature('dialog_customer_speech_percentage') !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Доля речи:</span>
                        <span className="font-medium">
                          {((getCallFeature('dialog_customer_speech_percentage') || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(getCallFeature('dialog_customer_speech_percentage') || 0) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Баланс диалога - визуальный чарт */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Баланс диалога
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const agentPercent = (getCallFeature('dialog_agent_speech_percentage') || 0) * 100;
                const customerPercent = (getCallFeature('dialog_customer_speech_percentage') || 0) * 100;
                const silencePercent = (getCallFeature('dialog_silence_length_percentage') || 0) * 100;
                const hasData = agentPercent > 0 || customerPercent > 0 || silencePercent > 0;
                
                return (
                  <div className={!hasData ? 'opacity-60' : ''}>
                    {/* Легенда с процентами */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span className="text-xs">Оператор: {agentPercent.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-400"></div>
                        <span className="text-xs">Клиент: {customerPercent.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-400"></div>
                        <span className="text-xs">Тишина: {silencePercent.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {/* Стековый прогресс бар */}
                    <div className="relative h-8 w-full bg-muted/30 rounded-md overflow-hidden flex">
                      <div 
                        className="bg-primary h-full transition-all" 
                        style={{width: `${agentPercent}%`}}
                      />
                      <div 
                        className="bg-blue-400 h-full transition-all" 
                        style={{width: `${customerPercent}%`}}
                      />
                      <div 
                        className="bg-yellow-400 h-full transition-all" 
                        style={{width: `${silencePercent}%`}}
                      />
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Эмоции оператора */}
            <Card className={!(call as any).operator_emotion_positive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Эмоции оператора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Smile className="h-3 w-3 text-success" />
                      Позитивные
                    </span>
                    <span className="font-medium">
                      {(call as any).operator_emotion_positive ? `${((call as any).operator_emotion_positive * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).operator_emotion_positive && (
                    <Progress value={(call as any).operator_emotion_positive * 100} className="h-2" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Meh className="h-3 w-3 text-warning" />
                      Нейтральные
                    </span>
                    <span className="font-medium">
                      {(call as any).operator_emotion_neutral ? `${((call as any).operator_emotion_neutral * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).operator_emotion_neutral && (
                    <Progress value={(call as any).operator_emotion_neutral * 100} className="h-2" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Frown className="h-3 w-3 text-destructive" />
                      Негативные
                    </span>
                    <span className="font-medium">
                      {(call as any).operator_emotion_negative ? `${((call as any).operator_emotion_negative * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).operator_emotion_negative && (
                    <Progress value={(call as any).operator_emotion_negative * 100} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Эмоции клиента */}
            <Card className={!(call as any).client_emotion_positive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Эмоции клиента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Smile className="h-3 w-3 text-success" />
                      Позитивные
                    </span>
                    <span className="font-medium">
                      {(call as any).client_emotion_positive ? `${((call as any).client_emotion_positive * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).client_emotion_positive && (
                    <Progress value={(call as any).client_emotion_positive * 100} className="h-2" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Meh className="h-3 w-3 text-warning" />
                      Нейтральные
                    </span>
                    <span className="font-medium">
                      {(call as any).client_emotion_neutral ? `${((call as any).client_emotion_neutral * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).client_emotion_neutral && (
                    <Progress value={(call as any).client_emotion_neutral * 100} className="h-2" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Frown className="h-3 w-3 text-destructive" />
                      Негативные
                    </span>
                    <span className="font-medium">
                      {(call as any).client_emotion_negative ? `${((call as any).client_emotion_negative * 100).toFixed(1)}%` : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).client_emotion_negative && (
                    <Progress value={(call as any).client_emotion_negative * 100} className="h-2" />
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Время негативных эмоций</span>
                  <span className="font-medium">
                    {(call as any).customer_emotion_neg_speech_time_percentage ? `${((call as any).customer_emotion_neg_speech_time_percentage * 100).toFixed(1)}%` : 'Нет данных'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Средний эмоц. счет</span>
                  <span className="font-medium">
                    {(call as any).customer_emo_score_mean ? (call as any).customer_emo_score_mean.toFixed(2) : 'Нет данных'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Индекс стресса */}
            <Card className={!(call as any).emotion_stress_index ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Индекс стресса
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {(call as any).emotion_stress_index ? (call as any).emotion_stress_index.toFixed(3) : 'Нет данных'}
                    </span>
                  </div>
                  {(call as any).emotion_stress_index && (
                    <Progress 
                      value={(call as any).emotion_stress_index * 100} 
                      className="h-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 7. Стенограмма */}
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