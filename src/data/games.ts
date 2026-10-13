/**
 * Web games shown in D:\Games next to Solitaire.
 * Add an entry and drop its icon into /public/svg/games — it appears in Explorer,
 * Start search and the Run dialog automatically.
 */
export interface Game {
  id: string;
  title: string;
  url: string;
  /** Square icon in /public/svg/games, e.g. "/svg/games/catch-up.svg" */
  icon: string;
  /** Games that refuse to run inside an iframe open in a real browser tab */
  external?: boolean;
}

export const GAMES: Game[] = [
  { id: "catch-up", title: "Catch Up", url: "https://catch-up-ziu0.onrender.com", icon: "/svg/games/catch-up.svg" },
];
