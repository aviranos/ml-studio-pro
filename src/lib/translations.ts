export type Language = 'he' | 'en';

export const translations = {
  // Navigation
  'nav.home': { he: 'בית', en: 'Home' },
  'nav.dataHub': { he: 'מרכז הנתונים', en: 'Data Hub' },
  'nav.model': { he: 'סטודיו מודלים', en: 'Model Studio' },
  'nav.evaluation': { he: 'הערכה', en: 'Evaluation' },
  'nav.leaderboard': { he: 'לוח תוצאות', en: 'Leaderboard' },

  // Welcome Screen
  'welcome.title': { he: 'ML Studio Pro', en: 'ML Studio Pro' },
  'welcome.subtitle': { he: 'מעבדה מקצועית ללמידת מכונה', en: 'Professional Machine Learning Laboratory' },
  'welcome.description': { 
    he: 'בנה, אמן והערך מודלים של למידת מכונה בממשק אינטואיטיבי ומקצועי. מטעינת נתונים ועד לתוצאות - הכל במקום אחד.',
    en: 'Build, train and evaluate machine learning models with an intuitive professional interface. From data loading to results - all in one place.'
  },
  'welcome.start': { he: 'התחל פרויקט חדש', en: 'Start New Project' },
  'welcome.features.data': { he: 'טעינת נתונים', en: 'Data Loading' },
  'welcome.features.dataDesc': { he: 'CSV, Excel, URL, Kaggle', en: 'CSV, Excel, URL, Kaggle' },
  'welcome.features.clean': { he: 'ניקוי וטיוב', en: 'Data Cleaning' },
  'welcome.features.cleanDesc': { he: 'מילוי חסרים, הסרת חריגים', en: 'Fill missing, remove outliers' },
  'welcome.features.engineer': { he: 'הנדסת פיצ\'רים', en: 'Feature Engineering' },
  'welcome.features.engineerDesc': { he: 'יצירת עמודות חדשות', en: 'Create new columns' },
  'welcome.features.model': { he: 'אימון מודלים', en: 'Model Training' },
  'welcome.features.modelDesc': { he: 'RF, XGBoost, Linear ועוד', en: 'RF, XGBoost, Linear & more' },

  // Data Hub
  'dataHub.title': { he: 'מרכז הנתונים', en: 'Data Hub' },
  'dataHub.upload': { he: 'העלאת קובץ', en: 'Upload File' },
  'dataHub.url': { he: 'טען מ-URL', en: 'Load from URL' },
  'dataHub.sample': { he: 'דאטה לדוגמה', en: 'Sample Data' },
  'dataHub.dropzone': { he: 'גרור קובץ לכאן או לחץ לבחירה', en: 'Drop file here or click to select' },
  'dataHub.formats': { he: 'תומך ב-CSV, Excel', en: 'Supports CSV, Excel' },
  'dataHub.urlPlaceholder': { he: 'הדבק לינק ישיר לקובץ CSV', en: 'Paste direct link to CSV file' },
  'dataHub.load': { he: 'טען נתונים', en: 'Load Data' },
  'dataHub.loaded': { he: 'נתונים נטענו בהצלחה!', en: 'Data loaded successfully!' },
  'dataHub.rows': { he: 'שורות', en: 'Rows' },
  'dataHub.columns': { he: 'עמודות', en: 'Columns' },
  'dataHub.missingPercent': { he: '% חסרים', en: '% Missing' },
  'dataHub.duplicates': { he: 'כפילויות', en: 'Duplicates' },
  'dataHub.overview': { he: 'סקירה כללית', en: 'Overview' },
  'dataHub.lab': { he: 'חדר ניתוח', en: 'The Lab' },
  'dataHub.quality': { he: 'איכות נתונים', en: 'Data Quality' },

  // Lab
  'lab.title': { he: 'מעבדת הנתונים', en: 'Data Laboratory' },
  'lab.overview': { he: 'סקירה כללית', en: 'Overview' },
  'lab.columns': { he: 'עמודות', en: 'Columns' },
  'lab.missing': { he: 'ערכים חסרים', en: 'Missing Values' },
  'lab.duplicates': { he: 'כפילויות', en: 'Duplicates' },
  'lab.selectColumn': { he: 'בחר עמודה לניתוח', en: 'Select column to analyze' },
  'lab.columnType': { he: 'סוג', en: 'Type' },
  'lab.unique': { he: 'ערכים ייחודיים', en: 'Unique Values' },
  'lab.stats': { he: 'סטטיסטיקות', en: 'Statistics' },
  'lab.actions': { he: 'פעולות', en: 'Actions' },
  'lab.dropColumn': { he: 'מחק עמודה', en: 'Drop Column' },
  'lab.fillMissing': { he: 'מלא חסרים', en: 'Fill Missing' },
  'lab.removeOutliers': { he: 'הסר חריגים', en: 'Remove Outliers' },
  'lab.mean': { he: 'ממוצע', en: 'Mean' },
  'lab.median': { he: 'חציון', en: 'Median' },
  'lab.mode': { he: 'שכיח', en: 'Mode' },
  'lab.correlation': { he: 'מטריצת קורלציה', en: 'Correlation Matrix' },
  'lab.featureEng': { he: 'הנדסת פיצ\'רים', en: 'Feature Engineering' },
  'lab.newColumn': { he: 'שם עמודה חדשה', en: 'New column name' },
  'lab.formula': { he: 'נוסחה', en: 'Formula' },
  'lab.createColumn': { he: 'צור עמודה', en: 'Create Column' },

  // Model Studio
  'model.title': { he: 'סטודיו המודלים', en: 'Model Studio' },
  'model.target': { he: 'משתנה מטרה', en: 'Target Variable' },
  'model.selectTarget': { he: 'בחר משתנה מטרה', en: 'Select target variable' },
  'model.taskType': { he: 'סוג משימה', en: 'Task Type' },
  'model.classification': { he: 'סיווג', en: 'Classification' },
  'model.regression': { he: 'רגרסיה', en: 'Regression' },
  'model.supervised': { he: 'מונחה', en: 'Supervised' },
  'model.unsupervised': { he: 'לא מונחה', en: 'Unsupervised' },
  'model.selectModel': { he: 'בחר מודל', en: 'Select Model' },
  'model.dropFeatures': { he: 'הסר פיצ\'רים מהאימון', en: 'Drop Features from Training' },
  'model.parameters': { he: 'פרמטרים', en: 'Parameters' },
  'model.train': { he: 'אמן מודל', en: 'Train Model' },
  'model.training': { he: 'מאמן...', en: 'Training...' },
  'model.addToLeaderboard': { he: 'הוסף ללוח תוצאות', en: 'Add to Leaderboard' },

  // Models
  'model.rf': { he: 'Random Forest', en: 'Random Forest' },
  'model.rfDesc': { he: 'יער אקראי - מודל אנסמבל חזק ויציב', en: 'Random Forest - Strong and stable ensemble model' },
  'model.xgb': { he: 'XGBoost', en: 'XGBoost' },
  'model.xgbDesc': { he: 'גרדיאנט בוסטינג מתקדם', en: 'Advanced gradient boosting' },
  'model.linear': { he: 'Linear/Logistic', en: 'Linear/Logistic' },
  'model.linearDesc': { he: 'רגרסיה ליניארית או לוגיסטית', en: 'Linear or logistic regression' },
  'model.tree': { he: 'Decision Tree', en: 'Decision Tree' },
  'model.treeDesc': { he: 'עץ החלטה - קל לפרשנות', en: 'Decision tree - Easy to interpret' },
  'model.knn': { he: 'KNN', en: 'KNN' },
  'model.knnDesc': { he: 'K-Nearest Neighbors', en: 'K-Nearest Neighbors' },
  'model.svm': { he: 'SVM', en: 'SVM' },
  'model.svmDesc': { he: 'Support Vector Machine', en: 'Support Vector Machine' },

  // Evaluation
  'eval.title': { he: 'הערכה ותוצאות', en: 'Evaluation & Results' },
  'eval.metrics': { he: 'מדדים', en: 'Metrics' },
  'eval.accuracy': { he: 'דיוק', en: 'Accuracy' },
  'eval.precision': { he: 'Precision', en: 'Precision' },
  'eval.recall': { he: 'Recall', en: 'Recall' },
  'eval.f1': { he: 'F1 Score', en: 'F1 Score' },
  'eval.rmse': { he: 'RMSE', en: 'RMSE' },
  'eval.r2': { he: 'R² Score', en: 'R² Score' },
  'eval.mae': { he: 'MAE', en: 'MAE' },
  'eval.threshold': { he: 'סף החלטה', en: 'Decision Threshold' },
  'eval.importance': { he: 'חשיבות פיצ\'רים', en: 'Feature Importance' },
  'eval.optimize': { he: 'מצא מודל אופטימלי', en: 'Find Optimal Model' },
  'eval.noResults': { he: 'אמן מודל כדי לראות תוצאות', en: 'Train a model to see results' },
  'eval.rocCurve': { he: 'עקומת ROC', en: 'ROC Curve' },
  'eval.prCurve': { he: 'עקומת Precision-Recall', en: 'Precision-Recall Curve' },
  'eval.treeRules': { he: 'חוקי העץ', en: 'Tree Rules' },
  'eval.actualVsPredicted': { he: 'בפועל מול חזוי', en: 'Actual vs Predicted' },

  // Leaderboard
  'leaderboard.title': { he: 'לוח תוצאות', en: 'Leaderboard' },
  'leaderboard.empty': { he: 'עדיין אין מודלים. אמן מודל והוסף אותו!', en: 'No models yet. Train a model and add it!' },
  'leaderboard.clear': { he: 'נקה הכל', en: 'Clear All' },
  'leaderboard.compare': { he: 'השווה מודלים', en: 'Compare Models' },

  // General
  'general.next': { he: 'הבא', en: 'Next' },
  'general.back': { he: 'חזור', en: 'Back' },
  'general.save': { he: 'שמור', en: 'Save' },
  'general.cancel': { he: 'ביטול', en: 'Cancel' },
  'general.loading': { he: 'טוען...', en: 'Loading...' },
  'general.error': { he: 'שגיאה', en: 'Error' },
  'general.success': { he: 'הצלחה', en: 'Success' },
  'general.noData': { he: 'אנא טען נתונים תחילה', en: 'Please load data first' },
  'general.mockMode': { he: 'מצב הדגמה', en: 'Mock Mode' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || key;
}
