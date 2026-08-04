'use client';
import { useState } from 'react';
import { Modal } from './Modal';
import { ResourceForm } from './ResourceForm';
import { useFeedback } from './FeedbackProvider';

type Resource = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  imgUrl: string | null;
  isFavorite: boolean;
  typeId: number;
  type: { name: string };
  categories: { categoryId: number; category: { name: string } }[];
};

type Props = {
  resources: Resource[];
  types: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  deleteResource: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  updateResource: (id: number, formData: FormData) => Promise<{ error: string } | { success: true }>;
};

export function ResourceList({ resources, types, categories, deleteResource, toggleFavorite, updateResource }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingResource = resources.find((r) => r.id === editingId) ?? null;
  const { confirm, showSuccess, showError } = useFeedback();

  async function handleUpdate(formData: FormData) {
    if (editingId == null) return;
    const ok = await confirm('¿Confirmas que quieres guardar los cambios?');
    if (!ok) return;

    const result = await updateResource(editingId, formData);
    if ('error' in result) {
      showError(result.error);
      return;
    }

    showSuccess('Link actualizado correctamente.');
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    const ok = await confirm('¿Seguro que quieres eliminar este link? Esta acción no se puede deshacer.');
    if (!ok) return;

    await deleteResource(id);
    showSuccess('Link eliminado correctamente.');
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Todavía no has guardado ningún link.</p>
        <p className="text-gray-400 text-sm">Usa el botón + para agregar el primero.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <li key={r.id} className="group rounded-2xl border border-red-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            <img
              src={r.imgUrl || '/images/logo.png'}
              alt={r.title}
              className={`w-full h-36 ${r.imgUrl ? 'object-cover' : 'object-contain bg-gray-50 p-6'}`}
            />            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-red-600 line-clamp-2">
                  {r.title}
                </a>
                <button
                  onClick={() => toggleFavorite(r.id)}
                  className={`shrink-0 text-xl ${r.isFavorite ? 'text-red-600' : 'text-gray-300 hover:text-red-400'}`}
                  aria-label="Favorito"
                >
                  {r.isFavorite ? '♥' : '♡'}
                </button>
              </div>

              {r.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs rounded-full bg-red-50 px-2 py-1 text-red-700">{r.type.name}</span>
                {r.categories.map((rc) => (
                  <span key={rc.category.name} className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                    {rc.category.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingId(r.id)} className="text-xs text-gray-400 hover:text-red-600">
                  Editar
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-xs text-gray-400 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={editingResource !== null} onClose={() => setEditingId(null)} title="Editar link">
        {editingResource && (
          <ResourceForm
            types={types}
            categories={categories}
            action={handleUpdate}
            submitLabel="Guardar cambios"
            initialValues={{
              title: editingResource.title,
              url: editingResource.url,
              description: editingResource.description,
              typeId: editingResource.typeId,
              categoryIds: editingResource.categories.map((c) => c.categoryId),
            }}
          />
        )}
      </Modal>
    </>
  );
}