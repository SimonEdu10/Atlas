'use client';
import { useState } from 'react';
import { useFeedback } from '@/app/components/FeedbackProvider';
import { Role } from '../../generated/prisma/client';

type User = { id: string; name: string; email: string; role: string };

type Props = {
  users: User[];
  updateUserRole: (userId: string, role: Role) => Promise<void>;
};

const roleLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  USER: 'Usuario',
  ADMIN: 'Admin',
};

const roleColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  USER: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-red-50 text-red-700',
};

export function UserManager({ users, updateUserRole }: Props) {
  const { confirm, showSuccess } = useFeedback();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleChange(userId: string, name: string, newRole: Role) {
    const ok = await confirm(`¿Confirmas que quieres cambiar el rol de ${name} a "${roleLabels[newRole]}"?`);
    if (!ok) return;

    setLoadingId(userId);
    await updateUserRole(userId, newRole);
    setLoadingId(null);
    showSuccess('Rol actualizado correctamente.');
  }

  if (users.length === 0) {
    return <p className="text-gray-400 text-center py-16">No hay usuarios registrados todavía.</p>;
  }

  return (
    <ul className="space-y-2">
      {users.map((u) => (
        <li key={u.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-3">
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs rounded-full px-2 py-1 ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
            <select
              value={u.role}
              disabled={loadingId === u.id}
              onChange={(e) => handleChange(u.id, u.name, e.target.value as Role)}
              className="rounded-lg border border-red-100 p-2 text-sm"
            >
              <option value="PENDING">Pendiente</option>
              <option value="USER">Usuario</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </li>
      ))}
    </ul>
  );
}