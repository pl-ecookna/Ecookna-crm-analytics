import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  ListFilter,
  TrendingDown,
  UserRound,
  Warehouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createApiClient } from "@ecookna/api-client";
import type {
  AnalyticsCountItem,
  DisapproveAnalyticsResponse,
  DisapproveLeadListItem,
} from "@ecookna/shared-types";

import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const api = createApiClient(import.meta.env.VITE_API_BASE_URL || "");

const chartConfig = {
  count: {
    label: "Лиды",
    color: "hsl(145 70% 45%)",
  },
} as const;

const initialData: DisapproveAnalyticsResponse = {
  summary: {
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    withReasons: 0,
    uniqueEmployees: 0,
    uniqueDepartments: 0,
    uniqueBrands: 0,
    reasonEntries: 0,
    averageReasonsPerLead: 0,
    minCallDatetime: null,
    maxCallDatetime: null,
  },
  topReasons: [],
  topBrands: [],
  topDepartments: [],
  monthlyTrend: [],
  recentLeads: [],
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Не указано";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Не указано";

  return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
};

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return format(date, "LLLL yyyy", { locale: ru });
};

const getLeadReasons = (lead: DisapproveLeadListItem) => {
  const reasons = lead.reject_reasons ? Object.keys(lead.reject_reasons) : [];
  return reasons.length > 0 ? reasons : ["Причина не указана"];
};

const getStatusVariant = (status: string | null): "destructive" | "default" | "secondary" => {
  if (status === "failed") return "destructive";
  if (status === "completed") return "default";
  return "secondary";
};

const CountList = ({
  items,
  emptyText,
}: {
  items: AnalyticsCountItem[];
  emptyText: string;
}) => {
  const max = Math.max(...items.map((item) => item.count), 0);

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const percent = max > 0 ? (item.count / max) * 100 : 0;

        return (
          <div key={`${item.label}-${index}`} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium leading-5">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.count} лидов</p>
              </div>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {index + 1}
              </Badge>
            </div>
            <Progress value={percent} className="h-2" />
          </div>
        );
      })}
    </div>
  );
};

const RejectedLeadsAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<DisapproveAnalyticsResponse>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const result = await api.getDisapproveAnalytics({ topLimit: 8, recentLimit: 10 });
        setData(result);
      } catch (error) {
        console.error("Error fetching rejected leads analytics:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить аналитику по отклоненным лидам",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [toast]);

  const summary = data.summary;
  const summaryCards = useMemo(
    () => [
      {
        title: "Всего лидов",
        value: summary.total,
        description: `Период: ${formatDateTime(summary.minCallDatetime)} - ${formatDateTime(summary.maxCallDatetime)}`,
        icon: BarChart3,
        tone: "text-foreground",
      },
      {
        title: "С причинами",
        value: summary.withReasons,
        description: `${summary.averageReasonsPerLead.toFixed(2)} причины на лид`,
        icon: ListFilter,
        tone: "text-success",
      },
      {
        title: "Обработано",
        value: summary.completed,
        description: `${summary.failed} лидов с ошибкой`,
        icon: CheckCircle2,
        tone: "text-primary",
      },
      {
        title: "Уникальные отделы",
        value: summary.uniqueDepartments,
        description: `${summary.uniqueEmployees} менеджеров, ${summary.uniqueBrands} брендов`,
        icon: Warehouse,
        tone: "text-warning",
      },
    ],
    [summary],
  );

  const monthlyTrend = useMemo(
    () => data.monthlyTrend.map((item) => ({ ...item, label: formatMonth(item.label) })),
    [data.monthlyTrend],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto space-y-8 px-4 py-6 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-3xl border bg-card px-6 py-8 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(120,53,15,0.12),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge variant="secondary" className="w-fit gap-1">
                <TrendingDown className="h-3.5 w-3.5" />
                Аналитика отклоненных лидов
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Разбираем, почему лиды не доходят до сделки
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  Страница строится по таблице <span className="font-medium text-foreground">disaproov_calls</span> и
                  показывает причины отказов, динамику по месяцам, распределение по брендам и подразделениям, а также
                  свежие записи для ручной проверки.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                К звонкам
              </Button>
              <Button asChild variant="secondary">
                <a
                  href="https://bi.entechai.ru/public/dashboard/26e07d8c-2451-4608-950b-bce04dce9a58"
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть BI
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.tone}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tabular-nums">{loading ? "…" : card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{loading ? "Загружаем..." : card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Динамика по месяцам</CardTitle>
              <CardDescription>Количество отклоненных лидов по календарным месяцам</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка графика...
                </div>
              ) : monthlyTrend.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                  Нет данных для графика
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[320px] w-full">
                  <LineChart data={monthlyTrend} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={18}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={36}
                    />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Line
                      dataKey="count"
                      type="monotone"
                      stroke="var(--color-count)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Ключевые срезы</CardTitle>
              <CardDescription>Бренды, отделы и причины в одном блоке</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reasons" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="reasons">Причины</TabsTrigger>
                  <TabsTrigger value="brands">Бренды</TabsTrigger>
                  <TabsTrigger value="departments">Отделы</TabsTrigger>
                </TabsList>
                <TabsContent value="reasons" className="mt-4">
                  <CountList items={data.topReasons} emptyText="Причины пока не найдены" />
                </TabsContent>
                <TabsContent value="brands" className="mt-4">
                  <CountList items={data.topBrands} emptyText="Бренды пока не найдены" />
                </TabsContent>
                <TabsContent value="departments" className="mt-4">
                  <CountList items={data.topDepartments} emptyText="Подразделения пока не найдены" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Последние отклоненные лиды</CardTitle>
                <CardDescription>Свежие записи для быстрой проверки причин отказа</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  Обновляется при загрузке страницы
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {summary.total} записей всего
                </span>
              </div>
            </div>
            <Separator />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загружаем список лидов...
              </div>
            ) : data.recentLeads.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                Нет отклоненных лидов
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Менеджер</TableHead>
                      <TableHead>Бренд</TableHead>
                      <TableHead>Отдел</TableHead>
                      <TableHead>Причины</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentLeads.map((lead) => {
                      const reasons = getLeadReasons(lead);

                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="whitespace-nowrap align-top">
                            <div className="space-y-1">
                              <div className="font-medium">{formatDateTime(lead.call_datetime)}</div>
                              <div className="text-xs text-muted-foreground">{lead.call_id}</div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span>{lead.user_name || "Не указан"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">{lead.brand || "Без бренда"}</TableCell>
                          <TableCell className="align-top">{lead.department || "Без подразделения"}</TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-wrap gap-2">
                              {reasons.slice(0, 2).map((reason) => (
                                <Badge key={reason} variant="outline" className="max-w-[220px] truncate">
                                  {reason}
                                </Badge>
                              ))}
                              {reasons.length > 2 ? (
                                <Badge variant="secondary">+{reasons.length - 2}</Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant={getStatusVariant(lead.file_status)}>
                              {lead.file_status || "unknown"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RejectedLeadsAnalytics;
