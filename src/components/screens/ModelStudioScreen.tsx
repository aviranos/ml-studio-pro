import { motion } from 'framer-motion';
import { Trees, Zap, TrendingUp, GitBranch, Users, Target, Play, Loader2, Settings2, Info, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMLStore, ModelType } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';

const classificationModels: { id: ModelType; icon: typeof Trees; name: string; desc: string; color: string }[] = [
  { id: 'rf', icon: Trees, name: 'Random Forest', desc: 'Ensemble of decision trees', color: 'from-green-500 to-emerald-600' },
  { id: 'tree', icon: GitBranch, name: 'Decision Tree', desc: 'Single tree, interpretable', color: 'from-purple-500 to-pink-500' },
  { id: 'gb', icon: Gauge, name: 'Gradient Boosting', desc: 'Sequential boosting', color: 'from-amber-500 to-orange-500' },
  { id: 'xgb', icon: Zap, name: 'XGBoost', desc: 'Advanced gradient boosting', color: 'from-red-500 to-rose-500' },
  { id: 'linear', icon: TrendingUp, name: 'Logistic Regression', desc: 'Linear classifier', color: 'from-blue-500 to-cyan-500' },
  { id: 'svm', icon: Target, name: 'SVM', desc: 'Support Vector Machine', color: 'from-indigo-500 to-violet-500' },
  { id: 'knn', icon: Users, name: 'KNN', desc: 'K-Nearest Neighbors', color: 'from-teal-500 to-cyan-500' },
];

const regressionModels: { id: ModelType; icon: typeof Trees; name: string; desc: string; color: string }[] = [
  { id: 'rf', icon: Trees, name: 'Random Forest', desc: 'Ensemble regressor', color: 'from-green-500 to-emerald-600' },
  { id: 'tree', icon: GitBranch, name: 'Decision Tree', desc: 'Single tree regressor', color: 'from-purple-500 to-pink-500' },
  { id: 'gb', icon: Gauge, name: 'Gradient Boosting', desc: 'Sequential boosting', color: 'from-amber-500 to-orange-500' },
  { id: 'xgb', icon: Zap, name: 'XGBoost', desc: 'Advanced gradient boosting', color: 'from-red-500 to-rose-500' },
  { id: 'ridge', icon: TrendingUp, name: 'Ridge', desc: 'L2 regularized linear', color: 'from-blue-500 to-cyan-500' },
  { id: 'lasso', icon: TrendingUp, name: 'Lasso', desc: 'L1 regularized linear', color: 'from-sky-500 to-blue-500' },
  { id: 'linear', icon: TrendingUp, name: 'Linear Regression', desc: 'Simple linear model', color: 'from-slate-500 to-gray-500' },
];

const defaultParams: Record<ModelType, Record<string, any>> = {
  rf: { n_estimators: 100, max_depth: 10, min_samples_split: 2, min_samples_leaf: 1, max_features: 'sqrt', criterion: 'gini', bootstrap: true },
  xgb: { n_estimators: 100, max_depth: 6, learning_rate: 0.1, subsample: 0.8 },
  linear: { C: 1.0, max_iter: 1000 },
  tree: { max_depth: 5, min_samples_split: 2, min_samples_leaf: 1, criterion: 'gini', splitter: 'best' },
  knn: { n_neighbors: 5, weights: 'uniform' },
  svm: { C: 1.0, kernel: 'rbf', gamma: 'scale' },
  gb: { n_estimators: 100, learning_rate: 0.1, max_depth: 3, min_samples_split: 2, subsample: 1.0 },
  ridge: { alpha: 1.0 },
  lasso: { alpha: 1.0 },
};

// Parameter help texts
const paramHelp: Record<string, { he: string; en: string }> = {
  n_estimators: { he: 'מספר העצים ביער. יותר עצים = דיוק טוב יותר אבל אימון איטי יותר', en: 'Number of trees in the forest. More trees = better accuracy but slower training' },
  max_depth: { he: 'עומק מקסימלי של כל עץ. ערכים נמוכים מונעים Overfitting', en: 'Maximum depth of each tree. Lower values prevent overfitting' },
  min_samples_split: { he: 'מינימום דגימות לפיצול צומת', en: 'Minimum samples required to split a node' },
  min_samples_leaf: { he: 'מינימום דגימות בעלה', en: 'Minimum samples in a leaf node' },
  learning_rate: { he: 'גודל צעד לירידת גרדיאנט. נמוך = מדויק יותר אבל איטי', en: 'Step size for gradient descent. Lower = more accurate but slower' },
  subsample: { he: 'חלק מהדגימות לכל עץ', en: 'Fraction of samples used for each tree' },
  C: { he: 'עוצמת רגולריזציה. ערכים קטנים = רגולריזציה חזקה יותר', en: 'Regularization strength. Smaller = stronger regularization' },
  kernel: { he: 'סוג Kernel. "rbf" טוב לבעיות לא-לינאריות', en: 'Kernel type. "rbf" is good for non-linear problems' },
  n_neighbors: { he: 'מספר שכנים. מספרים אי-זוגיים מונעים תיקו', en: 'Number of neighbors. Odd numbers avoid ties' },
  alpha: { he: 'עוצמת רגולריזציה. גבוה = מודל פשוט יותר', en: 'Regularization strength. Higher = simpler model' },
};

function ParamTooltip({ paramKey, lang }: { paramKey: string; lang: 'he' | 'en' }) {
  const help = paramHelp[paramKey];
  if (!help) return null;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{help[lang]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ModelStudioScreen() {
  const { 
    lang, data, columns, 
    targetColumn, setTargetColumn,
    taskType, setTaskType,
    selectedModel, setSelectedModel,
    droppedFeatures, setDroppedFeatures,
    modelParams, setModelParams,
    trainSize, setTrainSize,
    randomState, setRandomState,
    useCV, setUseCV,
    autoScale, setAutoScale,
    autoEncode, setAutoEncode,
    isTraining, setIsTraining,
    setResults, setCurrentScreen
  } = useMLStore();
  
  const isRTL = lang === 'he';
  const models = taskType === 'classification' ? classificationModels : regressionModels;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('general.noData', lang)}</p>
      </div>
    );
  }

  const handleModelSelect = (model: ModelType) => {
    setSelectedModel(model);
    setModelParams(defaultParams[model] || {});
  };

  const handleParamChange = (key: string, value: any) => {
    setModelParams({ ...modelParams, [key]: value });
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      setDroppedFeatures([...droppedFeatures, feature]);
    } else {
      setDroppedFeatures(droppedFeatures.filter(f => f !== feature));
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    
    // Simulate training
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate mock results based on model and params
    const baseScore = 0.7 + Math.random() * 0.2;
    const trainScore = baseScore + 0.05 + Math.random() * 0.1;
    
    const mockResults = taskType === 'classification' 
      ? {
          accuracy: baseScore + Math.random() * 0.05,
          precision: baseScore - 0.02 + Math.random() * 0.1,
          recall: baseScore - 0.05 + Math.random() * 0.15,
          f1: baseScore + Math.random() * 0.05,
          trainScore,
          auc: baseScore + 0.05 + Math.random() * 0.1,
          cvMean: useCV ? baseScore - 0.02 : undefined,
          cvStd: useCV ? 0.02 + Math.random() * 0.03 : undefined,
          confusionMatrix: [
            [Math.floor(80 + Math.random() * 20), Math.floor(10 + Math.random() * 10)],
            [Math.floor(8 + Math.random() * 10), Math.floor(85 + Math.random() * 15)]
          ],
          featureImportance: columns
            .filter(c => c.name !== targetColumn && !droppedFeatures.includes(c.name))
            .map(c => ({ name: c.name, importance: Math.random() }))
            .sort((a, b) => b.importance - a.importance)
        }
      : {
          r2: baseScore,
          mae: 0.1 + Math.random() * 0.3,
          rmse: 0.15 + Math.random() * 0.25,
          trainScore,
          cvMean: useCV ? baseScore - 0.03 : undefined,
          cvStd: useCV ? 0.03 + Math.random() * 0.02 : undefined,
          predictions: Array.from({ length: 20 }, () => {
            const actual = Math.random() * 100;
            return { actual, predicted: actual + (Math.random() - 0.5) * 20 };
          }),
          featureImportance: columns
            .filter(c => c.name !== targetColumn && !droppedFeatures.includes(c.name))
            .map(c => ({ name: c.name, importance: Math.random() }))
            .sort((a, b) => b.importance - a.importance)
        };
    
    setResults(mockResults);
    setIsTraining(false);
    setCurrentScreen('evaluation');
  };

  const canTrain = targetColumn && selectedModel;

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t('model.title', lang)}</h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'he' ? 'הגדר ואמן את המודל שלך' : 'Configure and train your model'}
        </p>

        {/* Setup Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Problem Type */}
          <div className="glass-card rounded-xl p-4">
            <Label className="text-sm text-muted-foreground mb-2 block">{t('model.taskType', lang)}</Label>
            <RadioGroup 
              value={taskType} 
              onValueChange={(v) => {
                setTaskType(v as 'classification' | 'regression');
                setSelectedModel(null);
              }} 
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="classification" id="classification" />
                <Label htmlFor="classification" className="cursor-pointer">{t('model.classification', lang)}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="regression" id="regression" />
                <Label htmlFor="regression" className="cursor-pointer">{t('model.regression', lang)}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Target Variable */}
          <div className="glass-card rounded-xl p-4">
            <Label className="text-sm text-muted-foreground mb-2 block">🎯 {t('model.target', lang)}</Label>
            <Select value={targetColumn || ''} onValueChange={setTargetColumn}>
              <SelectTrigger>
                <SelectValue placeholder={t('model.selectTarget', lang)} />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} <span className="text-muted-foreground text-xs">({col.type})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Train/Test Split */}
          <div className="glass-card rounded-xl p-4">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {lang === 'he' ? 'אחוז אימון' : 'Train Split'}: {Math.round(trainSize * 100)}%
            </Label>
            <Slider
              value={[trainSize * 100]}
              onValueChange={([v]) => setTrainSize(v / 100)}
              min={50}
              max={95}
              step={5}
              className="mt-4"
            />
          </div>

          {/* Options */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{lang === 'he' ? 'סקייל אוטומטי' : 'Auto Scale'}</Label>
              <Switch checked={autoScale} onCheckedChange={setAutoScale} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">{lang === 'he' ? 'קידוד אוטומטי' : 'Auto Encode'}</Label>
              <Switch checked={autoEncode} onCheckedChange={setAutoEncode} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">CV (5-Fold)</Label>
              <Switch checked={useCV} onCheckedChange={setUseCV} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Model Selection */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">🦁 {t('model.selectModel', lang)}</h3>
            <div className="space-y-2">
              {models.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleModelSelect(model.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-all flex items-center gap-3",
                    selectedModel === model.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-secondary"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0", model.color)}>
                    <model.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.desc}</p>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              {t('model.parameters', lang)}
            </h3>
            
            {selectedModel ? (
              <div className="space-y-4">
                {(selectedModel === 'rf' || selectedModel === 'gb' || selectedModel === 'xgb') && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">n_estimators: {modelParams.n_estimators}</Label>
                        <ParamTooltip paramKey="n_estimators" lang={lang} />
                      </div>
                      <Slider 
                        value={[modelParams.n_estimators]} 
                        onValueChange={([v]) => handleParamChange('n_estimators', v)}
                        min={10} max={500} step={10}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">max_depth: {modelParams.max_depth || 'None'}</Label>
                        <ParamTooltip paramKey="max_depth" lang={lang} />
                      </div>
                      <Slider 
                        value={[modelParams.max_depth || 10]} 
                        onValueChange={([v]) => handleParamChange('max_depth', v)}
                        min={1} max={30} step={1}
                      />
                    </div>
                  </>
                )}

                {(selectedModel === 'gb' || selectedModel === 'xgb') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm">learning_rate: {modelParams.learning_rate?.toFixed(2)}</Label>
                      <ParamTooltip paramKey="learning_rate" lang={lang} />
                    </div>
                    <Slider 
                      value={[modelParams.learning_rate * 100]} 
                      onValueChange={([v]) => handleParamChange('learning_rate', v / 100)}
                      min={1} max={50} step={1}
                    />
                  </div>
                )}

                {selectedModel === 'tree' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">max_depth: {modelParams.max_depth}</Label>
                        <ParamTooltip paramKey="max_depth" lang={lang} />
                      </div>
                      <Slider 
                        value={[modelParams.max_depth]} 
                        onValueChange={([v]) => handleParamChange('max_depth', v)}
                        min={1} max={30} step={1}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">criterion</Label>
                      <Select 
                        value={modelParams.criterion} 
                        onValueChange={(v) => handleParamChange('criterion', v)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gini">Gini</SelectItem>
                          <SelectItem value="entropy">Entropy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {selectedModel === 'knn' && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm">n_neighbors: {modelParams.n_neighbors}</Label>
                      <ParamTooltip paramKey="n_neighbors" lang={lang} />
                    </div>
                    <Slider 
                      value={[modelParams.n_neighbors]} 
                      onValueChange={([v]) => handleParamChange('n_neighbors', v)}
                      min={1} max={30} step={2}
                    />
                  </div>
                )}

                {selectedModel === 'svm' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">C: {modelParams.C}</Label>
                        <ParamTooltip paramKey="C" lang={lang} />
                      </div>
                      <Slider 
                        value={[modelParams.C * 10]} 
                        onValueChange={([v]) => handleParamChange('C', v / 10)}
                        min={1} max={100} step={1}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">kernel</Label>
                        <ParamTooltip paramKey="kernel" lang={lang} />
                      </div>
                      <Select value={modelParams.kernel} onValueChange={(v) => handleParamChange('kernel', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rbf">RBF</SelectItem>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="poly">Polynomial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {(selectedModel === 'ridge' || selectedModel === 'lasso') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm">alpha: {modelParams.alpha}</Label>
                      <ParamTooltip paramKey="alpha" lang={lang} />
                    </div>
                    <Slider 
                      value={[modelParams.alpha * 10]} 
                      onValueChange={([v]) => handleParamChange('alpha', v / 10)}
                      min={1} max={100} step={1}
                    />
                  </div>
                )}

                {selectedModel === 'linear' && taskType === 'classification' && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm">C: {modelParams.C}</Label>
                      <ParamTooltip paramKey="C" lang={lang} />
                    </div>
                    <Slider 
                      value={[modelParams.C * 10]} 
                      onValueChange={([v]) => handleParamChange('C', v / 10)}
                      min={1} max={100} step={1}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm">{lang === 'he' ? 'זרע אקראי' : 'Random State'}</Label>
                  <Input 
                    type="number" 
                    value={randomState} 
                    onChange={(e) => setRandomState(Number(e.target.value))}
                    className="mt-2"
                    min={0}
                    max={9999}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Settings2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>{lang === 'he' ? 'בחר מודל כדי לראות פרמטרים' : 'Select a model to see parameters'}</p>
              </div>
            )}
          </div>

          {/* Drop Features */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-2">{t('model.dropFeatures', lang)}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'he' 
                ? 'בחר עמודות להסרה מהאימון (כמו ID או עמודות שמגלות את התשובה)' 
                : 'Select columns to exclude from training (like ID or leaky columns)'}
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {columns.filter(c => c.name !== targetColumn).map(col => (
                <div 
                  key={col.name} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    droppedFeatures.includes(col.name) ? "bg-destructive/10" : "hover:bg-secondary"
                  )}
                >
                  <Checkbox 
                    id={col.name}
                    checked={droppedFeatures.includes(col.name)}
                    onCheckedChange={(checked) => handleFeatureToggle(col.name, checked as boolean)}
                  />
                  <Label htmlFor={col.name} className="flex-1 cursor-pointer">
                    <span className="font-medium">{col.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">({col.type})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Train Button */}
        <div className="flex justify-center mt-12">
          <Button 
            size="lg" 
            onClick={handleTrain}
            disabled={!canTrain || isTraining}
            className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30 glow-primary"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                {lang === 'he' ? 'מאמן...' : 'Training...'}
              </>
            ) : (
              <>
                <Play className="w-5 h-5 ml-2" />
                {t('model.train', lang)}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
