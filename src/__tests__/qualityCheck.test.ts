import { describe, expect, test } from 'vitest';
import { performGreatnessCheck, QualitySettings } from '../lib/qualityCheck';

describe('keyword alignment', () => {
  const settings: QualitySettings = {
    mode: 'detailed',
    voice: 'first-person',
    format: 'plain_text',
    includeTable: false,
    proofread: true,
  };

  test('does not count partial keyword matches (Java vs JavaScript)', () => {
    const result = performGreatnessCheck(
      'Experienced with JavaScript frameworks',
      'Java',
      settings
    );
    expect(result.factors.keywordAlignment).toBe(0);
  });

  test('counts exact keyword even within phrases (React vs React Native)', () => {
    const result = performGreatnessCheck(
      'Skilled in React Native development',
      'React',
      settings
    );
    expect(result.factors.keywordAlignment).toBe(1);
  });

  test('does not treat React as React Native when job requires the latter', () => {
    const result = performGreatnessCheck(
      'Experienced with React',
      'React Native',
      settings
    );
    expect(result.factors.keywordAlignment).toBeCloseTo(2 / 3, 5);
  });
});
