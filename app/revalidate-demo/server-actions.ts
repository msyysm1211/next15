'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateByTag(tag: string) {
  revalidateTag(tag);
}

export async function revalidateByPath(path: string) {
  revalidatePath(path);
}
