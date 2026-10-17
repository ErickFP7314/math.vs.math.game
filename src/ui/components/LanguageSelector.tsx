import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-sm text-xs font-mono">
      <div className="px-1.5 py-0.5 text-slate-400 flex items-center space-x-1">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
            language === opt.code
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={opt.label}
        >
          {opt.flag} {opt.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
