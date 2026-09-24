import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { serializeJsonLd } from '../src/lib/jsonLd.ts';

// Texte d'article tel qu'il pourrait sortir de l'OCR ou d'une édition : de quoi
// fermer la balise, ouvrir un commentaire HTML, et des signes légitimes.
const article = {
  '@context': 'https://schema.org',
  '@type': 'Legislation',
  name: 'Loi n° 2025-12 relative aux baux & loyers',
  text: 'Durée < 3 ans et loyer > 0.</script><script>alert(1)</script><!-- fin',
};

describe('serializeJsonLd', () => {
  it('ne laisse jamais un texte fermer la balise script', () => {
    // Le défaut corrigé : JSON.stringify seul rend la séquence intacte.
    assert.ok(JSON.stringify(article).includes('</script>'));

    const json = serializeJsonLd(article);
    assert.ok(!json.includes('</script'), json);
    assert.ok(!json.includes('<!--'), json);
    assert.doesNotMatch(json, /[<>&]/);
  });

  it('rend exactement le même objet une fois relu', () => {
    assert.deepEqual(JSON.parse(serializeJsonLd(article)), article);
  });

  it('ne change rien à un JSON-LD sans caractère sensible', () => {
    const breadcrumb = { '@type': 'ListItem', position: 2, name: 'Textes officiels', item: 'https://mibeko.fr/textes' };
    assert.equal(serializeJsonLd(breadcrumb), JSON.stringify(breadcrumb));
  });
});
