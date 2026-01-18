import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Type, Calendar, ToggleLeft, Trash2, RefreshCw, Scissors, TrendingUp, Plus, RotateCcw, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMLStore, ColumnInfo } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cleanData, resetData, undoData, createFeature, getData, ColumnInfoAPI, CleanRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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

// Convert API column format to store format
function convertColumns(apiColumns: ColumnInfoAPI[]): ColumnInfo[] {
  return apiColumns.map(col => ({
    name: col.name,
    type: col.dtype === 'float64' || col.dtype === 'int64' ? 'numeric' 
        : col.dtype === 'bool' ? 'boolean'
        : 'categorical',
    missing: col.missing,
    unique: col.unique,
    stats: col.stats,
  }));
}

// Generate correlation matrix data
function generateCorrelationData(data: Record<string, any>[], columns: ColumnInfo[]) {
  const numericCols = columns.filter(c => c.type === 'numeric').map(c => c.name);
  if (numericCols.length < 2) return [];

  const correlations: { x: string; y: string; value: number }[] = [];
  
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = 0; j < numericCols.length; j++) {
      const col1 = numericCols[i];
      const col2 = numericCols[j];
      
      const vals1 = data.map(row => Number(row[col1])).filter(n => !isNaN(n));
      const vals2 = data.map(row => Number(row[col2])).filter(n => !isNaN(n));
      
      if (vals1.length !== vals2.length || vals1.length === 0) {
        correlations.push({ x: col1, y: col2, value: 0 });
        continue;
      }
      
      const mean1 = vals1.reduce((a, b) => a + b, 0) / vals1.length;
      const mean2 = vals2.reduce((a, b) => a + b, 0) / vals2.length;
      
      let num = 0, den1 = 0, den2 = 0;
      for (let k = 0; k < vals1.length; k++) {
        num += (vals1[k] - mean1) * (vals2[k] - mean2);
        den1 += Math.pow(vals1[k] - mean1, 2);
        den2 += Math.pow(vals2[k] - mean2, 2);
      }
      
      const corr = den1 && den2 ? num / Math.sqrt(den1 * den2) : 0;
      correlations.push({ x: col1, y: col2, value: Number(corr.toFixed(2)) });
    }
  }
  
  return correlations;
}

export function LabScreen() {
  const { 
    lang, data, columns, selectedColumn, setSelectedColumn, 
    setData, setColumns, setCurrentScreen
  } = useMLStore();
  const [newColName, setNewColName] = useState('');
  const [formula, setFormula] = useState('');
  const [showCorrelation, setShowCorrelation] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const isRTL = lang === 'he';

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('general.noData', lang)}</p>
      </div>
    );
  }

  const selectedColInfo = columns.find(c => c.name === selectedColumn);
  const totalMissing = columns.reduce((sum, col) => sum + col.missing, 0);
  const duplicates = data.length - new Set(data.map(row => JSON.stringify(row))).size;

  // Generate distribution data for selected column
  const getDistributionData = () => {
    if (!selectedColumn || !data) return [];
    
    const values = data.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined && v !== '');
    
    if (selectedColInfo?.type === 'numeric') {
      const nums = values.map(Number).filter(n => !isNaN(n));
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const binCount = 10;
      const binSize = (max - min) / binCount || 1;
      
      const bins: Record<string, number> = {};
      nums.forEach(n => {
        const binIndex = Math.min(Math.floor((n - min) / binSize), binCount - 1);
        const binLabel = `${(min + binIndex * binSize).toFixed(1)}`;
        bins[binLabel] = (bins[binLabel] || 0) + 1;
      });
      
      return Object.entries(bins).map(([name, value]) => ({ name, value }));
    } else {
      const freq: Record<string, number> = {};
      values.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
    }
  };

  const distributionData = getDistributionData();
  const correlationData = generateCorrelationData(data, columns);
  const numericCols = columns.filter(c => c.type === 'numeric').map(c => c.name);

  // API-based actions
  const executeCleanAction = async (request: CleanRequest) => {
    setLoading(request.action);
    try {
      const response = await cleanData(request);
      if (response.success) {
        setData(response.data_preview);
        setColumns(convertColumns(response.columns));
        toast({
          title: lang === 'he' ? 'בוצע בהצלחה' : 'Success',
          description: response.message,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: err instanceof Error ? err.message : 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDropColumn = () => {
    if (!selectedColumn) return;
    executeCleanAction({ action: 'drop_column', column: selectedColumn });
    setSelectedColumn(null);
  };

  const handleFillMissing = (method: 'mean' | 'median' | 'mode') => {
    if (!selectedColumn) return;
    executeCleanAction({ action: 'fill_missing', column: selectedColumn, fill_method: method });
  };

  const handleRemoveOutliers = () => {
    if (!selectedColumn) return;
    executeCleanAction({ action: 'remove_outliers', column: selectedColumn });
  };

  const handleDropMissingRows = () => {
    executeCleanAction({ action: 'drop_missing_rows' });
  };

  const handleDropDuplicates = () => {
    executeCleanAction({ action: 'drop_duplicates' });
  };

  const handleUndo = async () => {
    setLoading('undo');
    try {
      const response = await undoData();
      if (response.success) {
        setData(response.data_preview);
        setColumns(convertColumns(response.columns));
      }
    } catch (err) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: err instanceof Error ? err.message : 'Undo failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    setLoading('reset');
    try {
      const response = await resetData();
      if (response.success) {
        setData(response.data_preview);
        setColumns(convertColumns(response.columns));
      }
    } catch (err) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: err instanceof Error ? err.message : 'Reset failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCreateFeature = async () => {
    if (!newColName.trim() || !formula.trim()) return;
    setLoading('feature');
    try {
      const response = await createFeature(newColName, formula);
      if (response.success) {
        setData(response.data_preview);
        setColumns(convertColumns(response.columns));
        setNewColName('');
        setFormula('');
        toast({
          title: lang === 'he' ? 'עמודה נוצרה' : 'Feature Created',
          description: response.message,
        });
      }
    } catch (err) {
      toast({
        title: lang === 'he' ? 'שגיאה' : 'Error',
        description: err instanceof Error ? err.message : 'Feature creation failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t('lab.title', lang)}</h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'he' ? 'נתח, נקה ושפר את הנתונים שלך' : 'Analyze, clean and improve your data'}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: t('data.rows', lang), value: data.length, color: 'text-primary', icon: '📊' },
            { label: t('data.columns', lang), value: columns.length, color: 'text-primary', icon: '📋' },
            { label: t('lab.missing', lang), value: totalMissing, color: totalMissing > 0 ? 'text-warning' : 'text-success', icon: totalMissing > 0 ? '⚠️' : '✅' },
            { label: t('lab.duplicates', lang), value: duplicates, color: duplicates > 0 ? 'text-warning' : 'text-success', icon: duplicates > 0 ? '⚠️' : '✅' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="metric-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{metric.label}</p>
                <span className="text-lg">{metric.icon}</span>
              </div>
              <p className={cn("text-3xl font-bold", metric.color)}>{metric.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Row */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleDropMissingRows}
            disabled={totalMissing === 0 || loading !== null}
          >
            {loading === 'drop_missing_rows' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 ml-1" />}
            {lang === 'he' ? 'מחק שורות עם חסרים' : 'Drop Missing Rows'}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleDropDuplicates}
            disabled={duplicates === 0 || loading !== null}
          >
            {loading === 'drop_duplicates' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4 ml-1" />}
            {lang === 'he' ? `מחק ${duplicates} כפילויות` : `Drop ${duplicates} Duplicates`}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowCorrelation(!showCorrelation)}
            disabled={numericCols.length < 2}
          >
            <TrendingUp className="w-4 h-4 ml-1" />
            {t('lab.correlation', lang)}
          </Button>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={loading !== null}
          >
            {loading === 'undo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 ml-1" />}
            {lang === 'he' ? 'בטל' : 'Undo'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={loading !== null}
          >
            {loading === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-1" />}
            {lang === 'he' ? 'אפס' : 'Reset'}
          </Button>
        </div>

        {/* Correlation Heatmap */}
        {showCorrelation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card rounded-xl p-6 mb-6"
          >
            <h3 className="font-semibold mb-4">{t('lab.correlation', lang)}</h3>
            <div className="grid gap-1" style={{ 
              gridTemplateColumns: `auto ${numericCols.map(() => '1fr').join(' ')}`,
              maxWidth: '100%',
              overflowX: 'auto'
            }}>
              <div /> {/* Empty corner */}
              {numericCols.map(col => (
                <div key={`header-${col}`} className="text-xs text-center text-muted-foreground truncate px-1">
                  {col}
                </div>
              ))}
              {numericCols.map(row => (
                <>
                  <div key={`row-${row}`} className="text-xs text-muted-foreground truncate px-1 flex items-center">
                    {row}
                  </div>
                  {numericCols.map(col => {
                    const cell = correlationData.find(c => c.x === row && c.y === col);
                    const value = cell?.value || 0;
                    const absValue = Math.abs(value);
                    const bgColor = value > 0 
                      ? `rgba(59, 130, 246, ${absValue})` // Blue for positive
                      : `rgba(239, 68, 68, ${absValue})`; // Red for negative
                    
                    return (
                      <div 
                        key={`${row}-${col}`}
                        className="aspect-square flex items-center justify-center text-xs font-mono rounded"
                        style={{ backgroundColor: bgColor }}
                        title={`${row} vs ${col}: ${value}`}
                      >
                        {value.toFixed(1)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }} />
                {lang === 'he' ? 'קורלציה שלילית' : 'Negative'}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }} />
                {lang === 'he' ? 'קורלציה חיובית' : 'Positive'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Main Layout: Columns List + Inspector */}
        <div className="grid grid-cols-3 gap-6">
          {/* Column List */}
          <div className="glass-card rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold mb-4">{t('lab.columns', lang)} ({columns.length})</h3>
            <div className="space-y-2">
              {columns.map((col) => {
                const Icon = typeIcons[col.type];
                const colorClass = typeColors[col.type];
                
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColumn(col.name)}
                    className={cn("column-card w-full", selectedColumn === col.name && "selected")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0", colorClass)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <p className="font-medium truncate">{col.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{col.unique} {lang === 'he' ? 'ייחודיים' : 'unique'}</span>
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

          {/* Inspector Panel */}
          <div className="col-span-2 glass-card rounded-xl p-6">
            {selectedColInfo ? (
              <motion.div
                key={selectedColumn}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedColInfo.name}</h3>
                    <p className="text-muted-foreground">
                      {t('lab.columnType', lang)}: <span className="font-medium">{selectedColInfo.type}</span>
                      {' • '}{selectedColInfo.unique} {t('lab.unique', lang)}
                      {selectedColInfo.missing > 0 && (
                        <span className="text-warning"> • {selectedColInfo.missing} {t('lab.missing', lang)}</span>
                      )}
                    </p>
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", typeColors[selectedColInfo.type])}>
                    {(() => { const Icon = typeIcons[selectedColInfo.type]; return <Icon className="w-6 h-6 text-white" />; })()}
                  </div>
                </div>

                {/* Stats Grid */}
                {selectedColInfo.stats && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {Object.entries(selectedColInfo.stats).map(([key, value]) => (
                      <div key={key} className="bg-secondary rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground capitalize mb-1">{key}</p>
                        <p className="text-lg font-semibold font-mono">
                          {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Distribution Chart */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    📊 {lang === 'he' ? 'התפלגות' : 'Distribution'}
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributionData}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distributionData.map((_, index) => (
                          <Cell key={index} fill={`hsl(${199 + index * 5} 89% ${48 + index}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-3">{t('lab.actions', lang)}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDropColumn}
                      disabled={loading !== null}
                    >
                      {loading === 'drop_column' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      {t('lab.dropColumn', lang)}
                    </Button>
                    
                    {selectedColInfo.missing > 0 && (
                      <>
                        {selectedColInfo.type === 'numeric' ? (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleFillMissing('mean')}
                              disabled={loading !== null}
                            >
                              {loading === 'fill_missing' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                              {lang === 'he' ? 'מלא ממוצע' : 'Fill Mean'}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleFillMissing('median')}
                              disabled={loading !== null}
                            >
                              {lang === 'he' ? 'מלא חציון' : 'Fill Median'}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleFillMissing('mode')}
                            disabled={loading !== null}
                          >
                            {loading === 'fill_missing' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            {lang === 'he' ? 'מלא שכיח' : 'Fill Mode'}
                          </Button>
                        )}
                      </>
                    )}
                    
                    {selectedColInfo.type === 'numeric' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveOutliers}
                        disabled={loading !== null}
                      >
                        {loading === 'remove_outliers' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Scissors className="w-4 h-4 mr-1" />}
                        {lang === 'he' ? 'הסר חריגים (IQR)' : 'Remove Outliers'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                <Hash className="w-16 h-16 mb-4 opacity-20" />
                <p>{lang === 'he' ? 'בחר עמודה מהרשימה' : 'Select a column from the list'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Engineering */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 mt-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {lang === 'he' ? 'הנדסת פיצ\'רים' : 'Feature Engineering'}
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">
                {lang === 'he' ? 'שם עמודה חדשה' : 'New Column Name'}
              </label>
              <Input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder={lang === 'he' ? 'price_per_sqft' : 'price_per_sqft'}
              />
            </div>
            <div className="flex-[2]">
              <label className="text-sm text-muted-foreground block mb-2">
                {lang === 'he' ? 'נוסחה (למשל: Price / Area)' : 'Formula (e.g., Price / Area)'}
              </label>
              <div className="flex gap-2">
                <Input
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="column1 / column2"
                  dir="ltr"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateFeature}
              disabled={!newColName.trim() || !formula.trim() || loading !== null}
            >
              {loading === 'feature' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {lang === 'he' ? 'צור' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {columns.map(col => (
              <Button
                key={col.name}
                variant="outline"
                size="sm"
                onClick={() => setFormula(prev => prev ? `${prev} ${col.name}` : col.name)}
                className="text-xs"
              >
                {col.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Next Button */}
        <div className="flex justify-center mt-12">
          <Button 
            size="lg" 
            onClick={() => setCurrentScreen('model')}
            className="px-12"
          >
            {t('general.next', lang)} → {t('nav.model', lang)}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
