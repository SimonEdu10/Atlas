'use client';
import { useState } from 'react';
import { Modal } from '@/app/components/Modal';
import { useFeedback } from '@/app/components/FeedbackProvider';

type Category = { id: number; name: string };

type Props = {
  categories: Category[];
  createCategory: (formData: FormData) => Promise<void>;
  updateCategory: (id: number, formData: FormData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
};

function CategoryForm({
  action,
  defaultName,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultName?: string;
  submitLabel: string;
}) {
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
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input name="name" required defaultValue={defaultName} className="w-full rounded-lg border border-red-100 p-2" />
      </div>
      <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
        {submitLabel}
      </button>
    </form>
  );
}

export function CategoryManager({ categories, createCategory, updateCategory, deleteCategory }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = categories.find((c) => c.id === editingId) ?? null;
  const { confirm, showSuccess } = useFeedback();

  async function handleCreate(formData: FormData) {
    const ok = await confirm('¿Confirmas que quieres crear esta categoría?');
    if (!ok) return;

    await createCategory(formData);
    showSuccess('Categoría creada correctamente.');
    setIsCreating(false);
  }

  async function handleUpdate(formData: FormData) {
    if (editingId == null) return;
    const ok = await confirm('¿Confirmas que quieres guardar los cambios?');
    if (!ok) return;

    await updateCategory(editingId, formData);
    showSuccess('Categoría actualizada correctamente.');
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    const ok = await confirm('¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.');
    if (!ok) return;

    await deleteCategory(id);
    showSuccess('Categoría eliminada correctamente.');
  }

  return (
    <>
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Todavía no hay categorías creadas.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-3">
              <span>{c.name}</span>
              <div className="flex gap-3">
                <button onClick={() => setEditingId(c.id)} className="text-sm text-gray-400 hover:text-red-600">
                  Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-sm text-gray-400 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 text-white text-2xl font-bold shadow-lg hover:bg-red-700 flex items-center justify-center z-40"
        aria-label="Agregar categoría"
      >
        +
      </button>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Agregar categoría">
        <CategoryForm action={handleCreate} submitLabel="Guardar categoría" />
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditingId(null)} title="Editar categoría">
        {editing && <CategoryForm action={handleUpdate} defaultName={editing.name} submitLabel="Guardar cambios" />}
      </Modal>
    </>
  );
}