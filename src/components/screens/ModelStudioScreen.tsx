import { motion } from 'framer-motion';
import { Trees, Zap, TrendingUp, GitBranch, Users, Target, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMLStore, ModelType } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';

const models: { id: ModelType; icon: typeof Trees; nameKey: string; descKey: string; color: string }[] = [
  { id: 'rf', icon: Trees, nameKey: 'model.rf', descKey: 'model.rfDesc', color: 'from-green-500 to-emerald-600' },
  { id: 'xgb', icon: Zap, nameKey: 'model.xgb', descKey: 'model.xgbDesc', color: 'from-orange-500 to-red-500' },
  { id: 'linear', icon: TrendingUp, nameKey: 'model.linear', descKey: 'model.linearDesc', color: 'from-blue-500 to-cyan-500' },
  { id: 'tree', icon: GitBranch, nameKey: 'model.tree', descKey: 'model.treeDesc', color: 'from-purple-500 to-pink-500' },
  { id: 'knn', icon: Users, nameKey: 'model.knn', descKey: 'model.knnDesc', color: 'from-yellow-500 to-amber-500' },
  { id: 'svm', icon: Target, nameKey: 'model.svm', descKey: 'model.svmDesc', color: 'from-indigo-500 to-violet-500' },
];

const defaultParams: Record<ModelType, Record<string, any>> = {
  rf: { n_estimators: 100, max_depth: 10, min_samples_split: 2 },
  xgb: { n_estimators: 100, max_depth: 6, learning_rate: 0.1 },
  linear: { C: 1.0, max_iter: 100 },
  tree: { max_depth: 5, min_samples_split: 2, criterion: 'gini' },
  knn: { n_neighbors: 5, weights: 'uniform', metric: 'euclidean' },
  svm: { C: 1.0, kernel: 'rbf', gamma: 'scale' },
};

export function ModelStudioScreen() {
  const { 
    lang, data, columns, 
    targetColumn, setTargetColumn,
    taskType, setTaskType,
    selectedModel, setSelectedModel,
    droppedFeatures, setDroppedFeatures,
    modelParams, setModelParams,
    isTraining, setIsTraining,
    setResults, setCurrentScreen
  } = useMLStore();
  
  const isRTL = lang === 'he';

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('general.noData', lang)}</p>
      </div>
    );
  }

  const handleModelSelect = (model: ModelType) => {
    setSelectedModel(model);
    setModelParams(defaultParams[model]);
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
    
    // Simulate training (in real app, this would call a backend)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results
    const mockResults = taskType === 'classification' 
      ? {
          accuracy: 0.85 + Math.random() * 0.1,
          precision: 0.82 + Math.random() * 0.1,
          recall: 0.78 + Math.random() * 0.15,
          f1: 0.80 + Math.random() * 0.1,
          featureImportance: columns
            .filter(c => c.name !== targetColumn && !droppedFeatures.includes(c.name))
            .map(c => ({ name: c.name, importance: Math.random() }))
            .sort((a, b) => b.importance - a.importance)
        }
      : {
          rmse: 0.15 + Math.random() * 0.2,
          r2: 0.75 + Math.random() * 0.2,
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

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Setup */}
          <div className="space-y-6">
            {/* Target Variable */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('model.target', lang)}</h3>
              <Select value={targetColumn || ''} onValueChange={setTargetColumn}>
                <SelectTrigger>
                  <SelectValue placeholder={t('model.selectTarget', lang)} />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('model.taskType', lang)}</h3>
              <RadioGroup value={taskType} onValueChange={(v) => setTaskType(v as 'classification' | 'regression')} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="classification" id="classification" />
                  <Label htmlFor="classification">{t('model.classification', lang)}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="regression" id="regression" />
                  <Label htmlFor="regression">{t('model.regression', lang)}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Drop Features */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('model.dropFeatures', lang)}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {lang === 'he' 
                  ? 'בחר עמודות להסרה מהאימון (כמו ID או עמודות שמגלות את התשובה)' 
                  : 'Select columns to exclude from training (like ID or leaky columns)'}
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {columns.filter(c => c.name !== targetColumn).map(col => (
                  <div key={col.name} className="flex items-center gap-2">
                    <Checkbox 
                      id={col.name}
                      checked={droppedFeatures.includes(col.name)}
                      onCheckedChange={(checked) => handleFeatureToggle(col.name, checked as boolean)}
                    />
                    <Label htmlFor={col.name} className="text-sm truncate">{col.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Model Selection */}
          <div className="space-y-6">
            {/* Model Cards */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('model.selectModel', lang)}</h3>
              <div className="grid grid-cols-2 gap-4">
                {models.map((model) => (
                  <motion.button
                    key={model.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModelSelect(model.id)}
                    className={cn(
                      "model-card text-right p-4",
                      selectedModel === model.id && "selected"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br mb-3", model.color)}>
                      <model.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold">{t(model.nameKey as any, lang)}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t(model.descKey as any, lang)}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-card rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4">{t('model.parameters', lang)}</h3>
                <div className="space-y-4">
                  {selectedModel === 'rf' && (
                    <>
                      <div>
                        <Label className="text-sm">n_estimators: {modelParams.n_estimators}</Label>
                        <Slider 
                          value={[modelParams.n_estimators]} 
                          onValueChange={([v]) => handleParamChange('n_estimators', v)}
                          min={10} max={500} step={10}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">max_depth</Label>
                        <Input 
                          type="number" 
                          value={modelParams.max_depth} 
                          onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedModel === 'xgb' && (
                    <>
                      <div>
                        <Label className="text-sm">n_estimators: {modelParams.n_estimators}</Label>
                        <Slider 
                          value={[modelParams.n_estimators]} 
                          onValueChange={([v]) => handleParamChange('n_estimators', v)}
                          min={10} max={500} step={10}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">learning_rate: {modelParams.learning_rate}</Label>
                        <Slider 
                          value={[modelParams.learning_rate * 100]} 
                          onValueChange={([v]) => handleParamChange('learning_rate', v / 100)}
                          min={1} max={50} step={1}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  {selectedModel === 'tree' && (
                    <>
                      <div>
                        <Label className="text-sm">max_depth</Label>
                        <Input 
                          type="number" 
                          value={modelParams.max_depth} 
                          onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">criterion</Label>
                        <Select value={modelParams.criterion} onValueChange={(v) => handleParamChange('criterion', v)}>
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
                      <Label className="text-sm">n_neighbors: {modelParams.n_neighbors}</Label>
                      <Slider 
                        value={[modelParams.n_neighbors]} 
                        onValueChange={([v]) => handleParamChange('n_neighbors', v)}
                        min={1} max={20} step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {selectedModel === 'svm' && (
                    <>
                      <div>
                        <Label className="text-sm">kernel</Label>
                        <Select value={modelParams.kernel} onValueChange={(v) => handleParamChange('kernel', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="rbf">RBF</SelectItem>
                            <SelectItem value="poly">Polynomial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">C</Label>
                        <Input 
                          type="number" 
                          value={modelParams.C} 
                          onChange={(e) => handleParamChange('C', Number(e.target.value))}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  {selectedModel === 'linear' && (
                    <div>
                      <Label className="text-sm">max_iter</Label>
                      <Input 
                        type="number" 
                        value={modelParams.max_iter} 
                        onChange={(e) => handleParamChange('max_iter', Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Train Button */}
        <div className="flex justify-center mt-12">
          <Button 
            size="lg" 
            onClick={handleTrain}
            disabled={!canTrain || isTraining}
            className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                {t('model.training', lang)}
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
