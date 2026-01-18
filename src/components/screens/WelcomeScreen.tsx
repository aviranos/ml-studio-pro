import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Database, Wrench, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMLStore } from '@/hooks/useMLStore';
import { t } from '@/lib/translations';

const features = [
  { icon: Database, titleKey: 'welcome.features.data', descKey: 'welcome.features.dataDesc', color: 'from-blue-500 to-cyan-500' },
  { icon: Wrench, titleKey: 'welcome.features.clean', descKey: 'welcome.features.cleanDesc', color: 'from-green-500 to-emerald-500' },
  { icon: Sparkles, titleKey: 'welcome.features.engineer', descKey: 'welcome.features.engineerDesc', color: 'from-purple-500 to-pink-500' },
  { icon: Brain, titleKey: 'welcome.features.model', descKey: 'welcome.features.modelDesc', color: 'from-orange-500 to-red-500' },
] as const;

export function WelcomeScreen() {
  const { lang, setCurrentScreen } = useMLStore();
  const isRTL = lang === 'he';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10 max-w-3xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent mb-8 shadow-lg shadow-primary/30"
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="text-gradient">{t('welcome.title', lang)}</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-4">
          {t('welcome.subtitle', lang)}
        </p>
        
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          {t('welcome.description', lang)}
        </p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            onClick={() => setCurrentScreen('dataHub')}
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/30 glow-primary"
          >
            {t('welcome.start', lang)}
            {isRTL ? <ArrowLeft className="mr-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 z-10 max-w-4xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="glass-card rounded-xl p-5 text-center group hover:border-primary/50 transition-all"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-3 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">{t(feature.titleKey, lang)}</h3>
            <p className="text-sm text-muted-foreground">{t(feature.descKey, lang)}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
