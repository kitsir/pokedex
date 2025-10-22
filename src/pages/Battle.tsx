// src/pages/Battle.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPokemon,
  officialArtworkUrl,
  getCombinedDefensiveMultipliers,
} from "../api/pokeapi";
import type { Pokemon } from "../types/pokemon";
import { popBattleSlots } from "../store/battle";

/* ====================== Types ====================== */
type Side = "A" | "B";
type Fighter = { data: Pokemon | null; currentHp: number; moveType: string | null };
type DamageMap = Record<string, number>;
type TurnLog = {
  attacker: Side; defender: Side; nameAtk: string; nameDef: string;
  moveType: string; damage: number; effectiveness: number; crit: boolean; defenderRemain: number;
};
type WithOfficialArtwork = {
  sprites?: { other?: { ["official-artwork"]?: { front_default?: string | null } } };
};

/** รูปแบบข้อมูลที่บีบอัดเก็บใน storage (เลี่ยง any) */
type SavedFighter = {
  id: number;
  name: string;
  stats: Pokemon["stats"];
  types: Pokemon["types"];
  sprites?: Pokemon["sprites"];
  currentHp: number;
  moveType: string | null;
};

const STORAGE_KEY = "battle:v1";

/* ====================== Utils ====================== */
function getStat(p: Pokemon, name: string): number {
  return p.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}
const cap = (n: string) => (n ? n[0].toUpperCase() + n.slice(1) : n);

/* ---------- บีบอัด state ก่อนเก็บ ---------- */
function packState(s: {
  left: Fighter; right: Fighter;
  inputA: string; inputB: string;
  firstTurn: Side | null; turn: Side | null;
  logs: TurnLog[]; finished: Side | null;
}) {
  function slim(f: Fighter): SavedFighter | null {
    if (!f.data) return null;
    const d = f.data;
    return {
      id: d.id,
      name: d.name,
      stats: d.stats,
      types: d.types,
      sprites: (d as Pokemon & WithOfficialArtwork).sprites,
      currentHp: f.currentHp,
      moveType: f.moveType,
    };
  }
  return JSON.stringify({
    inputA: s.inputA,
    inputB: s.inputB,
    firstTurn: s.firstTurn,
    turn: s.turn,
    finished: s.finished,
    logs: s.logs,
    left: slim(s.left),
    right: slim(s.right),
  });
}

/* ---------- type guard + restore (ไม่มี any) ---------- */
function isSavedFighter(x: unknown): x is SavedFighter {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.name === "string" &&
    Array.isArray(o.stats) &&
    Array.isArray(o.types)
  );
}
function restoreFighter(raw: unknown): Fighter {
  if (!isSavedFighter(raw)) {
    return { data: null, currentHp: 0, moveType: null };
  }
  const data = {
    id: raw.id,
    name: raw.name,
    stats: raw.stats,
    types: raw.types,
    sprites: raw.sprites,
  } as unknown as Pokemon;

  return {
    data,
    currentHp: raw.currentHp ?? 0,
    moveType: raw.moveType ?? null,
  };
}

/* ====================== Page ====================== */
export default function Battle() {
  // fighters
  const [left, setLeft] = useState<Fighter>({ data: null, currentHp: 0, moveType: null });
  const [right, setRight] = useState<Fighter>({ data: null, currentHp: 0, moveType: null });

  // inputs
  const [inputA, setInputA] = useState("bulbasaur");
  const [inputB, setInputB] = useState("charmander");

  // defensive multipliers
  const [defMapA, setDefMapA] = useState<DamageMap | null>(null);
  const [defMapB, setDefMapB] = useState<DamageMap | null>(null);

  // battle state
  const [firstTurn, setFirstTurn] = useState<Side | null>(null);
  const [turn, setTurn] = useState<Side | null>(null);
  const [logs, setLogs] = useState<TurnLog[]>([]);
  const [finished, setFinished] = useState<Side | null>(null);
  const [busy, setBusy] = useState(false);

  // focus guard (กันสลับโฟกัสรัวๆ)
  const inputARef = useRef<HTMLInputElement | null>(null);
  const inputBRef = useRef<HTMLInputElement | null>(null);
  const activeRef = useRef<Side | null>(null);
  const refocusIfStillActive = (who: Side) => {
    if (activeRef.current !== who) return;
    const el = who === "A" ? inputARef.current : inputBRef.current;
    if (!el) return;
    if (document.activeElement !== el) el.focus();
  };

  // กันการ “เซฟทับของเก่า” ก่อนกู้เสร็จ
  const hydratedRef = useRef(false);

  /* ---------- 1) กู้จาก storage + เติม slot จากหน้าแรก (ครั้งเดียว) ---------- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          inputA?: string; inputB?: string;
          firstTurn?: Side | null; turn?: Side | null;
          finished?: Side | null; logs?: TurnLog[];
          left?: unknown; right?: unknown;
        };

        setInputA(parsed.inputA ?? "bulbasaur");
        setInputB(parsed.inputB ?? "charmander");
        setLeft(restoreFighter(parsed.left));
        setRight(restoreFighter(parsed.right));
        setFirstTurn(parsed.firstTurn ?? null);
        setTurn(parsed.turn ?? null);
        setFinished(parsed.finished ?? null);
        setLogs(Array.isArray(parsed.logs) ? parsed.logs : []);
      }
    } catch (e) {
      console.warn("restore battle state failed:", e);
    }

    // เติมเฉพาะฝั่งที่มากับ slots (เช่นจากหน้า Pokédex/Home)
    const slots = popBattleSlots(); // {A?:string,B?:string}
    if (slots.A) loadFighter("A", slots.A);
    if (slots.B) loadFighter("B", slots.B);

    // ✅ บอกว่า hydrate เสร็จแล้ว เพื่ออนุญาตให้ effect เซฟทำงานรอบถัดไป
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 2) เซฟลง storage เมื่อ state สำคัญเปลี่ยน (หลัง hydrate เท่านั้น) ---------- */
  useEffect(() => {
    if (!hydratedRef.current) return; // ยังไม่ hydrate ห้ามเซฟทับ
    try {
      const payload = packState({
        left, right, inputA, inputB, firstTurn, turn, logs, finished,
      });
      sessionStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn("save battle state failed:", e);
    }
  }, [left, right, inputA, inputB, firstTurn, turn, logs, finished]);

  /* ---------- Loader (เรียบง่าย—ไม่รีสถานะอื่น) ---------- */
  async function loadFighter(which: Side, idOrName: string) {
    try {
      const p = await getPokemon(idOrName.toLowerCase());
      const hp = getStat(p, "hp");
      const defaultMoveType = p.types[0]?.type.name ?? null;
      const setter = which === "A" ? setLeft : setRight;
      setter({ data: p, currentHp: hp, moveType: defaultMoveType });

      if (which === "A") setInputA(idOrName);
      else setInputB(idOrName);
    } catch (err) {
      console.error("loadFighter error", err);
    }
  }

  /* ---------- Defensive map ---------- */
  useEffect(() => {
    (async () => {
      if (left.data) {
        const types = left.data.types.map((t) => t.type.name);
        setDefMapA(await getCombinedDefensiveMultipliers(types));
      } else setDefMapA(null);

      if (right.data) {
        const types = right.data.types.map((t) => t.type.name);
        setDefMapB(await getCombinedDefensiveMultipliers(types));
      } else setDefMapB(null);
    })();
  }, [left.data, right.data]);

  /* ---------- กำหนดคนเริ่มโดย speed (ตั้งต้นเฉพาะครั้งแรกจริงๆ) ---------- */
  const starter: Side | null = useMemo(() => {
    if (!left.data || !right.data) return null;
    const spA = getStat(left.data, "speed");
    const spB = getStat(right.data, "speed");
    if (spA > spB) return "A";
    if (spB > spA) return "B";
    return Math.random() < 0.5 ? "A" : "B";
  }, [left.data, right.data]);

  useEffect(() => {
    const neverStarted = (firstTurn === null && turn === null && logs.length === 0 && finished === null);
    if (left.data && right.data && starter && neverStarted) {
      setFirstTurn(starter);
      setTurn(starter);
    }
  }, [starter, left.data, right.data, firstTurn, turn, logs.length, finished]);

  /* ---------- ระบบต่อสู้ ---------- */
  function computeDamage(
    attacker: Pokemon,
    defender: Pokemon,
    defenderDefMap: DamageMap | null,
    moveType: string | null
  ): { damage: number; eff: number; crit: boolean } {
    const level = 50, power = 60;
    const atk = getStat(attacker, "attack");
    const def = getStat(defender, "defense");
    const stab = moveType && attacker.types.some((t) => t.type.name === moveType) ? 1.5 : 1;
    const eff = moveType && defenderDefMap ? defenderDefMap[moveType] ?? 1 : 1;
    const crit = Math.random() < 0.0625;
    const rand = 0.85 + Math.random() * 0.15;
    const base = (((2 * level) / 5 + 2) * power * (atk / Math.max(1, def))) / 50 + 2;
    const damage = Math.floor(base * stab * eff * (crit ? 1.5 : 1) * rand);
    return { damage: Math.max(1, damage), eff, crit };
  }

  function doTurn() {
    if (!turn || !left.data || !right.data || finished) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const isA = turn === "A";
      const atk = isA ? left : right;
      const def = isA ? right : left;
      const defMap = isA ? defMapB : defMapA;
      const moveType = atk.moveType ?? atk.data!.types[0]?.type.name ?? "normal";
      const result = computeDamage(atk.data!, def.data!, defMap, moveType);
      const nextHp = Math.max(0, def.currentHp - result.damage);
      if (isA) setRight((p) => ({ ...p, currentHp: nextHp }));
      else setLeft((p) => ({ ...p, currentHp: nextHp }));
      setLogs((prev) => [
        ...prev,
        {
          attacker: isA ? "A" : "B",
          defender: isA ? "B" : "A",
          nameAtk: cap(atk.data!.name),
          nameDef: cap(def.data!.name),
          moveType,
          damage: result.damage,
          effectiveness: result.eff,
          crit: result.crit,
          defenderRemain: nextHp,
        },
      ]);
      if (nextHp <= 0) {
        setFinished(isA ? "A" : "B");
        setTurn(null);
      } else setTurn(isA ? "B" : "A");
    }, 220);
  }

  function resetBattle() {
    if (!left.data || !right.data) return;
    setLeft((p) => ({ ...p, currentHp: getStat(p.data!, "hp") }));
    setRight((p) => ({ ...p, currentHp: getStat(p.data!, "hp") }));
    setTurn(firstTurn);
    setFinished(null);
    setLogs([]);
  }

  /* ---------- UI ---------- */
  const Card = ({ who }: { who: Side }) => {
    const f = who === "A" ? left : right;
    const setF = who === "A" ? setLeft : setRight;
    const input = who === "A" ? inputA : inputB;
    const setInput = who === "A" ? setInputA : setInputB;
    const myRef = who === "A" ? inputARef : inputBRef;

    const maxHp = f.data ? getStat(f.data, "hp") : 0;
    const hpPct = f.data ? Math.max(0, Math.min(100, (f.currentHp / Math.max(1, maxHp)) * 100)) : 0;

    const art = (f.data as (Pokemon & WithOfficialArtwork) | null)?.sprites?.other?.["official-artwork"];
    const img = f.data ? art?.front_default ?? officialArtworkUrl(f.data.id) : "";

    return (
      <div className="card white" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
          <strong style={{ fontSize: 18 }}>{who === "A" ? "Trainer A" : "Trainer B"}</strong>
          {turn === who && !finished && <span className="badge">Your turn</span>}
        </div>

        {/* ช่องกรอกธรรมดา: ไม่แย่งโฟกัสข้ามช่อง */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            ref={myRef}
            className="input"
            placeholder="name or id (e.g., bulbasaur)"
            value={input}
            onMouseDown={() => {
             activeRef.current = who; // บอกล่วงหน้าว่าจะโฟกัสช่องนี้
        }}
        onFocus={() => {
          activeRef.current = who;
        }}
        onChange={(e) => {
          setInput(e.target.value);
          if (document.activeElement === myRef.current) {
            requestAnimationFrame(() => refocusIfStillActive(who));
          }
        }}
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            loadFighter(who, input);
            requestAnimationFrame(() => refocusIfStillActive(who));
          }
        }}
/>
          <button
            type="button"
            className="pill filled"
            onMouseDown={(e) => e.preventDefault()} // กัน blur เมื่อกดปุ่ม
            onClick={() => {
              loadFighter(who, input);
              requestAnimationFrame(() => refocusIfStillActive(who));
            }}
          >
            Load
          </button>
        </div>
        <small style={{ color: "#64748b" }}>Tips: รองรับทั้งชื่อและหมายเลข Pokédex</small>

        {f.data && (
          <>
            <div style={{ display: "grid", gap: 10, justifyItems: "center", marginTop: 12 }}>
              <img src={img} alt={f.data.name} style={{ width: 160, height: 160, objectFit: "contain" }} />
              <div style={{ fontWeight: 700, fontSize: 18 }}>{cap(f.data.name)}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {f.data.types.map((t) => (
                  <span key={t.type.name} className={`type type-${t.type.name}`}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="hpbar">
                <div
                  className={`hpbar-fill ${hpPct > 50 ? "ok" : hpPct > 20 ? "mid" : "low"}`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <div style={{ textAlign: "right", fontFeatureSettings: "'tnum' 1" }}>
                {f.currentHp}/{maxHp}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: "#64748b" }}>Move Type</label>
              <div>
                <select
                  className="input"
                  value={f.moveType ?? ""}
                  onChange={(e) => setF((p) => ({ ...p, moveType: e.target.value }))}
                >
                  {f.data.types.map((t) => (
                    <option key={t.type.name} value={t.type.name}>
                      {t.type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const ready = Boolean(left.data && right.data);

  return (
    <section>
      <h1 style={{ marginBottom: 8 }}>Battle Simulator ⚔️</h1>

      <div className="toolbar">
        <button className="pill outline" onClick={resetBattle} disabled={!ready}>
          Reset
        </button>
        <button
          className="pill filled"
          onClick={doTurn}
          disabled={!ready || !turn || !!finished || busy}
        >
          {finished ? "Battle Finished" : turn ? "Do Turn" : "Start"}
        </button>
      </div>

      <div className="grid-2">
        <Card who="A" />
        <Card who="B" />
      </div>

      <div className="card white" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Battle Log</h3>
        {logs.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            ยังไม่มีเหตุการณ์ — กด <strong>Do Turn</strong> เพื่อเริ่ม
          </p>
        ) : (
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {logs.map((l, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <strong>{l.nameAtk}</strong> used <span className="badge">{l.moveType}</span> →{" "}
                <strong>{l.damage}</strong> dmg
                {l.crit && " (CRIT!)"}
                {l.effectiveness > 1 && " • It's super effective!"}
                {l.effectiveness === 0 && " • No effect…"}
                {l.effectiveness > 0 && l.effectiveness < 1 && " • Not very effective."} → {l.defenderRemain} HP left
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
