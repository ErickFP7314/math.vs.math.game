import { describe, it, expect } from 'vitest';
import { LevelRegistry } from '../../src/core/levels/LevelRegistry';
import { translations } from '../../src/i18n/translations';

describe('Math Theory & Didactic Coverage', () => {
  it('covers all 10 levels in the LevelRegistry', () => {
    const levels = LevelRegistry.getLevels();
    expect(levels.length).toBe(10);

    for (let id = 1; id <= 10; id++) {
      const level = LevelRegistry.getLevel(id);
      expect(level).toBeDefined();
      expect(level!.id).toBe(id);
      expect(level!.leftEntityConfig).toBeDefined();
      expect(level!.rightEntityConfig).toBeDefined();
    }
  });

  it('provides didactic translations for all levels across English, Spanish, and Korean', () => {
    const languages = ['en', 'es', 'ko'] as const;

    for (const lang of languages) {
      const dict = translations[lang];
      expect(dict.mathGuide).toBeTruthy();
      expect(dict.theoryTitle).toBeTruthy();
      expect(dict.interactiveDemo).toBeTruthy();
      expect(dict.playLevel).toBeTruthy();
      expect(dict.formulaBreakdown).toBeTruthy();
      expect(dict.gameplayConnection).toBeTruthy();

      for (let id = 1; id <= 10; id++) {
        const lvl = dict.levels[id];
        expect(lvl).toBeDefined();
        expect(lvl.title.length).toBeGreaterThan(0);
        expect(lvl.subtitle.length).toBeGreaterThan(0);
        expect(lvl.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('validates that Level 1 polynomial configuration specifies global HP', () => {
    const level1 = LevelRegistry.getLevel(1)!;
    expect(level1.polynomialGlobalHp).toBe(16);
    expect(level1.leftEntityConfig.symbol).toBe('d/dx');
    expect(level1.rightEntityConfig.symbol).toBe('x³');
  });

  it('validates that Level 10 features Euler Identity symbols', () => {
    const level10 = LevelRegistry.getLevel(10)!;
    expect(level10.subtitle).toContain('eⁱᵖⁱ + 1 = 0');
  });
});
