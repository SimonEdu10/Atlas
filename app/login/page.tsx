import Link from 'next/link';
import { signIn } from '../auth-actions';
import { AuthForm } from '../components/AuthForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 p-4">
      <div className="rounded-2xl bg-white p-3 shadow-lg shadow-red-900/5 border border-red-100">
        <img src="/images/logo.png" alt="Atlas" className="h-16 w-16 object-contain" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-4">Entra a tu cuenta de Atlas</p>
        <AuthForm
          action={signIn}
          submitLabel="Iniciar sesión"
          fields={[
            { name: 'email', type: 'email', label: 'Correo', placeholder: 'tu@correo.com' },
            { name: 'password', type: 'password', label: 'Contraseña' },
          ]}
        />

        <div className="flex justify-between text-sm mt-4">
          <Link href="/forgot-password" className="text-gray-500 hover:text-red-600">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/register" className="text-red-600 hover:underline">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}