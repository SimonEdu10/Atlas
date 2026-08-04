'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Props = {
  types: { id: number; name: string }[];
  categories: { id: number; name: string }[];
};

export function FilterBar({ types, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== (searchParams.get('q') ?? '')) {
        updateParam('q', searchInput);
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const isFavoriteActive = searchParams.get('favorite') === '1';
  const hasFilters = searchParams.get('type') || searchParams.get('category') || searchParams.get('q') || isFavoriteActive;

  function clearAll() {
    setSearchInput('');
    router.push(pathname);
  }

  return (
    <div className="space-y-3 mb-6">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar por título o descripción..."
        className="w-full rounded-lg border border-red-100 p-2 text-sm"
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={searchParams.get('type') ?? ''}
          onChange={(e) => updateParam('type', e.target.value)}
          className="rounded-lg border border-red-100 p-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={searchParams.get('category') ?? ''}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-lg border border-red-100 p-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={() => updateParam('favorite', isFavoriteActive ? '' : '1')}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${isFavoriteActive ? 'border-red-600 bg-red-600 text-white' : 'border-red-100 text-gray-600 hover:border-red-300'
            }`}
        >
          {isFavoriteActive ? '♥' : '♡'} Solo favoritos
        </button>

        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-gray-400 hover:text-red-600">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}