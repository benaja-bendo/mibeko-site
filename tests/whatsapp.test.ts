import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WHATSAPP_AFFICHE, whatsappUrl } from '../src/lib/whatsapp.ts';

describe('whatsappUrl', () => {
  it('vise le numéro professionnel, au format de wa.me', () => {
    assert.equal(whatsappUrl(), 'https://wa.me/242066443279');
  });

  it('encode le message prérempli', () => {
    assert.equal(whatsappUrl('Bonjour, j’ai vu Mibeko'), 'https://wa.me/242066443279?text=Bonjour%2C%20j%E2%80%99ai%20vu%20Mibeko');
  });

  it('affiche le même numéro que celui du lien', () => {
    assert.equal(WHATSAPP_AFFICHE.replace(/\D/g, ''), '242066443279');
  });
});
