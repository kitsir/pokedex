// src/pages/Home.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import SkeletonCard from "../components/SkeletonCard";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";
import { addFav, hasFav, removeFav } from "../store/favorites";
import { pushBattleSlot } from "../store/battle";

/* helpers เหมือนเดิม */
type PokemonListItem = { name: string; url: string };
type PokemonListResponse = { count: number; next: string | null; previous: string | null; results: PokemonListItem[] };
const API = "https://pokeapi.co/api/v2";
async function fetchList(limit: number, offset: number): Promise<PokemonListResponse> {
  const res = await fetch(`${API}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch list");
  return res.json();
}
const officialArtworkUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const getIdFromUrl = (url: string) => Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);
const PAGE_SIZE = 24;

function UncontrolledSearchInput({ value, onChange, placeholder, className = "input", autoFocusOnMount = true, leftPadding = 36, }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocusOnMount?: boolean; leftPadding?: number;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const focused = useRef(false);
  useEffect(() => { if (ref.current) ref.current.value = value; }, []);
  useEffect(() => { if (!autoFocusOnMount) return; const t = window.setTimeout(() => ref.current?.focus(), 0); return () => window.clearTimeout(t); }, [autoFocusOnMount]);
  useEffect(() => { const el = ref.current; if (!el) return; if (!focused.current && el.value !== value) el.value = value; }, [value]);
  return (
    <div style={{ position: "relative", flex: "1 1 420px" }}>
      <FiSearch style={{ position: "absolute", left: 12, top: 12, opacity: 0.6 }} />
      <input ref={ref} className={className} placeholder={placeholder} defaultValue={value}
             style={{ paddingLeft: leftPadding }} autoComplete="off" spellCheck={false}
             onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }}
             onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
    </div>
  );
}

export default function Home() {
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState(""); const [qDeb, setQDeb] = useState("");
  const [allList, setAllList] = useState<PokemonListItem[] | null>(null);
  const [allLoading, setAllLoading] = useState(false);
  const debTimer = useRef<number | null>(null);
  useEffect(() => { if (debTimer.current) window.clearTimeout(debTimer.current); debTimer.current = window.setTimeout(() => setQDeb(q.trim()), 350); }, [q]);

  useEffect(() => {
    setLoading(true); setError(null);
    fetchList(PAGE_SIZE, page * PAGE_SIZE)
      .then(setPageData).catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (!qDeb || allList) return;
    (async () => {
      setAllLoading(true);
      try {
        const res = await fetchList(1000, 0);
        setAllList(res.results);
      } finally { setAllLoading(false); }
    })();
  }, [qDeb, allList]);

  const displayList = useMemo(() => {
    if (qDeb && allList) {
      const s = qDeb.toLowerCase();
      return allList.filter((p) => p.name.includes(s));
    }
    return pageData?.results ?? [];
  }, [qDeb, allList, pageData]);

  const totalPages = useMemo(() => pageData?.count ? Math.ceil(pageData.count / PAGE_SIZE) : 0, [pageData]);

  // เก็บสถานะ caught แบบเร็ว ๆ เพื่อรีเฟรช UI หลัง catch/transfer
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  return (
    <section>
      <h1 style={{ marginBottom: 12 }}>Pokédex</h1>

      <div className="toolbar">
        <UncontrolledSearchInput value={q} onChange={setQ} placeholder="Search by name…" autoFocusOnMount leftPadding={36} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="pill outline" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>◀ Prev</button>
          <button className="pill outline" disabled={totalPages > 0 && page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ▶</button>
        </div>
      </div>

      {error && <p style={{ color: "#b91c1c" }}>Page Error: {error}</p>}

      <div className="grid">
        {(loading || allLoading) &&
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}

        {!loading && displayList.map((p) => {
          const id = getIdFromUrl(p.url);
          const img = officialArtworkUrl(id);
          const caught = hasFav(id);

          return (
            <PokemonCard
              key={id}
              id={id}
              name={p.name}
              image={img}
              onOpen={() => { window.location.href = `/pokemon/${id}`; }}
              // ปุ่มหลัก: ถ้ายังไม่จับ → Catch, ถ้าจับแล้ว → Transfer
              onCatch={!caught ? () => {
                addFav({ id, name: p.name, image: img });
                toast.success(`Caught ${p.name}!`);
                refresh();
              } : undefined}
              onTransfer={caught ? () => {
                removeFav(id);
                toast.success(`Transferred ${p.name}.`);
                refresh();
              } : undefined}
              // แถวล่าง: Add to A / Add to B (ไม่พาไปหน้าอื่น)
              extraActions={
                <>
                  <button className="pill outline" onClick={() => { pushBattleSlot("A", id); toast.success(`Queued ${p.name} → Team A`); }}>
                    Add to A
                  </button>
                  <button className="pill outline" onClick={() => { pushBattleSlot("B", id); toast.success(`Queued ${p.name} → Team B`); }}>
                    Add to B
                  </button>
                </>
              }
            />
          );
        })}
      </div>

      {!loading && !allLoading && displayList.length === 0 && (
        <p style={{ textAlign: "center", width: "100%" }}>No Pokémon found.</p>
      )}
    </section>
  );
}
