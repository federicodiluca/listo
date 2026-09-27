// The app works on data that only exists in the browser (IndexedDB, Google token),
// so there is nothing meaningful to render at build time: prerender an empty shell
// and let the client do the work.
export const ssr = false;
