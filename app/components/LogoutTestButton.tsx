'use client';
import { authClient } from '@/lib/auth/client';

export function LogoutTestButton() {
  return (
    <button
      onClick={async () => {
        const result = await authClient.signOut();
        console.log('Resultado de signOut:', result);
        window.location.href = '/';
      }}
      style={{ padding: '8px 16px', background: '#333', color: 'white', borderRadius: '4px' }}
    >
      Cerrar sesión (prueba)
    </button>
  );
}