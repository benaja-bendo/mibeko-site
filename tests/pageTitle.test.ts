import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DESCRIPTION_MAX,
  TITRE_MAX,
  avecMarque,
  descriptionArticleVide,
  descriptionTexte,
  intituleCourt,
  titreArticle,
  titreTexte,
} from '../src/lib/pageTitle.ts';

const ARRETE_LONG =
  'Arrêté n° 11428 du 15 septembre 2023 portant attribution à la société Mission du cèdre distribution d’une autorisation d’ouverture et d’exploitation d’une carrière de sable bloc 2, sise à Mantess';
const CONVENTION_SANS_OBJET =
  'Convention de concession des activités d’exploitation et de maintenance du port autonome d’Oyo (annexée au décret n° 2024-1241 du 27 août 2024)';
const TIRET_CADRATIN = '—';

describe('intituleCourt', () => {
  it('laisse intact un intitulé qui tient', () => {
    assert.equal(intituleCourt('LOI n° 4-2005', 50), 'LOI n° 4-2005');
  });

  it('retire le point final d’un acte en abrégé', () => {
    assert.equal(intituleCourt('Décret n° 2025-240 du 20 juin 2025.', 50), 'Décret n° 2025-240 du 20 juin 2025');
  });

  it('garde la référence et renvoie l’objet ailleurs', () => {
    assert.equal(intituleCourt(ARRETE_LONG, 50), 'Arrêté n° 11428 du 15 septembre 2023');
  });

  it('coupe au mot, avec une ellipse, quand il n’y a pas d’objet à retirer', () => {
    const court = intituleCourt(CONVENTION_SANS_OBJET, 50);
    assert.ok(court.length <= 50, court);
    assert.ok(court.endsWith('…'), court);
    assert.ok(!court.slice(0, -1).endsWith(' '), court);
  });

  it('ne prend pas un mot de liaison pour le début de l’objet', () => {
    const court = intituleCourt('Loi n° 12-2023 du 10 mai 2023 modifiant et complétant la loi n° 37-2014', 40);
    assert.equal(court, 'Loi n° 12-2023 du 10 mai 2023');
  });
});

describe('titreArticle', () => {
  it('tient dans la limite avec la marque, même sur un intitulé de 190 caractères', () => {
    const titre = avecMarque(titreArticle('Article 7', ARRETE_LONG));
    assert.equal(titre, 'Article 7 : Arrêté n° 11428 du 15 septembre 2023 | Mibeko');
    assert.ok(titre.length <= TITRE_MAX, titre);
  });

  it('reste borné quand l’intitulé n’a pas d’objet à retirer', () => {
    const titre = avecMarque(titreArticle('Article 18', CONVENTION_SANS_OBJET));
    assert.ok(titre.length <= TITRE_MAX + 5, titre);
    assert.ok(titre.startsWith('Article 18 : Convention'), titre);
  });

  it('met la capitale sur un intitulé saisi en minuscules', () => {
    assert.equal(titreArticle('Article 3', 'code de la famille de 1984'), 'Article 3 : Code de la famille de 1984');
  });

  it('ne contient jamais de tiret cadratin', () => {
    assert.ok(!avecMarque(titreArticle('Article 7', ARRETE_LONG)).includes(TIRET_CADRATIN));
  });
});

describe('titreTexte', () => {
  it('donne la référence seule quand il n’y a pas de libellé', () => {
    assert.equal(titreTexte('LOI n° 4-2005'), 'LOI n° 4-2005');
  });

  it('ajoute le libellé descriptif à côté de la référence quand il reste de la place', () => {
    assert.equal(
      titreTexte('Loi n° 4-2005 du 11 avril 2005.', 'code minier'),
      'Loi n° 4-2005 du 11 avril 2005 : code minier',
    );
  });

  it('coupe le libellé au mot pour tenir dans la limite', () => {
    const titre = avecMarque(titreTexte('Décret n° 2025-240 du 20 juin 2025.', 'nomination du directeur général de la société nationale des pétroles du Congo'));
    assert.ok(titre.length <= TITRE_MAX, titre);
    assert.ok(titre.includes('…'), titre);
  });

  it('n’ajoute pas de libellé à une référence déjà coupée', () => {
    const titre = titreTexte(CONVENTION_SANS_OBJET, 'concession portuaire');
    assert.ok(titre.endsWith('…'), titre);
    assert.ok(!titre.includes('concession portuaire'), titre);
  });
});

describe('descriptionTexte', () => {
  const base = { typeName: 'Loi', nbArticles: 198 };

  it('dit ce qu’on trouve dans la page, sans tiret cadratin', () => {
    const description = descriptionTexte({ ...base, titreOfficiel: 'LOI n° 4-2005' });
    assert.equal(description, 'LOI n° 4-2005. Loi de la République du Congo, 198 articles, à lire librement sur Mibeko.');
    assert.ok(!description.includes(TIRET_CADRATIN));
  });

  it('place le libellé descriptif juste après l’intitulé', () => {
    const description = descriptionTexte({
      ...base,
      titreOfficiel: 'Loi n° 4-2005 du 11 avril 2005.',
      libelleDescriptif: 'code minier',
    });
    assert.ok(description.startsWith('Loi n° 4-2005 du 11 avril 2005 : code minier. Loi de la République'), description);
  });

  it('ne dépasse jamais la limite et coupe l’intitulé, pas la fin', () => {
    const description = descriptionTexte({ ...base, titreOfficiel: ARRETE_LONG, typeName: 'Arrêté', nbArticles: 12 });
    assert.ok(description.length <= DESCRIPTION_MAX, `${description.length} : ${description}`);
    assert.ok(description.endsWith('à lire librement sur Mibeko.'), description);
  });

  it('accorde le singulier', () => {
    const description = descriptionTexte({ typeName: 'Décret', nbArticles: 1, titreOfficiel: 'Décret n° 1 du 2 mars 2020' });
    assert.ok(description.includes('1 article, à lire'), description);
  });
});

describe('descriptionArticleVide', () => {
  it('nomme l’article et le texte sans tiret cadratin', () => {
    const description = descriptionArticleVide('Article 5', 'LOI n° 4-2005');
    assert.equal(description, 'Article 5 : LOI n° 4-2005. République du Congo.');
  });
});
