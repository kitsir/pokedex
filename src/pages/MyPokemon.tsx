// src/pages/MyPokemon.tsx
import { useEffect, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import { pushBattleSlot, peekBattleSlots, clearBattleSlots } from "../store/battle";
import toast from "react-hot-toast";
import { getFavs, removeFav } from "../store/favorites";

type Fav = { id: number; name: string; image: string };

export default function MyPokemon() {
  const [list, setList] = useState<Fav[]>([]);
  const [pendingA, setPendingA] = useState<string | undefined>(undefined);
  const [pendingB, setPendingB] = useState<string | undefined>(undefined);

  useEffect(() => {
    setList(getFavs());
    const s = peekBattleSlots();
    setPendingA(s.A); setPendingB(s.B);
  }, []);

  const afterTransfer = (id: number, name: string) => {
    removeFav(id);
    setList((prev) => prev.filter((x) => x.id !== id));
    toast.success(`Transferred ${name}.`);
  };

  const addTo = (side: "A" | "B", id: number, name: string) => {
    const cur = pushBattleSlot(side, id);
    if (side === "A") setPendingA(cur.A); else setPendingB(cur.B);
    toast.success(`Queued ${name} → Team ${side}`);
  };

  return (
    <section>
      <h1 style={{ marginBottom: 12 }}>My Pokémon</h1>

      <div className="toolbar" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="badge">A: {pendingA ?? "-"}</span>
        <span className="badge">B: {pendingB ?? "-"}</span>
        <button className="pill outline" onClick={() => { clearBattleSlots(); setPendingA(undefined); setPendingB(undefined); }}>
          Clear
        </button>
        <button className="pill filled" onClick={() => { window.location.href = "/battle"; }}>
          Go to Battle
        </button>
      </div>

      <div className="grid">
        {list.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            image={p.image}
            onOpen={() => { window.location.href = `/pokemon/${p.id}`; }}
            // แถวบนเป็น Transfer (ลบออก)
            onTransfer={() => afterTransfer(p.id, p.name)}
            // แถวล่าง Add A/B ตามที่ต้องการ
            extraActions={
              <>
                <button className="pill outline" onClick={() => addTo("A", p.id, p.name)}>Add to A</button>
                <button className="pill outline" onClick={() => addTo("B", p.id, p.name)}>Add to B</button>
              </>
            }
          />
        ))}
      </div>

      {list.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.8 }}>No Pokémon yet. Go catch some!</p>
      )}
    </section>
  );
}
