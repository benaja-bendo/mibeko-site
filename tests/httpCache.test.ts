import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cachePolicyFor, etagFor, etagMatches } from '../src/lib/httpCache.ts';

const politique = (u: string) => cachePolicyFor(new URL(u, 'https://mibeko.fr'));

describe('cachePolicyFor', () => {
  it('met en cache longtemps une page de texte et sa page d’article', () => {
    assert.equal(politique('/textes/code-civil')?.cacheControl, 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    assert.equal(politique('/textes/code-civil/article-1204')?.etag, true);
    assert.equal(politique('/textes/code-civil/')?.etag, true);
  });

  it('met en cache brièvement les listes', () => {
    for (const u of ['/textes', '/textes/nouveautes', '/situations', '/situations/famille', '/textes?type=LOI&page=2']) {
      assert.equal(politique(u)?.cacheControl, 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600', u);
    }
  });

  it('interdit tout cache aux pages de recherche et de retour de signalement', () => {
    for (const u of ['/textes/code-civil?q=mariage', '/textes?q=mariage', '/textes/code-civil/article-1?signalement=ok', '/contact?status=ok']) {
      const p = politique(u);
      assert.deepEqual(p === null ? null : p.cacheControl, u.startsWith('/contact') ? null : 'no-store', u);
      if (p) assert.equal(p.etag, false, u);
    }
  });

  it('laisse tranquilles les pages hors du fonds et les routes API', () => {
    for (const u of ['/', '/guides', '/api/suggest?q=x', '/_sante', '/sitemap-textes.xml', '/textes/code-civil/article-1/plus']) {
      assert.equal(politique(u), null, u);
    }
  });
});

describe('etagFor', () => {
  it('est déterministe et faible', () => {
    assert.equal(etagFor('<html>a</html>'), etagFor('<html>a</html>'));
    assert.notEqual(etagFor('<html>a</html>'), etagFor('<html>b</html>'));
    assert.match(etagFor('x'), /^W\/"[A-Za-z0-9_-]+"$/);
  });
});

describe('etagMatches', () => {
  const etag = etagFor('corps');

  it('accepte la valeur exacte, sa forme forte, une liste et *', () => {
    assert.equal(etagMatches(etag, etag), true);
    assert.equal(etagMatches(etag.slice(2), etag), true);
    assert.equal(etagMatches(`"autre", ${etag}`, etag), true);
    assert.equal(etagMatches('*', etag), true);
  });

  it('refuse l’absence et une autre valeur', () => {
    assert.equal(etagMatches(null, etag), false);
    assert.equal(etagMatches(undefined, etag), false);
    assert.equal(etagMatches('"autre"', etag), false);
  });
});
