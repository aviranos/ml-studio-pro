import { motion } from 'framer-motion';
import { Trophy, Trash2, BarChart3, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMLStore } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const MODEL_NAMES: Record<string, string> = {
  rf: 'Random Forest',
  xgb: 'XGBoost',
  tree: 'Decision Tree',
  linear: 'Linear/Logistic',
  gb: 'Gradient Boosting',
  svm: 'SVM',
  knn: 'KNN',
  ridge: 'Ridge',
  lasso: 'Lasso',
};

const COLORS = [
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
];

export function LeaderboardScreen() {
  const { lang, leaderboard, clearLeaderboard, setCurrentScreen } = useMLStore();
  const isRTL = lang === 'he';

  if (leaderboard.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Trophy className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('leaderboard.title', lang)}</h1>
          <p className="text-muted-foreground mb-8">{t('leaderboard.empty', lang)}</p>
          <Button onClick={() => setCurrentScreen('model')} size="lg">
            ← {t('nav.model', lang)}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = leaderboard.map((entry, index) => ({
    name: `Run ${index + 1}`,
    model: MODEL_NAMES[entry.modelType] || entry.modelType,
    accuracy: entry.metrics.accuracy ? entry.metrics.accuracy * 100 : null,
    f1: entry.metrics.f1 ? entry.metrics.f1 * 100 : null,
    r2: entry.metrics.r2 ? entry.metrics.r2 * 100 : null,
  }));

  const isClassification = leaderboard[0]?.taskType === 'classification';

  // Find best model
  const bestEntry = [...leaderboard].sort((a, b) => {
    const scoreA = isClassification ? (a.metrics.f1 || 0) : (a.metrics.r2 || 0);
    const scoreB = isClassification ? (b.metrics.f1 || 0) : (b.metrics.r2 || 0);
    return scoreB - scoreA;
  })[0];

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('leaderboard.title', lang)}</h1>
              <p className="text-muted-foreground">{leaderboard.length} {lang === 'he' ? 'ניסויים' : 'experiments'}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={clearLeaderboard}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('leaderboard.clear', lang)}
          </Button>
        </div>

        {/* Best Model Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-6 mb-8 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl">
              🏆
            </div>
            <div>
              <p className="text-sm text-yellow-500 font-medium mb-1">Best Model</p>
              <h2 className="text-2xl font-bold">{MODEL_NAMES[bestEntry.modelType]}</h2>
              <p className="text-muted-foreground">
                {isClassification 
                  ? `F1: ${(bestEntry.metrics.f1! * 100).toFixed(1)}% | Accuracy: ${(bestEntry.metrics.accuracy! * 100).toFixed(1)}%`
                  : `R²: ${(bestEntry.metrics.r2! * 100).toFixed(1)}% | RMSE: ${bestEntry.metrics.rmse?.toFixed(2)}`
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('leaderboard.compare', lang)}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Legend />
                {isClassification ? (
                  <>
                    <Bar dataKey="accuracy" name="Accuracy" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="f1" name="F1 Score" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </>
                ) : (
                  <Bar dataKey="r2" name="R² Score" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">Experiment History</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Model</th>
                  <th>Task</th>
                  {isClassification ? (
                    <>
                      <th>Accuracy</th>
                      <th>F1 Score</th>
                    </>
                  ) : (
                    <>
                      <th>R² Score</th>
                      <th>RMSE</th>
                    </>
                  )}
                  <th>Parameters</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const isBest = entry.id === bestEntry.id;
                  return (
                    <tr key={entry.id} className={cn(isBest && "bg-yellow-500/5")}>
                      <td>
                        <span className={cn(
                          "w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold",
                          isBest ? "bg-yellow-500 text-white" : "bg-secondary"
                        )}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="font-medium">
                        {MODEL_NAMES[entry.modelType]}
                        {isBest && <span className="ml-2">🏆</span>}
                      </td>
                      <td>
                        <span className="status-badge info">
                          {entry.taskType}
                        </span>
                      </td>
                      {isClassification ? (
                        <>
                          <td className="font-mono">{(entry.metrics.accuracy! * 100).toFixed(1)}%</td>
                          <td className="font-mono font-bold text-primary">{(entry.metrics.f1! * 100).toFixed(1)}%</td>
                        </>
                      ) : (
                        <>
                          <td className="font-mono font-bold text-primary">{(entry.metrics.r2! * 100).toFixed(1)}%</td>
                          <td className="font-mono">{entry.metrics.rmse?.toFixed(3)}</td>
                        </>
                      )}
                      <td>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Settings2 className="w-3 h-3" />
                          {Object.entries(entry.params).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(', ')}
                        </div>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
