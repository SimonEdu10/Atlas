'use client';
import { useState, useRef, useEffect } from 'react';

type Item = { id: string | number; label: string; sublabel?: string };

type Props = {
    items: Item[];
    fieldName: string;
    defaultValue?: (string | number)[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
};

export function MultiSelectPicker({
    items,
    fieldName,
    defaultValue = [],
    placeholder = 'Selecciona opciones',
    searchPlaceholder = 'Buscar...',
    emptyLabel = 'No se encontraron resultados.',
}: Props) {
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>(defaultValue);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = items.filter(
        (item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.sublabel?.toLowerCase().includes(search.toLowerCase())
    );
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));

    function toggle(id: string | number) {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }

    function remove(id: string | number) {
        setSelectedIds((prev) => prev.filter((i) => i !== id));
    }

    return (
        <div ref={ref} className="relative">
            {selectedIds.map((id) => (
                <input key={id} type="hidden" name={fieldName} value={id} />
            ))}

            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full rounded-lg border border-red-100 p-2 text-left text-sm text-gray-600 flex justify-between items-center"
            >
                <span>{selectedIds.length > 0 ? `${selectedIds.length} seleccionado(s)` : placeholder}</span>
                <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
            </button>

            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedItems.map((item) => (
                        <span key={item.id} className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                            {item.label}
                            <button type="button" onClick={() => remove(item.id)} className="text-red-400 hover:text-red-700 font-bold leading-none">
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-red-100 bg-white p-2 shadow-lg">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-lg border border-red-100 p-2 text-sm mb-2"
                        autoFocus
                    />
                    {filtered.length === 0 ? (
                        <p className="text-sm text-gray-400 p-2">{emptyLabel}</p>
                    ) : (
                        filtered.map((item) => (
                            <label key={item.id} className="flex items-center gap-2 rounded p-2 text-sm hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggle(item.id)}
                                    className="accent-red-600"
                                />
                                <span>
                                    {item.label}
                                    {item.sublabel && <span className="text-gray-400"> ({item.sublabel})</span>}
                                </span>
                            </label>
                        ))
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-2 rounded-lg bg-red-600 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Listo
                    </button>
                </div>
            )}
        </div>
    );
}