'use client';

type Props = {
    types: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    action: (formData: FormData) => Promise<void>;
    initialValues?: {
        title: string;
        url: string;
        description: string | null;
        typeId: number;
        categoryIds: number[];
    };
    submitLabel?: string;
};

export function ResourceForm({ types, categories, action, initialValues, submitLabel = 'Guardar link' }: Props) {
    return (
        <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                action(formData);
            }}
            className="space-y-4">
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
                <select
                    name="categoryIds"
                    multiple
                    defaultValue={initialValues?.categoryIds.map(String) ?? []}
                    className="w-full rounded-lg border border-red-100 p-2 h-28"
                >
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Ctrl/Cmd + clic para elegir varias</p>
            </div>

            <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
                {submitLabel}
            </button>
        </form>
    );
}