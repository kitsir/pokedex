// src/store/favorites.ts
export type Fav = { id: number; name: string; image: string };

const KEY = "my-pokemon:favs";

const safe: Pick<Storage, "getItem" | "setItem" | "removeItem"> =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function read(): Fav[] {
  try {
    const raw = safe.getItem(KEY);
    return raw ? (JSON.parse(raw) as Fav[]) : [];
  } catch {
    return [];
  }
}
function write(list: Fav[]) {
  try {
    safe.setItem(KEY, JSON.stringify(list));
  } catch { /* noop */ }
}

export function addFav(f: Fav) {
  const list = read();
  if (!list.some((x) => x.id === f.id)) {
    list.push(f);
    write(list);
  }
}
export function removeFav(id: number) {
  write(read().filter((x) => x.id !== id));
}
export function getFavs(): Fav[] {
  return read();
}
export function hasFav(id: number): boolean {
  return read().some((x) => x.id === id);
}

/* optional alias */
export const listFavs = getFavs;
