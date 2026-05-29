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
  Timer,
  HandMetal,
  Mic,
  Repeat,
  Activity,
  Cpu,
  Waves,
  Radar,
  Volume2,
  ExternalLink,
} from "lucide-react";
import TranscriptDisplay from "./TranscriptDisplay";
import type { CrmCallDetails, SpeechAnalysisPayload } from "@ecookna/shared-types";

type CrmCallAnalysis = CrmCallDetails;

interface CallDetailsAccordionProps {
  call: CrmCallAnalysis;
}

export const CallDetailsAccordion: React.FC<CallDetailsAccordionProps> = ({ call }) => {
  type YandexPhrase = {
    channelNumber?: number | string;
    channel_number?: number | string;
    startTimeMs?: number | string;
    start_time_ms?: number | string;
    endTimeMs?: number | string;
    end_time_ms?: number | string;
    phrase?: {
      text?: string;
      normalizedText?: string;
      normalized_text?: string;
    };
  };

  type YandexTalk = {
    id?: string;
    transcription?: {
      phrases?: YandexPhrase[];
    };
    speechStatistics?: unknown;
    speech_statistics?: unknown;
    silenceStatistics?: {
      totalSimultaneousSilenceRatio?: number | string;
      total_simultaneous_silence_ratio?: number | string;
    };
    silence_statistics?: {
      totalSimultaneousSilenceRatio?: number | string;
      total_simultaneous_silence_ratio?: number | string;
    };
    conversationStatistics?: {
      conversationBoundaries?: {
        durationSeconds?: number | string;
        duration_seconds?: number | string;
      };
      conversation_boundaries?: {
        durationSeconds?: number | string;
        duration_seconds?: number | string;
      };
    };
    conversation_statistics?: {
      conversationBoundaries?: {
        durationSeconds?: number | string;
        duration_seconds?: number | string;
      };
      conversation_boundaries?: {
        durationSeconds?: number | string;
        duration_seconds?: number | string;
      };
    };
    talkState?: {
      processingState?: string;
      processing_state?: string;
      algorithmProcessingInfos?: Array<{
        algorithm?: string;
        processingState?: string;
        processing_state?: string;
      }>;
      algorithm_processing_infos?: Array<{
        algorithm?: string;
        processingState?: string;
        processing_state?: string;
      }>;
    };
    talk_state?: {
      processingState?: string;
      processing_state?: string;
      algorithmProcessingInfos?: Array<{
        algorithm?: string;
        processingState?: string;
        processing_state?: string;
      }>;
      algorithm_processing_infos?: Array<{
        algorithm?: string;
        processingState?: string;
        processing_state?: string;
      }>;
    };
  };

  type SpeechAnalysisJson = SpeechAnalysisPayload;

  const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  
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
      if (!normalizedCallFeatures) return null;
      return toNullableNumber(normalizedCallFeatures[featureName]);
    } catch {
      return null;
    }
  };

  const getRawCallFeature = (featureName: string): number | null => {
    try {
      const features = rawInsightResult?.call_features;
      if (!features) return null;
      return toNullableNumber(features[featureName]);
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

  const formatPercentValue = (value: number | null, digits = 1): string => {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(digits)}%`;
  };

  const formatTimestamp = (value: string | null | undefined) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const pick = <T,>(object: Record<string, unknown> | null | undefined, ...keys: string[]): T | undefined => {
    for (const key of keys) {
      if (object && object[key] !== undefined) {
        return object[key] as T;
      }
    }
    return undefined;
  };

  const getSpeechAnalysisJson = (): SpeechAnalysisJson | null => {
    if (!call.transkription_full_json || typeof call.transkription_full_json !== 'object') return null;
    return call.transkription_full_json as SpeechAnalysisJson;
  };

  const speechAnalysis = getSpeechAnalysisJson();
  const speechProvider = String(speechAnalysis?.provider || '').trim().toLowerCase();
  const isSberProvider = speechProvider === 'sber';
  const isYandexProvider = speechProvider === 'yandex';
  const providerResult = speechAnalysis?.provider_result && typeof speechAnalysis.provider_result === 'object'
    ? speechAnalysis.provider_result
    : null;
  const rawInsightResult = providerResult?.insight_result && typeof providerResult.insight_result === 'object'
    ? providerResult.insight_result
    : null;
  const normalizedCallFeatures = (
    speechAnalysis?.insight_result?.call_features
    || rawInsightResult?.call_features
    || {}
  ) as Record<string, unknown>;
  const yandexTalk = isYandexProvider && Array.isArray(providerResult?.talk)
    ? providerResult.talk?.[0] || null
    : null;

  const rawPhrases = Array.isArray(yandexTalk?.transcription?.phrases) ? yandexTalk.transcription.phrases : [];
  const timelineSegments = rawPhrases
    .map((phrase) => {
      const startMs = toNullableNumber(pick<number | string>(phrase as Record<string, unknown>, 'startTimeMs', 'start_time_ms'));
      const endMs = toNullableNumber(pick<number | string>(phrase as Record<string, unknown>, 'endTimeMs', 'end_time_ms'));
      const channel = toNullableNumber(pick<number | string>(phrase as Record<string, unknown>, 'channelNumber', 'channel_number')) ?? 0;
      const phraseBody = (phrase?.phrase || {}) as Record<string, unknown>;
      const text = String(
        pick<string>(phraseBody, 'normalizedText', 'normalized_text')
          || pick<string>(phraseBody, 'text')
          || '',
      ).trim();

      if (startMs === null || endMs === null || endMs <= startMs || !text) return null;

      return {
        channel,
        startMs,
        endMs,
        durationMs: endMs - startMs,
        text,
      };
    })
    .filter((segment): segment is NonNullable<typeof segment> => Boolean(segment))
    .sort((a, b) => a.startMs - b.startMs);

  const conversationDurationMs = (() => {
    const fromBoundaries = toNullableNumber(
      pick<number | string>(
        (pick<Record<string, unknown>>(yandexTalk as Record<string, unknown>, 'conversationStatistics', 'conversation_statistics')
          ? {
              ...(pick<Record<string, unknown>>(yandexTalk as Record<string, unknown>, 'conversationStatistics', 'conversation_statistics') || {}),
              ...(pick<Record<string, unknown>>(
                pick<Record<string, unknown>>(yandexTalk as Record<string, unknown>, 'conversationStatistics', 'conversation_statistics'),
                'conversationBoundaries',
                'conversation_boundaries',
              ) || {}),
            }
          : null),
        'durationSeconds',
        'duration_seconds',
      ),
    );

    if (fromBoundaries !== null && fromBoundaries > 0) {
      return fromBoundaries * 1000;
    }

    if (timelineSegments.length === 0) return null;
    const minStart = Math.min(...timelineSegments.map((segment) => segment.startMs));
    const maxEnd = Math.max(...timelineSegments.map((segment) => segment.endMs));
    return Math.max(0, maxEnd - minStart);
  })();

  const talkState = String(
    pick<string>(yandexTalk?.talkState as Record<string, unknown>, 'processingState', 'processing_state')
      || pick<string>(yandexTalk?.talk_state as Record<string, unknown>, 'processingState', 'processing_state')
      || '',
  ).trim();

  const algorithmStates = (
    pick<Array<Record<string, unknown>>>(yandexTalk?.talkState as Record<string, unknown>, 'algorithmProcessingInfos', 'algorithm_processing_infos')
    || pick<Array<Record<string, unknown>>>(yandexTalk?.talk_state as Record<string, unknown>, 'algorithmProcessingInfos', 'algorithm_processing_infos')
    || []
  ).map((item) => ({
    algorithm: String(item.algorithm || '').trim(),
    state: String(
      pick<string>(item, 'processingState', 'processing_state') || '',
    ).trim(),
  })).filter((item) => item.algorithm && item.state);

  const statusTone = (state: string) => {
    if (state.includes('SUCCESS')) return 'bg-success/10 text-success border-success/20';
    if (state.includes('FAILED')) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (state.includes('PROCESSING')) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted/20 text-muted-foreground border-muted/20';
  };

  const statusLabel = (state: string) => {
    if (state.includes('SUCCESS')) return 'Готово';
    if (state.includes('FAILED')) return 'Ошибка';
    if (state.includes('PROCESSING')) return 'В обработке';
    if (state.includes('NOT_STARTED')) return 'Не начато';
    return state || '—';
  };

  const algorithmLabel = (algorithm: string) => {
    switch (algorithm) {
      case 'ALGORITHM_SPEECHKIT':
        return 'SpeechKit';
      case 'ALGORITHM_CLASSIFIER':
        return 'Классификатор';
      case 'ALGORITHM_SUMMARIZATION':
        return 'Суммаризация';
      case 'ALGORITHM_EMBEDDING':
        return 'Embedding';
      case 'ALGORITHM_ASSISTANT':
        return 'Assistant';
      default:
        return algorithm.replace('ALGORITHM_', '');
    }
  };

  const talkId = yandexTalk?.id || '—';
  const phrasesCount = timelineSegments.length;
  const silencePercent = getCallFeature('dialog_silence_length_percentage');
  const interruptionsCount = getCallFeature('dialog_interruptions_count');
  const operatorInterruptedPercent = getCallFeature('dialog_interruptions_in_agent_speech_percentage') !== null
    ? getCallFeature('dialog_interruptions_in_agent_speech_percentage')
    : null;
  const operatorSpeechPercent = getCallFeature('dialog_agent_speech_percentage');
  const customerSpeechPercent = getCallFeature('dialog_customer_speech_percentage');
  const nonSpeechPausePercent = (
    silencePercent === null
    || operatorSpeechPercent === null
    || customerSpeechPercent === null
  )
    ? null
    : Math.max(0, 1 - operatorSpeechPercent - customerSpeechPercent - silencePercent);
  const sberCsi = rawInsightResult?.csi && typeof rawInsightResult.csi === 'object'
    ? rawInsightResult.csi as Record<string, unknown>
    : null;
  const providerTalkCount = Array.isArray(providerResult?.result)
    ? providerResult.result.length
    : phrasesCount;
  const timelineHasData = Boolean(conversationDurationMs && conversationDurationMs > 0 && timelineSegments.length > 0);

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

  const getTransferQualityBadgeClass = (score: number | null, transferRequired: boolean | null) => {
    if (transferRequired === false) return 'bg-muted/10 text-muted-foreground border-muted/20';
    if (score === null) return 'bg-muted/10 text-muted-foreground border-muted/20';
    if (score >= 4) return 'bg-success/10 text-success border-success/20';
    if (score >= 3) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getTransferQualityLabel = (score: number | null, transferRequired: boolean | null, transferDone: boolean | null) => {
    if (transferRequired === false) return 'Не применимо';
    if (transferDone === false && score !== null) return `${score}/5 · Не выполнен`;
    if (score === null) return 'Не определено';
    return `${score}/5`;
  };

  const getTransferQualityHint = (score: number | null, transferRequired: boolean | null, transferDone: boolean | null) => {
    if (transferRequired === false) return 'Перевод по сценарию не требовался';
    if (transferDone === false) return 'Перевод требовался, но не был выполнен';
    if (score === null) return 'Нет данных по качеству перевода';
    if (score <= 2) return 'Низкое качество перевода влияет на оценку оператора';
    if (score === 3) return 'Перевод выполнен частично корректно';
    return 'Перевод выполнен корректно';
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return '—';
    return duration;
  };

  const formatScoreValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return String(value);
  };

  const formatBurnoutSigns = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item === null || item === undefined) return '';
          return String(item).trim();
        })
        .filter(Boolean)
        .filter((item) => item !== 'Не выявлено' && item !== 'Не определено');

      return normalized.length > 0 ? normalized.join(', ') : null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === 'Не выявлено' || trimmed === 'Не определено') {
        return null;
      }
      return trimmed;
    }

    return null;
  };

  const resolvedConversationDuration =
    call.conversation_duration_total || formatMinutes(call.conversation_duration_minutes);
  const callAudioUrl = typeof call.file_url === 'string' && call.file_url.trim() ? call.file_url.trim() : null;

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
                {resolvedConversationDuration}
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
                {call.conversation_duration_total ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {call.conversation_duration_total}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {/* Этапы разговора */}
            <Card>
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
                {formatScoreValue(call.overall_score)}/10
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
                      {formatScoreValue(call.overall_score)}
                    </span>
                  </div>
                  <Progress 
                    value={((call.overall_score ?? 0) / 10) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {call.overall_score === null || call.overall_score === undefined ? 'Не оценено' : 'Максимум: 10 баллов'}
                  </span>
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
                      {formatScoreValue(call.stages_score)}
                    </span>
                  </div>
                  <Progress 
                    value={((call.stages_score ?? 0) / 6) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {call.stages_score === null || call.stages_score === undefined ? 'Не оценено' : 'Максимум: 6 баллов'}
                  </span>
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
                      {formatScoreValue(call.quality_score)}
                    </span>
                  </div>
                  <Progress 
                    value={((call.quality_score ?? 0) / 4) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {call.quality_score === null || call.quality_score === undefined ? 'Не оценено' : 'Максимум: 4 балла'}
                  </span>
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
                      {formatScoreValue(call.compliance_score)}
                    </span>
                  </div>
                  <Progress 
                    value={((call.compliance_score ?? 0) / 5) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {call.compliance_score === null || call.compliance_score === undefined ? 'Не оценено' : 'Максимум: 5 баллов'}
                  </span>
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
                      {formatScoreValue(call.conflict_risk_score)}
                    </span>
                  </div>
                  <Progress 
                    value={((call.conflict_risk_score ?? 0) / 10) * 100} 
                    className="h-3"
                  />
                  <span className="text-xs text-muted-foreground">
                    {call.conflict_risk_score === null || call.conflict_risk_score === undefined
                      ? 'Не оценено'
                      : `${getRiskLevel(call.conflict_risk_score)} (макс: 10)`}
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
                    <Mic className="h-4 w-4" />
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
                  {formatBurnoutSigns(call.burnout_signs) ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatBurnoutSigns(call.burnout_signs)}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Качество перевода звонка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={getTransferQualityBadgeClass(call.transfer_quality ?? null, call.transfer_required ?? null)}>
                      {getTransferQualityLabel(
                        call.transfer_quality ?? null,
                        call.transfer_required ?? null,
                        call.transfer_done ?? null,
                      )}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getTransferQualityHint(
                        call.transfer_quality ?? null,
                        call.transfer_required ?? null,
                        call.transfer_done ?? null,
                      )}
                    </p>
                    {call.transfer_comment ? (
                      <p className="text-sm leading-relaxed">
                        {call.transfer_comment}
                      </p>
                    ) : null}
                  </div>
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
          {isYandexProvider && (talkState || algorithmStates.length > 0) && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Статус обработки анализа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusTone(talkState)}>
                    Общий статус: {statusLabel(talkState)}
                  </Badge>
                  {algorithmStates.map((item) => (
                    <Badge key={`${item.algorithm}-${item.state}`} variant="outline" className={statusTone(item.state)}>
                      {algorithmLabel(item.algorithm)}: {statusLabel(item.state)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isSberProvider && sberCsi && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  CSI анализа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Прогноз:</span>
                  <span className="font-medium text-right">{String(sberCsi.prediction ?? '—')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Положительный:</span>
                  <span className="font-medium text-right">{formatPercentValue(toNullableNumber(sberCsi.positive ?? null))}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Отрицательный:</span>
                  <span className="font-medium text-right">{formatPercentValue(toNullableNumber(sberCsi.negative ?? null))}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <span className="font-medium">{formatSeconds(getCallFeature('agent_speech_length_sum'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Слов:</span>
                      <span className="font-medium">{getCallFeature('agent_n_words_sum')?.toLocaleString() || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скорость:</span>
                      <span className="font-medium">{formatSpeechSpeed(getCallFeature('agent_speech_speed_words_all_call_mean'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Реплик:</span>
                      <span className="font-medium">{getCallFeature('agent_utt_count') || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Средняя реплика:</span>
                      <span className="font-medium">{formatSeconds(getCallFeature('agent_utt_length_mean'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Прерываний:</span>
                      <span className="font-medium">{formatPercentValue(operatorInterruptedPercent)}</span>
                    </div>
                  </div>
                  {getCallFeature('dialog_agent_speech_percentage') !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Доля речи:</span>
                        <span className="font-medium">{formatPercentValue(getCallFeature('dialog_agent_speech_percentage'))}</span>
                      </div>
                      <Progress
                        value={(getCallFeature('dialog_agent_speech_percentage') || 0) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  {isSberProvider && (
                    <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Эмоции оператора</div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Положительные:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('operator_emotion_positive'))}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Нейтральные:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('operator_emotion_neutral'))}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Негативные:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('operator_emotion_negative'))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                      <span className="font-medium">{formatSeconds(getCallFeature('customer_speech_length_sum'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Слов:</span>
                      <span className="font-medium">{getCallFeature('customer_n_words_sum')?.toLocaleString() || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скорость:</span>
                      <span className="font-medium">{formatSpeechSpeed(getCallFeature('customer_speech_speed_words_all_call_mean'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Реплик:</span>
                      <span className="font-medium">{getCallFeature('customer_utt_count') || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Средняя реплика:</span>
                      <span className="font-medium">{formatSeconds(getCallFeature('customer_utt_length_mean'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Перебиваний:</span>
                      <span className="font-medium">
                        {interruptionsCount !== null && interruptionsCount !== undefined ? interruptionsCount : '—'}
                      </span>
                    </div>
                  </div>
                  {getCallFeature('dialog_customer_speech_percentage') !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Доля речи:</span>
                        <span className="font-medium">{formatPercentValue(getCallFeature('dialog_customer_speech_percentage'))}</span>
                      </div>
                      <Progress
                        value={(getCallFeature('dialog_customer_speech_percentage') || 0) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  {isSberProvider && (
                    <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Эмоции клиента</div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Средний скор:</span>
                        <span className="font-medium text-right">{formatScoreValue(getRawCallFeature('customer_emo_score_mean'))}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Негативная речь:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('customer_emotion_neg_speech_time_percentage'))}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Позитивная речь:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('customer_emotion_pos_speech_time_percentage'))}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">Позитивные реплики:</span>
                        <span className="font-medium text-right">{formatPercentValue(getRawCallFeature('customer_emotion_pos_utt_percentage'))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Баланс диалога
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const agentPercent = operatorSpeechPercent;
                const customerPercent = customerSpeechPercent;
                const silenceRatio = silencePercent;
                const pausePercent = nonSpeechPausePercent;
                const hasData = [agentPercent, customerPercent, silenceRatio, pausePercent].some((value) => value !== null);

                return (
                  <div className={!hasData ? 'opacity-60' : ''}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary" />
                        <span className="text-xs">Оператор: {formatPercentValue(agentPercent)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-400" />
                        <span className="text-xs">Клиент: {formatPercentValue(customerPercent)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-400" />
                        <span className="text-xs">Тишина: {formatPercentValue(silenceRatio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-muted-foreground/40" />
                        <span className="text-xs">
                          Паузы: {pausePercent === null ? '—' : `${(pausePercent * 100).toFixed(1)}%`}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-8 w-full bg-muted/30 rounded-md overflow-hidden flex">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${(agentPercent || 0) * 100}%` }}
                      />
                      <div
                        className="bg-blue-400 h-full transition-all"
                        style={{ width: `${(customerPercent || 0) * 100}%` }}
                      />
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${(silenceRatio || 0) * 100}%` }}
                      />
                      <div
                        className="bg-muted-foreground/40 h-full transition-all"
                        style={{ width: `${(pausePercent || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card className={silencePercent === null && interruptionsCount === null && operatorInterruptedPercent === null ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Waves className="h-4 w-4" />
                  Паузы и перебивания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Одновременная тишина:</span>
                    <span className="font-medium">{formatPercentValue(silencePercent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Паузы вне речи:</span>
                    <span className="font-medium">
                      {nonSpeechPausePercent === null ? '—' : `${(nonSpeechPausePercent * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Всего перебиваний:</span>
                    <span className="font-medium">{interruptionsCount ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Оператора перебивали:</span>
                    <span className="font-medium">{formatPercentValue(operatorInterruptedPercent)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isYandexProvider && (
              <Card className={!timelineHasData ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Radar className="h-4 w-4" />
                    Таймлайн разговора
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineHasData ? (
                    <div className="space-y-3">
                      {[
                        { label: decodeUtf8(call.user_name) || 'Оператор', channel: 0, barClass: 'bg-primary' },
                        { label: 'Клиент', channel: 1, barClass: 'bg-blue-400' },
                      ].map((lane) => (
                        <div key={lane.channel} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{lane.label}</span>
                            <span className="text-muted-foreground">
                              {timelineSegments.filter((segment) => segment.channel === lane.channel).length} реплик
                            </span>
                          </div>
                          <div className="relative h-4 w-full rounded bg-muted/30 overflow-hidden">
                            {timelineSegments
                              .filter((segment) => segment.channel === lane.channel)
                              .map((segment, index) => {
                                const left = conversationDurationMs ? (segment.startMs / conversationDurationMs) * 100 : 0;
                                const width = conversationDurationMs ? Math.max(0.8, (segment.durationMs / conversationDurationMs) * 100) : 0;
                                return (
                                  <div
                                    key={`${lane.channel}-${segment.startMs}-${index}`}
                                    className={`absolute top-0 h-full rounded-sm ${lane.barClass}`}
                                    style={{ left: `${left}%`, width: `${width}%` }}
                                    title={`${lane.label}: ${segment.text}`}
                                  />
                                );
                              })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>00:00</span>
                        <span>{formatSeconds(conversationDurationMs / 1000)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Недостаточно данных для таймлайна</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {(speechProvider || talkId !== '—' || phrasesCount > 0 || providerTalkCount > 0) && (
            <Card className="mt-4 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Технические данные анализа
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {isYandexProvider && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">ID диалога:</span>
                      <span className="font-medium text-right break-all">{talkId}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Фраз в данных:</span>
                    <span className="font-medium text-right">{providerTalkCount || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Нормализованных метрик:</span>
                    <span className="font-medium text-right">{Object.keys(normalizedCallFeatures).length || '—'}</span>
                  </div>
                  {isYandexProvider && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Старт анализа:</span>
                      <span className="font-medium text-right">{formatTimestamp(call.call_datetime)}</span>
                    </div>
                  )}
                  {isSberProvider && sberCsi && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">CSI prediction:</span>
                      <span className="font-medium text-right">{String(sberCsi.prediction ?? '—')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* 6. Стенограмма */}
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

      {/* 7. Прослушивание звонка */}
      <AccordionItem value="audio-player" className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <Volume2 className="h-5 w-5 text-primary" />
            <span className="text-base font-medium">Прослушивание звонка</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Аудиозапись звонка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {callAudioUrl ? (
                <>
                  <audio controls preload="metadata" className="w-full">
                    <source src={callAudioUrl} />
                    Ваш браузер не поддерживает воспроизведение аудио.
                  </audio>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted-foreground">
                      {String(call.file_name || 'Файл звонка')}
                    </span>
                    <a
                      href={callAudioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Открыть файл
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Аудиозапись недоступна
                </p>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
