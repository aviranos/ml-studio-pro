import { motion } from 'framer-motion';
import { Target, Percent, Activity, Sparkles, BarChart3, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMLStore } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ScatterChart, Scatter, ReferenceLine
} from 'recharts';

export function EvaluationScreen() {
  const { lang, taskType, results, threshold, setThreshold, setCurrentScreen, selectedModel, useCV } = useMLStore();
  const isRTL = lang === 'he';

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <BarChart3 className="w-24 h-24 mb-4 opacity-20" />
        <p className="text-xl">{t('eval.noResults', lang)}</p>
        <Button variant="outline" className="mt-4" onClick={() => setCurrentScreen('model')}>
          ← {t('nav.model', lang)}
        </Button>
      </div>
    );
  }

  const isClassification = taskType === 'classification';

  // Calculate adjusted metrics based on threshold (simplified simulation)
  const adjustedPrecision = results.precision 
    ? Math.min(0.99, results.precision * (1 + (threshold - 0.5) * 0.3))
    : undefined;
  const adjustedRecall = results.recall 
    ? Math.max(0.4, results.recall * (1 - (threshold - 0.5) * 0.5))
    : undefined;

  // Detect overfitting/underfitting
  const getModelInsight = () => {
    if (!results.trainScore) return null;
    
    const testScore = isClassification ? results.f1 : results.r2;
    if (!testScore) return null;
    
    const diff = results.trainScore - testScore;
    
    if (diff > 0.15) {
      return {
        type: 'warning',
        message: lang === 'he' 
          ? '⚠️ זוהה Overfitting! ציון האימון גבוה משמעותית מציון הבדיקה.' 
          : '⚠️ Overfitting detected! Train score much higher than test score.',
        suggestion: lang === 'he'
          ? 'נסה להקטין את עומק העץ או להגדיל את min_samples_split'
          : 'Try reducing max_depth or increasing min_samples_split'
      };
    }
    
    if (testScore < 0.6 && results.trainScore < 0.7) {
      return {
        type: 'warning',
        message: lang === 'he'
          ? '⚠️ זוהה Underfitting! שני הציונים נמוכים.'
          : '⚠️ Underfitting detected! Both scores are low.',
        suggestion: lang === 'he'
          ? 'נסה להגדיל את מספר העצים או עומק העץ'
          : 'Try increasing n_estimators or max_depth'
      };
    }
    
    return {
      type: 'success',
      message: lang === 'he' ? '✅ המודל נראה בריא!' : '✅ Model looks healthy!',
      suggestion: null
    };
  };

  const insight = getModelInsight();

  // Confusion matrix visualization data
  const confusionData = results.confusionMatrix || [[85, 15], [12, 88]];

  // Metric card helper
  const MetricCard = ({ label, value, color, icon: Icon, subtext }: { 
    label: string; 
    value: number | string; 
    color: string; 
    icon: typeof Target;
    subtext?: string;
  }) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    const bgClass = numValue >= 0.8 ? 'border-success/30 bg-success/5' : 
                    numValue >= 0.6 ? 'border-warning/30 bg-warning/5' : 
                    'border-destructive/30 bg-destructive/5';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("metric-card", bgClass)}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-5 h-5", color)} />
          <span className="text-muted-foreground text-sm">{label}</span>
        </div>
        <p className={cn("text-4xl font-bold", color)}>
          {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : value}
        </p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </motion.div>
    );
  };

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t('eval.title', lang)}</h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'he' ? 'בחן את ביצועי המודל וכוון את הסף' : 'Examine model performance and tune the threshold'}
        </p>

        {/* Model Insight */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "rounded-xl p-4 mb-6 flex items-start gap-3",
              insight.type === 'warning' ? "bg-warning/10 border border-warning/30" : "bg-success/10 border border-success/30"
            )}
          >
            {insight.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            )}
            <div>
              <p className={insight.type === 'warning' ? "text-warning" : "text-success"}>
                {insight.message}
              </p>
              {insight.suggestion && (
                <p className="text-sm text-muted-foreground mt-1">💡 {insight.suggestion}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* CV Score */}
        {useCV && results.cvMean && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-info/10 border border-info/30 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <TrendingUp className="w-5 h-5 text-info" />
            <span>
              📊 CV Score: <strong>{(results.cvMean * 100).toFixed(1)}%</strong> ± {((results.cvStd || 0) * 100).toFixed(1)}%
            </span>
          </motion.div>
        )}

        {/* Metrics Cards */}
        <div className={cn("grid gap-4 mb-8", isClassification ? "grid-cols-4" : "grid-cols-3")}>
          {isClassification ? (
            <>
              <MetricCard 
                label={t('eval.accuracy', lang)} 
                value={results.accuracy!} 
                color="text-primary"
                icon={Target}
              />
              <MetricCard 
                label={t('eval.precision', lang)} 
                value={adjustedPrecision ?? results.precision!} 
                color="text-green-500"
                icon={Percent}
              />
              <MetricCard 
                label={t('eval.recall', lang)} 
                value={adjustedRecall ?? results.recall!} 
                color="text-orange-500"
                icon={Activity}
              />
              <MetricCard 
                label={t('eval.f1', lang)} 
                value={results.f1!} 
                color="text-purple-500"
                icon={Sparkles}
              />
            </>
          ) : (
            <>
              <MetricCard 
                label={t('eval.r2', lang)} 
                value={results.r2!} 
                color="text-primary"
                icon={Target}
              />
              <MetricCard 
                label={t('eval.mae', lang)} 
                value={results.mae!.toFixed(4)} 
                color="text-orange-500"
                icon={Activity}
              />
              <MetricCard 
                label={t('eval.rmse', lang)} 
                value={results.rmse!.toFixed(4)} 
                color="text-purple-500"
                icon={Sparkles}
              />
            </>
          )}
        </div>

        {/* ROC AUC for binary classification */}
        {isClassification && results.auc && (
          <div className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-muted-foreground">{t('eval.accuracy', lang)} (ROC AUC)</span>
            <span className="text-2xl font-bold text-primary">{(results.auc * 100).toFixed(1)}%</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Threshold Tuner (Classification only) */}
          {isClassification && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="font-semibold mb-4">{t('eval.threshold', lang)}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {lang === 'he' 
                  ? 'התאם את סף ההחלטה לאיזון בין Precision ל-Recall' 
                  : 'Adjust the decision threshold to balance Precision and Recall'}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>0.0</span>
                  <span className="font-bold text-primary text-lg">{threshold.toFixed(2)}</span>
                  <span>1.0</span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  className="w-full"
                />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Precision</p>
                    <p className="text-2xl font-bold text-green-500">
                      {((adjustedPrecision ?? results.precision!) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Recall</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {((adjustedRecall ?? results.recall!) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confusion Matrix (Classification) or Actual vs Predicted (Regression) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            {isClassification ? (
              <>
                <h3 className="font-semibold mb-4">
                  {lang === 'he' ? 'מטריצת בלבול' : 'Confusion Matrix'}
                </h3>
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  <div className="bg-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-500">{confusionData[0][0]}</p>
                    <p className="text-xs text-muted-foreground">TN</p>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-500">{confusionData[0][1]}</p>
                    <p className="text-xs text-muted-foreground">FP</p>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-500">{confusionData[1][0]}</p>
                    <p className="text-xs text-muted-foreground">FN</p>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-500">{confusionData[1][1]}</p>
                    <p className="text-xs text-muted-foreground">TP</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span>Predicted →</span>
                  <span>Actual ↓</span>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold mb-4">
                  {lang === 'he' ? 'בפועל מול חזוי' : 'Actual vs Predicted'}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <XAxis 
                      dataKey="actual" 
                      name="Actual" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis 
                      dataKey="predicted" 
                      name="Predicted"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter 
                      data={results.predictions || [
                        { actual: 10, predicted: 12 },
                        { actual: 20, predicted: 18 },
                        { actual: 30, predicted: 32 },
                        { actual: 40, predicted: 38 },
                        { actual: 50, predicted: 52 },
                      ]} 
                      fill="hsl(var(--primary))"
                    />
                    <ReferenceLine 
                      segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </>
            )}
          </motion.div>
        </div>

        {/* Feature Importance */}
        {results.featureImportance && results.featureImportance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-6 mt-6"
          >
            <h3 className="font-semibold mb-4">{t('eval.importance', lang)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={results.featureImportance.slice(0, 10)} 
                layout="vertical"
                margin={{ left: 100 }}
              >
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {results.featureImportance.slice(0, 10).map((_, index) => (
                    <Cell 
                      key={index} 
                      fill={`hsl(${199 - index * 8} 89% ${48 + index * 2}%)`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Optimize Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 glow-primary"
          >
            <Sparkles className="w-5 h-5 ml-2" />
            {t('eval.optimize', lang)}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
