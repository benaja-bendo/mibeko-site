import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  appStoreCampaignToken,
  appStoreUrl,
  originFromSearch,
  playStoreUrl,
  type StoreOrigin,
} from '../src/lib/storeLinks.ts';

const site: StoreOrigin = { source: 'mibeko.fr', medium: 'site', campaign: 'page-application' };

describe('playStoreUrl', () => {
  it('transporte les UTM dans un seul paramètre referrer encodé', () => {
    const url = new URL(playStoreUrl(site));
    assert.equal(url.origin + url.pathname, 'https://play.google.com/store/apps/details');
    assert.equal(url.searchParams.get('id'), 'cg.mibeko.app');
    const referrer = new URLSearchParams(url.searchParams.get('referrer')!);
    assert.equal(referrer.get('utm_source'), 'mibeko.fr');
    assert.equal(referrer.get('utm_medium'), 'site');
    assert.equal(referrer.get('utm_campaign'), 'page-application');
    assert.equal(referrer.has('utm_content'), false);
  });

  it('ajoute utm_content seulement quand une variante est donnée', () => {
    const url = new URL(playStoreUrl({ ...site, content: 'grace' }));
    const referrer = new URLSearchParams(url.searchParams.get('referrer')!);
    assert.equal(referrer.get('utm_content'), 'grace');
  });

  it('part toujours de la fiche cg.mibeko.app', () => {
    assert.ok(playStoreUrl(site).startsWith(`${PLAY_STORE_URL}&referrer=`));
  });
});

describe('appStoreUrl', () => {
  it('reste nu tant que le jeton fournisseur manque : un ct seul ne serait pas attribué', () => {
    assert.equal(appStoreUrl(site, ''), APP_STORE_URL);
  });

  it('porte pt, ct et mt quand le jeton fournisseur est connu', () => {
    const url = new URL(appStoreUrl(site, '123456'));
    assert.equal(url.searchParams.get('pt'), '123456');
    assert.equal(url.searchParams.get('ct'), 'mibeko.fr-page-application');
    assert.equal(url.searchParams.get('mt'), '8');
  });

  it('borne le jeton de campagne aux 40 caractères imposés par Apple', () => {
    const long = { ...site, campaign: 'x'.repeat(80) };
    assert.equal(appStoreCampaignToken(long).length, 40);
  });

  it('préfère la variante à la campagne dans le jeton', () => {
    assert.equal(appStoreCampaignToken({ ...site, source: 'facebook', content: 'grace' }), 'facebook-grace');
  });
});

describe('originFromSearch', () => {
  it("garde l'origine par défaut sans utm_source", () => {
    assert.deepEqual(originFromSearch('', site), site);
    assert.deepEqual(originFromSearch('?utm_medium=social', site), site);
  });

  it("reprend l'origine d'une publication", () => {
    assert.deepEqual(originFromSearch('?utm_source=facebook&utm_medium=social&utm_campaign=2026-10&utm_content=grace', site), {
      source: 'facebook',
      medium: 'social',
      campaign: '2026-10',
      content: 'grace',
    });
  });

  it("complète un lien incomplet sans perdre l'emplacement", () => {
    assert.deepEqual(originFromSearch('?utm_source=TikTok', site), {
      source: 'tiktok',
      medium: 'lien',
      campaign: 'page-application',
    });
  });

  it('neutralise une valeur fantaisiste venue de l’URL', () => {
    const origin = originFromSearch(`?utm_source=${encodeURIComponent('<script>alert(1)</script>')}`, site);
    assert.equal(origin.source, 'scriptalert1script');
  });
});
