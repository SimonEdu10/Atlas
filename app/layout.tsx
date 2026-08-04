import Link from 'next/link';
import { FeedbackProvider } from './components/FeedbackProvider';
import { getSessionUser } from '@/lib/session';
import { signOutAction } from './auth-actions';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const isAdmin = user?.role === 'ADMIN';
  const isPending = user?.role === 'PENDING';

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <header className="flex h-16 items-center justify-between border-b border-red-100 bg-white/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Atlas" className="h-9 w-9 object-contain" />
              <h1 className="text-lg font-bold tracking-tight">Atlas</h1>
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">
                Administración
              </Link>
            )}
          </div>

          {user ? (
            <form action={signOutAction}>
              <button type="submit" className="text-sm text-gray-500 hover:text-red-600">
                {user.name} · Cerrar sesión
              </button>
            </form>
          ) : (
            <Link href="/login" className="text-sm text-gray-500 hover:text-red-600">
              Iniciar sesión
            </Link>
          )}
        </header>

        <FeedbackProvider>
          {isPending ? (
            <main className="mx-auto max-w-md p-6 py-24 text-center">
              <h2 className="text-xl font-bold mb-2">Cuenta pendiente de aprobación</h2>
              <p className="text-gray-500">
                Un administrador debe activar tu cuenta antes de que puedas usar Atlas.
              </p>
            </main>
          ) : (
            children
          )}
        </FeedbackProvider>
      </body>
    </html>
  );
}