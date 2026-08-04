'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Item = { id: number; name: string };

type Props = {
  types: Item[];
  categories: Item[];
};

function MultiSelectDropdown({
  label,
  items,
  selectedIds,
  onChange,
}: {
  label: string;
  items: Item[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`rounded-lg border px-3 py-2 text-sm ${
          selectedIds.length > 0 ? 'border-red-600 bg-red-50 text-red-700' : 'border-red-100 text-gray-600 hover:border-red-300'
        }`}
      >
        {label} {selectedIds.length > 0 && `(${selectedIds.length})`}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-56 max-h-64 overflow-y-auto rounded-lg border border-red-100 bg-white p-2 shadow-lg">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 p-2">No hay opciones.</p>
          ) : (
            items.map((item) => (
              <label key={item.id} className="flex items-center gap-2 rounded p-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="accent-red-600"
                />
                {item.name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ types, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');

  const selectedTypeIds = (searchParams.get('type') ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number);
  const selectedCategoryIds = (searchParams.get('category') ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number);

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
  const hasFilters =
    selectedTypeIds.length > 0 || selectedCategoryIds.length > 0 || searchParams.get('q') || isFavoriteActive;

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
        <MultiSelectDropdown
          label="Tipos"
          items={types}
          selectedIds={selectedTypeIds}
          onChange={(ids) => updateParam('type', ids.join(','))}
        />

        <MultiSelectDropdown
          label="Categorías"
          items={categories}
          selectedIds={selectedCategoryIds}
          onChange={(ids) => updateParam('category', ids.join(','))}
        />

        <button
          onClick={() => updateParam('favorite', isFavoriteActive ? '' : '1')}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            isFavoriteActive ? 'border-red-600 bg-red-600 text-white' : 'border-red-100 text-gray-600 hover:border-red-300'
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