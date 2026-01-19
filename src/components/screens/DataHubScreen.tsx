import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Link, FileSpreadsheet, CheckCircle, Loader2, 
  Hash, Type, Calendar, ToggleLeft, Trash2, RefreshCw, 
  AlertTriangle, RotateCcw, Plus, TrendingUp, Copy, Scissors, BarChart3, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMLStore, ColumnInfo, DataHubTab } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { uploadFile, uploadFromURL, cleanData, resetData, undoData, createFeature, CleanRequest, isOfflineError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MOCK_DATASETS } from '@/lib/mockData';

const typeIcons = {
  numeric: Hash,
  categorical: Type,
  datetime: Calendar,
  boolean: ToggleLeft,
};

const typeColors = {
  numeric: 'from-blue-500 to-cyan-500',
  categorical: 'from-purple-500 to-pink-500',
  datetime: 'from-orange-500 to-yellow-500',
  boolean: 'from-green-500 to-emerald-500',
};

export function DataHubScreen() {
  const { 
    lang, data, dataName, dataHubTab, totalRows,
    setData, setOriginalData, setColumns, setDataHistory, setDataName, setDataHubTab, setTotalRows,
    columns, selectedColumn, setSelectedColumn
  } = useMLStore();
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const [formula, setFormula] = useState('');
  const isRTL = lang === 'he';

  const totalMissing = columns.reduce((sum, col) => sum + col.missing, 0);
  const totalCells = data ? data.length * columns.length : 0;
  const missingPercent = totalCells > 0 ? ((totalMissing / totalCells) * 100).toFixed(1) : '0';
  const duplicates = data ? data.length - new Set(data.map(row => JSON.stringify(row))).size : 0;

  // Process upload response: set data, columns, switch to overview tab
  const processUploadResponse = useCallback((response: {
    success: boolean;
    message: string;
    filename: string;
    total_rows: number;
    data_preview: Record<string, any>[];
    columns: ColumnInfo[];
  }) => {
    if (!response.success) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: response.message || 'Upload failed',
        variant: 'destructive',
      });
      return;
    }

    if (!response.data_preview || response.data_preview.length === 0) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: lang === 'he' ? 'הנתונים ריקים' : 'Data is empty',
        variant: 'destructive',
      });
      return;
    }

    // Set all data from response
    setData(response.data_preview);
    setOriginalData([...response.data_preview]);
    setColumns(response.columns);
    setDataName(response.filename);
    setTotalRows(response.total_rows);
    setDataHistory([]);
    
    // CRITICAL: Switch to overview tab immediately
    setDataHubTab('overview');

    toast({ 
      title: lang === 'he' ? 'הנתונים נטענו בהצלחה!' : 'Data loaded successfully!',
      description: `${response.total_rows} rows, ${response.columns.length} columns`
    });
  }, [setData, setOriginalData, setColumns, setDataName, setTotalRows, setDataHistory, setDataHubTab, lang]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const response = await uploadFile(file);
      processUploadResponse(response);
    } catch (err) {
      const offline = isOfflineError(err);
      toast({
        title: offline ? '🔌 Backend Offline' : (lang === 'he' ? 'שגיאה' : 'Error'),
        description: offline 
          ? 'Please start the Python backend: python main.py' 
          : (err instanceof Error ? err.message : 'Upload failed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [processUploadResponse, lang]);

  const handleUrlLoad = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await uploadFromURL(url);
      processUploadResponse(response);
    } catch (err) {
      const offline = isOfflineError(err);
      toast({
        title: offline ? '🔌 Backend Offline' : (lang === 'he' ? 'שגיאה' : 'Error'),
        description: offline 
          ? 'Please start the Python backend: python main.py' 
          : (err instanceof Error ? err.message : 'Failed to load URL'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [url, processUploadResponse, lang]);

  // Load mock data (no backend needed)
  const handleMockLoad = useCallback((datasetName: string) => {
    const dataset = MOCK_DATASETS.find(d => d.name === datasetName);
    if (!dataset) return;

    setData(dataset.data);
    setOriginalData([...dataset.data]);
    setColumns(dataset.columns);
    setDataName(`${dataset.name} (Demo)`);
    setTotalRows(dataset.data.length);
    setDataHistory([]);
    setDataHubTab('overview');

    toast({
      title: lang === 'he' ? '🎯 נתוני הדגמה נטענו!' : '🎯 Demo data loaded!',
      description: `${dataset.data.length} rows, ${dataset.columns.length} columns`,
    });
  }, [setData, setOriginalData, setColumns, setDataName, setTotalRows, setDataHistory, setDataHubTab, lang]);

  const handleChangeData = () => {
    setData(null);
    setOriginalData(null);
    setColumns([]);
    setDataHistory([]);
    setDataName('');
    setTotalRows(0);
  };

  const executeCleanAction = async (request: CleanRequest) => {
    setActionLoading(request.action);
    try {
      const response = await cleanData(request);
      if (response.success) {
        setData(response.data_preview);
        setColumns(response.columns);
        toast({ title: response.message });
      }
    } catch (err) {
      const offline = isOfflineError(err);
      toast({
        title: offline ? '🔌 Backend Offline' : (lang === 'he' ? 'שגיאה' : 'Error'),
        description: offline 
          ? 'Please start the Python backend: python main.py' 
          : (err instanceof Error ? err.message : 'Operation failed'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async () => {
    setActionLoading('reset');
    try {
      const response = await resetData();
      if (response.success) {
        setData(response.data_preview);
        setColumns(response.columns);
        toast({ title: response.message });
      }
    } catch (err) {
      toast({ title: 'Reset failed', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUndo = async () => {
    setActionLoading('undo');
    try {
      const response = await undoData();
      if (response.success) {
        setData(response.data_preview);
        setColumns(response.columns);
        toast({ title: response.message });
      }
    } catch (err) {
      toast({ title: 'Undo failed', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateFeature = async () => {
    if (!newColName.trim() || !formula.trim()) return;
    setActionLoading('feature');
    try {
      const response = await createFeature(newColName, formula);
      if (response.success) {
        setData(response.data_preview);
        setColumns(response.columns);
        setNewColName('');
        setFormula('');
        toast({ title: response.message });
      }
    } catch (err) {
      toast({ title: 'Feature creation failed', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const selectedColInfo = columns.find(c => c.name === selectedColumn);

  const getDistributionData = () => {
    if (!selectedColumn || !data) return [];
    const values = data.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined && v !== '');
    
    if (selectedColInfo?.type === 'numeric') {
      const nums = values.map(Number).filter(n => !isNaN(n));
      if (nums.length === 0) return [];
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const binCount = 10;
      const binSize = (max - min) / binCount || 1;
      
      const bins: Record<string, number> = {};
      nums.forEach(n => {
        const binIndex = Math.min(Math.floor((n - min) / binSize), binCount - 1);
        const binLabel = `${(min + binIndex * binSize).toFixed(0)}`;
        bins[binLabel] = (bins[binLabel] || 0) + 1;
      });
      
      return Object.entries(bins).map(([name, value]) => ({ name, value }));
    } else {
      const freq: Record<string, number> = {};
      values.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
    }
  };

  const distributionData = getDistributionData();

  // No data loaded - show import screen
  if (!data) {
    return (
      <div className="p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('dataHub.title', lang)}</h1>
              <p className="text-muted-foreground">
                {lang === 'he' ? 'טען נתונים להתחלת הפרויקט' : 'Load data to start your project'}
              </p>
            </div>
          </div>

          <Tabs defaultValue="sample" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="sample" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                {t('dataHub.sample', lang)}
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                {t('dataHub.upload', lang)}
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <Link className="w-4 h-4" />
                {t('dataHub.url', lang)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sample">
              <div className="grid grid-cols-2 gap-4">
                {MOCK_DATASETS.map((dataset) => (
                  <motion.button
                    key={dataset.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMockLoad(dataset.name)}
                    className="glass-card rounded-xl p-6 text-right hover:border-primary/50 transition-all flex items-center gap-4 group"
                    disabled={loading}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {dataset.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{dataset.name}</p>
                      <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <label className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={loading} />
                <Upload className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                <p className="text-lg font-medium mb-2">{t('dataHub.dropzone', lang)}</p>
                <p className="text-sm text-muted-foreground">{t('dataHub.formats', lang)}</p>
              </label>
            </TabsContent>

            <TabsContent value="url">
              <div className="glass-card rounded-2xl p-8">
                <div className="flex gap-4">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t('dataHub.urlPlaceholder', lang)}
                    className="flex-1"
                    dir="ltr"
                  />
                  <Button onClick={handleUrlLoad} disabled={loading || !url.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dataHub.load', lang)}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {lang === 'he' 
                    ? 'הדבק לינק ישיר (Raw) לקובץ CSV מ-GitHub, Kaggle או כל מקור אחר' 
                    : 'Paste a direct (Raw) link to a CSV file from GitHub, Kaggle or any source'}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 glass-card rounded-xl p-6 flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="font-medium">{t('general.loading', lang)}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Data loaded - show Data Hub with tabs
  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header with metrics */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('dataHub.title', lang)}</h1>
              <p className="text-muted-foreground text-sm">{dataName} • {totalRows} rows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={actionLoading !== null}>
              {actionLoading === 'undo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={actionLoading !== null}>
              {actionLoading === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleChangeData}>
              🔄 {lang === 'he' ? 'החלף נתונים' : 'Change Data'}
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: t('dataHub.rows', lang), value: totalRows, icon: '📊', color: 'primary' },
            { label: t('dataHub.columns', lang), value: columns.length, icon: '📋', color: 'info' },
            { label: t('dataHub.missingPercent', lang), value: `${missingPercent}%`, icon: totalMissing > 0 ? '⚠️' : '✅', color: totalMissing > 0 ? 'warning' : 'success' },
            { label: t('dataHub.duplicates', lang), value: duplicates, icon: duplicates > 0 ? '⚠️' : '✅', color: duplicates > 0 ? 'warning' : 'success' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "metric-card",
                metric.color === 'success' && "border-success/40",
                metric.color === 'warning' && "border-warning/40",
                metric.color === 'primary' && "border-primary/40",
                metric.color === 'info' && "border-info/40"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</span>
                <span className="text-xl">{metric.icon}</span>
              </div>
              <p className={cn(
                "text-3xl font-bold tracking-tight",
                metric.color === 'success' && "text-success",
                metric.color === 'warning' && "text-warning",
                metric.color === 'primary' && "text-primary",
                metric.color === 'info' && "text-info"
              )}>{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={dataHubTab} onValueChange={(v) => setDataHubTab(v as DataHubTab)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('dataHub.overview', lang)}
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-2">
              <Scissors className="w-4 h-4" />
              {t('dataHub.lab', lang)}
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('dataHub.quality', lang)}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-6">
              {/* Column Types Visual List */}
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  {t('lab.columns', lang)}
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {columns.map((col) => {
                    const Icon = typeIcons[col.type];
                    return (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColumn(col.name)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                          selectedColumn === col.name 
                            ? "bg-primary/10 border border-primary/30" 
                            : "hover:bg-secondary/50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0", typeColors[col.type])}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm truncate">{col.name}</p>
                          <p className="text-xs text-muted-foreground">{col.type}</p>
                        </div>
                        {col.missing > 0 && (
                          <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                            {col.missing}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column Details Panel */}
              <div className="col-span-2 glass-card rounded-xl p-5">
                <AnimatePresence mode="wait">
                  {selectedColInfo ? (
                    <motion.div
                      key={selectedColumn}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {(() => { const Icon = typeIcons[selectedColInfo.type]; return <Icon className="w-5 h-5 text-primary" />; })()}
                          {selectedColumn}
                        </h3>
                        <span className={cn("status-badge", selectedColInfo.missing > 0 ? "warning" : "success")}>
                          {selectedColInfo.missing > 0 ? `${selectedColInfo.missing} missing` : 'No missing'}
                        </span>
                      </div>

                      {/* Stats Grid - now using flat structure */}
                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {selectedColInfo.type === 'numeric' ? (
                          <>
                            {selectedColInfo.mean !== undefined && (
                              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">{t('lab.mean', lang)}</p>
                                <p className="font-bold text-primary">{selectedColInfo.mean.toFixed(2)}</p>
                              </div>
                            )}
                            {selectedColInfo.median !== undefined && (
                              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">{t('lab.median', lang)}</p>
                                <p className="font-bold text-primary">{selectedColInfo.median.toFixed(2)}</p>
                              </div>
                            )}
                            {selectedColInfo.min !== undefined && (
                              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Min</p>
                                <p className="font-bold text-primary">{selectedColInfo.min.toFixed(2)}</p>
                              </div>
                            )}
                            {selectedColInfo.max !== undefined && (
                              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Max</p>
                                <p className="font-bold text-primary">{selectedColInfo.max.toFixed(2)}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="bg-secondary/50 rounded-lg p-3 text-center">
                              <p className="text-xs text-muted-foreground mb-1">{t('lab.unique', lang)}</p>
                              <p className="font-bold text-primary">{selectedColInfo.unique}</p>
                            </div>
                            {selectedColInfo.mode !== undefined && (
                              <div className="bg-secondary/50 rounded-lg p-3 text-center col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">{t('lab.mode', lang)}</p>
                                <p className="font-bold text-primary truncate">{String(selectedColInfo.mode)}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Distribution Chart */}
                      {distributionData.length > 0 && (
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
                              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {distributionData.map((_, index) => (
                                  <Cell key={index} fill={`hsl(${199 - index * 8} 89% ${48 + index * 2}%)`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
                      <p>{t('lab.selectColumn', lang)}</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="glass-card rounded-xl p-5 mt-6">
              <h3 className="font-semibold mb-4">Data Preview</h3>
              <div className="overflow-x-auto rounded-lg border border-border max-h-[300px]">
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.keys(data[0] || {}).map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="font-mono text-sm">
                            {val === null || val === undefined ? <span className="text-muted-foreground">—</span> : String(val).substring(0, 25)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Lab Tab */}
          <TabsContent value="lab">
            <div className="grid grid-cols-3 gap-6">
              {/* Column List */}
              <div className="glass-card rounded-xl p-5 max-h-[500px] overflow-y-auto">
                <h3 className="font-semibold mb-4">{t('lab.columns', lang)} ({columns.length})</h3>
                <div className="space-y-2">
                  {columns.map((col) => {
                    const Icon = typeIcons[col.type];
                    return (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColumn(col.name)}
                        className={cn("column-card w-full", selectedColumn === col.name && "selected")}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0", typeColors[col.type])}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm truncate">{col.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{col.unique} unique</span>
                              {col.missing > 0 && (
                                <span className="text-warning flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3" />
                                  {col.missing}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions Panel */}
              <div className="col-span-2 space-y-6">
                {selectedColInfo ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
                    <h3 className="font-semibold mb-4">{t('lab.actions', lang)}: {selectedColumn}</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => executeCleanAction({ action: 'drop_column', column: selectedColumn! })}
                        disabled={actionLoading !== null}
                        className="justify-start"
                      >
                        {actionLoading === 'drop_column' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {t('lab.dropColumn', lang)}
                      </Button>

                      {selectedColInfo.type === 'numeric' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => executeCleanAction({ action: 'fill_missing', column: selectedColumn!, fill_method: 'mean' })}
                            disabled={actionLoading !== null || selectedColInfo.missing === 0}
                            className="justify-start"
                          >
                            {actionLoading === 'fill_missing' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                            Fill with Mean
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => executeCleanAction({ action: 'fill_missing', column: selectedColumn!, fill_method: 'median' })}
                            disabled={actionLoading !== null || selectedColInfo.missing === 0}
                            className="justify-start"
                          >
                            Fill with Median
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => executeCleanAction({ action: 'remove_outliers', column: selectedColumn! })}
                            disabled={actionLoading !== null}
                            className="justify-start"
                          >
                            {actionLoading === 'remove_outliers' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Scissors className="w-4 h-4 mr-2" />}
                            {t('lab.removeOutliers', lang)}
                          </Button>
                        </>
                      )}

                      {selectedColInfo.type === 'categorical' && (
                        <Button
                          variant="outline"
                          onClick={() => executeCleanAction({ action: 'fill_missing', column: selectedColumn!, fill_method: 'mode' })}
                          disabled={actionLoading !== null || selectedColInfo.missing === 0}
                          className="justify-start"
                        >
                          Fill with Mode
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground">
                    <Scissors className="w-12 h-12 mb-4 opacity-30" />
                    <p>{t('lab.selectColumn', lang)}</p>
                  </div>
                )}

                {/* Quick Global Actions */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => executeCleanAction({ action: 'drop_missing_rows' })}
                      disabled={actionLoading !== null || totalMissing === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Drop Missing Rows
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => executeCleanAction({ action: 'drop_duplicates' })}
                      disabled={actionLoading !== null || duplicates === 0}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Drop {duplicates} Duplicates
                    </Button>
                  </div>
                </div>

                {/* Feature Engineering */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    {t('lab.featureEng', lang)}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder={t('lab.newColumn', lang)}
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                    />
                    <Input
                      placeholder="col1 + col2 * 0.5"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                  <Button
                    className="mt-3 w-full"
                    onClick={handleCreateFeature}
                    disabled={actionLoading !== null || !newColName.trim() || !formula.trim()}
                  >
                    {actionLoading === 'feature' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {t('lab.createFeature', lang)}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality">
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-6">{t('dataHub.quality', lang)}</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('lab.column', lang)}</th>
                      <th>{t('lab.type', lang)}</th>
                      <th>{t('lab.unique', lang)}</th>
                      <th>{t('lab.missing', lang)}</th>
                      <th>Missing %</th>
                      <th>Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => {
                      const missingPct = data ? ((col.missing / data.length) * 100).toFixed(1) : '0';
                      return (
                        <tr key={col.name} className="hover:bg-secondary/30">
                          <td className="font-medium">{col.name}</td>
                          <td>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              col.type === 'numeric' && "bg-blue-500/10 text-blue-500",
                              col.type === 'categorical' && "bg-purple-500/10 text-purple-500",
                              col.type === 'boolean' && "bg-green-500/10 text-green-500",
                              col.type === 'datetime' && "bg-orange-500/10 text-orange-500"
                            )}>
                              {col.type}
                            </span>
                          </td>
                          <td>{col.unique}</td>
                          <td>
                            {col.missing > 0 ? (
                              <span className="text-warning font-medium">{col.missing}</span>
                            ) : (
                              <span className="text-success">0</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full", parseFloat(missingPct) > 10 ? "bg-warning" : "bg-success")}
                                  style={{ width: `${Math.min(parseFloat(missingPct), 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{missingPct}%</span>
                            </div>
                          </td>
                          <td className="text-xs text-muted-foreground">
                            {col.type === 'numeric' && col.mean !== undefined && (
                              <span>μ={col.mean.toFixed(1)}, range=[{col.min?.toFixed(1)}, {col.max?.toFixed(1)}]</span>
                            )}
                            {col.type === 'categorical' && col.mode !== undefined && (
                              <span>mode="{col.mode}"</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
