'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export type UserProfile = {
    email: string;
    fullName: string;
    createdAt: any;
    avatar: string;
};

// Creates a user profile document in Firestore.
// Assigns a default avatar if one is not provided.
export async function createUserProfile(userId: string, data: Partial<UserProfile>, merge = false) {
    const userDocRef = doc(db, 'users', userId);

    const profileData = {
        email: data.email,
        fullName: data.fullName,
        createdAt: serverTimestamp(),
        // Ensure avatar has a default value to prevent undefined errors in Firestore
        avatar: data.avatar || `https://placehold.co/80x80.png`, 
    };

    if (merge) {
        // For social logins, don't overwrite existing data if the user already exists.
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
             await setDoc(userDocRef, profileData);
        }
    } else {
        await setDoc(userDocRef, profileData);
    }
    
    // Return the full profile to be used immediately after creation
    return profileData;
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamp to Date object if needed
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate();
        }
        return data as UserProfile;
    } else {
        return null;
    }
}
