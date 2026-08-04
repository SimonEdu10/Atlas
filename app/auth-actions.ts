'use server';

import { randomBytes, createHash } from 'crypto';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function signUp(formData: FormData) {
  const name = formData.get('name') as string;
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!name || !email || !password) return { error: 'Faltan campos obligatorios.' };
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Ya existe una cuenta con este correo.' };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  await createSession(user.id);
  redirect('/');
}

export async function signIn(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Faltan campos obligatorios.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Correo o contraseña incorrectos.' };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: 'Correo o contraseña incorrectos.' };

  await createSession(user.id);
  redirect('/');
}

export async function signOutAction() {
  await destroySession();
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  if (!email) return { error: 'Falta el correo.' };

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

    await transporter.sendMail({
      from: `Atlas <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Tu código de recuperación de Atlas',
      html: `<p>Tu código de verificación es:</p><h2 style="letter-spacing:4px;">${code}</h2><p>Vence en 15 minutos.</p>`,
    });
  }

  return { success: true };
}

export async function verifyResetCode(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const code = (formData.get('code') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !code || !password) return { error: 'Faltan datos.' };
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Código inválido o expirado.' };

  const tokenHash = createHash('sha256').update(code).digest('hex');
  const resetToken = await prisma.passwordResetToken.findFirst({ where: { userId: user.id, tokenHash } });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: 'Código inválido o expirado.' };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  return { success: true };
}