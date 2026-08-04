'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal } from './Modal';

type ConfirmState = { message: string; resolve: (value: boolean) => void } | null;

type FeedbackContextType = {
  confirm: (message: string) => Promise<boolean>;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2500);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  function handleConfirm(result: boolean) {
    confirmState?.resolve(result);
    setConfirmState(null);
  }

  return (
    <FeedbackContext.Provider value={{ confirm, showSuccess, showError }}>
      {children}

      <Modal isOpen={confirmState !== null} onClose={() => handleConfirm(false)} title="Confirmar">
        <p className="text-gray-600 mb-6">{confirmState?.message}</p>
        <div className="flex gap-3">
          <button onClick={() => handleConfirm(false)} className="flex-1 rounded-lg border border-gray-200 py-2 font-semibold text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => handleConfirm(true)} className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700">
            Confirmar
          </button>
        </div>
      </Modal>

      <Modal isOpen={successMessage !== null} onClose={() => setSuccessMessage(null)} title="¡Listo!">
        <p className="text-gray-600">{successMessage}</p>
      </Modal>

      <Modal isOpen={errorMessage !== null} onClose={() => setErrorMessage(null)} title="No se pudo completar">
        <p className="text-gray-600">{errorMessage}</p>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return ctx;
}