# Listo

Liste personalizzabili in cui ogni elemento può stare in più categorie contemporaneamente.

**[listo.federicodiluca.com](https://listo.federicodiluca.com/)** — in costruzione.

Nasce da un problema concreto: l'inventario del congelatore su Google Keep, dove il
minestrone pronto non può stare sia sotto "verdure" sia sotto "piatti pronti". Listo
non è un inventario fisso: ognuno crea le proprie liste e le proprie categorie.

## Come funziona

- **Nessun server, nessun dato raccolto.** L'app è un sito statico. I dati restano sul
  dispositivo (IndexedDB) oppure, se si sceglie di sincronizzare, in un foglio Google
  nel Drive di chi la usa.
- **Local-first.** L'interfaccia legge e scrive solo il database locale, quindi funziona
  anche senza rete. Ogni record ha un `updatedAt`, e le eliminazioni restano come
  "lapidi" (`deletedAt`) per poter essere sincronizzate.
- **Sincronizzazione facoltativa con Google Drive.** Un unico foglio Google nel Drive
  dell'utente fa da copia condivisa tra i dispositivi: a ogni sincronizzazione l'app lo
  legge, unisce i dati record per record (vince la modifica più recente) e lo riscrive
  solo se serve. L'app chiede solo il permesso `drive.file`, quindi vede esclusivamente
  il file che ha creato lei.
- **PWA installabile, anche offline.** Un service worker scritto a mano
  (`src/service-worker.ts`) tiene in cache l'app: il codice con hash dalla cache, le
  pagine dalla rete con un limite di 3 secondi e poi dalla cache. Con i dati già in
  IndexedDB, l'app si apre e si usa anche senza rete.
- **Landing pre-renderizzata, app lato client.** Le pagine pubbliche sono HTML statico
  indicizzabile; l'area `/app` gira solo nel browser ed è esclusa dall'indicizzazione.

## Sviluppo

Node 22 (vedi `.nvmrc`).

```bash
npm install
npm run dev
npm test         # test unitari (Vitest)
npm run check    # controllo dei tipi (svelte-check)
npm run lint     # Prettier + ESLint
npm run build    # sito statico in build/
npm run icons:build  # rigenera le icone PNG da static/favicon.svg
```

Stack: SvelteKit (Svelte 5) con `adapter-static`, TypeScript, Tailwind CSS, Vitest.

### Credenziali Google

Senza credenziali l'app funziona in sola modalità locale. Per le funzioni Google serve un
progetto Google Cloud con le API **Google Sheets** e **Google Drive** attive e un **OAuth
Client ID** di tipo "Applicazione web", con le origini JavaScript autorizzate
(`http://localhost:5173` per lo sviluppo e il dominio di produzione). Si copia poi
`.env.example` in `.env` e si inserisce il Client ID.

Il Client ID è un identificativo pubblico, non un segreto: finisce comunque nel codice che
gira nel browser.

## Deploy

GitHub Actions esegue lint, controllo dei tipi e test a ogni push e pull request, e
pubblica su GitHub Pages a ogni push su `main`. Il Client ID Google è una variabile del
repository (`PUBLIC_GOOGLE_CLIENT_ID`).

## Autore

Listo è un progetto di [Federico Di Luca](https://federicodiluca.com/): scopri gli
[altri progetti](https://federicodiluca.com/progetti/). Per contatti:
[listo@federicodiluca.com](mailto:listo@federicodiluca.com).
