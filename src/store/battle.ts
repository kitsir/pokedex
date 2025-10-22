// src/store/battle.ts
export type PendingSlots = { A?: string; B?: string };

const KEY = "battle:slots";

// ใช้ storage แบบปลอดภัย (กัน SSR/ไม่มี window)
const safeStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> =
  typeof window !== "undefined" && window.sessionStorage
    ? window.sessionStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

/** ดึงคิวแล้วลบทิ้ง (ใช้บนหน้า Battle) */
export function popBattleSlots(): PendingSlots {
  try {
    const raw = safeStorage.getItem(KEY);
    if (!raw) return {};
    const cur = JSON.parse(raw) as PendingSlots;
    safeStorage.removeItem(KEY);
    return cur ?? {};
  } catch {
    return {};
  }
}

/** อ่านคิวโดยไม่ลบ (ใช้บนหน้าอื่นๆ ถ้าต้องโชว์สถานะ) */
export function peekBattleSlots(): PendingSlots {
  try {
    const raw = safeStorage.getItem(KEY);
    if (!raw) return {};
    return (JSON.parse(raw) as PendingSlots) ?? {};
  } catch {
    return {};
  }
}

/** ตั้ง/อัปเดตคิวฝั่ง A/B */
export function pushBattleSlot(side: "A" | "B", idOrName: string | number): PendingSlots {
  const raw = safeStorage.getItem(KEY);
  const cur: PendingSlots = raw ? (JSON.parse(raw) as PendingSlots) : {};
  cur[side] = String(idOrName);
  safeStorage.setItem(KEY, JSON.stringify(cur));
  return cur;
}

/** ✅ alias เพื่อความเข้ากันได้กับโค้ดเดิม */
export const setBattleSlot = pushBattleSlot;

/** ล้างคิว */
export function clearBattleSlots() {
  safeStorage.removeItem(KEY);
}
