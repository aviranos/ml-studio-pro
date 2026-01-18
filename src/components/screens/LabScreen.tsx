import { motion } from 'framer-motion';
import { Hash, Type, Calendar, ToggleLeft, Trash2, RefreshCw, Scissors, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMLStore } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';

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

export function LabScreen() {
  const { lang, data, columns, selectedColumn, setSelectedColumn, setData, setColumns, setCurrentScreen } = useMLStore();
  const [newColName, setNewColName] = useState('');
  const [formula, setFormula] = useState('');
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
      // Create histogram bins
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
      // Count categories
      const freq: Record<string, number> = {};
      values.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
    }
  };

  const distributionData = getDistributionData();

  const handleDropColumn = () => {
    if (!selectedColumn) return;
    const newData = data.map(row => {
      const { [selectedColumn]: _, ...rest } = row;
      return rest;
    });
    setData(newData);
    setColumns(columns.filter(c => c.name !== selectedColumn));
    setSelectedColumn(null);
  };

  const handleFillMissing = (method: 'mean' | 'median' | 'mode') => {
    if (!selectedColumn || !selectedColInfo) return;
    
    let fillValue: any;
    if (method === 'mean') fillValue = selectedColInfo.stats?.mean;
    else if (method === 'median') fillValue = selectedColInfo.stats?.median;
    else fillValue = selectedColInfo.stats?.mode;
    
    if (fillValue === undefined) return;
    
    const newData = data.map(row => ({
      ...row,
      [selectedColumn]: row[selectedColumn] === null || row[selectedColumn] === undefined || row[selectedColumn] === '' 
        ? fillValue 
        : row[selectedColumn]
    }));
    
    setData(newData);
    // Update column info
    const newColumns = columns.map(c => 
      c.name === selectedColumn ? { ...c, missing: 0 } : c
    );
    setColumns(newColumns);
  };

  const handleRemoveOutliers = () => {
    if (!selectedColumn || selectedColInfo?.type !== 'numeric') return;
    
    const values = data.map(row => Number(row[selectedColumn])).filter(n => !isNaN(n));
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const newData = data.filter(row => {
      const val = Number(row[selectedColumn]);
      return !isNaN(val) && val >= lowerBound && val <= upperBound;
    });
    
    setData(newData);
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
            { label: t('data.rows', lang), value: data.length, color: 'text-primary' },
            { label: t('data.columns', lang), value: columns.length, color: 'text-primary' },
            { label: t('lab.missing', lang), value: totalMissing, color: totalMissing > 0 ? 'text-warning' : 'text-success' },
            { label: t('lab.duplicates', lang), value: duplicates, color: duplicates > 0 ? 'text-warning' : 'text-success' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="metric-card"
            >
              <p className="text-muted-foreground text-sm">{metric.label}</p>
              <p className={cn("text-3xl font-bold", metric.color)}>{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Layout: Columns List + Inspector */}
        <div className="grid grid-cols-3 gap-6">
          {/* Column List */}
          <div className="glass-card rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold mb-4">{t('lab.columns', lang)}</h3>
            <div className="space-y-2">
              {columns.map((col) => {
                const Icon = typeIcons[col.type];
                const colorClass = typeColors[col.type];
                
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColumn(col.name)}
                    className={cn("column-card w-full text-right", selectedColumn === col.name && "selected")}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", colorClass)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-medium truncate">{col.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {col.unique} {t('lab.unique', lang)}
                          {col.missing > 0 && <span className="text-warning mr-2"> • {col.missing} {t('lab.missing', lang)}</span>}
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
                      {t('lab.columnType', lang)}: {selectedColInfo.type} • {selectedColInfo.unique} {t('lab.unique', lang)}
                    </p>
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", typeColors[selectedColInfo.type])}>
                    {(() => { const Icon = typeIcons[selectedColInfo.type]; return <Icon className="w-6 h-6 text-white" />; })()}
                  </div>
                </div>

                {/* Stats */}
                {selectedColInfo.stats && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(selectedColInfo.stats).map(([key, value]) => (
                      <div key={key} className="bg-secondary rounded-lg p-3">
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        <p className="text-lg font-semibold font-mono">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Distribution Chart */}
                <div className="bg-secondary rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-medium mb-4">
                    {lang === 'he' ? 'התפלגות' : 'Distribution'}
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributionData}>
                      <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distributionData.map((_, index) => (
                          <Cell key={index} fill={`hsl(var(--primary))`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-3">{t('lab.actions', lang)}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDropColumn}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      {t('lab.dropColumn', lang)}
                    </Button>
                    
                    {selectedColInfo.missing > 0 && (
                      <>
                        {selectedColInfo.type === 'numeric' && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleFillMissing('mean')}>
                              <RefreshCw className="w-4 h-4 ml-2" />
                              {t('lab.fillMissing', lang)} ({t('lab.mean', lang)})
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleFillMissing('median')}>
                              {t('lab.fillMissing', lang)} ({t('lab.median', lang)})
                            </Button>
                          </>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => handleFillMissing('mode')}>
                          {t('lab.fillMissing', lang)} ({t('lab.mode', lang)})
                        </Button>
                      </>
                    )}
                    
                    {selectedColInfo.type === 'numeric' && (
                      <Button variant="secondary" size="sm" onClick={handleRemoveOutliers}>
                        <Scissors className="w-4 h-4 ml-2" />
                        {t('lab.removeOutliers', lang)} (IQR)
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                <p>{t('lab.selectColumn', lang)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Engineering */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 mt-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {t('lab.featureEng', lang)}
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <Input
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder={t('lab.newColumn', lang)}
            />
            <div className="col-span-2">
              <Input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder={`${t('lab.formula', lang)}: col_a / col_b`}
                dir="ltr"
                className="font-mono"
              />
            </div>
            <Button disabled={!newColName || !formula}>
              {t('lab.createColumn', lang)}
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            {columns.slice(0, 6).map(col => (
              <button
                key={col.name}
                onClick={() => setFormula(f => f + col.name)}
                className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-primary/20 transition-colors"
              >
                {col.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <Button size="lg" onClick={() => setCurrentScreen('model')}>
            {t('general.next', lang)} → {t('nav.model', lang)}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
