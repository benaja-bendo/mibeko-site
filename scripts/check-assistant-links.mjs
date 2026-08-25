/**
 * Vérifie que chaque article cité par une démonstration de l'Assistant Mibeko
 * répond bien 200 sur le site public.
 *
 * POURQUOI CE SCRIPT EXISTE : la valeur entière de ces démonstrations tient à
 * ce que le lecteur puisse cliquer et vérifier. Une citation qui mène à un 404
 * détruit précisément ce qu'elle prétend établir — et cela peut arriver sans
 * qu'on touche au site, si le texte est dépublié ou si son slug change côté
 * corpus. À rejouer après toute évolution du fonds, pas seulement après un
 * changement de code.
 *
 *   node scripts/check-assistant-links.mjs                  # contre mibeko.fr
 *   node scripts/check-assistant-links.mjs http://localhost:4330
 */
import { assistantDemos } from '../src/data/assistant-demos.ts';

const base = (process.argv[2] ?? 'https://mibeko.fr').replace(/\/$/, '');
const cites = assistantDemos.flatMap((demo) =>
	demo.sources.map((source) => ({ demo: demo.slug, label: source.label, href: source.href }))
);

let failed = 0;
for (const cite of cites) {
	const url = `${base}${cite.href}`;
	let status;
	try {
		status = (await fetch(url, { redirect: 'follow' })).status;
	} catch (error) {
		status = `échec réseau (${error.message})`;
	}
	const ok = status === 200;
	if (!ok) failed++;
	console.log(`${ok ? 'ok  ' : 'ÉCHEC'} ${String(status).padEnd(6)} ${cite.href}`);
	if (!ok) console.log(`      → ${cite.demo} · ${cite.label}`);
}

console.log(`\n${cites.length - failed}/${cites.length} citations vérifiées sur ${base}`);
process.exit(failed === 0 ? 0 : 1);
