'use client';
import { useState } from 'react';
import { Modal } from './Modal';
import { ResourceForm } from './ResourceForm';
import { useFeedback } from './FeedbackProvider';

type Props = {
    types: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    createResource: (formData: FormData) => Promise<void>;
};

export function AddResourceButton({ types, categories, createResource }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { confirm, showSuccess, showError } = useFeedback();
    /* async function handleCreate(formData: FormData) {
      const ok = await confirm('¿Confirmas que quieres guardar este link?');
      if (!ok) return;
  
      await createResource(formData);
      showSuccess('Link guardado correctamente.');
      setIsOpen(false);
    } */

    async function handleCreate(formData: FormData) {
        const ok = await confirm('¿Confirmas que quieres guardar este link?');
        if (!ok) return;

        const result = await createResource(formData);
        if (result?.error) {
            showError(result.error);
            return;
        }

        showSuccess('Link guardado correctamente.');
        setIsOpen(false);
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
                <ResourceForm types={types} categories={categories} action={handleCreate} />
            </Modal>
        </>
    );
}