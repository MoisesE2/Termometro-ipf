// components/CotaSearch.tsx
interface Props {
  search: string;
  setSearch: (val: string) => void;
}

export default function CotaSearch({ search, setSearch }: Props) {
  return (
    <input
      type="text"
      placeholder="Buscar por responsável..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-md shadow-sm mb-6"
    />
  );
}
