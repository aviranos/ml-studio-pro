import { Home, Database, FlaskConical, Brain, BarChart3, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMLStore, Screen } from '@/hooks/useMLStore';
import { t, Language } from '@/lib/translations';

const navItems: { id: Screen; icon: typeof Home; labelKey: 'nav.home' | 'nav.data' | 'nav.lab' | 'nav.model' | 'nav.evaluation' }[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'data', icon: Database, labelKey: 'nav.data' },
  { id: 'lab', icon: FlaskConical, labelKey: 'nav.lab' },
  { id: 'model', icon: Brain, labelKey: 'nav.model' },
  { id: 'evaluation', icon: BarChart3, labelKey: 'nav.evaluation' },
];

export function Sidebar() {
  const { lang, setLang, currentScreen, setCurrentScreen, data } = useMLStore();
  const isRTL = lang === 'he';

  return (
    <motion.aside 
      initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 h-screen w-64 bg-sidebar border-sidebar-border flex flex-col z-50",
        isRTL ? "right-0 border-l" : "left-0 border-r"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gradient">ML Studio</h1>
            <p className="text-xs text-muted-foreground">Pro Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const isDisabled = (item.id === 'lab' || item.id === 'model' || item.id === 'evaluation') && !data;
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setCurrentScreen(item.id)}
              disabled={isDisabled}
              className={cn(
                "nav-item w-full",
                isActive && "active",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{t(item.labelKey, lang)}</span>
              {item.id === 'data' && data && (
                <span className="status-badge success mr-auto ml-2">✓</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Language Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
          className="nav-item w-full justify-center"
        >
          <Globe className="w-4 h-4" />
          <span>{lang === 'he' ? 'English' : 'עברית'}</span>
        </button>
      </div>
    </motion.aside>
  );
}
