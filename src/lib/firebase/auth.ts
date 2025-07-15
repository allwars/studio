'use client';

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/services/userService';


type AuthResult = {
    user?: User;
    error?: string;
}

const formatAuthError = (error: any): string => {
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No user found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use':
                return 'This email is already in use.';
            case 'auth/weak-password':
                return 'The password is too weak. It must be at least 6 characters long.';
            case 'auth/invalid-email':
                 return 'The email address is not valid.';
            default:
                return 'An unknown error occurred. Please try again.';
        }
    }
    return error.message;
};


export async function handleSignUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: fullName });

        // Create user profile in Firestore
        await createUserProfile(user.uid, {
            email: user.email!,
            fullName: fullName,
            createdAt: new Date(),
        });
        
        return { user };
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}


export async function handleEmailLogin(email: string, password: string): Promise<AuthResult> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user };
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}


export async function handleGoogleLogin(): Promise<AuthResult> {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Optionally, create a user profile in Firestore if they don't have one
        await createUserProfile(user.uid, {
            email: user.email!,
            fullName: user.displayName || 'Google User',
            createdAt: new Date(),
        }, true); // `true` to merge and not overwrite

        return { user };
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}


export async function handleLogout(): Promise<{ error?: string }> {
    try {
        await signOut(auth);
        return {};
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}