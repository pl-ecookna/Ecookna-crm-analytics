import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, CheckCircle, XCircle, Loader2, FileText, Target, TrendingDown, Star, Clock, ChevronDown, ChevronUp, Trash2, Edit3, Check, X, Phone, MapPin, Package, Globe, MessageSquare, BarChart3, ExternalLink } from "lucide-react";
import { CrmCallCard } from "@/components/CrmCallCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { AIAnalyticsModal } from "@/components/AIAnalyticsModal";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import { CallDetailsAccordion } from "@/components/CallDetailsAccordion";
import { Header } from "@/components/Header";

type CallAnalysis = Tables<'call_analysis'>;
type SalesCallAnalysis = any; // Используем any для sales_calls_analysis до обновления типов
type CrmCallAnalysis = Tables<'crm_analytics'>;

const Index = () => {
  const [activeTab, setActiveTab] = useState("crm");
  
  // Call Center States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CallAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  // Pagination for Call Center
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;
  
  // Sales States
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedSalesItem, setSelectedSalesItem] = useState<SalesCallAnalysis | null>(null);
  const [salesAnalyses, setSalesAnalyses] = useState<SalesCallAnalysis[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesActiveFilter, setSalesActiveFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'measured'>('all');
  // Pagination for Sales
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [salesTotalCount, setSalesTotalCount] = useState(0);
  const salesPageSize = 25;
  
  // CRM States
  const [selectedCrmItem, setSelectedCrmItem] = useState<CrmCallAnalysis | null>(null);
  const [crmAnalyses, setCrmAnalyses] = useState<CrmCallAnalysis[]>([]);
  const [crmLoading, setCrmLoading] = useState(true);
  const [crmActiveFilter, setCrmActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [crmEmployeeFilter, setCrmEmployeeFilter] = useState<string>('all');
  const [crmDepartmentFilter, setCrmDepartmentFilter] = useState<string>('all');
  const [crmBrandFilter, setCrmBrandFilter] = useState<string>('all');
  const [crmCallSuccessFilter, setCrmCallSuccessFilter] = useState<string>('all');
  // Pagination for CRM
  const [crmCurrentPage, setCrmCurrentPage] = useState(1);
  const [crmTotalCount, setCrmTotalCount] = useState(0);
  const crmPageSize = 25;
  
  
  // Selection and editing states for call center
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState<CallAnalysis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Selection and editing states for sales
  const [salesSelectionMode, setSalesSelectionMode] = useState(false);
  const [salesSelectedItems, setSalesSelectedItems] = useState<Set<string>>(new Set());
  const [salesEditMode, setSalesEditMode] = useState(false);
  const [salesEditedItem, setSalesEditedItem] = useState<SalesCallAnalysis | null>(null);
  const [salesDeleteLoading, setSalesDeleteLoading] = useState(false);
  const [salesUpdateLoading, setSalesUpdateLoading] = useState(false);
  
  // Selection and editing states for CRM
  const [crmSelectionMode, setCrmSelectionMode] = useState(false);
  const [crmSelectedItems, setCrmSelectedItems] = useState<Set<string>>(new Set());
  const [crmEditMode, setCrmEditMode] = useState(false);
  const [crmEditedItem, setCrmEditedItem] = useState<CrmCallAnalysis | null>(null);
  const [crmDeleteLoading, setCrmDeleteLoading] = useState(false);
  const [crmUpdateLoading, setCrmUpdateLoading] = useState(false);
  
  // CRM Metrics state (independent of pagination)
  const [crmMetricsData, setCrmMetricsData] = useState<{
    successfulCount: number;
    failedCount: number;
    averageResultCount: number;
    totalScoreSum: number;
    scoredCount: number;
    employees: string[];
    departments: string[];
    brands: string[];
  }>({
    successfulCount: 0,
    failedCount: 0,
    averageResultCount: 0,
    totalScoreSum: 0,
    scoredCount: 0,
    employees: [],
    departments: [],
    brands: []
  });
  const [crmMetricsLoading, setCrmMetricsLoading] = useState(false);
  
  // AI Analytics Modal state
  const [aiAnalyticsOpen, setAiAnalyticsOpen] = useState(false);
  
  const { toast } = useToast();

  // Count fetching functions (for totals with high limit)
  const fetchCallCenterCount = async () => {
    try {
      const { count, error } = await supabase
        .from('call_analysis')
        .select('*', { count: 'exact', head: true })
        .limit(300000);

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching call center count:', error);
    }
  };

  const fetchSalesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('sales_calls_analysis')
        .select('*', { count: 'exact', head: true })
        .limit(300000);

      if (error) throw error;
      setSalesTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching sales count:', error);
    }
  };

  const fetchCrmCount = async () => {
    try {
      const { count, error } = await supabase
        .from('crm_analytics')
        .select('*', { count: 'exact', head: true })
        .limit(300000);

      if (error) throw error;
      setCrmTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching CRM count:', error);
    }
  };

  // Fetch CRM metrics data (independent of pagination and filters)
  const fetchCrmMetrics = async () => {
    try {
      setCrmMetricsLoading(true);
      
      // Fetch all CRM data needed for metrics calculation
      const { data, error } = await supabase
        .from('crm_analytics')
        .select('call_success, overall_score, user_name, department, brand')
        .limit(300000);

      if (error) throw error;

      // Calculate metrics from all data
      const successfulCount = (data as any)?.filter((item: any) => item.call_success === 'Успешный').length || 0;
      const failedCount = (data as any)?.filter((item: any) => item.call_success === 'Неуспешный').length || 0;
      const averageResultCount = (data as any)?.filter((item: any) => item.call_success === 'Средний результат').length || 0;
      const totalScoreSum = (data as any)?.reduce((sum: number, item: any) => sum + (item.overall_score || 0), 0) || 0;
      const scoredCount = (data as any)?.filter((item: any) => item.overall_score !== null).length || 0;
      
      // Extract unique values for filters
      const employees = [...new Set((data as any)?.map((item: any) => item.user_name).filter(Boolean))] as string[];
      const departments = [...new Set((data as any)?.map((item: any) => item.department).filter(Boolean))] as string[];
      const brands = [...new Set((data as any)?.map((item: any) => item.brand).filter(Boolean))] as string[];

      setCrmMetricsData({
        successfulCount,
        failedCount,
        averageResultCount,
        totalScoreSum,
        scoredCount,
        employees: employees.sort(),
        departments: departments.sort(),
        brands: brands.sort()
      });
    } catch (error) {
      console.error('Error fetching CRM metrics:', error);
    } finally {
      setCrmMetricsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch counts and metrics first
    fetchCallCenterCount();
    fetchSalesCount();
    fetchCrmCount();
    fetchCrmMetrics(); // Fetch CRM metrics independently
    
    // Then fetch paginated data
    fetchAnalyses(1);
    fetchSalesAnalyses(1);
    fetchCrmAnalyses(1);
  }, []);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAnalyses(page);
  };

  const handleSalesPageChange = (page: number) => {
    setSalesCurrentPage(page);
    fetchSalesAnalyses(page);
  };

  const handleCrmPageChange = (page: number) => {
    setCrmCurrentPage(page);
    fetchCrmAnalyses(page);
  };

  // Reset pagination when search/filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      fetchAnalyses(1);
    }
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    if (salesCurrentPage !== 1) {
      setSalesCurrentPage(1);
      fetchSalesAnalyses(1);
    }
  }, [salesSearchTerm, salesActiveFilter]);

  useEffect(() => {
    if (crmCurrentPage !== 1) {
      setCrmCurrentPage(1);
      fetchCrmAnalyses(1);
    }
  }, [crmActiveFilter]);

  const fetchAnalyses = async (page = 1) => {
    try {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('call_analysis')
        .select('*')
        .order('date_created', { ascending: false })
        .range(from, to);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить анализ звонков",
          variant: "destructive"
        });
        console.error('Error fetching call analysis:', error);
        return;
      }

      setAnalyses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке данных",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesAnalyses = async (page = 1) => {
    try {
      setSalesLoading(true);
      const from = (page - 1) * salesPageSize;
      const to = from + salesPageSize - 1;

      const { data, error } = await supabase
        .from('sales_calls_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить анализ звонков отдела продаж",
          variant: "destructive"
        });
        console.error('Error fetching sales analysis:', error);
        return;
      }

      setSalesAnalyses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке данных продаж",
        variant: "destructive"
      });
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchCrmAnalyses = async (page = 1) => {
    try {
      setCrmLoading(true);
      const from = (page - 1) * crmPageSize;
      const to = from + crmPageSize - 1;

      const { data, error } = await supabase
        .from('crm_analytics')
        .select('*')
        .order('call_datetime', { ascending: false })
        .range(from, to);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить анализ звонков из CRM",
          variant: "destructive"
        });
        console.error('Error fetching CRM analysis:', error);
        return;
      }

      setCrmAnalyses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке CRM данных",
        variant: "destructive"
      });
    } finally {
      setCrmLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Дата не указана";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Не указано";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин ${remainingSeconds} сек`;
  };

  const getTonalityColor = (tonality: string | null) => {
    if (!tonality) return "bg-muted text-muted-foreground";
    const lower = tonality.toLowerCase();
    if (lower.includes('положительн') || lower.includes('дружелюбн') || lower.includes('профессиональн')) return "bg-success/10 text-success border-success/20";
    if (lower.includes('раздражен') || lower.includes('агрессивн') || lower.includes('негативн')) return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const renderStarRating = (score: number | null, maxStars: number = 10) => {
    if (score === null) return <span className="text-muted-foreground">Не оценено</span>;
    
    let starColor = "text-destructive";
    
    if (maxStars === 5) {
      if (score === 5) {
        starColor = "text-success";
      } else if (score === 4) {
        starColor = "text-warning";
      }
    } else {
      if (score >= 8) {
        starColor = "text-success";
      } else if (score >= 5) {
        starColor = "text-warning";
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < score ? `fill-current ${starColor}` : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{score}/{maxStars}</span>
      </div>
    );
  };

  // CRM Filtered Data
  const crmFilteredData = useMemo(() => {
    let filtered = crmAnalyses;
    
    // Фильтр по статусу успешности звонка
    if (crmActiveFilter === 'success') {
      filtered = filtered.filter(item => item.call_success === 'Успешный');
    } else if (crmActiveFilter === 'failed') {
      filtered = filtered.filter(item => item.call_success === 'Неуспешный');
    }
    
    // Фильтр по call_success
    if (crmCallSuccessFilter !== 'all') {
      filtered = filtered.filter(item => item.call_success === crmCallSuccessFilter);
    }
    
    // Фильтр по сотрудникам
    if (crmEmployeeFilter !== 'all') {
      filtered = filtered.filter(item => item.user_name === crmEmployeeFilter);
    }
    
    // Фильтр по подразделениям
    if (crmDepartmentFilter !== 'all') {
      filtered = filtered.filter(item => item.department === crmDepartmentFilter);
    }
    
    // Фильтр по брендам
    if (crmBrandFilter !== 'all') {
      filtered = filtered.filter(item => item.brand === crmBrandFilter);
    }
    
    return filtered;
  }, [crmAnalyses, crmActiveFilter, crmEmployeeFilter, crmDepartmentFilter, crmBrandFilter, crmCallSuccessFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Анализ звонков</h1>
            <p className="text-muted-foreground">
              Управление и анализ записей звонков
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setAiAnalyticsOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              AI Аналитика
            </Button>
            <Button asChild variant="secondary">
              <a 
                href="https://bi.entechai.ru/public/dashboard/26e07d8c-2451-4608-950b-bce04dce9a58"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Отклоненные лиды
              </a>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="crm">Звонки из CRM (КЦ)</TabsTrigger>
          </TabsList>

          {/* CRM Tab Content */}
          <TabsContent value="crm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Success Rate Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Успешные звонки</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {crmMetricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : crmMetricsData.successfulCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {crmMetricsLoading ? 'Загрузка...' : 
                      `${crmTotalCount > 0 ? ((crmMetricsData.successfulCount / crmTotalCount) * 100).toFixed(1) : 0}% от общего количества`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Failed Calls Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Неуспешные звонки</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {crmMetricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : crmMetricsData.failedCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {crmMetricsLoading ? 'Загрузка...' : 
                      `${crmTotalCount > 0 ? ((crmMetricsData.failedCount / crmTotalCount) * 100).toFixed(1) : 0}% от общего количества`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Average Result Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний результат</CardTitle>
                  <TrendingDown className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {crmMetricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : crmMetricsData.averageResultCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {crmMetricsLoading ? 'Загрузка...' : 
                      `${crmTotalCount > 0 ? ((crmMetricsData.averageResultCount / crmTotalCount) * 100).toFixed(1) : 0}% от общего количества`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Average Score Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
                  <Star className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {crmMetricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                      `${crmMetricsData.scoredCount > 0 ? (crmMetricsData.totalScoreSum / crmMetricsData.scoredCount).toFixed(1) : 0}`
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {crmMetricsLoading ? 'Загрузка...' : 
                      `из 10 баллов (${crmMetricsData.scoredCount} оценено)`
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Результат звонка</label>
                    <Select value={crmCallSuccessFilter} onValueChange={setCrmCallSuccessFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все результаты" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все результаты</SelectItem>
                        <SelectItem value="Успешный">Успешный</SelectItem>
                        <SelectItem value="Неуспешный">Неуспешный</SelectItem>
                        <SelectItem value="Средний результат">Средний результат</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сотрудник</label>
                    <Select value={crmEmployeeFilter} onValueChange={setCrmEmployeeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все сотрудники" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все сотрудники</SelectItem>
                        {crmMetricsData.employees.map(employee => (
                          <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Подразделение</label>
                    <Select value={crmDepartmentFilter} onValueChange={setCrmDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все подразделения" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все подразделения</SelectItem>
                        {crmMetricsData.departments.map(department => (
                          <SelectItem key={department} value={department}>{department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Бренд</label>
                    <Select value={crmBrandFilter} onValueChange={setCrmBrandFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все бренды" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все бренды</SelectItem>
                        {crmMetricsData.brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CRM Analysis List */}
            <Card>
              <CardHeader>
                <CardTitle>Анализ звонков CRM ({crmFilteredData.length})</CardTitle>
                <CardDescription>
                  Показано {crmFilteredData.length} из {crmTotalCount} записей
                </CardDescription>
              </CardHeader>
              <CardContent>
                {crmLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Загружаем анализ звонков...</span>
                  </div>
                ) : crmFilteredData.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Анализы не найдены</h3>
                    <p className="text-muted-foreground">
                      {crmTotalCount === 0 
                        ? "Пока нет анализов звонков" 
                        : "Попробуйте изменить параметры фильтрации"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {crmFilteredData.map((analysis) => (
                      <CrmCallCard 
                        key={analysis.id}
                        call={{
                          id: analysis.id,
                          call_id: analysis.call_id,
                          call_datetime: analysis.call_datetime,
                          user_name: analysis.user_name,
                          department: analysis.department,
                          brand: analysis.brand,
                          overall_score: analysis.overall_score || 0,
                          call_success: analysis.call_success || 'Неизвестно',
                          conversation_duration_minutes: analysis.conversation_duration_minutes || 0,
                          call_type: analysis.call_type,
                          file_status: analysis.file_status,
                          client_phone: analysis.client_phone
                        }}
                        onClick={(id) => setSelectedCrmItem(analysis)}
                       />
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {!crmLoading && crmTotalCount > crmPageSize && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => crmCurrentPage > 1 && handleCrmPageChange(crmCurrentPage - 1)}
                            className={crmCurrentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, Math.ceil(crmTotalCount / crmPageSize)) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handleCrmPageChange(page)}
                                isActive={page === crmCurrentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => crmCurrentPage < Math.ceil(crmTotalCount / crmPageSize) && handleCrmPageChange(crmCurrentPage + 1)}
                            className={crmCurrentPage >= Math.ceil(crmTotalCount / crmPageSize) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call Center and Sales tabs content would go here */}
        </Tabs>

        {/* CRM Detail Modal */}
        <Dialog open={!!selectedCrmItem} onOpenChange={() => setSelectedCrmItem(null)}>
          <DialogContent className="w-[80vw] max-w-none overflow-y-auto max-h-[90vh]" style={{ width: '80vw' }}>
            {selectedCrmItem && (
              <>
                <DialogHeader className="space-y-3">
                  <div className="flex items-center justify-between pr-12">
                    <DialogTitle className="text-xl">
                      Анализ звонка из CRM
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedCrmItem.call_type === 'входящий' ? 'default' : 'secondary'}>
                        {selectedCrmItem.call_type || 'Не указан'}
                      </Badge>
                      <Badge variant="outline" className={`${
                        selectedCrmItem.file_status === 'completed' ? 'border-success text-success' :
                        selectedCrmItem.file_status === 'processing' ? 'border-warning text-warning' :
                        'border-muted text-muted-foreground'
                      }`}>
                        {selectedCrmItem.file_status || 'Новый'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Оператор:</span> {selectedCrmItem.user_name}
                    </div>
                    <div>
                      <span className="font-medium">Телефон клиента:</span> {selectedCrmItem.client_phone || 'Не указан'}
                    </div>
                    <div>
                      <span className="font-medium">Дата звонка:</span> {formatDate(selectedCrmItem.call_datetime)}
                    </div>
                    <div>
                      <span className="font-medium">Общая оценка:</span>
                      <br />
                      {selectedCrmItem.overall_score ? `${selectedCrmItem.overall_score}/10` : "Не оценено"}
                    </div>
                    <div>
                      <span className="font-medium">Результат звонка:</span>
                      <br />
                      <Badge className={
                        selectedCrmItem.call_success === 'Успешный' ? "bg-success/10 text-success border-success/20" : 
                        selectedCrmItem.call_success === 'Средний результат' ? "bg-warning/10 text-warning border-warning/20" :
                        selectedCrmItem.call_success === 'Неуспешный' ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-muted/10 text-muted-foreground border-muted/20"
                      }>
                        {selectedCrmItem.call_success || "Не указан"}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6">
                  <CallDetailsAccordion call={selectedCrmItem} />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Analytics Modal */}
        <AIAnalyticsModal 
          open={aiAnalyticsOpen} 
          onOpenChange={setAiAnalyticsOpen} 
        />
      </div>
    </div>
  );
};

export default Index;