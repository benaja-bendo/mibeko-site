import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPresetSearch, presetSearchPath } from '../src/lib/presetSearch.ts';

const paramsOf = (path: string) => new URL(path, 'https://mibeko.fr').searchParams;

describe('presetSearchPath', () => {
  it('rend la requête intacte, esperluette et apostrophe comprises', () => {
    for (const query of ['administration & services publics', "voies d'exécution saisie", 'injonction de payer']) {
      const path = presetSearchPath(query);
      assert.ok(path.startsWith('/textes?'));
      assert.equal(paramsOf(path).get('q'), query);
    }
  });

  it('porte le marqueur que /textes reconnaît', () => {
    assert.equal(isPresetSearch(paramsOf(presetSearchPath('capital social'))), true);
  });
});

describe('isPresetSearch', () => {
  it('garde le marqueur quand /textes reconstruit l’URL pour la page suivante ou la vue', () => {
    // Même reconstruction que `urlWith` dans src/pages/textes/index.astro.
    const next = new URLSearchParams(paramsOf(presetSearchPath('capital social')));
    next.set('page', '2');
    next.set('view', 'articles');
    assert.equal(isPresetSearch(next), true);
  });

  it('ne marque pas une recherche saisie dans le formulaire', () => {
    assert.equal(isPresetSearch(paramsOf('/textes?q=capital+social&view=articles')), false);
    assert.equal(isPresetSearch(paramsOf('/textes?q=capital+social&origine=autre')), false);
  });
});
