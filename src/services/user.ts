import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

export async function updateUserSettings(userId: string, settings: Partial<User['settings']>) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        settings: {
          ...userDoc.data().settings,
          ...settings,
        },
        updatedAt: new Date(),
      });
    } else {
      // Create new document if it doesn't exist
      await setDoc(userRef, {
        settings: settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
} 