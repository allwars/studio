'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { PantryItem } from '@/app/dashboard/pantry/page';

// For simplicity, we'll use a hardcoded user ID.
// In a real application, this would come from an authentication session.
const USER_ID = 'user-123';
const PANTRY_COLLECTION = `users/${USER_ID}/pantry`;

export async function getPantryItems(): Promise<PantryItem[]> {
  const pantryCollectionRef = collection(db, PANTRY_COLLECTION);
  const snapshot = await getDocs(pantryCollectionRef);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
}

export async function addItemsToPantry(items: Omit<PantryItem, 'id'>[]): Promise<PantryItem[]> {
  const batch = writeBatch(db);
  const newItems: PantryItem[] = [];

  items.forEach(itemData => {
    const newItemRef = doc(collection(db, PANTRY_COLLECTION));
    batch.set(newItemRef, itemData);
    newItems.push({ id: newItemRef.id, ...itemData });
  });

  await batch.commit();
  return newItems;
}

export async function updatePantryItem(item: PantryItem): Promise<void> {
  const itemDocRef = doc(db, PANTRY_COLLECTION, item.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...itemData } = item;
  await updateDoc(itemDocRef, itemData);
}

export async function removePantryItem(itemId: string): Promise<void> {
  const itemDocRef = doc(db, PANTRY_COLLECTION, itemId);
  await deleteDoc(itemDocRef);
}