/**
 * Mise en paragraphes du texte légal au rendu (site vitrine uniquement).
 *
 * `contenu_texte` porte encore la mise en page du PDF source : une ligne du
 * scan devient une ligne du texte stocké, sans rapport avec les phrases ou
 * les paragraphes réels. La charte visuelle (`docs/design-system.md` § 8,
 * « Corps d'article ») est explicite : « les retours à la ligne hérités du
 * PDF source sont supprimés à l'affichage » — c'est un rendu, pas une
 * correction de contenu : aucun caractère du texte n'est modifié, seule
 * l'interprétation des sauts de ligne change.
 *
 * Deux signaux structurels seulement sont utilisés, parce que ce sont les
 * deux qui apparaissent de façon fiable dans le corpus :
 *   - une ligne vide sépare deux paragraphes ;
 *   - une ligne qui commence par un tiret introduit un élément de liste,
 *     que le texte de l'item suive sur la même ligne ou sur les lignes
 *     suivantes jusqu'au tiret ou à la ligne vide suivants (les deux formes
 *     coexistent dans le corpus).
 * Le reste du texte est rejoint en prose continue. Aucune détection de
 * titre d'article ou de chapitre : trop peu fiable sur du texte OCR pour ne
 * pas risquer de couper une phrase au mauvais endroit.
 */

export type LegalTextBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

const LIST_MARKER = /^[-•*]\s*(.*)$/;

export function reflowLegalText(raw: string): LegalTextBlock[] {
  const lines = raw.split('\n').map((line) => line.trim());
  const blocks: LegalTextBlock[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] | null = null;

  const flushParagraph = () => {
    const text = paragraphBuffer.join(' ').trim();
    if (text !== '') {
      blocks.push({ kind: 'paragraph', text });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer && listBuffer.length > 0) {
      blocks.push({ kind: 'list', items: listBuffer.map((item) => item.trim()).filter(Boolean) });
    }
    listBuffer = null;
  };

  for (const line of lines) {
    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const marker = LIST_MARKER.exec(line);
    if (marker) {
      flushParagraph();
      if (!listBuffer) {
        listBuffer = [];
      }
      listBuffer.push(marker[1]);
      continue;
    }

    if (listBuffer) {
      // Suite d'un item de liste dont le texte continue sur la ligne suivante
      // (forme « tiret seul sur sa ligne, texte en dessous »).
      const lastIndex = listBuffer.length - 1;
      listBuffer[lastIndex] = `${listBuffer[lastIndex]} ${line}`.trim();
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
