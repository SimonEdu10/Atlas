'use client';
import { useState, useTransition } from 'react';

type Props = {
    requestReset: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;
    verifyCode: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;
};

export function ForgotPasswordFlow({ requestReset, verifyCode }: Props) {
    const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const emailValue = formData.get('email') as string;

        startTransition(async () => {
            const result = await requestReset(formData);
            if (result?.error) {
                setError(result.error);
                return;
            }
            setEmail(emailValue);
            setStep('code');
        });
    }

    function handleCodeSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await verifyCode(formData);
            if (result?.error) {
                setError(result.error);
                return;
            }
            setStep('done');
        });
    }

    if (step === 'done') {
        return <p className="text-sm text-green-600">Contraseña actualizada. Ya puedes iniciar sesión.</p>;
    }

    if (step === 'email') {
        return (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Correo</label>
                    <input name="email" type="email" required placeholder="tu@correo.com" className="w-full rounded-lg border border-red-100 p-2" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={isPending} className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                    {isPending ? 'Enviando...' : 'Enviar código'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <p className="text-sm text-gray-500">Enviamos un código de 6 dígitos a {email}.</p>

            <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                    name="code"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className="w-full rounded-lg border border-red-100 p-2 tracking-widest text-center text-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                <input name="password" type="password" required placeholder="Mínimo 8 caracteres" className="w-full rounded-lg border border-red-100 p-2" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={isPending} className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {isPending ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-400 hover:text-red-600">
                Usar otro correo
            </button>
        </form>
    );
}