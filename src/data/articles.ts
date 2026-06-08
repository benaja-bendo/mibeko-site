export interface Article {
  id: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  content?: string;
}

export const categories = [
  'Tout', 
  'Droit commercial', 
  'Droit du travail', 
  'OHADA', 
  'Droit de la famille', 
  "Création d'entreprise"
];

export const articles: Article[] = [
  {
    id: '1',
    tag: 'Droit commercial',
    date: '12 mai 2026',
    title: "Révision de l'Acte Uniforme OHADA sur le Droit Commercial Général",
    description: "Les nouvelles dispositions concernant le registre du commerce et du crédit mobilier (RCCM) entrent en vigueur ce trimestre. Décryptage des implications pour les PME et les startups de la région.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800&h=400",
    content: "Le nouvel Acte Uniforme sur le Droit Commercial Général introduit des changements majeurs visant à simplifier l'immatriculation au RCCM..."
  },
  {
    id: '2',
    tag: 'Droit du travail',
    date: '05 mai 2026',
    title: "Nouveau barème des indemnités de licenciement",
    description: "Publication de l'arrêté ministériel fixant les nouvelles modalités de calcul des indemnités de fin de carrière et de licenciement. Ce qu'il faut savoir en tant qu'employeur.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800&h=400",
    content: "L'arrêté ministériel publié le 2 mai 2026 redéfinit les planchers et plafonds des indemnités de licenciement, offrant plus de flexibilité mais imposant un calcul rigoureux..."
  },
  {
    id: '3',
    tag: "Création d'entreprise",
    date: '28 avril 2026',
    title: "Créer une SARL au Congo : le guide complet 2026",
    description: "Étapes, coûts, délais et pièces à fournir pour immatriculer votre société. Un guide pratique en français simple, à jour des dernières réformes administratives.",
    imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800&h=400",
    content: "Créer une SARL n'a jamais été aussi rapide. Depuis l'informatisation des guichets uniques, le délai moyen est passé de 3 semaines à 72h. Voici les documents nécessaires..."
  },
  {
    id: '4',
    tag: 'Droit de la famille',
    date: '15 avril 2026',
    title: "Divorce : comprendre vos droits et la procédure",
    description: "Procédure, garde des enfants, partage des biens : tout ce que la loi congolaise prévoit, expliqué sans jargon pour les citoyens.",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800&h=400",
    content: "Le Code de la famille détaille les conditions du divorce par consentement mutuel et pour faute. Les démarches de médiation sont obligatoires avant toute saisine du juge..."
  },
  {
    id: '5',
    tag: 'OHADA',
    date: '02 avril 2026',
    title: "Sûretés OHADA : ce qui change pour les garanties bancaires",
    description: "Panorama des évolutions récentes de l'Acte Uniforme portant organisation des sûretés et leurs conséquences pratiques sur le financement des entreprises.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800&h=400",
    content: "L'élargissement du champ des sûretés mobilières permet désormais aux PME d'utiliser des actifs immatériels (propriété intellectuelle, créances futures) comme garanties..."
  },
  {
    id: '6',
    tag: 'Droit commercial',
    date: '20 mars 2026',
    title: "Bail commercial : droits et obligations du locataire",
    description: "Durée, renouvellement, loyer, résiliation : les points essentiels du bail commercial à connaître impérativement avant de signer un contrat.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=400",
    content: "Le droit au renouvellement est d'ordre public dans l'espace OHADA, protégeant ainsi le fonds de commerce du locataire. Attention cependant aux clauses de résiliation anticipée..."
  },
];
