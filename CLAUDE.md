# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wat dit is

MADE's eigen website, opgezet vanaf de officiële **Storyblok "Core Space Blueprint: Next.js"** template (zie `README.md`, dat nog de ongewijzigde blueprint-docs bevat). De inhoud staat nog dicht bij de template: vier standaard blokken, minimale styling, `metadata` in `layout.js` staat nog op "Create Next App".

Stack: Next.js 16 (App Router) + React 19 + Storyblok als headless CMS via `@storyblok/react/rsc`, plus anime.js v4 voor de intro-animatie. **Plain JavaScript, geen TypeScript** (`jsconfig.json`, geen `tsconfig.json`). Geen tests, geen testrunner.

Let op: deze map is **geen git-repo** (geen `.git`). Voer geen git-commando's uit en stel geen commits/branches voor zonder eerst met Menno af te stemmen hoe dit project onder versiebeheer hoort te staan.

## Commando's

```sh
npm install
npm run dev     # dev server op http://localhost:3000
npm run build   # productie build
npm start       # productie server
npm run lint    # eslint . (flat config, eslint-config-next/core-web-vitals)
```

Voor de **Storyblok Visual Editor** moet de dev server over HTTPS draaien — anders laadt de preview niet:

```sh
npx next dev --experimental-https
```

In Storyblok staat de default environment op `https://localhost:3000/`, met `/` als Real path van de `home` story.

**ESLint blijft op 9 staan — niet bumpen naar 10.** `eslint-config-next` zet voor alle bestanden de Babel-parser in die in Next zelf gebundeld zit (`next/dist/compiled/babel/eslint-parser`). De scope manager daarvan mist `addGlobals`, dat ESLint 10 vereist, dus elke lintrun crasht met `TypeError: scopeManager.addGlobals is not a function`. De peer-range van `eslint-config-next` staat `^10` wél toe, dus npm waarschuwt hier niet voor. Houd `eslint-config-next` bovendien gelijk aan de `next`-versie.

De flat config importeert `eslint-config-next/core-web-vitals` rechtstreeks; `@eslint/eslintrc` en `FlatCompat` zijn niet meer nodig en zijn verwijderd.

## Architectuur

**Eén centrale registratie, één catch-all route.** Alles loopt via twee bestanden:

1. `src/lib/storyblok.js` — roept `storyblokInit()` aan en exporteert `getStoryblokApi`. Hier staat de **component-map**: de Storyblok blok-naam (`page`, de stroken hieronder, hun nestbare onderdelen en de resten van de blueprint: `feature`, `grid`, `teaser`) gekoppeld aan de React-component. Een nieuw blok bestaat pas als het hier geregistreerd is; anders rendert Storyblok een "component not found"-placeholder.
2. `src/app/[[...slug]]/page.js` — optionele catch-all die elke URL naar een Storyblok story vertaalt (leeg pad → `home`) en aan `<StoryblokStory>` geeft. Nieuwe pagina's vereisen dus **geen** nieuwe route; ze ontstaan door een story in Storyblok aan te maken. Dit bestand exporteert ook `generateMetadata`, dat `page_title` en `page_description` van het `page`-blok naar `<title>` en de meta-description vertaalt; zijn ze leeg, dan valt Next terug op de `metadata` in `layout.js`.

`src/lib/stories.js` bevat het daadwerkelijke ophalen, verpakt in React `cache()`. Zowel `generateMetadata` als de pagina zelf roepen `getStory()` aan, en dankzij die cache is dat samen één API-call per request. **Importeer dit bestand nooit vanuit een client component** — `cache()` is server-only. `src/lib/storyblok.js` zit wél in de client-graph (via `StoryblokProvider`), dus daar hoort geen server-only code in; vandaar de splitsing.

**Server components zijn de default.** De blok-componenten in `src/components/` zijn RSC's: ze krijgen één prop `blok`, spreiden `storyblokEditable(blok)` op hun root-element (nodig voor klikbaarheid in de Visual Editor) en renderen geneste bloks met `<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />`. `StoryblokProvider.jsx` is het enige `'use client'`-bestand; het wrapt de hele app in `layout.js` en initialiseert de bridge client-side.

Een nieuw blok toevoegen = component in `src/components/` + entry in de `components`-map in `src/lib/storyblok.js` + het blok aanmaken in de Storyblok space.

**De stroken.** Elke strook is één blok dat je in `body` van een `page` zet.
Ze komen allemaal uit het designcanvas:

| Blok | Onderdelen |
| --- | --- |
| `hero` | `nav_link`, `button` (beeldkant: twee slashes of een nachtgroen vlak) |
| `loopband` | — (steekwoorden, één per regel) |
| `profielen` | `profiel` |
| `over_ons` | `team_lid` |
| `tekst` | `button` |
| `tekst_beeld` | `button` |
| `stappen` | `stap` |
| `werk` | `werk_item` |
| `diensten` | `dienst_groep` → `dienst` |
| `pakketten` | `pakket` |
| `stellingen` | `stelling` |
| `cta` | `button` |
| `contact` | `contact_persoon` |
| `voet` | `voet_kolom` → `nav_link` |

Ze delen drie dingen:

- Het kapitalenlabel boven de kop is `StrookLabel.jsx` (klasse `strook-label`),
  de tweekoloms kop van een strook met kaarten is `StrookKop.jsx`. Bouw dat niet
  per strook opnieuw na.
- De binnenmaat is één gedeelde CSS-regel in `globals.css` (`…__binnen` voor
  alle stroken samen): `--made-maat-inhoud` breed, `clamp()` marges, en onder
  900px klappen de tweekoloms stroken naar één kolom.
- Elk blok heeft een `anchor`-veld, zodat een `nav_link` ernaartoe kan springen.

**Het vlak waarop een strook staat** is een veld (`vlak`: standaard, verhoogd,
nachtgroen) en in CSS één modifier — `.strook--verhoogd` en
`.strook--nachtgroen` in `globals.css` zetten alleen de *rollen* om
(`--made-oppervlak`, `--made-inhoud`, `--made-link`, de logotokens), plus een
`@media (prefers-color-scheme: dark)`-blok dat ze een slag verschuift zodat een
nachtgroen strook niet samenvalt met een nachtgroen pagina. Geef een nieuwe
strook die modifier via `strookKlassen()` uit `src/lib/stroken.js` en je hoeft
verder niets per kleur te regelen. De voet gebruikt dezelfde regel.

Nog drie dingen die in de code zitten:

- De nummers in `stappen` komen uit een **CSS-counter** op `.stappen__lijst`,
  niet uit de inhoud. Een stap ertussen schuiven hoeft dus alleen in Storyblok.
- `werk__cases` is een grid van **twaalf kolommen**; een `werk_item` zegt met
  `breedte` of hij 5, 6 of 7 kolommen inneemt. Onder 900px staat alles onder
  elkaar. Een case met link wordt één grote `<a>`; die heeft `color: inherit`
  nodig, anders trekt de globale `a:hover` de hele kaart amber.
- De loopband staat er twee keer in en schuift precies `-50%` op; daardoor is de
  lus naadloos. Bij `prefers-reduced-motion: reduce` staat hij stil, en hij is
  `aria-hidden` omdat dezelfde woorden verderop in de diensten staan.

De hero heeft twee beeldkanten (`beeld_variant`): de twee losse slashes, of het
nachtgroen vlak met de slash die eruit loopt, een label en het beeldmerk erin
(`Beeldmerk.jsx`, de tegel uit het designsysteem). De maten van dat vlak zijn
verhoudingen van 560 × 500, dus het schaalt mee met de kolom. Let op: scène 4
van de intro animeert de hero-elementen op naam — `.hero__beeldvlak` staat in
diezelfde selector in `IntroAnimatie.jsx`, dus een derde variant moet daar ook
bij.

`tekst_beeld` dekt zowel "Tekst naast beeld" als "Beeld naast tekst": het veld
`beeld_positie` draait alleen de CSS-volgorde om, de markup houdt de tekst
vooraan in de leesvolgorde. Het uitgelichte pakket staat op nachtgroen in
**beide** thema's; die kleuren lopen via de `--made-uitgelicht-*`-tokens, dus
vertak ook hier niet in JavaScript op het thema.

Het contactformulier post naar wat er in `formulier_actie` staat. Zolang dat
leeg is, wordt het formulier wel getoond maar is versturen nog niet aangesloten;
er is geen route of server action die het afvangt. De keuzerondjes "naar wie
gaat je bericht" komen uit dezelfde `personen` als de kaarten ernaast.

**Blok-schema's staan in de repo**, op de plek waar de Storyblok CLI ze verwacht: `.storyblok/components/295294118476970/components.json` (space "Made Website"). Pas dit bestand aan en push het, in plaats van velden met de hand in de UI te klikken — anders lopen repo en space uiteen.

```sh
storyblok login
storyblok components pull --space 295294118476970   # space -> schijf
storyblok components push --space 295294118476970   # schijf -> space
```

Drie dingen over dit bestand die makkelijk misgaan:

- Het pad ligt vast. De CLI leest uit `<basisdir>/components/<space-id>/` en accepteert geen vrij bestandspad; de basisdir is `.storyblok` tenzij je `-p` meegeeft.
- De inhoud is een **platte array** van blok-objecten, niet `{"components": [...]}`. De CLI itereert direct over de array en herkent per item of het een blok, een groep, een tag of een preset is.
- De commando's heten `components pull` / `components push`. Het oude `push-components` uit CLI v3 bestaat niet meer; `--from` valt terug op `--space`, dus voor één space is die vlag overbodig.

`pull` overschrijft dit bestand met wat er in de space staat, dus push je lokale wijzigingen eerst. De `logs/` en `reports/` die de CLI ernaast aanmaakt staan in `.gitignore`.

`NavLink.jsx` rendert met de klasse `made-navlink` (niet `hero__menulink`): de
voet gebruikt hetzelfde blok en zet er via `.voet .made-navlink` een rustigere
stijl op.

`src/lib/links.js` vertaalt Storyblok multilink-velden naar een `href`; `story`-links worden een pad, `home` wordt `/`. Interne paden (alles wat met `/` begint) renderen als `next/link`, externe links, `mailto:` en ankers als gewone `<a>` — `@next/next/no-html-link-for-pages` slaat anders aan.

## Storyblok-configuratie

`next.config.mjs` zet `STORYBLOK_DELIVERY_API_TOKEN`, `STORYBLOK_API_BASE_URL` en `STORYBLOK_REGION` bewust door naar de **publieke bundle** — dat hoort zo voor de preview/bridge, maar betekent dat hier alleen een *preview*-token thuishoort, nooit een management token.

`src/lib/stories.js` kiest de Storyblok-versie: `draft` in development, `published` in productie. `STORYBLOK_VERSION` overschrijft dat expliciet — zet die op `draft` voor een previewdeploy waar de Visual Editor op draait, anders ziet de editor daar alleen gepubliceerde content. Die variabele staat bewust **niet** in de `env`-blok van `next.config.mjs`: `stories.js` draait alleen server-side, dus hij hoeft niet in de publieke bundle.

Gevolg: een story die nog niet is gepubliceerd geeft in productie een 404, ook al ziet hij er in de Visual Editor goed uit. Bij "werkt lokaal, 404 op productie" is dat de eerste plek om te kijken.

`.env.example` bevat de te zetten variabelen; `region` valt terug op `'eu'`.

## Designsysteem en thema's

De huisstijl komt uit het MADE-designsysteem (designtokens uit huisstijlhandboek 1.0) en staat volledig in `src/app/globals.css` als CSS-variabelen. Twee lagen:

- **Merkkleuren** (`--made-nachtgroen`, `--made-amber`, `--made-krijt`, ...) zijn vast en veranderen nooit.
- **Rollen** (`--made-oppervlak`, `--made-inhoud`, `--made-link`, ...) wijzen naar merkkleuren en worden onder `@media (prefers-color-scheme: dark)` opnieuw gezet. Gebruik in componenten altijd de rol, nooit de merkkleur direct.

Het donkere thema volgt **alleen** de systeeminstelling; er is bewust geen handmatige schakelaar en geen `data-theme`-attribuut in de app. Daardoor is er één set markup voor beide thema's: onderdelen die niet op een bestaande rol passen (logo-inkt, de achterste slash, de heroleur van het label) hebben een eigen token — `--made-logo-woord`, `--made-logo-slash`, `--made-slash-achter`, `--made-hero-label` — dat per thema wisselt. **Vertak dus nooit in JavaScript op het thema**: dat geeft hydration-mismatches, en het is niet nodig.

Twee toegankelijkheidsregels uit het handboek die makkelijk fout gaan: `--made-accent` (amber) haalt 2,7:1 op krijt en mag **nooit** tekstkleur zijn — gebruik `--made-link`. En op amber hoort `--made-op-accent` (nachtgroen), nooit krijt.

Fonts (Nunito voor koppen, Instrument Sans voor tekst) laden via `next/font/google` in `layout.js` en komen als `--font-nunito` / `--font-instrument-sans` binnen; `globals.css` verpakt ze in `--font-kop` en `--font-tekst`.

## Intro-animatie

`src/components/IntroAnimatie.jsx` (het tweede `'use client'`-bestand) legt bij de eerste paginalading een laag over de site en speelt het logo in vier scènes af met **anime.js v4** (`animejs`): MADE tekent zich in → MA en DE schuiven uiteen en typen zich uit tot MARKETING en DEVELOPMENT → dat wordt gewist, de helften komen samen en de slash plus tagline verschijnen → het logo vliegt naar het logo in de hero-navigatie en de hero-inhoud komt met een stagger tevoorschijn. `layout.js` rendert het component als eerste kind van `<body>`, zodat de overlay al in de server-HTML zit voordat de pagina zichtbaar wordt.

Spelregels die in de code zitten en die je niet moet omzeilen:

- De intro speelt **één keer per browsersessie** (`sessionStorage`-sleutel `made-intro-gezien`), niet bij `prefers-reduced-motion: reduce` en niet in een iframe (de Storyblok Visual Editor). Met `?intro` in de URL speelt hij altijd — handig bij het afstemmen. Een inline `<script>` direct na de overlay verbergt hem vóór hydration als hij niet hoort te spelen; daarom staat er `suppressHydrationWarning` op de root en `.made-intro[hidden] { display: none }` in de CSS.
- De lettervormen staan in `src/lib/woordmerk.js`: M, A, D en E zijn de paden uit `Logo.jsx` verschoven naar x = 0, de overige letters zijn in dezelfde geometrie (lijn 22, kaphoogte 11–89) bijgetekend en bestaan alleen voor de intro. Het logo in scène 3 gebruikt de exacte coördinaten van `Logo.jsx`, zodat het aan het eind pixelprecies op het navigatielogo landt (de eindpositie wordt live gemeten met `getBoundingClientRect`).
- Alle geometrie is in svg-eenheden waarbij 1 eenheid = 1 css-pixel en (0, 0) het schermmidden is (de `<svg>` is 100 × 100 met `overflow: visible`). De schaal zit op één buitenste groep; verplaatsen gebeurt met `translateX`/`translateY` op `<g>`-elementen (CSS-transforms, niet het `transform`-attribuut — anime.js schrijft naar `style.transform`). Gebruik geen `x`/`y` als tweenproperty op SVG-elementen: anime.js ziet die als attribuut.
- Kleuren lopen via `--made-logo-woord`, `--made-logo-slash`, `--made-logo-tagline` en `--made-oppervlak`, dus het thema volgt vanzelf; er is geen JavaScript-vertakking op het thema.
- Onder 720px komen MARKETING en DEVELOPMENT onder elkaar; de marge tot de schermrand is 6vw (max 56px).
- Zolang de intro speelt staat `made-intro-actief` op `<body>` (scroll-lock). Escape of de knop "Overslaan" springt naar de overdracht. Bij unmount ruimt het component alle inline stijlen op de hero-elementen op.

In development hangt het component `window.__madeIntro = { tijdlijn, overslaan }` aan het venster; met `tijdlijn.pause()` en `tijdlijn.seek(ms)` stap je door de scènes. Let op: de anime.js-engine pauzeert zolang het document `hidden` is (tabwissel), dat is bewust en hoort zo.

## Onthullen bij scroll

Naast de intro is er één site-breed mechanisme voor binnenkomst-animaties:
`src/components/Onthullen.jsx` (het derde `'use client'`-bestand, gerenderd in
`layout.js`). Een element doet mee zodra het `data-onthul=""` als attribuut
heeft — verder is er niets te regelen. Een IntersectionObserver zet dat
attribuut op `zichtbaar` wanneer het element in beeld scrollt, en laat het
daarna los; de beweging zelf (opacity plus een translateY van 20px, 900ms met
`cubic-bezier(0.16, 1, 0.3, 1)`) staat volledig in `globals.css`.

Elementen die in dezelfde waarneming binnenkomen worden op **documentvolgorde**
gesorteerd en krijgen een oplopende `--onthul-index`, goed voor 80ms extra
vertraging per stap (`--onthul-trede`, afgetopt op zes stappen). Zo verschijnt
een strook als een golf zonder dat een blok zelf indexen hoeft bij te houden.
Een element kan de afstand bijstellen met `--onthul-afstand` (de teamkaarten
staan op 26px).

Drie dingen die hier makkelijk misgaan:

- De begintoestand staat achter `@media (scripting: enabled) and
  (prefers-reduced-motion: no-preference)`. Zonder JavaScript zet niemand het
  attribuut om, en dan hoort alles gewoon zichtbaar te zijn; bij minder
  beweging geldt het blok evenmin en is het component een no-op. **Zet die
  begintoestand dus nooit buiten die media query.**
- De vertraging hoort als `transition-delay` op het element zelf, niet als
  custom property op `:root`. Een `calc()` in een custom property wordt op
  `:root` al uitgerekend, waar `--onthul-index` niet bestaat, en erft dan als
  vaste `0s`.
- De hero-elementen dragen `data-onthul` én worden in scène 4 van de intro
  geanimeerd. `IntroAnimatie.jsx` **verwijdert dat attribuut** bij de
  overdracht, en zet het niet op `zichtbaar`. Zolang het erop staat geldt de
  transitie van 900ms, en die kruipt achter elke waarde aan die anime.js
  schrijft: je ziet de hero dan al half staan voordat de vlucht hem inanimeert.
  Zonder attribuut is de tijdlijn de enige die ze beweegt. De hero komt bij die
  overdracht bewust als één geheel mee met het wegvallen van de overlay, zonder
  stagger; de trapsgewijze opbouw hoort bij een bezoek zonder intro.

## Conventies

- **Prettier**: tabs (`useTabs: true`), single quotes in JS, double quotes in JSX-attributen, semicolons, printWidth 80. Prettier staat niet in `package.json` — er is geen `format`-script, dus formatteer handmatig conform `.prettierrc`.
- Import-alias `@/*` → `./src/*`.
- Styling is plain CSS in `src/app/globals.css`, met BEM-achtige klassen (`hero__titel`, `made-knop--primair`). Geen CSS-modules, geen Tailwind, geen CSS-in-JS.

## Deploy

Zowel Netlify (`netlify.toml`, `@netlify/plugin-nextjs`) als Vercel (`vercel.json`) zijn geconfigureerd. Welke van de twee daadwerkelijk live staat is uit de repo niet af te leiden — vraag het bij twijfel.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
