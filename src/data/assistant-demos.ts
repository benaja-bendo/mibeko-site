/**
 * Démonstrations figées de l'Assistant Mibeko.
 *
 * POURQUOI FIGÉES : la règle absolue du dépôt interdit toute IA conversationnelle
 * sur mibeko.fr (pas de compte, pas d'état utilisateur, pas d'appel LLM exposé aux
 * anonymes). La décision du 31/07/2026 (`docs/decisions.md`) tranche : « trois démos
 * figées, 80 % de la valeur, 0 % du risque ». Ce module en est la source unique.
 *
 * CE QUI EST PROUVÉ ICI : chaque source porte l'extrait *verbatim* du corpus et un
 * lien vers la page publique de l'article. Le lecteur clique et vérifie sur ce site
 * même — c'est la loi 1 de la charte (« la preuve avant la promesse »). Une
 * démonstration dont un lien casse détruit exactement ce qu'elle prétend établir :
 * voir la vérification dans `docs/design-system.md` avant toute modification.
 *
 * DEUX ÉTATS. Tant que `answer` vaut `null`, la démonstration montre la question et
 * les articles du fonds qui y répondent — ce qui est vrai et vérifiable dès
 * aujourd'hui. Dès qu'une réponse réelle de l'Assistant est capturée, on renseigne
 * `answer` (verbatim, marqueurs [n] compris) *et* `capturedOn` : les deux vont
 * ensemble, une réponse sans date est invérifiable donc invalide.
 *
 * Les extraits et les numéros d'article ont été relevés sur l'API publique de
 * production le 25 août 2026. Ils ne sont pas recopiés à la main d'un PDF.
 */

export type DemoSource = {
	/** Numéro de citation affiché dans la réponse : [1], [2]… */
	marker: number;
	/** Libellé lisible : « Article 123 — Acte uniforme portant droit commercial général ». */
	label: string;
	/** Extrait verbatim du corpus publié. Jamais reformulé. */
	excerpt: string;
	/** Chemin public de l'article sur ce site. Doit répondre 200. */
	href: string;
};

export type AssistantDemo = {
	slug: string;
	audience: 'citoyen' | 'professionnel';
	/** Une ligne de contexte : à qui la question se pose, concrètement. */
	context: string;
	question: string;
	/** Réponse réelle de l'Assistant, verbatim, marqueurs [n] inline. `null` tant qu'aucune capture n'existe. */
	answer: string | null;
	/** Date de la capture (ISO). Obligatoire dès que `answer` est renseignée. */
	capturedOn: string | null;
	sources: DemoSource[];
};

export const assistantDemos: AssistantDemo[] = [
	{
		slug: 'renouvellement-bail-professionnel',
		audience: 'citoyen',
		context: "Un commerçant dont le bail arrive à terme",
		question: "Mon bailleur peut-il refuser de renouveler mon bail commercial ?",
		answer: null,
		capturedOn: null,
		sources: [
			{
				marker: 1,
				label: "Article 123 — Acte uniforme portant droit commercial général",
				excerpt:
					"Le droit au renouvellement du bail à durée déterminée ou indéterminée est acquis au preneur qui justifie avoir exploité, conformément aux stipulations du bail, l'activité prévue à celui-ci, pendant une durée minimale de deux ans. Aucune stipulation du contrat ne peut faire échec au droit au renouvellement.",
				href: '/textes/acte-uniforme-portant-droit-commercial-general/article-123',
			},
			{
				marker: 2,
				label: "Article 127 — Acte uniforme portant droit commercial général",
				excerpt:
					"Le bailleur peut s'opposer au droit au renouvellement du bail à durée déterminée ou indéterminée, sans avoir à régler d'indemnité d'éviction, dans les cas suivants […]",
				href: '/textes/acte-uniforme-portant-droit-commercial-general/article-127',
			},
		],
	},
	{
		slug: 'filiation-enfant-hors-mariage',
		audience: 'citoyen',
		context: "Un parent qui veut établir la filiation de son enfant",
		question: "Comment prouver la filiation d'un enfant né hors mariage ?",
		answer: null,
		capturedOn: null,
		sources: [
			{
				marker: 1,
				label: "Article 263 — Code de la famille",
				excerpt:
					"La filiation maternelle ou paternelle d'un enfant né hors mariage se prouve par l'acte de naissance ou par une déclaration judiciaire homologuée.",
				href: '/textes/code-de-la-famille-de-1984/article-263',
			},
			{
				marker: 2,
				label: "Article 273 — Code de la famille",
				excerpt:
					"Tout enfant dont la filiation paternelle n'est qu'apparente peut réclamer des aliments à celui qui a eu des relations suivies ou notoires avec sa mère […]",
				href: '/textes/code-de-la-famille-de-1984/article-273',
			},
		],
	},
	{
		slug: 'cession-fonds-de-commerce',
		audience: 'professionnel',
		context: "Un juriste qui rédige un acte de cession",
		question: "Quelles mentions l'acte de cession d'un fonds de commerce doit-il énoncer ?",
		answer: null,
		capturedOn: null,
		sources: [
			{
				marker: 1,
				label: "Article 149 — Acte uniforme portant droit commercial général",
				excerpt:
					"La vente d'un fonds de commerce peut être réalisée soit par acte sous seing privé, soit par acte authentique. Les dispositions du présent Chapitre s'appliquent à tout acte constatant une cession de fonds de commerce, consentie même sous condition, y compris en cas d'apport d'un fonds de commerce à une société.",
				href: '/textes/acte-uniforme-portant-droit-commercial-general/article-149',
			},
			{
				marker: 2,
				label: "Article 150 — Acte uniforme portant droit commercial général",
				excerpt:
					"Tout acte constatant la cession d'un fonds de commerce doit énoncer : 1°) pour les personnes physiques, l'état civil complet du vendeur et de l'acheteur […] 3°) leurs numéros d'immatriculation au Registre du Commerce et du Crédit Mobilier […] 6°) le chiffre d'affaires réalisé au cours de chacune des trois dernières années d'exploitation […]",
				href: '/textes/acte-uniforme-portant-droit-commercial-general/article-150',
			},
		],
	},
];

/**
 * La démonstration mise en avant hors de la page dédiée (accueil, murs de
 * conversion). On prend la première citoyenne : l'accueil reçoit un public
 * général, et le bail professionnel parle à un commerçant comme à son conseil.
 */
export const featuredDemo: AssistantDemo = assistantDemos[0];
