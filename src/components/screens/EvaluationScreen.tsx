import { motion } from 'framer-motion';
import { Target, Percent, Activity, Sparkles, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMLStore } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function EvaluationScreen() {
  const { lang, taskType, results, threshold, setThreshold, setCurrentScreen } = useMLStore();
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

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t('eval.title', lang)}</h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'he' ? 'בחן את ביצועי המודל וכוון את הסף' : 'Examine model performance and tune the threshold'}
        </p>

        {/* Metrics Cards */}
        <div className={cn("grid gap-4 mb-8", isClassification ? "grid-cols-4" : "grid-cols-2")}>
          {isClassification ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">{t('eval.accuracy', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-gradient">
                  {(results.accuracy! * 100).toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">{t('eval.precision', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-green-500">
                  {((adjustedPrecision ?? results.precision!) * 100).toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <span className="text-muted-foreground">{t('eval.recall', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-orange-500">
                  {((adjustedRecall ?? results.recall!) * 100).toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-muted-foreground">{t('eval.f1', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-purple-500">
                  {(results.f1! * 100).toFixed(1)}%
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">{t('eval.rmse', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-gradient">
                  {results.rmse!.toFixed(4)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="metric-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">{t('eval.r2', lang)}</span>
                </div>
                <p className="text-4xl font-bold text-green-500">
                  {(results.r2! * 100).toFixed(1)}%
                </p>
              </motion.div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Threshold Tuner (Classification only) */}
          {isClassification && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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
                  <span className="font-bold text-primary">{threshold.toFixed(2)}</span>
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
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Precision</p>
                    <p className="text-2xl font-bold text-green-500">
                      {((adjustedPrecision ?? results.precision!) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Recall</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {((adjustedRecall ?? results.recall!) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature Importance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={cn("glass-card rounded-xl p-6", !isClassification && "col-span-2")}
          >
            <h3 className="font-semibold mb-4">{t('eval.importance', lang)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={results.featureImportance?.slice(0, 8)} 
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
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
                  {results.featureImportance?.slice(0, 8).map((_, index) => (
                    <Cell 
                      key={index} 
                      fill={`hsl(${199 - index * 10} 89% ${48 + index * 3}%)`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Optimize Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center mt-12"
        >
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
          >
            <Sparkles className="w-5 h-5 ml-2" />
            {t('eval.optimize', lang)}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
