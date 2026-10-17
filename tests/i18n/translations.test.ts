import { describe, it, expect } from 'vitest';
import { translations, Language } from '../../src/i18n/translations';

describe('i18n Translations', () => {
  const languages: Language[] = ['en', 'es', 'ko'];

  it('provides all 3 required languages', () => {
    for (const lang of languages) {
      expect(translations[lang]).toBeDefined();
    }
  });

  it('contains consistent UI keys across English, Spanish, and Korean', () => {
    const enKeys = Object.keys(translations.en) as (keyof typeof translations.en)[];
    
    for (const lang of languages) {
      const dict = translations[lang];
      for (const key of enKeys) {
        expect(dict[key]).toBeDefined();
        if (typeof dict[key] === 'string') {
          expect((dict[key] as string).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('defines valid titles, subtitles, and descriptions for all 10 levels in all 3 languages', () => {
    for (const lang of languages) {
      const levelsDict = translations[lang].levels;
      for (let levelId = 1; levelId <= 10; levelId++) {
        const lvl = levelsDict[levelId];
        expect(lvl, `Level ${levelId} missing in ${lang}`).toBeDefined();
        expect(lvl.title.length).toBeGreaterThan(0);
        expect(lvl.subtitle.length).toBeGreaterThan(0);
        expect(lvl.description.length).toBeGreaterThan(0);
      }
    }
  });
});
