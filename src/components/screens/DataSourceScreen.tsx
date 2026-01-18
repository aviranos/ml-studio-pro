import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMLStore, ColumnInfo } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import Papa from 'papaparse';

// Sample datasets
const sampleDatasets = [
  { name: 'Titanic (Classification)', url: 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv', icon: '🚢' },
  { name: 'Iris (Classification)', url: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv', icon: '🌸' },
  { name: 'Tips (Regression)', url: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv', icon: '💵' },
  { name: 'Penguins (Classification)', url: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv', icon: '🐧' },
];

function analyzeColumns(data: Record<string, any>[]): ColumnInfo[] {
  if (!data.length) return [];
  
  const columns: ColumnInfo[] = [];
  const firstRow = data[0];
  
  for (const key of Object.keys(firstRow)) {
    const values = data.map(row => row[key]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missing = values.length - nonNullValues.length;
    const uniqueValues = new Set(nonNullValues);
    
    let type: ColumnInfo['type'] = 'categorical';
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v)));
    
    if (numericValues.length > nonNullValues.length * 0.8) {
      type = 'numeric';
      const nums = numericValues.map(Number);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const std = Math.sqrt(nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / nums.length);
      
      columns.push({
        name: key,
        type,
        missing,
        unique: uniqueValues.size,
        stats: {
          mean: Number(mean.toFixed(2)),
          median: Number(median.toFixed(2)),
          std: Number(std.toFixed(2)),
          min: Math.min(...nums),
          max: Math.max(...nums),
        }
      });
    } else if (uniqueValues.size === 2 && (uniqueValues.has(true) || uniqueValues.has('true') || uniqueValues.has(1))) {
      type = 'boolean';
      columns.push({ name: key, type, missing, unique: uniqueValues.size });
    } else {
      const freq: Record<string, number> = {};
      nonNullValues.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
      const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      
      columns.push({
        name: key,
        type,
        missing,
        unique: uniqueValues.size,
        stats: { mode }
      });
    }
  }
  
  return columns;
}

export function DataSourceScreen() {
  const { lang, data, setData, setOriginalData, setColumns, setCurrentScreen, setDataHistory } = useMLStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataName, setDataName] = useState<string>('');
  const isRTL = lang === 'he';

  const processData = useCallback((results: Papa.ParseResult<Record<string, any>>, name: string) => {
    if (results.errors.length) {
      setError(results.errors[0].message);
      return;
    }
    
    const parsedData = results.data.filter(row => Object.values(row).some(v => v !== null && v !== ''));
    setData(parsedData);
    setOriginalData([...parsedData]);
    setColumns(analyzeColumns(parsedData));
    setDataHistory([]);
    setDataName(name);
    setError(null);
  }, [setData, setOriginalData, setColumns, setDataHistory]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results, file.name);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, [processData]);

  const handleUrlLoad = useCallback(async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError(null);
    
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results, 'URL Data');
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, [url, processData]);

  const handleSampleLoad = useCallback((sampleUrl: string, name: string) => {
    setUrl(sampleUrl);
    setLoading(true);
    setError(null);
    
    Papa.parse(sampleUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results, name);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, [processData]);

  const handleChangeData = () => {
    setData(null);
    setOriginalData(null);
    setColumns([]);
    setDataHistory([]);
    setDataName('');
  };

  // Compact view when data is loaded
  if (data) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card rounded-xl p-6 border-success/30 bg-success/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <h3 className="font-semibold text-success">{t('data.loaded', lang)}</h3>
                  <p className="text-muted-foreground">{dataName}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{data.length.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t('data.rows', lang)}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Object.keys(data[0] || {}).length}</p>
                  <p className="text-xs text-muted-foreground">{t('data.columns', lang)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleChangeData}>
                  🔄 {lang === 'he' ? 'החלף נתונים' : 'Change Data'}
                </Button>
              </div>
            </div>
            
            {/* Preview Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(data[0] || {}).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="font-mono text-sm">
                          {val === null || val === undefined ? <span className="text-muted-foreground">—</span> : String(val).substring(0, 30)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button 
              onClick={() => setCurrentScreen('lab')} 
              className="mt-6 w-full"
              size="lg"
            >
              {t('general.next', lang)} → {t('nav.lab', lang)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t('data.title', lang)}</h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'he' ? 'בחר מקור נתונים להתחלת הפרויקט' : 'Choose a data source to start your project'}
        </p>

        <Tabs defaultValue="sample" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sample" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {t('data.sample', lang)}
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('data.upload', lang)}
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="w-4 h-4" />
              {t('data.url', lang)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sample">
            <div className="grid grid-cols-2 gap-4">
              {sampleDatasets.map((dataset) => (
                <motion.button
                  key={dataset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSampleLoad(dataset.url, dataset.name)}
                  className="glass-card rounded-xl p-6 text-right hover:border-primary/50 transition-all flex items-center gap-4 group"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={loading}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl">
                    {dataset.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{dataset.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{dataset.url.split('/').pop()}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <label className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
              <p className="text-lg font-medium mb-2">{t('data.dropzone', lang)}</p>
              <p className="text-sm text-muted-foreground">{t('data.formats', lang)}</p>
            </label>
          </TabsContent>

          <TabsContent value="url">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex gap-4">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('data.urlPlaceholder', lang)}
                  className="flex-1"
                  dir="ltr"
                />
                <Button onClick={handleUrlLoad} disabled={loading || !url.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('data.load', lang)}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {lang === 'he' 
                  ? 'הדבק לינק ישיר (Raw) לקובץ CSV מ-GitHub, Kaggle או כל מקור אחר' 
                  : 'Paste a direct (Raw) link to a CSV file from GitHub, Kaggle or any other source'}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 glass-card rounded-xl p-6 flex items-center gap-4"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>{t('general.loading', lang)}</span>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-destructive/10 border border-destructive/30 rounded-xl p-6 flex items-center gap-4"
          >
            <AlertCircle className="w-6 h-6 text-destructive" />
            <span className="text-destructive">{error}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
