import { getJSON, setJSON } from "../../shared/storage/storage";
import type { CbtRecord } from "./cbtTypes";

const KEY = "cbt.records.v1";

export async function loadCbtRecords() {
  return getJSON<CbtRecord[]>(KEY, []);
}

export async function saveCbtRecords(records: CbtRecord[]) {
  return setJSON(KEY, records);
}
