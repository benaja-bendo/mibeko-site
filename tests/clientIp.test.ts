import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CLOUDFLARE_IP_RANGES, cdnAddressList, isCdnAddress, lastForwardedFor, visitorAddress } from '../src/lib/clientIp.ts';

const cdn = cdnAddressList(CLOUDFLARE_IP_RANGES);
const socket = () => '172.18.0.2';

describe('isCdnAddress', () => {
  it('reconnaît une adresse v4 et v6 des plages du CDN, et rien d’autre', () => {
    assert.equal(isCdnAddress('104.16.1.1', cdn), true);
    assert.equal(isCdnAddress('2606:4700::1', cdn), true);
    assert.equal(isCdnAddress('203.0.113.7', cdn), false);
    assert.equal(isCdnAddress('pas-une-ip', cdn), false);
  });

  it('ignore une plage mal formée sans casser les autres', () => {
    const liste = cdnAddressList(['n-importe-quoi/8', '198.51.100.0/24']);
    assert.equal(isCdnAddress('198.51.100.9', liste), true);
    assert.equal(isCdnAddress('198.51.101.9', liste), false);
  });
});

describe('lastForwardedFor', () => {
  it('prend la dernière valeur valide, ou rien', () => {
    assert.equal(lastForwardedFor('9.9.9.9, 203.0.113.11'), '203.0.113.11');
    assert.equal(lastForwardedFor('203.0.113.9'), '203.0.113.9');
    assert.equal(lastForwardedFor('pas-une-ip'), undefined);
    assert.equal(lastForwardedFor(null), undefined);
  });
});

describe('visitorAddress', () => {
  it('sans CDN : le pair vu par Traefik, sinon la socket', () => {
    assert.equal(visitorAddress({ forwardedFor: '203.0.113.9', cdnConnectingIp: null }, socket, cdn), '203.0.113.9');
    assert.equal(visitorAddress({ forwardedFor: '9.9.9.9, 203.0.113.11', cdnConnectingIp: null }, socket, cdn), '203.0.113.11');
    assert.equal(visitorAddress({ forwardedFor: null, cdnConnectingIp: null }, socket, cdn), '172.18.0.2');
  });

  it('derrière le CDN : l’IP transmise par le CDN, seulement si le pair est un relais du CDN', () => {
    assert.equal(visitorAddress({ forwardedFor: '104.16.1.1', cdnConnectingIp: '203.0.113.42' }, socket, cdn), '203.0.113.42');
    assert.equal(visitorAddress({ forwardedFor: '2606:4700::1', cdnConnectingIp: '2001:db8::7' }, socket, cdn), '2001:db8::7');
    // Relais du CDN mais en-tête absent ou invalide : on garde le relais plutôt que rien.
    assert.equal(visitorAddress({ forwardedFor: '104.16.1.1', cdnConnectingIp: null }, socket, cdn), '104.16.1.1');
    assert.equal(visitorAddress({ forwardedFor: '104.16.1.1', cdnConnectingIp: 'forgé' }, socket, cdn), '104.16.1.1');
  });

  it('refuse un CF-Connecting-IP forgé par un client qui frappe l’origine directement', () => {
    assert.equal(visitorAddress({ forwardedFor: '203.0.113.9', cdnConnectingIp: '1.2.3.4' }, socket, cdn), '203.0.113.9');
    assert.equal(visitorAddress({ forwardedFor: null, cdnConnectingIp: '1.2.3.4' }, socket, cdn), '172.18.0.2');
  });
});
