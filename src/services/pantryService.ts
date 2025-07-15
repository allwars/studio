import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';

export type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    unit: 'g' | 'kg' | 'l' | 'ml' | 'units';
};

const getPantryCollection = (userId: string) => {
    return collection(db, 'users', userId, 'pantry');
};

// MOCK USER ID
const MOCK_USER_ID = 'user-123';

export async function getPantryItems(userId: string = MOCK_USER_ID): Promise<PantryItem[]> {
    const pantryCol = getPantryCollection(userId);
    const pantrySnapshot = await getDocs(pantryCol);
    return pantrySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PantryItem));
}

export async function addItemToPantry(item: Omit<PantryItem, 'id'>, userId: string = MOCK_USER_ID): Promise<PantryItem> {
    const pantryCol = getPantryCollection(userId);
    const docRef = await addDoc(pantryCol, item);
    return { ...item, id: docRef.id };
}

export async function addItemsToPantry(items: Omit<PantryItem, 'id'>[], userId: string = MOCK_USER_ID): Promise<void> {
    const pantryCol = getPantryCollection(userId);
    const batch = writeBatch(db);

    items.forEach(item => {
        const docRef = doc(pantryCol); // Automatically generate new doc ID
        batch.set(docRef, item);
    });

    await batch.commit();
}


export async function updatePantryItem(item: PantryItem, userId: string = MOCK_USER_ID): Promise<void> {
    const docRef = doc(db, 'users', userId, 'pantry', item.id);
    await updateDoc(docRef, { name: item.name, quantity: item.quantity, unit: item.unit });
}

export async function removePantryItem(itemId: string, userId: string = MOCK_USER_ID): Promise<void> {
    const docRef = doc(db, 'users', userId, 'pantry', itemId);
    await deleteDoc(docRef);
}
