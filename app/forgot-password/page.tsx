import { requestPasswordReset, verifyResetCode } from '../auth-actions';
import { ForgotPasswordFlow } from '../components/ForgotPasswordFlow';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold mb-1">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500 mb-4">Te enviaremos un código a tu correo.</p>
        <ForgotPasswordFlow requestReset={requestPasswordReset} verifyCode={verifyResetCode} />
      </div>
    </main>
  );
}