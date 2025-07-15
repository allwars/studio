import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type UserProfile = {
    email: string;
    fullName: string;
    createdAt: Date;
    avatar?: string;
};

export async function createUserProfile(userId: string, data: UserProfile, merge = false) {
    const userDocRef = doc(db, 'users', userId);
    
    if (merge) {
        // For social logins, don't overwrite existing data if the user already exists.
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
             await setDoc(userDocRef, data);
        }
    } else {
        await setDoc(userDocRef, data);
    }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
}
