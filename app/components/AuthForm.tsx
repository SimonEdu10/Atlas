'use client';
import { useState, useTransition } from 'react';

type Field = { name: string; type: string; label: string; placeholder?: string };

type Props = {
  fields: Field[];
  action: (formData: FormData) => Promise<{ error?: string; success?: string } | void>;
  submitLabel: string;
  hiddenValues?: Record<string, string>;
};

export function AuthForm({ fields, action, submitLabel, hiddenValues }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hiddenValues &&
        Object.entries(hiddenValues).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          <input
            name={f.name}
            type={f.type}
            required
            placeholder={f.placeholder}
            className="w-full rounded-lg border border-red-100 p-2"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : submitLabel}
      </button>
    </form>
  );
}