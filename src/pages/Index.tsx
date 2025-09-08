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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { AIAnalyticsModal } from "@/components/AIAnalyticsModal";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import { Header } from "@/components/Header";

type CallAnalysis = Tables<'call_analysis'>;
type SalesCallAnalysis = any; // Используем any для sales_calls_analysis до обновления типов
type CrmCallAnalysis = any; // Временный тип для call_analysis_crm до обновления типов

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
  const [crmSearchTerm, setCrmSearchTerm] = useState("");
  const [selectedCrmItem, setSelectedCrmItem] = useState<CrmCallAnalysis | null>(null);
  const [crmAnalyses, setCrmAnalyses] = useState<CrmCallAnalysis[]>([]);
  const [crmLoading, setCrmLoading] = useState(true);
  const [crmActiveFilter, setCrmActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [crmEmployeeFilter, setCrmEmployeeFilter] = useState<string>('all');
  const [crmDepartmentFilter, setCrmDepartmentFilter] = useState<string>('all');
  const [crmBrandFilter, setCrmBrandFilter] = useState<string>('all');
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>('all');
  // Pagination for CRM
  const [crmCurrentPage, setCrmCurrentPage] = useState(1);
  const [crmTotalCount, setCrmTotalCount] = useState(0);
  const crmPageSize = 25;
  
  // Selected card states for visual feedback
  const [selectedCallCenterCard, setSelectedCallCenterCard] = useState<'all' | 'success' | 'failed'>('all');
  const [selectedSalesCard, setSelectedSalesCard] = useState<'all' | 'hot' | 'warm' | 'cold' | 'measured'>('all');
  const [selectedCrmCard, setSelectedCrmCard] = useState<'all' | 'success' | 'failed'>('all');
  
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
    totalScoreSum: number;
    scoredCount: number;
    employees: string[];
    departments: string[];
    brands: string[];
  }>({
    successfulCount: 0,
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
        .from('call_analysis_crm' as any)
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
        .from('call_analysis_crm' as any)
        .select('goal_achieved, overall_score, user_name, department, brand')
        .limit(300000);

      if (error) throw error;

      // Calculate metrics from all data
      const successfulCount = (data as any)?.filter((item: any) => item.goal_achieved).length || 0;
      const totalScoreSum = (data as any)?.reduce((sum: number, item: any) => sum + (item.overall_score || 0), 0) || 0;
      const scoredCount = (data as any)?.filter((item: any) => item.overall_score !== null).length || 0;
      
      // Extract unique values for filters
      const employees = [...new Set((data as any)?.map((item: any) => item.user_name).filter(Boolean))] as string[];
      const departments = [...new Set((data as any)?.map((item: any) => item.department).filter(Boolean))] as string[];
      const brands = [...new Set((data as any)?.map((item: any) => item.brand).filter(Boolean))] as string[];

      setCrmMetricsData({
        successfulCount,
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
  }, [crmSearchTerm, crmActiveFilter]);

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
        .from('call_analysis_crm' as any)
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
    if (lower.includes('положительн') || lower.includes('дружелюбн')) return "bg-success/10 text-success border-success/20";
    if (lower.includes('раздражен') || lower.includes('агрессивн')) return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getNpsColor = (category: string | null) => {
    if (!category) return "bg-muted text-muted-foreground";
    const lower = category.toLowerCase();
    if (lower.includes('промоутер')) return "bg-success/10 text-success border-success/20";
    if (lower.includes('критик')) return "bg-destructive/10 text-destructive border-destructive/20";
    if (lower.includes('пассивн')) return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getWarmthColor = (warmth: string | null) => {
    if (!warmth) return "bg-muted text-muted-foreground";
    const lower = warmth.toLowerCase();
    if (lower.includes('горячий')) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (lower.includes('тёплый') || lower.includes('теплый')) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (lower.includes('холодный')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
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

  const renderStarRatingFrom100 = (score: number | null) => {
    if (score === null) return <span className="text-muted-foreground">Не оценено</span>;
    
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    let starColor = "text-destructive";
    
    if (score >= 80) {
      starColor = "text-success";
    } else if (score >= 60) {
      starColor = "text-warning";
    }
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < stars ? `fill-current ${starColor}` : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{score}/100</span>
      </div>
    );
  };

  // Call Center Metrics
  const metrics = useMemo(() => {
    const total = totalCount; // Use total count from database
    const currentPageSuccessful = analyses.filter(t => t.goal_achieved).length;
    const currentPageFailed = analyses.length - currentPageSuccessful;
    
    return {
      total,
      successful: currentPageSuccessful,
      failed: currentPageFailed
    };
  }, [analyses, totalCount]);

  // Sales Metrics
  const salesMetrics = useMemo(() => {
    const total = salesTotalCount; // Use total count from database
    const hot = salesAnalyses.filter(t => (t.total_score || 0) > 50).length;
    const warm = salesAnalyses.filter(t => {
      const score = t.total_score || 0;
      return score >= 20 && score <= 50;
    }).length;
    const cold = salesAnalyses.filter(t => (t.total_score || 0) < 20).length;
    const measured = salesAnalyses.filter(t => t.measurement_scheduled).length;
    const averageScore = total > 0 ? Math.round(salesAnalyses.reduce((sum, item) => sum + (item.total_score || 0), 0) / total) : 0;
    const stage5Average = total > 0 ? Math.round(salesAnalyses.reduce((sum, item) => sum + (item.stage5_total_score || 0), 0) / total * 100) / 100 : 0;
    const stage6Average = total > 0 ? Math.round(salesAnalyses.reduce((sum, item) => sum + (item.stage6_total_score || 0), 0) / total * 100) / 100 : 0;
    
    return {
      total,
      hot,
      warm,
      cold,
      measured,
      averageScore,
      stage5Average,
      stage6Average
    };
  }, [salesAnalyses, salesTotalCount]);

  // CRM Metrics (independent of pagination and filters)
  const crmMetrics = useMemo(() => {
    const total = crmTotalCount; // Use total count from database
    const successful = crmMetricsData.successfulCount; // Use independent metrics data
    const failed = total - successful;
    const averageScore = crmMetricsData.scoredCount > 0 ? 
      Math.round(crmMetricsData.totalScoreSum / crmMetricsData.scoredCount) : 0;
    
    return {
      total,
      successful,
      failed,
      averageScore,
      employees: crmMetricsData.employees,
      departments: crmMetricsData.departments,
      brands: crmMetricsData.brands
    };
  }, [crmTotalCount, crmMetricsData]);

  // Call Center Filtered Data
  const filteredData = useMemo(() => {
    let filtered = analyses;
    
    if (activeFilter === 'success') {
      filtered = filtered.filter(item => item.goal_achieved);
    } else if (activeFilter === 'failed') {
      filtered = filtered.filter(item => !item.goal_achieved);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.call_goal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.final_conclusion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transcript?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [analyses, activeFilter, searchTerm]);

  // Sales Filtered Data
  const salesFilteredData = useMemo(() => {
    let filtered = salesAnalyses;
    
    if (salesActiveFilter === 'hot') {
      filtered = filtered.filter(item => (item.total_score || 0) > 50);
    } else if (salesActiveFilter === 'warm') {
      filtered = filtered.filter(item => {
        const score = item.total_score || 0;
        return score >= 20 && score <= 50;
      });
    } else if (salesActiveFilter === 'cold') {
      filtered = filtered.filter(item => (item.total_score || 0) < 20);
    } else if (salesActiveFilter === 'measured') {
      filtered = filtered.filter(item => item.measurement_scheduled);
    }
    
    if (salesSearchTerm) {
      filtered = filtered.filter(item =>
        item.object_type?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.client_requirements?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.client_emotion?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.manager_feedback?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.skills_to_improve?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.used_skills?.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [salesAnalyses, salesActiveFilter, salesSearchTerm]);

  // CRM Filtered Data
  const crmFilteredData = useMemo(() => {
    let filtered = crmAnalyses;
    
    // Фильтр по статусу достижения цели
    if (crmActiveFilter === 'success') {
      filtered = filtered.filter(item => item.goal_achieved);
    } else if (crmActiveFilter === 'failed') {
      filtered = filtered.filter(item => !item.goal_achieved);
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
    
    
    // Фильтр по статусу обработки
    if (crmStatusFilter !== 'all') {
      filtered = filtered.filter(item => item.file_status === crmStatusFilter);
    }
    
    // Поиск
    if (crmSearchTerm) {
      filtered = filtered.filter(item =>
        item.user_name?.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
        item.client_phone?.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
        item.call_goal?.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
        item.final_conclusion?.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
        item.transcript?.toLowerCase().includes(crmSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [crmAnalyses, crmActiveFilter, crmEmployeeFilter, crmDepartmentFilter, crmBrandFilter, crmStatusFilter, crmSearchTerm]);

  // CRUD Operations for Call Center
  const deleteSingleItem = async (id: string) => {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить анализ",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ удален",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteMultipleItems = async (ids: string[]) => {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .delete()
        .in('id', ids);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить выбранные записи",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedItems(new Set());
      setSelectionMode(false);
      toast({
        title: "Успешно",
        description: `Удалено ${ids.length} анализов`,
      });
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<CallAnalysis>) => {
    try {
      setUpdateLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить анализ",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
      setEditedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ обновлен",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // CRUD Operations for Sales
  const deleteSingleSalesItem = async (id: string) => {
    try {
      setSalesDeleteLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить анализ продаж",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.filter(item => item.id !== id));
      setSelectedSalesItem(null);
      toast({
        title: "Успешно",
        description: "Анализ продаж удален",
      });
    } catch (error) {
      console.error('Error deleting sales item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setSalesDeleteLoading(false);
    }
  };

  const deleteMultipleSalesItems = async (ids: string[]) => {
    try {
      setSalesDeleteLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .delete()
        .in('id', ids);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить выбранные записи",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.filter(item => !ids.includes(item.id)));
      setSalesSelectedItems(new Set());
      setSalesSelectionMode(false);
      toast({
        title: "Успешно",
        description: `Удалено ${ids.length} анализов продаж`,
      });
    } catch (error) {
      console.error('Error deleting sales items:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setSalesDeleteLoading(false);
    }
  };

  const updateSalesItem = async (id: string, updates: Partial<SalesCallAnalysis>) => {
    try {
      setSalesUpdateLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить анализ продаж",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setSelectedSalesItem(prev => prev ? { ...prev, ...updates } : null);
      setSalesEditMode(false);
      setSalesEditedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ продаж обновлен",
      });
    } catch (error) {
      console.error('Error updating sales item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении",
        variant: "destructive"
      });
    } finally {
      setSalesUpdateLoading(false);
    }
  };

  // Selection helpers for Call Center
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    }
  };

  // Selection helpers for Sales
  const handleSelectSalesItem = (id: string) => {
    const newSelected = new Set(salesSelectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSalesSelectedItems(newSelected);
  };

  const handleSelectAllSales = () => {
    if (salesSelectedItems.size === salesFilteredData.length) {
      setSalesSelectedItems(new Set());
    } else {
      setSalesSelectedItems(new Set(salesFilteredData.map(item => item.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto p-6 space-y-8">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border gap-1 p-1 h-12">
          <TabsTrigger value="crm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-primary/20 shadow-sm">
            ({crmMetrics.total}) Звонки из CRM (КЦ)
          </TabsTrigger>
          <TabsTrigger value="call-center" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-primary/20 shadow-sm">
            ({metrics.total}) Анализ звонков колл-центра
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-primary/20 shadow-sm">
            ({salesMetrics.total}) Анализ звонков отдела продаж
          </TabsTrigger>
        </TabsList>

        <TabsContent value="call-center" className="space-y-6">
          {/* Call Center Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCallCenterCard === 'all' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setActiveFilter('all');
                setSelectedCallCenterCard('all');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего звонков</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCallCenterCard === 'success' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setActiveFilter('success');
                setSelectedCallCenterCard('success');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Успешные</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{metrics.successful}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total > 0 ? Math.round((metrics.successful / metrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCallCenterCard === 'failed' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setActiveFilter('failed');
                setSelectedCallCenterCard('failed');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Неуспешные</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics.failed}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total > 0 ? Math.round((metrics.failed / metrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call Center Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по цели звонка, заключению или транскрипции..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              
              {selectionMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    size="sm"
                  >
                    {selectedItems.size === filteredData.length ? "Снять всё" : "Выбрать всё"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedItems(new Set());
                    }}
                    size="sm"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Call Center Delete Button */}
          {selectionMode && selectedItems.size > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full shadow-lg"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-5 w-5 mr-2" />
                    )}
                    Удалить ({selectedItems.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите удалить {selectedItems.size} выбранных анализов? 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMultipleItems(Array.from(selectedItems))}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Call Center Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка анализов...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Анализы не найдены</p>
            </div>
          ) : (
            /* Call Center Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectionMode ? "hover:bg-muted/50" : ""
                  } ${
                    selectedItems.has(item.id) ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      handleSelectItem(item.id);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.call_goal || "Цель не указана"}
                            {item.goal_achieved ? (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatDate(item.date_created)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                      {renderStarRating(item.overall_score)}
                    </div>

                    {item.operator_tonality && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Тональность оператора</p>
                        <Badge className={getTonalityColor(item.operator_tonality)}>
                          {item.operator_tonality}
                        </Badge>
                      </div>
                    )}

                    {item.client_nps_category && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Категория NPS</p>
                        <Badge className={getNpsColor(item.client_nps_category)}>
                          {item.client_nps_category}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination for Call Center */}
          {totalCount > pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < Math.ceil(totalCount / pageSize) && handlePageChange(currentPage + 1)}
                      className={currentPage >= Math.ceil(totalCount / pageSize) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSalesCard === 'all' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setSalesActiveFilter('all');
                setSelectedSalesCard('all');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesMetrics.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Средний балл: {salesMetrics.averageScore}/100
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSalesCard === 'hot' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setSalesActiveFilter('hot');
                setSelectedSalesCard('hot');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Горячие лиды</CardTitle>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{salesMetrics.hot}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.hot / salesMetrics.total) * 100) : 0}% (&gt;50 баллов)
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSalesCard === 'warm' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setSalesActiveFilter('warm');
                setSelectedSalesCard('warm');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Тёплые лиды</CardTitle>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{salesMetrics.warm}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.warm / salesMetrics.total) * 100) : 0}% (20-50 баллов)
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSalesCard === 'cold' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setSalesActiveFilter('cold');
                setSelectedSalesCard('cold');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Холодные лиды</CardTitle>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{salesMetrics.cold}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.cold / salesMetrics.total) * 100) : 0}% (&lt;20 баллов)
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSalesCard === 'measured' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setSalesActiveFilter('measured');
                setSelectedSalesCard('measured');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Запись на замер</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{salesMetrics.measured}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.measured / salesMetrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stage Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Базовая оценка
                </CardTitle>
                <CardDescription>Максимум 70 баллов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((salesMetrics.averageScore - salesMetrics.stage5Average - salesMetrics.stage6Average) * 100) / 100}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Средний балл по базовым критериям
                  </div>
                  <Progress 
                    value={((salesMetrics.averageScore - salesMetrics.stage5Average - salesMetrics.stage6Average) / 70) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Завершение сделки
                </CardTitle>
                <CardDescription>Максимум 15 баллов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    {salesMetrics.stage5Average}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Средний балл по завершению сделки
                  </div>
                  <Progress 
                    value={(salesMetrics.stage5Average / 15) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Этика общения
                </CardTitle>
                <CardDescription>Максимум 15 баллов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {salesMetrics.stage6Average}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Средний балл по этике телефонного общения
                  </div>
                  <Progress 
                    value={(salesMetrics.stage6Average / 15) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по объекту, требованиям, обратной связи..."
                value={salesSearchTerm}
                onChange={(e) => setSalesSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={salesActiveFilter} onValueChange={(value: 'all' | 'hot' | 'warm' | 'cold' | 'measured') => setSalesActiveFilter(value)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все лиды</SelectItem>
                  <SelectItem value="hot">Горячие лиды (&gt;50)</SelectItem>
                  <SelectItem value="warm">Тёплые лиды (20-50)</SelectItem>
                  <SelectItem value="cold">Холодные лиды (&lt;20)</SelectItem>
                  <SelectItem value="measured">Записались на замер</SelectItem>
                </SelectContent>
              </Select>
              
              {!salesSelectionMode ? (
                <Button
                  variant="outline"
                  onClick={() => setSalesSelectionMode(true)}
                  disabled={salesFilteredData.length === 0}
                >
                  Выбрать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSelectAllSales}
                    size="sm"
                  >
                    {salesSelectedItems.size === salesFilteredData.length ? "Снять всё" : "Выбрать всё"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSalesSelectionMode(false);
                      setSalesSelectedItems(new Set());
                    }}
                    size="sm"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sales Delete Button */}
          {salesSelectionMode && salesSelectedItems.size > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full shadow-lg"
                    disabled={salesDeleteLoading}
                  >
                    {salesDeleteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-5 w-5 mr-2" />
                    )}
                    Удалить ({salesSelectedItems.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите удалить {salesSelectedItems.size} выбранных анализов продаж? 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMultipleSalesItems(Array.from(salesSelectedItems))}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Sales Loading */}
          {salesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка анализов продаж...</span>
            </div>
          ) : salesFilteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Анализы продаж не найдены</p>
            </div>
          ) : (
            /* Sales Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salesFilteredData.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    salesSelectionMode ? "hover:bg-muted/50" : ""
                  } ${
                    salesSelectedItems.has(item.id) ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (salesSelectionMode) {
                      handleSelectSalesItem(item.id);
                    } else {
                      setSelectedSalesItem(item);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {salesSelectionMode && (
                          <Checkbox
                            checked={salesSelectedItems.has(item.id)}
                            onChange={() => handleSelectSalesItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.object_type || "Тип объекта не указан"}
                            {item.measurement_scheduled && (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(item.call_duration_seconds)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                      {renderStarRatingFrom100(item.total_score)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                        <div className="font-medium text-blue-600">Базовая оценка</div>
                        <div className="text-blue-700">{((item.total_score || 0) - (item.stage5_total_score || 0) - (item.stage6_total_score || 0)).toFixed(1)}/70</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded border-l-2 border-green-400">
                        <div className="font-medium text-green-600">Завершение сделки</div>
                        <div className="text-green-700">{(item.stage5_total_score || 0)}/15</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                        <div className="font-medium text-purple-600">Этика общения</div>
                        <div className="text-purple-700">{(item.stage6_total_score || 0)}/15</div>
                      </div>
                    </div>

                    {item.client_emotion && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Эмоциональная оценка</p>
                        <Badge className={getTonalityColor(item.client_emotion)}>
                          {item.client_emotion}
                        </Badge>
                      </div>
                    )}

                    {item.manager_feedback && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Обратная связь</p>
                        <div className="text-xs p-2 bg-orange-50 rounded border border-orange-200 text-orange-800 line-clamp-2">
                          {item.manager_feedback}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sales Transcript */}
          {selectedSalesItem && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Транскрипция разговора</CardTitle>
                </CardHeader>
                <CardContent>
                  <TranscriptDisplay transcript={selectedSalesItem.steno} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          {/* CRM Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCrmCard === 'all' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setCrmActiveFilter('all');
                setSelectedCrmCard('all');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего звонков</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {crmMetricsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Загрузка...</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{crmMetrics.total}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {crmMetricsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Загрузка...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{crmMetrics.averageScore}/10</div>
                    <p className="text-xs text-muted-foreground">
                      Качество обслуживания
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCrmCard === 'success' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setCrmActiveFilter('success');
                setSelectedCrmCard('success');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Успешные</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                {crmMetricsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Загрузка...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-success">{crmMetrics.successful}</div>
                    <p className="text-xs text-muted-foreground">
                      {crmMetrics.total > 0 ? Math.round((crmMetrics.successful / crmMetrics.total) * 100) : 0}% достижение целей
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCrmCard === 'failed' ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => {
                setCrmActiveFilter('failed');
                setSelectedCrmCard('failed');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Неуспешные</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {crmMetricsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Загрузка...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-destructive">{crmMetrics.failed}</div>
                    <p className="text-xs text-muted-foreground">
                      {crmMetrics.total > 0 ? Math.round((crmMetrics.failed / crmMetrics.total) * 100) : 0}% не достигли цели
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CRM Filters */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск по сотруднику, телефону, цели..."
                  value={crmSearchTerm}
                  onChange={(e) => setCrmSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={crmActiveFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setCrmActiveFilter('all')}
                  size="sm"
                >
                  Все ({crmMetrics.total})
                </Button>
                <Button
                  variant={crmActiveFilter === 'success' ? 'default' : 'outline'}
                  onClick={() => setCrmActiveFilter('success')}
                  size="sm"
                >
                  Успешные ({crmMetrics.successful})
                </Button>
                <Button
                  variant={crmActiveFilter === 'failed' ? 'default' : 'outline'}
                  onClick={() => setCrmActiveFilter('failed')}
                  size="sm"
                >
                  Неуспешные ({crmMetrics.failed})
                </Button>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Select value={crmEmployeeFilter} onValueChange={setCrmEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Сотрудник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все сотрудники</SelectItem>
                  {crmMetrics.employees.map(employee => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={crmDepartmentFilter} onValueChange={setCrmDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Подразделение" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подразделения</SelectItem>
                  {crmMetrics.departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={crmBrandFilter} onValueChange={setCrmBrandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Бренд" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все бренды</SelectItem>
                  {crmMetrics.brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={crmStatusFilter} onValueChange={setCrmStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="new">Новый</SelectItem>
                  <SelectItem value="processed">Обработан</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analytics Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setAiAnalyticsOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                AI Аналитика
              </Button>
              
              <Button
                onClick={() => window.open('https://bi.entechai.ru/public/dashboard/26e07d8c-2451-4608-950b-bce04dce9a58', '_blank')}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Отклоненные лиды
              </Button>
            </div>
          </div>

          {/* CRM Call List */}
          {crmLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {crmFilteredData.map((analysis) => (
                <Card 
                  key={analysis.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-400"
                  onClick={() => setSelectedCrmItem(analysis)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={analysis.call_type === 'входящий' ? 'default' : 'secondary'}>
                            {analysis.call_type || 'Не указан'}
                          </Badge>
                          <Badge variant="outline" className={`${
                            analysis.file_status === 'completed' ? 'border-success text-success' :
                            analysis.file_status === 'processed' ? 'border-warning text-warning' :
                            'border-muted text-muted-foreground'
                          }`}>
                            {analysis.file_status || 'Новый'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Дата:</span> {formatDate(analysis.call_datetime)}
                          </div>
                          <div>
                            <span className="font-medium">Сотрудник:</span> {analysis.user_name || 'Не указан'}
                          </div>
                          <div>
                            <span className="font-medium">Бренд:</span> {analysis.brand || 'Не указан'}
                          </div>
                          <div>
                            <span className="font-medium">Цель:</span> {analysis.call_goal || 'Не указана'}
                          </div>
                        </div>
                      </div>

                      {/* Score and Status */}
                      <div className="flex items-center justify-between">
                        {analysis.overall_score && (
                          <div className="flex items-center gap-1">
                            {renderStarRating(analysis.overall_score)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          {analysis.goal_achieved ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className={`text-xs ${analysis.goal_achieved ? 'text-success' : 'text-destructive'}`}>
                            {analysis.goal_achieved ? 'Достигнута' : 'Не достигнута'}
                          </span>
                        </div>
                      </div>

                      {/* Analysis Results */}
                      <div className="flex flex-wrap gap-1">
                        {analysis.client_nps_category && (
                          <Badge className={`${getNpsColor(analysis.client_nps_category)} text-xs`}>
                            NPS: {analysis.client_nps_category}
                          </Badge>
                        )}
                        {analysis.conflict_risk_level && (
                          <Badge className={`text-xs ${
                            analysis.conflict_risk_level.toLowerCase().includes('высокий') ? 
                            'bg-destructive/10 text-destructive border-destructive/20' :
                            analysis.conflict_risk_level.toLowerCase().includes('средний') ?
                            'bg-warning/10 text-warning border-warning/20' :
                            'bg-success/10 text-success border-success/20'
                          }`}>
                            {analysis.conflict_risk_level}
                          </Badge>
                        )}
                        {analysis.operator_tonality && (
                          <Badge className={`${getTonalityColor(analysis.operator_tonality)} text-xs`}>
                            {analysis.operator_tonality}
                          </Badge>
                        )}
                      </div>

                      {/* Conclusion */}
                      {analysis.final_conclusion && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {analysis.final_conclusion}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {crmFilteredData.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Звонки не найдены</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* CRM Pagination */}
          {crmTotalCount > crmPageSize && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => crmCurrentPage > 1 && handleCrmPageChange(crmCurrentPage - 1)}
                      className={crmCurrentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(crmTotalCount / crmPageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handleCrmPageChange(pageNum)}
                          isActive={crmCurrentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
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
        </TabsContent>
        
      </Tabs>

      {/* CRM Detail Dialog */}
      <Dialog open={!!selectedCrmItem} onOpenChange={(open) => !open && setSelectedCrmItem(null)}>
        <DialogContent className="w-[80vw] max-w-none overflow-y-auto max-h-[90vh]" style={{ width: '80vw' }}>
          {selectedCrmItem && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">
                    {selectedCrmItem.call_goal || "Анализ звонка из CRM"}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedCrmItem.call_type === 'входящий' ? 'default' : 'secondary'}>
                      {selectedCrmItem.call_type || 'Не указан'}
                    </Badge>
                    <Badge variant="outline" className={`${
                      selectedCrmItem.file_status === 'completed' ? 'border-success text-success' :
                      selectedCrmItem.file_status === 'processed' ? 'border-warning text-warning' :
                      'border-muted text-muted-foreground'
                    }`}>
                      {selectedCrmItem.file_status || 'Новый'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Дата звонка:</span>
                    <br />
                    {formatDate(selectedCrmItem.call_datetime)}
                  </div>
                  <div>
                    <span className="font-medium">Длительность:</span>
                    <br />
                    {selectedCrmItem.conversation_duration_total || "Не указана"}
                  </div>
                  <div>
                    <span className="font-medium">Общая оценка:</span>
                    <br />
                    {selectedCrmItem.overall_score ? `${selectedCrmItem.overall_score}/10` : "Не оценено"}
                  </div>
                  <div>
                    <span className="font-medium">Достижение цели:</span>
                    <br />
                    <Badge className={selectedCrmItem.goal_achieved ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                      {selectedCrmItem.goal_achieved ? "Да" : "Нет"}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="crm-data">Данные CRM</TabsTrigger>
                  <TabsTrigger value="analysis">Анализ разговора</TabsTrigger>
                  <TabsTrigger value="transcript">Транскрипция</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Основные показатели</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Цель достигнута</p>
                            <Badge className={selectedCrmItem.goal_achieved ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                              {selectedCrmItem.goal_achieved ? "Да" : "Нет"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Общая оценка</p>
                            {selectedCrmItem.overall_score ? renderStarRating(selectedCrmItem.overall_score) : <span className="text-muted-foreground">Не оценено</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Полнота ответов</p>
                            {selectedCrmItem.answer_completeness_score ? renderStarRating(selectedCrmItem.answer_completeness_score) : <span className="text-muted-foreground">Не оценено</span>}
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Активное слушание</p>
                            {selectedCrmItem.active_listening_score ? renderStarRating(selectedCrmItem.active_listening_score) : <span className="text-muted-foreground">Не оценено</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Правильное приветствие</p>
                            <Badge className={selectedCrmItem.greeting_correct ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                              {selectedCrmItem.greeting_correct ? "Да" : "Нет"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Правильное завершение</p>
                            <Badge className={selectedCrmItem.closing_correct ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                              {selectedCrmItem.closing_correct ? "Да" : "Нет"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Назвал имя</p>
                            <Badge className={selectedCrmItem.operator_said_name ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                              {selectedCrmItem.operator_said_name ? "Да" : "Нет"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Поблагодарил</p>
                            <Badge className={selectedCrmItem.operator_thanked ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                              {selectedCrmItem.operator_thanked ? "Да" : "Нет"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Качественные показатели</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCrmItem.client_nps_category && (
                          <div>
                            <p className="text-sm font-medium mb-2">NPS категория клиента</p>
                            <Badge className={getNpsColor(selectedCrmItem.client_nps_category)}>
                              {selectedCrmItem.client_nps_category}
                            </Badge>
                          </div>
                        )}

                        {selectedCrmItem.operator_tonality && (
                          <div>
                            <p className="text-sm font-medium mb-2">Тональность оператора</p>
                            <Badge className={getTonalityColor(selectedCrmItem.operator_tonality)}>
                              {selectedCrmItem.operator_tonality}
                            </Badge>
                          </div>
                        )}

                        {selectedCrmItem.conflict_risk_level && (
                          <div>
                            <p className="text-sm font-medium mb-2">Уровень риска конфликта</p>
                            <Badge className={
                              selectedCrmItem.conflict_risk_level.toLowerCase().includes('высокий') ? 
                              'bg-destructive/10 text-destructive border-destructive/20' :
                              selectedCrmItem.conflict_risk_level.toLowerCase().includes('средний') ?
                              'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                            }>
                              {selectedCrmItem.conflict_risk_level}
                            </Badge>
                          </div>
                        )}

                        {selectedCrmItem.burnout_signs && (
                          <div>
                            <p className="text-sm font-medium mb-2">Признаки выгорания</p>
                            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                              {selectedCrmItem.burnout_signs}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="crm-data" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Данные из CRM системы</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">ID звонка</p>
                          <p className="text-sm">{selectedCrmItem.call_id || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">ID клиента</p>
                          <p className="text-sm">{selectedCrmItem.client_id || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Телефон клиента</p>
                          <p className="text-sm">{selectedCrmItem.client_phone || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">ID пользователя</p>
                          <p className="text-sm">{selectedCrmItem.user_id || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Имя сотрудника</p>
                          <p className="text-sm">{selectedCrmItem.user_name || 'Не указано'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Подразделение</p>
                          <p className="text-sm">{selectedCrmItem.department || 'Не указано'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Бренд</p>
                          <p className="text-sm">{selectedCrmItem.brand || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Тип звонка</p>
                          <p className="text-sm">{selectedCrmItem.call_type || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Файл</p>
                          <p className="text-sm">{selectedCrmItem.file_name || 'Не указан'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Дата загрузки</p>
                          <p className="text-sm">{formatDate(selectedCrmItem.uploaded_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Дата анализа</p>
                          <p className="text-sm">{selectedCrmItem.analyzed_at ? formatDate(selectedCrmItem.analyzed_at) : 'Не анализировался'}</p>
                        </div>
                      </div>

                      {selectedCrmItem.file_url && (
                        <div>
                          <p className="text-sm font-medium mb-2">Аудиофайл</p>
                          <audio controls className="w-full">
                            <source src={selectedCrmItem.file_url} type="audio/mpeg" />
                            <source src={selectedCrmItem.file_url} type="audio/wav" />
                            Ваш браузер не поддерживает аудио элемент.
                          </audio>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Этапы разговора</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCrmItem.conversation_stage_greeting && (
                          <div>
                            <p className="text-sm font-medium mb-2">Приветствие</p>
                            <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 text-blue-800">
                              {selectedCrmItem.conversation_stage_greeting}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.conversation_stage_request && (
                          <div>
                            <p className="text-sm font-medium mb-2">Запрос</p>
                            <div className="text-sm bg-green-50 p-3 rounded border border-green-200 text-green-800">
                              {selectedCrmItem.conversation_stage_request}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.conversation_stage_solution && (
                          <div>
                            <p className="text-sm font-medium mb-2">Решение</p>
                            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                              {selectedCrmItem.conversation_stage_solution}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.conversation_stage_closing && (
                          <div>
                            <p className="text-sm font-medium mb-2">Завершение</p>
                            <div className="text-sm bg-purple-50 p-3 rounded border border-purple-200 text-purple-800">
                              {selectedCrmItem.conversation_stage_closing}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Анализ качества</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCrmItem.answer_completeness_comment && (
                          <div>
                            <p className="text-sm font-medium mb-2">Комментарий к полноте ответов</p>
                            <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 text-blue-800">
                              {selectedCrmItem.answer_completeness_comment}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.active_listening_comment && (
                          <div>
                            <p className="text-sm font-medium mb-2">Комментарий к активному слушанию</p>
                            <div className="text-sm bg-green-50 p-3 rounded border border-green-200 text-green-800">
                              {selectedCrmItem.active_listening_comment}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.operator_strength && (
                          <div>
                            <p className="text-sm font-medium mb-2">Сильные стороны оператора</p>
                            <div className="text-sm bg-green-50 p-3 rounded border border-green-200 text-green-800">
                              {selectedCrmItem.operator_strength}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.operator_weakness && (
                          <div>
                            <p className="text-sm font-medium mb-2">Слабые стороны оператора</p>
                            <div className="text-sm bg-red-50 p-3 rounded border border-red-200 text-red-800">
                              {selectedCrmItem.operator_weakness}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.communication_issues && (
                          <div>
                            <p className="text-sm font-medium mb-2">Проблемы коммуникации</p>
                            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                              {selectedCrmItem.communication_issues}
                            </div>
                          </div>
                        )}

                        {selectedCrmItem.conflict_moments && (
                          <div>
                            <p className="text-sm font-medium mb-2">Конфликтные моменты</p>
                            <div className="text-sm bg-red-50 p-3 rounded border border-red-200 text-red-800">
                              {selectedCrmItem.conflict_moments}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {selectedCrmItem.final_conclusion && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Общее заключение</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm bg-gray-50 p-4 rounded border border-gray-200 text-gray-800">
                          {selectedCrmItem.final_conclusion}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="transcript" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Транскрипция разговора</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCrmItem.transcript ? (
                        <TranscriptDisplay transcript={selectedCrmItem.transcript} />
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Транскрипция недоступна
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Center Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="w-[80vw] max-w-none overflow-y-auto max-h-[90vh]" style={{ width: '80vw' }}>
          {selectedItem && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">
                    {selectedItem.call_goal || "Анализ звонка"}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditMode(true);
                        setEditedItem({ ...selectedItem });
                      }}
                      disabled={editMode || updateLoading}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы действительно хотите удалить этот анализ? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteSingleItem(selectedItem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(selectedItem.date_created)}</span>
                  {selectedItem.goal_achieved ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Цель достигнута
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Цель не достигнута
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              {editMode ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Цель звонка</label>
                    <Textarea
                      value={editedItem?.call_goal || ''}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, call_goal: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Заключение</label>
                    <Textarea
                      value={editedItem?.final_conclusion || ''}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, final_conclusion: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Общая оценка (0-10)</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem?.overall_score || 0}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, overall_score: parseInt(e.target.value) || 0 } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (editedItem) {
                          updateItem(selectedItem.id, {
                            call_goal: editedItem.call_goal,
                            final_conclusion: editedItem.final_conclusion,
                            overall_score: editedItem.overall_score
                          });
                        }
                      }}
                      disabled={updateLoading}
                      className="flex-1"
                    >
                      {updateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditedItem(null);
                      }}
                      disabled={updateLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="analysis">Анализ</TabsTrigger>
                    <TabsTrigger value="transcript">Транскрипция</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Основные показатели</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Общая оценка</p>
                            {renderStarRating(selectedItem.overall_score)}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Активное слушание</p>
                            {renderStarRating(selectedItem.active_listening_score)}
                          </div>
                        </div>

                        {selectedItem.operator_tonality && (
                          <div>
                            <p className="text-sm font-medium mb-2">Тональность оператора</p>
                            <Badge className={getTonalityColor(selectedItem.operator_tonality)}>
                              {selectedItem.operator_tonality}
                            </Badge>
                          </div>
                        )}

                        {selectedItem.client_nps_category && (
                          <div>
                            <p className="text-sm font-medium mb-2">Категория NPS</p>
                            <Badge className={getNpsColor(selectedItem.client_nps_category)}>
                              {selectedItem.client_nps_category}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Детальный анализ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedItem.final_conclusion && (
                          <div>
                            <p className="text-sm font-medium mb-2">Заключение</p>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                              {selectedItem.final_conclusion}
                            </p>
                          </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Активное слушание</p>
                            <p>{selectedItem.active_listening_score || "Не оценено"}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Полнота ответа</p>
                            <p>{selectedItem.answer_completeness_score || "Не оценено"}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Общая оценка</p>
                            <p>{selectedItem.overall_score || "Не оценено"}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Цель достигнута</p>
                            <p>{selectedItem.goal_achieved ? "Да" : "Нет"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transcript" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Транскрипция разговора</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TranscriptDisplay transcript={selectedItem.transcript} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sales Detail Dialog */}
      <Dialog open={!!selectedSalesItem} onOpenChange={(open) => !open && setSelectedSalesItem(null)}>
        <DialogContent className="w-[80vw] max-w-none overflow-y-auto max-h-[90vh]" style={{ width: '80vw' }}>
          {selectedSalesItem && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">
                    {selectedSalesItem.object_type || "Анализ продаж"}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSalesEditMode(true);
                        setSalesEditedItem({ ...selectedSalesItem });
                      }}
                      disabled={salesEditMode || salesUpdateLoading}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы действительно хотите удалить этот анализ продаж? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteSingleSalesItem(selectedSalesItem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(selectedSalesItem.created_at)}</span>
                  <span>{formatDuration(selectedSalesItem.call_duration_seconds)}</span>
                  {selectedSalesItem.measurement_scheduled && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Записался на замер
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              {salesEditMode ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Тип объекта</label>
                    <Input
                      value={salesEditedItem?.object_type || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, object_type: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Количество конструкций</label>
                    <Input
                      value={salesEditedItem?.construction_count || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, construction_count: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Когда нужны окна</label>
                    <Input
                      value={salesEditedItem?.window_needed_when || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, window_needed_when: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="measurement_scheduled"
                      checked={salesEditedItem?.measurement_scheduled || false}
                      onCheckedChange={(checked) => setSalesEditedItem(prev => prev ? { ...prev, measurement_scheduled: checked as boolean } : null)}
                    />
                    <label htmlFor="measurement_scheduled" className="text-sm font-medium">
                      Записался на замер
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Требования клиента</label>
                    <Textarea
                      value={salesEditedItem?.client_requirements || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, client_requirements: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Эмоциональная оценка</label>
                    <Select
                      value={salesEditedItem?.client_emotion || ''}
                      onValueChange={(value) => setSalesEditedItem(prev => prev ? { ...prev, client_emotion: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="положительная">Положительная</SelectItem>
                        <SelectItem value="нейтральная">Нейтральная</SelectItem>
                        <SelectItem value="негативная">Негативная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Температура клиента</label>
                    <Select
                      value={salesEditedItem?.client_warmth || ''}
                      onValueChange={(value) => setSalesEditedItem(prev => prev ? { ...prev, client_warmth: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="горячий">Горячий</SelectItem>
                        <SelectItem value="тёплый">Тёплый</SelectItem>
                        <SelectItem value="холодный">Холодный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (salesEditedItem) {
                          updateSalesItem(selectedSalesItem.id, {
                            object_type: salesEditedItem.object_type,
                            construction_count: salesEditedItem.construction_count,
                            window_needed_when: salesEditedItem.window_needed_when,
                            measurement_scheduled: salesEditedItem.measurement_scheduled,
                            client_requirements: salesEditedItem.client_requirements,
                            client_emotion: salesEditedItem.client_emotion,
                            client_warmth: salesEditedItem.client_warmth
                          });
                        }
                      }}
                      disabled={salesUpdateLoading}
                      className="flex-1"
                    >
                      {salesUpdateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSalesEditMode(false);
                        setSalesEditedItem(null);
                      }}
                      disabled={salesUpdateLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="assessment">Оценка разговора</TabsTrigger>
                    <TabsTrigger value="transcript">Транскрипция</TabsTrigger>
                    <TabsTrigger value="feedback">Обратная связь</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Основные показатели</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Общая оценка</p>
                            {renderStarRatingFrom100(selectedSalesItem.total_score)}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Длительность звонка</p>
                            <p className="text-sm">{formatDuration(selectedSalesItem.call_duration_seconds)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="text-2xl font-bold text-blue-600">
                              {((selectedSalesItem.total_score || 0) - (selectedSalesItem.stage5_total_score || 0) - (selectedSalesItem.stage6_total_score || 0)).toFixed(1)}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">Базовая оценка</div>
                            <div className="text-xs text-blue-600">из 70 баллов</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <div className="text-2xl font-bold text-green-600">
                              {(selectedSalesItem.stage5_total_score || 0)}
                            </div>
                            <div className="text-sm text-green-700 font-medium">Завершение сделки</div>
                            <div className="text-xs text-green-600">из 15 баллов</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                            <div className="text-2xl font-bold text-purple-600">
                              {(selectedSalesItem.stage6_total_score || 0)}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">Этика общения</div>
                            <div className="text-xs text-purple-600">из 15 баллов</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Тип объекта</p>
                            <p className="text-sm">{selectedSalesItem.object_type || "Не указано"}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Количество конструкций</p>
                            <p className="text-sm">{selectedSalesItem.construction_count || "Не указано"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Записался на замер</p>
                          <Badge className={selectedSalesItem.measurement_scheduled ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                            {selectedSalesItem.measurement_scheduled ? "Да" : "Нет"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assessment" className="space-y-4">
                    <Card className="border-l-4 border-l-blue-400">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          Оценка разговора
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Тип объекта</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.object_type || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.object_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Количество конструкций</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.construction_count || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.construction_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Срочность</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.window_needed_when || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.timing_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Замер</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.measurement_scheduled ? "Записался" : "Не записался"}</span>
                              <Badge variant="outline">{selectedSalesItem.measurement_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Эмоции клиента</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.client_emotion || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.emotion_score || 0} баллов</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-green-400">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          Завершение сделки (до 15 баллов)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Условия оплаты</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage5_payment_conditions || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage5_payment_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">"Я - Ваш персональный менеджер"</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage5_personal_manager || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage5_personal_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Благодарность клиенту</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage5_thanked_client || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage5_thanks_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Итог разговора с результатом</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage5_call_summary || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage5_summary_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Предложение менеджера заказа</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage5_order_manager || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage5_order_score || 0} баллов</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-800">
                            Общий балл завершения сделки: {selectedSalesItem.stage5_total_score || 0} из 15 баллов
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-400">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                          Этика телефонного общения (до 15 баллов)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Знание номера телефона</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage6_knows_phone || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage6_phone_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Знание источника рекламы</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage6_knows_source || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage6_source_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Культура речи (без жаргона)</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage6_speech_culture || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage6_culture_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Обращение по имени 3+ раз</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage6_name_usage || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage6_name_score || 0} баллов</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Уточнение полноты ответов</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedSalesItem.stage6_questions_check || "Не указано"}</span>
                              <Badge variant="outline">{selectedSalesItem.stage6_check_score || 0} баллов</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-medium text-purple-800">
                            Общий балл этики общения: {selectedSalesItem.stage6_total_score || 0} из 15 баллов
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transcript" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Транскрипция разговора</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TranscriptDisplay transcript={selectedSalesItem.steno} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Обратная связь и дополнительная информация</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedSalesItem.manager_feedback && (
                          <div>
                            <p className="text-sm font-medium mb-2">Обратная связь от менеджера</p>
                            <div className="text-sm bg-orange-50 p-3 rounded border border-orange-200 text-orange-800">
                              {selectedSalesItem.manager_feedback}
                            </div>
                          </div>
                        )}

                        {selectedSalesItem.skills_to_improve && (
                          <div>
                            <p className="text-sm font-medium mb-2">Навыки для улучшения</p>
                            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                              {selectedSalesItem.skills_to_improve}
                            </div>
                          </div>
                        )}

                        {selectedSalesItem.used_skills && (
                          <div>
                            <p className="text-sm font-medium mb-2">Использованные навыки</p>
                            <div className="text-sm bg-green-50 p-3 rounded border border-green-200 text-green-800">
                              {selectedSalesItem.used_skills}
                            </div>
                          </div>
                        )}

                        {selectedSalesItem.client_requirements && (
                          <div>
                            <p className="text-sm font-medium mb-2">Требования клиента</p>
                            <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 text-blue-800">
                              {selectedSalesItem.client_requirements}
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Дата следующего контакта</p>
                            <p>{selectedSalesItem.next_contact_date || "Не указано"}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Способ следующего контакта</p>
                            <p>{selectedSalesItem.next_contact_method || "Не указано"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </Tabs>
              )}
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
