import { Sidebar } from '@/components/Sidebar';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { DataSourceScreen } from '@/components/screens/DataSourceScreen';
import { LabScreen } from '@/components/screens/LabScreen';
import { ModelStudioScreen } from '@/components/screens/ModelStudioScreen';
import { EvaluationScreen } from '@/components/screens/EvaluationScreen';
import { useMLStore } from '@/hooks/useMLStore';
import { cn } from '@/lib/utils';

const screens = {
  home: WelcomeScreen,
  data: DataSourceScreen,
  lab: LabScreen,
  model: ModelStudioScreen,
  evaluation: EvaluationScreen,
};

const Index = () => {
  const { lang, currentScreen } = useMLStore();
  const isRTL = lang === 'he';
  const Screen = screens[currentScreen];

  return (
    <div className={cn("min-h-screen flex", isRTL ? "flex-row-reverse" : "flex-row")} dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar />
      <main className={cn("flex-1 overflow-auto", isRTL ? "mr-64" : "ml-64")}>
        <Screen />
      </main>
    </div>
  );
};

export default Index;
