'use client';
import { useState } from 'react';
import { Modal } from './Modal';
import { ResourceForm } from './ResourceForm';
import { useFeedback } from './FeedbackProvider';

type Props = {
  types: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  shareableUsers: { id: string; name: string; email: string }[];
  createResource: (formData: FormData) => Promise<{ error: string } | { success: true }>;
};

export function AddResourceButton({ types, categories, shareableUsers, createResource }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { confirm, showSuccess, showError } = useFeedback();

  async function handleCreate(formData: FormData) {
    const ok = await confirm('¿Confirmas que quieres guardar este link?');
    if (!ok) return;

    try {
      const result = await createResource(formData);
      if (result && 'error' in result) {
        showError(result.error);
        return;
      }
      showSuccess('Link guardado correctamente.');
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error inesperado al guardar el link.');
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 text-white text-2xl font-bold shadow-lg hover:bg-red-700 flex items-center justify-center z-40"
        aria-label="Agregar link"
      >
        +
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar link">
        <ResourceForm types={types} categories={categories} shareableUsers={shareableUsers} action={handleCreate} />
      </Modal>
    </>
  );
}