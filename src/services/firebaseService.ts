import { 
    collection, 
    doc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    getDoc,
    setDoc 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import type { ConsumedMeal, User } from '../types';
  
  export const firebaseService = {
    // User operations
    async createUser(user: User): Promise<void> {
      await setDoc(doc(db, 'users', user.id), user);
    },
  
    async updateUser(userId: string, userData: Partial<User>): Promise<void> {
      await updateDoc(doc(db, 'users', userId), userData);
    },
  
    async getUser(userId: string): Promise<User | null> {
      const docSnap = await getDoc(doc(db, 'users', userId));
      return docSnap.exists() ? docSnap.data() as User : null;
    },
  
    async getAllUsers(): Promise<User[]> {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as User);
    },
  
    // Consumed meals operations
    async addConsumedMeal(meal: Omit<ConsumedMeal, 'id'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'consumedMeals'), meal);
      return docRef.id;
    },
  
    async updateConsumedMeal(mealId: string, mealData: Partial<ConsumedMeal>): Promise<void> {
      await updateDoc(doc(db, 'consumedMeals', mealId), mealData);
    },
  
    async deleteConsumedMeal(mealId: string): Promise<void> {
      await deleteDoc(doc(db, 'consumedMeals', mealId));
    },
  
    async getUserConsumedMeals(userId: string): Promise<ConsumedMeal[]> {
      const q = query(
        collection(db, 'consumedMeals'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConsumedMeal));
    },
  
    async getConsumedMealsByDate(userId: string, date: string): Promise<ConsumedMeal[]> {
      const q = query(
        collection(db, 'consumedMeals'),
        where('userId', '==', userId),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConsumedMeal));
    }
  };