/**
 * Génère l'image de partage (Open Graph) d'une page de texte : titre réel de
 * l'article ou du document, au lieu de l'écusson générique servi partout
 * ailleurs (mibeko-site#27). WhatsApp est le canal de partage dominant au
 * Congo et affiche cette image avant tout — avant le titre, avant le clic.
 *
 * satori (JSX-like → SVG) + resvg (SVG → PNG) : pas de navigateur headless,
 * fonctionne dans le conteneur Node/Alpine de production.
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const WIDTH = 1200;
const HEIGHT = 630;

// public/fonts/*.ttf est copié tel quel dans dist/client/fonts au build
// (comme tout public/) : présent dans l'image Docker de production. En dev
// (`astro dev`), dist/ n'existe pas encore : repli sur public/ directement.
const FONT_DIRS = ['dist/client/fonts', 'public/fonts'];

function loadFont(filename: string): Buffer {
  for (const dir of FONT_DIRS) {
    const candidate = path.join(process.cwd(), dir, filename);
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate);
  }
  throw new Error(`Police introuvable pour l'image de partage : ${filename}`);
}

let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | null = null;
function getFonts() {
  if (!fonts) {
    fonts = [
      { name: 'Inter', data: loadFont('Inter-Regular.ttf'), weight: 400, style: 'normal' },
      { name: 'Inter', data: loadFont('Inter-Bold.ttf'), weight: 700, style: 'normal' },
    ];
  }
  return fonts;
}

export interface OgCardInput {
  /** Type du texte, ex. « Code », « Décret ». Vide si non classé. */
  kicker: string;
  title: string;
  /** Ex. « sgg.cg » ou « ohada.org ». Vide si le périmètre n'en implique aucune. */
  source: string;
}

const COLOR_BG = '#fcf9f8';
const COLOR_PRIMARY = '#03271a';
const COLOR_ON_SURFACE = '#1b1c1c';
const COLOR_MUTED = '#414844';
const COLOR_SECONDARY = '#8f4c31';
const COLOR_SECONDARY_TINT = '#f7e9e2';

export async function renderOgImage({ kicker, title, source }: OgCardInput): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: COLOR_BG,
          padding: '60px 72px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 28, fontWeight: 700, color: COLOR_PRIMARY, letterSpacing: -0.5 },
              children: 'Mibeko',
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: 22 },
              children: [
                kicker
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignSelf: 'flex-start',
                          backgroundColor: COLOR_SECONDARY_TINT,
                          color: COLOR_SECONDARY,
                          fontSize: 22,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          padding: '8px 18px',
                          borderRadius: 6,
                        },
                        children: kicker,
                      },
                    }
                  : null,
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: 46,
                      fontWeight: 700,
                      color: COLOR_ON_SURFACE,
                      lineHeight: 1.2,
                      letterSpacing: -0.5,
                      // Non standard, supporté par satori : tronque proprement
                      // au lieu de laisser un intitulé long déborder du cadre.
                      lineClamp: 4,
                    },
                    children: title,
                  },
                },
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 24, color: COLOR_MUTED },
              children: source ? `Source officielle : ${source}` : 'mibeko.fr',
            },
          },
        ],
      },
    },
    { width: WIDTH, height: HEIGHT, fonts: getFonts() },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}

/** Domaine de la source officielle, pour la ligne de provenance de l'image. */
export function ogSourceFromScope(legalScope: string | undefined | null): string {
  if (legalScope === 'ohada') return 'ohada.org';
  if (legalScope === 'national') return 'sgg.cg';
  return '';
}
