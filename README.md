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
- **Condivisione tramite Google Drive.** Ogni lista è un foglio Google: condividerla
  significa condividere il file. L'app chiede solo il permesso `drive.file`, quindi
  vede esclusivamente i fogli che crea o che l'utente apre esplicitamente.
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
```

Stack: SvelteKit (Svelte 5) con `adapter-static`, TypeScript, Tailwind CSS, Vitest.

### Credenziali Google

Senza credenziali l'app funziona in sola modalità locale. Per le funzioni Google serve un
progetto Google Cloud con le API **Google Sheets**, **Google Drive** e **Google Picker**
attive; poi si copia `.env.example` in `.env` e lo si compila con:

- **OAuth Client ID** di tipo "Applicazione web", con le origini JavaScript autorizzate
  (`http://localhost:5173` per lo sviluppo, il dominio di produzione);
- **API key** limitata ai siti dell'app **e a `https://docs.google.com/*`** (il Picker gira
  in un iframe servito da lì) e alle sole API Google Picker e Google Drive;
- **numero del progetto** (App ID), usato dal Picker.

Sono identificativi pubblici, non segreti: finiscono comunque nel codice che gira nel
browser.

## Deploy

GitHub Actions esegue lint, controllo dei tipi e test a ogni push e pull request, e
pubblica su GitHub Pages a ogni push su `main`. Le credenziali Google sono variabili del
repository (`PUBLIC_GOOGLE_CLIENT_ID`, `PUBLIC_GOOGLE_API_KEY`, `PUBLIC_GOOGLE_APP_ID`).

## Autore

Listo è un progetto di [Federico Di Luca](https://federicodiluca.com/): scopri gli
[altri progetti](https://federicodiluca.com/progetti/). Per contatti:
[listo@federicodiluca.com](mailto:listo@federicodiluca.com).
