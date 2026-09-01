import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe,
  getDocFromServer,
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

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const docRef = doc(db, 'shared_apps', DEFAULT_ROOM_ID);
    await getDocFromServer(docRef);
    return true;
  } catch (error) {
    console.warn('Firestore connection test info:', error);
    return false;
  }
}

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
      } else {
        // Document doesn't exist yet on cloud, so it will be created on first user edit
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

export async function pushStateToCloud(
  state: AppState,
  updatedBy: string = 'Sevgilim',
  roomId: string = DEFAULT_ROOM_ID
): Promise<boolean> {
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
    return true;
  } catch (error) {
    console.error('Failed to sync state to Firebase:', error);
    return false;
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
