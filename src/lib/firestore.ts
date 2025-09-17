
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
} from 'firebase/firestore';
import type { Trip } from './types';

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

const getTripsCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'trips');
};

export const getTripsFromFirestore = async (userId: string) => {
    const tripsCollection = getTripsCollectionRef(userId);
    const tripSnapshot = await getDocs(tripsCollection);
    const tripList = tripSnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = convertTimestampsToDates(data);
        return { ...convertedData, id: doc.id } as Trip;
    });
    return tripList.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export const addTripToFirestore = async (userId: string, trip: Omit<Trip, 'id'>) => {
    const tripsCollection = getTripsCollectionRef(userId);
    const docRef = await addDoc(tripsCollection, trip);
    return docRef.id;
};

export const updateTripInFirestore = async (userId: string, tripId: string, trip: Omit<Trip, 'id'>) => {
    const tripDoc = doc(db, 'users', userId, 'trips', tripId);
    await updateDoc(tripDoc, trip);
};

export const deleteTripFromFirestore = async (userId: string, tripId: string) => {
    const tripDoc = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(tripDoc);
};
