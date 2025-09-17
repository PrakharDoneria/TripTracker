
import { app } from './firebase';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  documentId,
  setDoc,
} from 'firebase/firestore';
import type { Trip, UserProfile, Business } from './types';

const db = getFirestore(app);

// Helper to convert Firestore Timestamps to JS Dates in nested objects
const convertTimestampsToDates = (data: any): any => {
    if (data?.startTime instanceof Timestamp) {
        data.startTime = data.startTime.toDate();
    }
    if (data?.endTime instanceof Timestamp) {
        data.endTime = data.endTime.toDate();
    }
    return data;
}

// --- User Profile Functions ---

export const createUserProfile = async (user: { uid: string; email: string | null }) => {
  if (!user.email) {
    throw new Error("Cannot create profile for user without an email.");
  }
  const userRef = doc(db, 'users', user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
  };
  await setDoc(userRef, userProfile);
  return userProfile;
};

export const getUserProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (userSnap.empty) {
        return null;
    }
    return userSnap.docs[0].data() as UserProfile;
}

export const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(usersQuery);
    if (querySnapshot.empty) {
        return null;
    }
    // Assuming email is unique
    return querySnapshot.docs[0].data() as UserProfile;
}


// --- Trip Functions ---

const tripsCollectionRef = collection(db, 'trips');

export const getTripsFromFirestore = async (userId: string) => {
    const q = query(tripsCollectionRef, where('participants', 'array-contains', userId));
    const tripSnapshot = await getDocs(q);
    const tripList = tripSnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = convertTimestampsToDates(data);
        return { ...convertedData, id: doc.id } as Trip;
    });
    return tripList.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export const addTripToFirestore = async (trip: Omit<Trip, 'id'>) => {
    const docRef = await addDoc(tripsCollectionRef, trip);
    return docRef.id;
};

export const updateTripInFirestore = async (tripId: string, trip: Partial<Omit<Trip, 'id'>>) => {
    const tripDoc = doc(db, 'trips', tripId);
    await updateDoc(tripDoc, trip);
};

export const deleteTripFromFirestore = async (tripId: string) => {
    const tripDoc = doc(db, 'trips', tripId);
    await deleteDoc(tripDoc);
};


// --- Business Functions ---

const businessesCollectionRef = collection(db, 'businesses');

export const getBusinessesFromFirestore = async () => {
    const businessSnapshot = await getDocs(businessesCollectionRef);
    const businessList = businessSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as Business;
    });
    return businessList;
};

export const addBusinessToFirestore = async (business: Omit<Business, 'id'>) => {
    const docRef = await addDoc(businessesCollectionRef, business);
    return docRef.id;
};
