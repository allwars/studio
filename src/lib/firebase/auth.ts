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
            case 'auth/wrong-password':
                return 'Invalid credentials. Please check your email and password.';
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
        const profileData = await createUserProfile(user.uid, {
            email: user.email!,
            fullName: fullName,
        });

        // Store profile in localStorage for immediate use
        localStorage.setItem('userProfile', JSON.stringify({ fullName, email, avatar: profileData.avatar }));
        
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

        const profileData = await createUserProfile(user.uid, {
            email: user.email!,
            fullName: user.displayName || 'Google User',
            avatar: user.photoURL || undefined
        }, true);

        // Store profile in localStorage for immediate use
        localStorage.setItem('userProfile', JSON.stringify({
             fullName: user.displayName || 'Google User', 
             email: user.email, 
             avatar: user.photoURL || profileData.avatar,
        }));

        return { user };
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}


export async function handleLogout(): Promise<{ error?: string }> {
    try {
        await signOut(auth);
        localStorage.removeItem('userProfile');
        localStorage.removeItem('fitnessGoal');
        localStorage.removeItem('pantryItems');
        localStorage.removeItem('activityLog');
    } catch (error: any) {
        return { error: formatAuthError(error) };
    }
}
