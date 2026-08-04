'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
/* import { auth } from '@/lib/auth/server'; */
import { revalidatePath } from 'next/cache';
import { Prisma } from '../app/generated/prisma/client';
import { getSessionUser } from '@/lib/session';
import { put } from '@vercel/blob';


async function requireUser() {
    const user = await getSessionUser();
    if (!user) throw new Error('No autenticado');
    return user;
}

const PAGE_SIZE = 8;

export async function getResourcesWithFavorites(filters: {
    typeId?: number;
    categoryId?: number;
    favoritesOnly?: boolean;
    search?: string;
    page?: number;
} = {}) {
    const user = await getSessionUser();
    const userId = user?.id;
    const page = filters.page ?? 1;

    const where = {
        ...(filters.typeId ? { typeId: filters.typeId } : {}),
        ...(filters.categoryId ? { categories: { some: { categoryId: filters.categoryId } } } : {}),
        ...(filters.favoritesOnly && userId ? { favorites: { some: { userId } } } : {}),
        ...(filters.search
            ? {
                OR: [
                    { title: { contains: filters.search, mode: 'insensitive' as const } },
                    { description: { contains: filters.search, mode: 'insensitive' as const } },
                ],
            }
            : {}),
    };

    const [resources, totalCount] = await Promise.all([
        prisma.resource.findMany({
            where,
            include: {
                type: true,
                categories: { include: { category: true } },
                favorites: userId ? { where: { userId } } : false,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.resource.count({ where }),
    ]);

    return {
        resources: resources.map((r) => ({ ...r, isFavorite: userId ? r.favorites.length > 0 : false })),
        totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
        currentPage: page,
    };
}

export async function toggleFavorite(resourceId: number) {
    const user = await requireUser();

    const existing = await prisma.favorite.findUnique({
        where: { userId_resourceId: { userId: user.id, resourceId } },
    });

    if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
        await prisma.favorite.create({ data: { userId: user.id, resourceId } });
    }

    revalidatePath('/');
}

export async function getTypes() {
    return prisma.resourceType.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function saveImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(filename, file, {
    access: 'public',
  });

  return blob.url;
}

export async function createResource(formData: FormData) {
    await requireUser();

    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = (formData.get('description') as string) || null;
    const typeId = Number(formData.get('typeId'));
    const categoryIds = formData.getAll('categoryIds').map(Number);
    const imageFile = formData.get('image') as File | null;

    if (!title || !url || !typeId) return { error: 'Faltan campos obligatorios.' };

    let imgUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
        imgUrl = await saveImage(imageFile);
    }

    try {
        await prisma.resource.create({
            data: {
                title,
                url,
                description,
                typeId,
                imgUrl,
                categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { error: 'Ya guardaste este link antes.' };
        }
        throw error;
    }

    revalidatePath('/');
    return { success: true };
}

export async function deleteResource(id: number) {
    await requireUser();
    await prisma.resource.delete({ where: { id } });
    revalidatePath('/');
}

export async function updateResource(id: number, formData: FormData) {
    await requireUser();

    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = (formData.get('description') as string) || null;
    const typeId = Number(formData.get('typeId'));
    const categoryIds = formData.getAll('categoryIds').map(Number);
    const imageFile = formData.get('image') as File | null;

    if (!title || !url || !typeId) return { error: 'Faltan campos obligatorios.' };

    let imgUrl: string | undefined = undefined;
    if (imageFile && imageFile.size > 0) {
        imgUrl = await saveImage(imageFile);
    }

    try {
        await prisma.resourceCategory.deleteMany({ where: { resourceId: id } });
        await prisma.resource.update({
            where: { id },
            data: {
                title,
                url,
                description,
                typeId,
                ...(imgUrl ? { imgUrl } : {}),
                categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { error: 'Ya existe otro link con esa URL.' };
        }
        throw error;
    }

    revalidatePath('/');
    return { success: true };
}

