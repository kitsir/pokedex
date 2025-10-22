// ==============================
// PokeAPI helpers (ครบชุด + type ชัด)
// ==============================

/** รายการทั่วไปจาก PokeAPI */
export type PokemonListItem = { name: string; url: string };
export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

// ดึงรายการโปเกม่อน (แบ่งหน้า)
export async function listPokemon(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to load list");
  return res.json();
}

// ดึงข้อมูลรายตัว
export async function getPokemon(idOrName: number | string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  if (!res.ok) throw new Error("Failed to load pokemon");
  return res.json();
}

// แปลง URL → id (ใช้กับ results.url)
export function getIdFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

// ลิงก์รูป Official Artwork
export function officialArtworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// ==============================
// Evolution Chain (type ครบ)
// ==============================

export type NamedAPIResource = { name: string; url: string };

export type EvolutionDetail = {
  trigger: NamedAPIResource | null;
  min_level: number | null;
  item: NamedAPIResource | null;
  time_of_day: string | null;
};

export type ChainLink = {
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
};

export type EvolutionChainResponse = {
  id: number;
  chain: ChainLink;
};

export type EvoNode = {
  id: number;
  name: string;
  trigger?: string;
  min_level?: number | null;
  item?: string | null;
  time_of_day?: string | null;
};

function extractIdFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

export async function getSpecies(idOrName: string | number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
  if (!res.ok) throw new Error("Failed to load species");
  return res.json();
}

export async function getEvolutionChainById(evoChainId: number): Promise<EvoNode[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${evoChainId}`);
  if (!res.ok) throw new Error("Failed to load evolution chain");
  const data: EvolutionChainResponse = await res.json();

  const out: EvoNode[] = [];
  const walk = (node: ChainLink): void => {
    const s = node.species;
    const id = extractIdFromUrl(s.url);
    const d: EvolutionDetail | undefined = node.evolution_details?.[0];

    out.push({
      id,
      name: s.name,
      trigger: d?.trigger?.name ?? undefined,
      min_level: d?.min_level ?? null,
      item: d?.item?.name ?? null,
      time_of_day: d?.time_of_day ?? null,
    });

    node.evolves_to?.forEach(walk);
  };

  walk(data.chain);
  return out;
}

export async function getEvolutionChainForPokemon(idOrName: string | number): Promise<EvoNode[]> {
  const species = await getSpecies(idOrName);
  const evoUrl: string = species.evolution_chain.url; // .../evolution-chain/{id}/
  const evoId = extractIdFromUrl(evoUrl);
  return getEvolutionChainById(evoId);
}

// ==============================
// Random Pokémon
// ==============================
export async function getPokemonCount(): Promise<number> {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=1");
  if (!res.ok) throw new Error("Failed to get count");
  const d = await res.json();
  return d.count as number;
}

export async function getRandomPokemonId(): Promise<number> {
  const count = await getPokemonCount();
  return Math.floor(Math.random() * count) + 1; // id เริ่ม 1
}

// ==============================
// Encounter Locations (type ครบ)
// ==============================
export type EncounterVersionDetail = {
  version: NamedAPIResource;
};
export type LocationAreaEncounter = {
  location_area: NamedAPIResource;
  version_details: EncounterVersionDetail[];
};

export async function getEncounterLocations(id: number | string): Promise<LocationAreaEncounter[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
  if (!res.ok) throw new Error("Failed to load encounters");
  return (await res.json()) as LocationAreaEncounter[];
}

// ==============================
// Type Effectiveness (Defense) — type ชัด
// ==============================
type DamageRelations = {
  double_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
};

type TypeAPIResponse = {
  name: string;
  damage_relations: DamageRelations;
};

type TypeIndexResponse = {
  results: NamedAPIResource[];
};

export type DamageMap = Record<string, number>; // เช่น { fire: 2, water: 0.5, ... }

export async function getTypeRelations(typeName: string): Promise<TypeAPIResponse> {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
  if (!res.ok) throw new Error("Failed to load type");
  return (await res.json()) as TypeAPIResponse;
}

export async function getCombinedDefensiveMultipliers(types: string[]): Promise<DamageMap> {
  const baseTypes: TypeAPIResponse[] = await Promise.all(types.map(getTypeRelations));

  const allTypesRes: TypeIndexResponse = await (await fetch("https://pokeapi.co/api/v2/type")).json();
  const allTypeNames: string[] = allTypesRes.results
    .map((t: NamedAPIResource) => t.name)
    .filter((t) => t !== "unknown" && t !== "shadow");

  const mult: DamageMap = {};
  allTypeNames.forEach((t) => (mult[t] = 1));

  baseTypes.forEach((tr) => {
    const rel = tr.damage_relations;
    rel.double_damage_from.forEach((x) => {
      mult[x.name] *= 2;
    });
    rel.half_damage_from.forEach((x) => {
      mult[x.name] *= 0.5;
    });
    rel.no_damage_from.forEach((x) => {
      mult[x.name] *= 0;
    });
  });

  return mult;
}
