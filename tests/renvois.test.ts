import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cleNumero, decouperRenvois, indexNumeros, renvoisPermis, type Morceau } from '../src/lib/renvois.ts';

const numeros = indexNumeros(['PREAMBULE', 'premier', '2', '12', '121', '136', '162', '167', '32-2', '40 bis']);
const liens = (morceaux: Morceau[]) =>
  morceaux.filter((m) => m.kind === 'renvoi').map((m) => `${m.texte} → ${m.kind === 'renvoi' ? m.numero : ''}`);
const recoller = (morceaux: Morceau[]) => morceaux.map((m) => m.texte).join('');

describe('decouperRenvois', () => {
  it('fait un lien d’un renvoi vers un article du même texte', () => {
    const texte = 'Une option de polygamie peut être déclarée dans les conditions fixées par l’article 136.';
    assert.deepEqual(liens(decouperRenvois(texte, numeros)), ['article 136 → 136']);
  });

  it('rend le texte d’origine, caractère pour caractère', () => {
    const texte = 'Voir les articles 162 à 167, et l’article 12 du présent code ; l’article 5 de la loi n° 2020-12.';
    assert.equal(recoller(decouperRenvois(texte, numeros)), texte);
  });

  it('relie chaque borne d’une énumération', () => {
    assert.deepEqual(liens(decouperRenvois('les articles 162 à 167', numeros)), ['articles 162 → 162', '167 → 167']);
    assert.deepEqual(liens(decouperRenvois('les articles 2, 12 et 136', numeros)), ['articles 2 → 2', '12 → 12', '136 → 136']);
  });

  it('laisse en texte un renvoi vers un autre texte', () => {
    for (const texte of [
      'l’article 12 de la loi n° 2020-12 du 5 mai 2020',
      'l’article 136 du décret n° 2025-240',
      'l’article 2 du Code civil',
      'l’article 12, alinéa 2, de la loi susvisée',
      'l’article 136 dudit code',
      'l’article 12 de l’Acte uniforme relatif au droit commercial',
    ]) {
      assert.deepEqual(liens(decouperRenvois(texte, numeros)), [], texte);
    }
  });

  it('relie « du présent code » et « de la présente loi »', () => {
    assert.deepEqual(liens(decouperRenvois('l’article 12 du présent code', numeros)), ['article 12 → 12']);
    assert.deepEqual(liens(decouperRenvois('l’article 2 de la présente loi', numeros)), ['article 2 → 2']);
  });

  it('ne relie ni une nouvelle rédaction, ni un article absent, ni l’article lui-même', () => {
    assert.deepEqual(liens(decouperRenvois('Article 12 nouveau : …', numeros)), []);
    assert.deepEqual(liens(decouperRenvois('l’article 999', numeros)), []);
    assert.deepEqual(liens(decouperRenvois('au sens de l’article 121', numeros, '121')), []);
  });

  it('reconnaît « premier », « 1er », les tirets et « bis »', () => {
    assert.deepEqual(liens(decouperRenvois('l’article premier', numeros)), ['article premier → premier']);
    assert.deepEqual(liens(decouperRenvois('l’article 1er', numeros)), ['article 1er → premier']);
    assert.deepEqual(liens(decouperRenvois('l’article 32-2', numeros)), ['article 32-2 → 32-2']);
    assert.deepEqual(liens(decouperRenvois('l’article 40 bis', numeros)), ['article 40 bis → 40 bis']);
  });

  it('ne touche pas un texte sans renvoi', () => {
    const texte = 'La Loi reconnaît la polygamie et la monogamie.';
    assert.deepEqual(decouperRenvois(texte, numeros), [{ kind: 'texte', texte }]);
  });
});

describe('cleNumero et renvoisPermis', () => {
  it('rapproche « premier », « 1er » et « 1 »', () => {
    assert.equal(cleNumero('premier'), '1');
    assert.equal(cleNumero('1er'), '1');
    assert.equal(cleNumero('40 bis'), '40bis');
  });

  it('réserve les renvois aux codes, constitutions et Actes uniformes', () => {
    assert.equal(renvoisPermis({ type_code: 'CODE' }), true);
    assert.equal(renvoisPermis({ type_code: 'AU' }), true);
    assert.equal(renvoisPermis({ type_code: 'LOI', document_role: 'STOCK' }), true);
    assert.equal(renvoisPermis({ type_code: 'LOI', document_role: 'FLUX' }), false);
    assert.equal(renvoisPermis({ type_code: 'DEC' }), false);
  });
});
