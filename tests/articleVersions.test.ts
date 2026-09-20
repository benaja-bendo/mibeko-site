import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findVersionAt, isValidDateParam, versionSelectorLabel } from '../src/lib/articleVersions.ts';
import type { ArticleVersionRef } from '../src/lib/api.ts';

describe('isValidDateParam', () => {
  it("accepte le format YYYY-MM-DD, rejette le reste", () => {
    assert.equal(isValidDateParam('2019-03-12'), true);
    assert.equal(isValidDateParam('12-03-2019'), false);
    assert.equal(isValidDateParam('hier'), false);
    assert.equal(isValidDateParam(''), false);
    assert.equal(isValidDateParam(null), false);
    assert.equal(isValidDateParam(undefined), false);
  });
});

const ancienne: ArticleVersionRef = { start: '2018-01-01', end: '2021-06-01', is_current: false, modifie_par: null };
const amendee: ArticleVersionRef = { start: '2021-06-01', end: null, is_current: true, modifie_par: 'Loi modificative' };
const versions = [ancienne, amendee];

describe('findVersionAt', () => {
  it('trouve la version dont la période couvre la date demandée', () => {
    assert.equal(findVersionAt(versions, '2019-05-01'), ancienne);
    assert.equal(findVersionAt(versions, '2021-06-01'), amendee);
    assert.equal(findVersionAt(versions, '2023-01-01'), amendee);
  });

  it("renvoie null pour une date antérieure à la toute première version — jamais une erreur", () => {
    assert.equal(findVersionAt(versions, '2010-01-01'), null);
  });
});

describe('versionSelectorLabel', () => {
  it("n'affirme jamais la date de début de la première version comme un fait de droit", () => {
    assert.equal(versionSelectorLabel(ancienne, 0), 'Avant le 1 juin 2021');
  });

  it('libelle une version amendée avec sa date de début et son texte modificateur', () => {
    assert.equal(versionSelectorLabel(amendee, 1), 'Depuis le 1 juin 2021 — modifié par Loi modificative');
  });

  it('libelle une version amendée intermédiaire (ni la première ni la courante) avec sa période complète', () => {
    const intermediaire: ArticleVersionRef = { start: '2021-06-01', end: '2023-01-01', is_current: false, modifie_par: 'Loi modificative' };
    assert.equal(versionSelectorLabel(intermediaire, 1), 'Du 1 juin 2021 au 1 janvier 2023 — modifié par Loi modificative');
  });

  it("affiche « Texte actuel » pour une première version toujours en vigueur (article jamais amendé)", () => {
    const seule: ArticleVersionRef = { start: '2018-01-01', end: null, is_current: true, modifie_par: null };
    assert.equal(versionSelectorLabel(seule, 0), 'Texte actuel');
  });
});
