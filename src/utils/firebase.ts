import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { AppState } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the specific provisioned database ID
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ''
    ? firebaseConfig.firestoreDatabaseId
    : '(default)'
);

const DEFAULT_ROOM_ID = 'couple-main';

export function subscribeToSharedState(
  roomId: string = DEFAULT_ROOM_ID,
  onRemoteUpdate: (remoteState: AppState) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'shared_apps', roomId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.state) {
          onRemoteUpdate(data.state as AppState);
        }
      }
    },
    (error) => {
      console.warn('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

export async function pushStateToCloud(
  state: AppState,
  updatedBy: string = 'Murat',
  roomId: string = DEFAULT_ROOM_ID
): Promise<void> {
  try {
    const docRef = doc(db, 'shared_apps', roomId);
    await setDoc(
      docRef,
      {
        state,
        lastUpdated: Date.now(),
        updatedBy,
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Failed to sync state to Firebase:', error);
  }
}

export async function fetchRemoteState(
  roomId: string = DEFAULT_ROOM_ID
): Promise<AppState | null> {
  try {
    const docRef = doc(db, 'shared_apps', roomId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.state as AppState) || null;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching remote state:', err);
    return null;
  }
}
