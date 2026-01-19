import { useState, useEffect } from 'react';
import { Home, Database, Brain, BarChart3, Globe, Zap, Trophy, FlaskConical, WifiOff, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMLStore, Screen } from '@/hooks/useMLStore';
import { t, Language } from '@/lib/translations';

const navItems: { id: Screen; icon: typeof Home; labelKey: 'nav.home' | 'nav.dataHub' | 'nav.model' | 'nav.evaluation' | 'nav.leaderboard' }[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'dataHub', icon: Database, labelKey: 'nav.dataHub' },
  { id: 'model', icon: Brain, labelKey: 'nav.model' },
  { id: 'evaluation', icon: BarChart3, labelKey: 'nav.evaluation' },
  { id: 'leaderboard', icon: Trophy, labelKey: 'nav.leaderboard' },
];

function BackendStatusIndicator() {
  const { lang } = useMLStore();
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch {
        setStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
      status === 'online' ? "bg-success/10 text-success" : 
      status === 'offline' ? "bg-destructive/10 text-destructive" :
      "bg-muted/10 text-muted-foreground"
    )}>
      {status === 'online' ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : status === 'offline' ? (
        <WifiOff className="w-3.5 h-3.5" />
      ) : (
        <Zap className="w-3.5 h-3.5" />
      )}
      <span className="font-medium">
        {status === 'online' ? t('general.backendOnline', lang) : 
         status === 'offline' ? t('general.backendOffline', lang) : 
         t('general.backendChecking', lang)}
      </span>
      <span className={cn(
        "w-2 h-2 rounded-full ml-auto",
        status === 'online' ? "bg-success" : 
        status === 'offline' ? "bg-destructive" : 
        "bg-muted-foreground animate-pulse"
      )} />
    </div>
  );
}

export function Sidebar() {
  const { lang, setLang, currentScreen, setCurrentScreen, data, leaderboard } = useMLStore();
  const isRTL = lang === 'he';

  return (
    <motion.aside 
      initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 h-screen w-64 flex flex-col z-50",
        "bg-gradient-to-b from-sidebar via-sidebar to-background/95",
        "border-sidebar-border backdrop-blur-xl",
        isRTL ? "right-0 border-l" : "left-0 border-r"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 relative">
            <FlaskConical className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gradient">ML Studio</h1>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent" />
              <p className="text-xs text-muted-foreground">Pro Edition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item, index) => {
          const isActive = currentScreen === item.id;
          const isDisabled = (item.id === 'model' || item.id === 'evaluation') && !data;
          const showBadge = item.id === 'leaderboard' && leaderboard.length > 0;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !isDisabled && setCurrentScreen(item.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-sm glow-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? "bg-primary/20" 
                  : "bg-secondary/50 group-hover:bg-secondary"
              )}>
                <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
              </div>
              <span className="font-medium text-sm">{t(item.labelKey, lang)}</span>
              
              {/* Data loaded indicator */}
              {item.id === 'dataHub' && data && (
                <div className="ml-auto flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {lang === 'he' ? 'נטען' : 'Loaded'}
                </div>
              )}
              
              {/* Leaderboard count badge */}
              {showBadge && (
                <div className="ml-auto flex items-center justify-center min-w-[20px] h-5 text-xs font-bold text-primary-foreground bg-primary px-1.5 rounded-full">
                  {leaderboard.length}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50 space-y-3">
        {/* Backend Status Indicator */}
        <BackendStatusIndicator />

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{lang === 'he' ? 'English' : 'עברית'}</span>
        </button>
      </div>
    </motion.aside>
  );
}
