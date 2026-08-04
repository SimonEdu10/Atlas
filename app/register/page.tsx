import Link from 'next/link';
import { signUp } from '../auth-actions';
import { AuthForm } from '../components/AuthForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold mb-1">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mb-4">
          Tu cuenta quedará pendiente de aprobación por un administrador.
        </p>

        <AuthForm
          action={signUp}
          submitLabel="Crear cuenta"
          fields={[
            { name: 'name', type: 'text', label: 'Nombre' },
            { name: 'email', type: 'email', label: 'Correo', placeholder: 'tu@correo.com' },
            { name: 'password', type: 'password', label: 'Contraseña (mínimo 8 caracteres)' },
          ]}
        />

        <p className="text-sm text-gray-500 mt-4 text-center">
          ¿Ya tienes cuenta? <Link href="/login" className="text-red-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}