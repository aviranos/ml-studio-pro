import { Sidebar } from '@/components/Sidebar';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { DataSourceScreen } from '@/components/screens/DataSourceScreen';
import { LabScreen } from '@/components/screens/LabScreen';
import { ModelStudioScreen } from '@/components/screens/ModelStudioScreen';
import { EvaluationScreen } from '@/components/screens/EvaluationScreen';
import { useMLStore } from '@/hooks/useMLStore';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <div 
        className={cn(
          "min-h-screen flex bg-background",
          isRTL ? "flex-row-reverse" : "flex-row"
        )} 
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Background Gradient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <Sidebar />
        
        <main 
          className={cn(
            "flex-1 overflow-auto relative z-10",
            isRTL ? "mr-64" : "ml-64"
          )}
        >
          <Screen />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Index;
