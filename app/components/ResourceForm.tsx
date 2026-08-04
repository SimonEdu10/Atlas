'use client';
import { useState } from 'react';
import { MultiSelectPicker } from './MultiSelectPicker';

type ShareableUser = { id: string; name: string; email: string };

type Props = {
    types: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    shareableUsers: ShareableUser[];
    action: (formData: FormData) => Promise<void>;
    initialValues?: {
        title: string;
        url: string;
        description: string | null;
        typeId: number;
        categoryIds: number[];
        visibility?: string;
        sharedUserIds?: string[];
    };
    submitLabel?: string;
};

export function ResourceForm({ types, categories, shareableUsers, action, initialValues, submitLabel = 'Guardar link' }: Props) {
    const [visibility, setVisibility] = useState(initialValues?.visibility ?? 'PUBLIC');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                action(formData);
            }}
            className="space-y-4"
        >
            <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input name="title" required defaultValue={initialValues?.title} className="w-full rounded-lg border border-red-100 p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input name="url" type="url" required defaultValue={initialValues?.url} className="w-full rounded-lg border border-red-100 p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea name="description" defaultValue={initialValues?.description ?? ''} className="w-full rounded-lg border border-red-100 p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Imagen {initialValues ? '(deja vacío para no cambiarla)' : '(opcional)'}
                </label>
                <input name="image" type="file" accept="image/*" className="w-full rounded-lg border border-red-100 p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select name="typeId" required defaultValue={initialValues?.typeId ?? ''} className="w-full rounded-lg border border-red-100 p-2">
                    <option value="">Selecciona un tipo</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Categorías</label>
                <MultiSelectPicker
                    fieldName="categoryIds"
                    items={categories.map((c) => ({ id: c.id, label: c.name }))}
                    defaultValue={initialValues?.categoryIds ?? []}
                    placeholder="Selecciona categorías"
                    searchPlaceholder="Buscar categoría..."
                    emptyLabel="No se encontraron categorías."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Visibilidad</label>
                <select
                    name="visibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full rounded-lg border border-red-100 p-2"
                >
                    <option value="PUBLIC">Público (todos lo pueden ver)</option>
                    <option value="PRIVATE">Privado (solo tú)</option>
                    <option value="PRIVATE_SHARED">Privado compartido (elige quién)</option>
                </select>
            </div>

            {visibility === 'PRIVATE_SHARED' && (
                <div>
                    <label className="block text-sm font-medium mb-1">Compartir con</label>
                    <MultiSelectPicker
                        fieldName="sharedUserIds"
                        items={shareableUsers.map((u) => ({ id: u.id, label: u.name, sublabel: u.email }))}
                        defaultValue={initialValues?.sharedUserIds ?? []}
                        placeholder="Selecciona usuarios"
                        searchPlaceholder="Buscar usuario..."
                        emptyLabel="No se encontraron usuarios."
                    />
                </div>
            )}

            <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
                {submitLabel}
            </button>
        </form>
    );
}