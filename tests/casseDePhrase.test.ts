import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { casseDePhrase } from '../src/lib/sanitize.ts';

describe('casseDePhrase', () => {
  it('met la capitale initiale sur un intitulé saisi en minuscules', () => {
    assert.equal(casseDePhrase('code de la famille de 1984'), 'Code de la famille de 1984');
  });

  it('gère une initiale accentuée', () => {
    assert.equal(casseDePhrase('état civil'), 'État civil');
  });

  it('ne touche pas au reste de l’intitulé', () => {
    assert.equal(casseDePhrase('Décret n° 2025-240 du 20 juin 2025. — nomination'), 'Décret n° 2025-240 du 20 juin 2025. — nomination');
  });

  it('laisse une chaîne vide vide', () => {
    assert.equal(casseDePhrase(''), '');
  });
});
