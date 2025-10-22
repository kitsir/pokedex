export type NamedAPIResource = { name: string; url: string };

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

export type Pokemon = {
  id: number;
  name: string;
  sprites: {
    other?: {
      ["official-artwork"]?: { front_default: string | null };
    };
    front_default?: string | null;
  };
  height: number;
  weight: number;
  abilities: { ability: NamedAPIResource }[];
  types: { slot: number; type: NamedAPIResource }[];
  stats: { base_stat: number; stat: NamedAPIResource }[];
};
