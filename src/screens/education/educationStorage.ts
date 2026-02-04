import { getJSON, setJSON } from "../../shared/storage/storage";

const KEY = "education.favorites.v1";

export async function loadFavoriteIds() {
  return getJSON<string[]>(KEY, []);
}

export async function saveFavoriteIds(ids: string[]) {
  return setJSON(KEY, ids);
}
