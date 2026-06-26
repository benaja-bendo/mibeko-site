/**
 * Assainissement du texte légal au rendu (site vitrine).
 *
 * Le fonds est ingéré via un pipeline OCR (mibeko-python / MinerU) qui produit
 * parfois des artefacts LaTeX dans `article_versions.contenu_texte` :
 *   - ordinaux       : `$2^{\mathrm{e}}$`            → « 2e »
 *   - pourcentages   : `$5\%$`                        → « 5% »
 *   - superficies    : `$150~\mathrm{km}^2$`          → « 150 km² »
 *   - coordonnées    : `$14^{\circ}01'08''\mathrm{E}$`→ « 14°01'08''E »
 *   - numéro         : `$n^{\circ}2007$`              → « n°2007 »
 *
 * Cette fonction convertit les motifs LaTeX courants en texte simple. Elle est
 * volontairement conservatrice : elle ne se déclenche que sur des caractères
 * qui n'apparaissent pas dans du texte juridique français légitime
 * (`$ \ ^ _ { } ~`). Le vrai correctif est en amont (réingestion) — voir la
 * note mémoire `code_penal_reliability` / `parsing_improvements_plan`.
 *
 * Les retours à la ligne sont préservés : le corps de l'article est rendu en
 * `white-space: pre-wrap` (cf. `pages/textes/[doc]/[article].astro`).
 */

/** Chiffres et signes en exposant → caractères Unicode (km^2 → km²). */
const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻',
};

export function sanitizeLegalText(input: string): string;
export function sanitizeLegalText(input: null | undefined): null | undefined;
export function sanitizeLegalText(input: string | null): string | null;
export function sanitizeLegalText(input: string | null | undefined): string | null | undefined {
  if (input == null) {
    return input;
  }
  // Chemin rapide : aucun caractère susceptible de porter un artefact LaTeX.
  if (!/[$\\^_{}~]/.test(input)) {
    return input;
  }

  let s = input;

  // 1. Caractères spéciaux échappés en LaTeX → caractère nu (\% → %).
  s = s.replace(/\\([%&#_$])/g, '$1');

  // 2. Délimiteurs mathématiques. Le corpus juridique congolais n'emploie pas
  //    « $ » comme symbole monétaire (devise = FCFA) : on les retire tous.
  s = s.replace(/\$+/g, '');

  // 3. Espacements LaTeX (~, \, \; \: \! \quad \qquad, antislash-espace) → espace.
  s = s
    .replace(/~/g, ' ')
    .replace(/\\[,;:!]/g, ' ')
    .replace(/\\quad\b|\\qquad\b/g, ' ')
    .replace(/\\ /g, ' ');

  // 4. Symboles courants. Traités AVANT la réduction des exposants pour
  //    préserver « n° », les coordonnées en degrés, etc.
  s = s
    .replace(/\^\s*\{\s*\\circ\s*\}/g, '°')
    .replace(/\^\s*\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\^\s*\{\s*\\prime\s*\}/g, '′')
    .replace(/\\prime/g, '′')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\leq(?:slant)?/g, '≤')
    .replace(/\\geq(?:slant)?/g, '≥')
    .replace(/\\(?:textdegree|degree)/g, '°')
    .replace(/\\to\b|\\rightarrow/g, '→')
    .replace(/\\(?:ldots|dots|cdots)/g, '…')
    .replace(/\\section\b|\\S\b/g, '§');

  // 5. Exposants numériques → Unicode (km^2 → km², 10^{23} → 10²³).
  s = s
    .replace(/\^\{([0-9+\-]+)\}/g, (_m, body: string) =>
      [...body].map((c) => SUPERSCRIPT[c] ?? c).join(''),
    )
    .replace(/\^([0-9])(?![0-9])/g, (_m, d: string) => SUPERSCRIPT[d]);

  // 6. Commandes d'emballage : on conserve le contenu. Boucle pour gérer
  //    l'imbrication (\mathrm{\mathbf{x}} → x) du plus interne au plus externe.
  const WRAP =
    /\\(?:mathrm|mathbf|mathit|mathsf|mathtt|mathcal|mathbb|mathfrak|mathnormal|text|textrm|textbf|textit|textsf|texttt|operatorname|boldsymbol|emph|dot|hat|bar|vec|tilde|overline|underline|rm|bf|it)\s*\{([^{}]*)\}/g;
  let previous: string;
  do {
    previous = s;
    s = s.replace(WRAP, '$1');
  } while (s !== previous);

  // 7. Exposants / indices restants : retirer le marqueur, garder le contenu
  //    (1^{er} → 1er ; H_{2}O → H2O ; 4^e → 4e).
  s = s
    .replace(/[\^_]\s*\{([^{}]*)\}/g, '$1')
    .replace(/[\^_]\s*([^\s{}\\^_])/g, '$1');

  // 8. Environnements et commandes LaTeX résiduels.
  s = s
    .replace(/\\(?:begin|end)\s*\{[^{}]*\}/g, ' ')
    .replace(/\\[a-zA-Z]+\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/\\(?![a-zA-Z])/g, '');

  // 9. Accolades orphelines.
  s = s.replace(/[{}]/g, '');

  // 10. Espaces parasites introduits par les suppressions. On ne touche pas
  //     aux retours à la ligne (rendu pre-wrap) ni à la typographie française
  //     des `; : ! ?` (espace fine légitime).
  s = s
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .replace(/[^\S\r\n]+([,.)])/g, '$1')
    .replace(/(\()[^\S\r\n]+/g, '$1')
    .replace(/[^\S\r\n]+$/gm, '');

  return s;
}
