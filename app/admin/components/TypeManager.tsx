'use client';
import { useState } from 'react';
import { Modal } from '@/app/components/Modal';
import { useFeedback } from '@/app/components/FeedbackProvider';

type ResourceType = { id: number; name: string };

type Props = {
  types: ResourceType[];
  createType: (formData: FormData) => Promise<void>;
  updateType: (id: number, formData: FormData) => Promise<void>;
  deleteType: (id: number) => Promise<void>;
};

function TypeForm({ action, defaultValue, submitLabel }: { action: (formData: FormData) => Promise<void>; defaultValue?: string; submitLabel: string }) {
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
        <input name="name" required defaultValue={defaultValue} className="w-full rounded-lg border border-red-100 p-2" />
      </div>
      <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
        {submitLabel}
      </button>
    </form>
  );
}

export function TypeManager({ types, createType, updateType, deleteType }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = types.find((t) => t.id === editingId) ?? null;
  const { confirm, showSuccess } = useFeedback();

  async function handleCreate(formData: FormData) {
    const ok = await confirm('¿Confirmas que quieres crear este tipo?');
    if (!ok) return;

    await createType(formData);
    showSuccess('Tipo creado correctamente.');
    setIsCreating(false);
  }

  async function handleUpdate(formData: FormData) {
    if (editingId == null) return;
    const ok = await confirm('¿Confirmas que quieres guardar los cambios?');
    if (!ok) return;

    await updateType(editingId, formData);
    showSuccess('Tipo actualizado correctamente.');
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    const ok = await confirm('¿Seguro que quieres eliminar este tipo? Esta acción no se puede deshacer.');
    if (!ok) return;

    await deleteType(id);
    showSuccess('Tipo eliminado correctamente.');
  }

  return (
    <>
      {types.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Todavía no hay tipos creados.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {types.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-3">
              <span>{t.name}</span>
              <div className="flex gap-3">
                <button onClick={() => setEditingId(t.id)} className="text-sm text-gray-400 hover:text-red-600">
                  Editar
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-sm text-gray-400 hover:text-red-600">
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
        aria-label="Agregar tipo"
      >
        +
      </button>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Agregar tipo">
        <TypeForm action={handleCreate} submitLabel="Guardar tipo" />
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditingId(null)} title="Editar tipo">
        {editing && <TypeForm action={handleUpdate} defaultValue={editing.name} submitLabel="Guardar cambios" />}
      </Modal>
    </>
  );
}