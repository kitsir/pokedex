import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPokemon,
  officialArtworkUrl,
  getEvolutionChainForPokemon,
  getEncounterLocations,
  getCombinedDefensiveMultipliers,
  type EvoNode,
  type LocationAreaEncounter,
} from "../api/pokeapi";
import type { Pokemon } from "../types/pokemon";
import { addFav } from "../store/favorites";
import toast from "react-hot-toast";

const typeClass = (t: string) => `type type-${t}`;

// ช่วยกำหนด type ให้ทาง sprites.other["official-artwork"]
type WithOfficialArtwork = {
  sprites?: {
    other?: {
      ["official-artwork"]?: {
        front_default?: string | null;
        front_shiny?: string | null;
      };
    };
  };
};

export default function PokemonDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ฟีเจอร์เพิ่มเติม
  const [shiny, setShiny] = useState(false);
  const [evo, setEvo] = useState<EvoNode[]>([]);
  const [spots, setSpots] = useState<LocationAreaEncounter[]>([]);
  const [typeMult, setTypeMult] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setLoading(true);
    setError(null);
    getPokemon(id)
      .then((p) => {
        if (!ignore) setData(p);
      })
      .catch((e: unknown) => setError((e as Error).message ?? "Error"))
      .finally(() => setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  // Evolution / Encounters / Type multipliers
  useEffect(() => {
    if (!id) return;
    getEvolutionChainForPokemon(id).then(setEvo).catch(() => setEvo([]));
  }, [id]);

  useEffect(() => {
    if (!data) return;
    getEncounterLocations(data.id).then(setSpots).catch(() => setSpots([]));
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const ts = data.types.map((t) => t.type.name);
    getCombinedDefensiveMultipliers(ts)
      .then(setTypeMult)
      .catch(() => setTypeMult(null));
  }, [data]);

  // เลือกรูป: Normal/Shiny (โดยไม่ใช้ any)
  const img = useMemo(() => {
    if (!data) return "";
    const art = (data as Pokemon & WithOfficialArtwork).sprites?.other?.["official-artwork"];
    const normal = art?.front_default ?? officialArtworkUrl(data.id);
    const shinyImg = art?.front_shiny ?? normal;
    return shiny ? shinyImg : normal;
  }, [data, shiny]);

  if (loading)
    return (
      <div className="grid">
        <div className="card white">
          <div className="skel img" />
        </div>
      </div>
    );
  if (error) return <p style={{ color: "#b91c1c" }}>Error: {error}</p>;
  if (!data) return null;

  const displayName = data.name[0].toUpperCase() + data.name.slice(1);

  return (
    <section>
      <div className="toolbar" style={{ marginTop: 0 }}>
        <button className="pill outline" onClick={() => nav(-1)}>
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>
          {displayName} <span className="badge light">#{data.id}</span>
        </h1>
      </div>

      <div className="detail">
        {/* ซ้าย: ภาพ + ปุ่ม + Types */}
        <div className="card white center">
          <div className="ribbon static">Details</div>
          <img src={img} alt={data.name} />
          <div className="types">
            {data.types.map((t) => (
              <span key={t.type.name} className={typeClass(t.type.name)}>
                {t.type.name}
              </span>
            ))}
          </div>
          <div className="actions">
            <button className="pill outline" onClick={() => setShiny((s) => !s)}>
              {shiny ? "Normal" : "Shiny"}
            </button>
            <button
              className="pill filled"
              onClick={() => {
                addFav({ id: data.id, name: data.name, image: img });
                toast.success("Added to team!");
              }}
            >
              Add to My Pokémon
            </button>
          </div>
        </div>

        {/* ขวา: Stats + Abilities + Size */}
        <div className="card white">
          <h3 style={{ marginTop: 0 }}>Base Stats</h3>
          {data.stats.map((s) => (
            <div className="stat" key={s.stat.name}>
              <div className="stat-name">{s.stat.name}</div>
              <div className="bar light">
                <div className="fill red" style={{ width: `${Math.min(100, s.base_stat)}%` }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>{s.base_stat}</strong>
              </div>
            </div>
          ))}

          <h3 style={{ marginTop: 18 }}>Abilities</h3>
          <ul>
            {data.abilities.map((a) => (
              <li key={a.ability.name}>{a.ability.name}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: 18 }}>Size</h3>
          <p>
            Height: {data.height} | Weight: {data.weight}
          </p>
        </div>
      </div>

{/* Evolution Chain */}
{evo.length > 0 && (
  <div className="card white" style={{ marginTop: 16 }}>
    <h3 style={{ marginTop: 0, textAlign: "center" }}>Evolution Chain</h3>

    <div className="evo-row">
      {evo.map((n, idx) => (
        <div key={n.id} className="evo-wrap">
          <div className="evo-card">
            <img
              src={officialArtworkUrl(n.id)}
              alt={n.name}
              className="evo-img"
            />

            <div className="evo-name">
              {n.name[0].toUpperCase() + n.name.slice(1)}
            </div>

            {(n.min_level || n.item || n.time_of_day || n.trigger) && (
              <div className="badge light evo-cond" title={
                [
                  n.trigger ? `by ${n.trigger}` : null,
                  n.min_level != null ? `Lv.${n.min_level}` : null,
                  n.item ? `item: ${n.item}` : null,
                  n.time_of_day ? n.time_of_day : null,
                ].filter(Boolean).join(" • ")
              }>
                {[
                  n.trigger ? `by ${n.trigger}` : null,
                  n.min_level != null ? `Lv.${n.min_level}` : null,
                  n.item ? `item: ${n.item}` : null,
                  n.time_of_day ? n.time_of_day : null,
                ].filter(Boolean).join(" • ")}
              </div>
            )}

            <a className="pill outline evo-btn" href={`/pokemon/${n.id}`}>
              Details
            </a>
          </div>

          {/* เส้นเชื่อมไปขั้นถัดไป */}
          {idx < evo.length - 1 && <span className="evo-connector" aria-hidden />}
        </div>
      ))}
    </div>
  </div>
)}

      {/* Type Effectiveness */}
      {typeMult && (
        <div className="card white" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Type Effectiveness (Defense)</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(typeMult)
              .filter(([, v]) => v !== 1)
              .sort((a, b) => b[1] - a[1])
              .map(([t, v]) => (
                <span key={t} className="badge" title={`x${v}`}>
                  {t} ×{v}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Encounter Locations */}
      {spots.length > 0 && (
        <div className="card white" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Encounter Locations</h3>
          <ul style={{ marginTop: 8 }}>
            {spots.slice(0, 8).map((s, i) => (
              <li key={i}>
                {s.location_area.name.replace(/-/g, " ")} —{" "}
                {s.version_details?.[0]?.version?.name ?? "version n/a"}
              </li>
            ))}
          </ul>
          {spots.length > 8 && <div className="badge light">+{spots.length - 8} more</div>}
        </div>
      )}
    </section>
  );
}
