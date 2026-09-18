import React, { createContext, useContext, useState, useEffect } from 'react';
import { Observation, Worker, LocationItem, Category, SupervisorUser } from '../types';
import { db, isConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { 
  INITIAL_WORKERS, 
  INITIAL_LOCATIONS, 
  INITIAL_CATEGORIES 
} from '../data/mockData';

interface DataContextType {
  observations: Observation[];
  workers: Worker[];
  locations: LocationItem[];
  categories: Category[];
  supervisors: SupervisorUser[];
  loading: boolean;
  error: string | null;
  addObservation: (data: {
    categoryId: string;
    categoryName: string;
    locationId: string;
    locationName: string;
    workerId: string;
    workerName: string;
    description: string;
  }) => Promise<void>;
  closeObservation: (observationId: string) => Promise<void>;
  pauseObservation: (observationId: string, pauseReason: string, reviewDate: string) => Promise<void>;
  reopenObservation: (observationId: string) => Promise<void>;
  addWorker: (name: string, department: string) => Promise<void>;
  toggleWorkerStatus: (id: string, active: boolean) => Promise<void>;
  addLocation: (name: string) => Promise<void>;
  toggleLocationStatus: (id: string, active: boolean) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  toggleCategoryStatus: (id: string, active: boolean) => Promise<void>;
  seedStarterData: () => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isFirebaseLive } = useAuth();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize with Cloud Firestore as the single source of truth
  useEffect(() => {
    if (!isFirebaseLive || !db) {
      setLoading(false);
      setError('تعذر تحميل البيانات حالياً. تحقق من الاتصال ثم حاول مرة أخرى.');
      return;
    }

    if (!currentUser) {
      setObservations([]);
      setWorkers([]);
      setLocations([]);
      setCategories([]);
      setSupervisors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Observations listener (real-time stream)
    const obsQuery = query(collection(db, 'observations'), orderBy('createdAt', 'desc'));
    const unsubObs = onSnapshot(
      obsQuery,
      (snap) => {
        const list: Observation[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setObservations(list);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore Observations Error:', err);
        setError('تعذر تحميل البيانات حالياً. تحقق من الاتصال ثم حاول مرة أخرى.');
        setLoading(false);
      }
    );

    // 2. Workers listener
    const unsubWorkers = onSnapshot(
      collection(db, 'workers'),
      (snap) => {
        const list: Worker[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setWorkers(list);
      },
      (err) => {
        console.error('Firestore Workers Error:', err);
      }
    );

    // 3. Locations listener
    const unsubLoc = onSnapshot(
      collection(db, 'locations'),
      (snap) => {
        const list: LocationItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setLocations(list);
      },
      (err) => {
        console.error('Firestore Locations Error:', err);
      }
    );

    // 4. Categories listener
    const unsubCat = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const list: Category[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setCategories(list);
      },
      (err) => {
        console.error('Firestore Categories Error:', err);
      }
    );

    // 5. Supervisors (Users) listener
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: SupervisorUser[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setSupervisors(list);
      },
      (err) => {
        console.error('Firestore Users Error:', err);
      }
    );

    return () => {
      unsubObs();
      unsubWorkers();
      unsubLoc();
      unsubCat();
      unsubUsers();
    };
  }, [isFirebaseLive, currentUser]);

  // 1. ADD OBSERVATION
  const addObservation = async (data: {
    categoryId: string;
    categoryName: string;
    locationId: string;
    locationName: string;
    workerId: string;
    workerName: string;
    description: string;
  }) => {
    if (!currentUser || !db) throw new Error('يجب تسجيل الدخول أولاً');

    const newObsData = {
      description: data.description.trim(),
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      locationId: data.locationId,
      locationName: data.locationName,
      workerId: data.workerId,
      workerName: data.workerName,
      status: 'OPEN' as const,
      createdBy: currentUser.id,
      createdByName: currentUser.displayName,
      pausedBy: null,
      pausedByName: null,
      pausedAt: null,
      pauseReason: null,
      reviewDate: null,
      closedBy: null,
      closedByName: null,
      closedAt: null,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'observations'), newObsData);
    } catch (err: any) {
      console.error('Add Observation Error:', err);
      throw new Error('تعذر حفظ الملاحظة في قاعدة البيانات. حاول مرة أخرى.');
    }
  };

  // 2. CLOSE OBSERVATION
  const closeObservation = async (observationId: string) => {
    if (!currentUser || !db) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      const obsRef = doc(db, 'observations', observationId);
      await updateDoc(obsRef, {
        status: 'CLOSED' as const,
        closedBy: currentUser.id,
        closedByName: currentUser.displayName,
        closedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Close Observation Error:', err);
      throw new Error('تعذر إغلاق الملاحظة. حاول مرة أخرى.');
    }
  };

  // 3. PAUSE OBSERVATION
  const pauseObservation = async (observationId: string, pauseReason: string, reviewDate: string) => {
    if (!currentUser || !db) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      const obsRef = doc(db, 'observations', observationId);
      await updateDoc(obsRef, {
        status: 'PAUSED' as const,
        pausedBy: currentUser.id,
        pausedByName: currentUser.displayName,
        pauseReason: pauseReason.trim(),
        reviewDate: reviewDate || null,
        pausedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Pause Observation Error:', err);
      throw new Error('تعذر تعليق الملاحظة. حاول مرة أخرى.');
    }
  };

  // 4. REOPEN OBSERVATION
  const reopenObservation = async (observationId: string) => {
    if (!currentUser || !db) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      const obsRef = doc(db, 'observations', observationId);
      await updateDoc(obsRef, {
        status: 'OPEN' as const,
      });
    } catch (err: any) {
      console.error('Reopen Observation Error:', err);
      throw new Error('تعذر إعادة فتح الملاحظة. حاول مرة أخرى.');
    }
  };

  // ADMIN OPERATIONS
  const addWorker = async (name: string, department: string) => {
    if (!db) throw new Error('قاعدة البيانات غير متصلة');
    try {
      await addDoc(collection(db, 'workers'), {
        name: name.trim(),
        department: department.trim(),
        active: true,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Add Worker Error:', err);
      throw new Error('تعذر إضافة الفني/العامل. حاول مرة أخرى.');
    }
  };

  const toggleWorkerStatus = async (id: string, active: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'workers', id), { active });
    } catch (err: any) {
      console.error('Toggle Worker Error:', err);
      throw new Error('تعذر تعديل حالة الفني.');
    }
  };

  const addLocation = async (name: string) => {
    if (!db) throw new Error('قاعدة البيانات غير متصلة');
    try {
      await addDoc(collection(db, 'locations'), {
        name: name.trim(),
        active: true,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Add Location Error:', err);
      throw new Error('تعذر إضافة الموقع. حاول مرة أخرى.');
    }
  };

  const toggleLocationStatus = async (id: string, active: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'locations', id), { active });
    } catch (err: any) {
      console.error('Toggle Location Error:', err);
      throw new Error('تعذر تعديل حالة الموقع.');
    }
  };

  const addCategory = async (name: string) => {
    if (!db) throw new Error('قاعدة البيانات غير متصلة');
    try {
      await addDoc(collection(db, 'categories'), {
        name: name.trim(),
        active: true,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Add Category Error:', err);
      throw new Error('تعذر إضافة التصنيف. حاول مرة أخرى.');
    }
  };

  const toggleCategoryStatus = async (id: string, active: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'categories', id), { active });
    } catch (err: any) {
      console.error('Toggle Category Error:', err);
      throw new Error('تعذر تعديل حالة التصنيف.');
    }
  };

  /**
   * First-Run Starter Data Initializer:
   * Safely seeds starter reference data (categories, locations, workers)
   * into Firestore if empty, without generating duplicates.
   */
  const seedStarterData = async (): Promise<{ success: boolean; message: string }> => {
    if (!db) return { success: false, message: 'قاعدة البيانات غير متصلة' };

    try {
      let seededItemsCount = 0;

      // 1. Categories
      const catSnap = await getDocs(collection(db, 'categories'));
      if (catSnap.empty) {
        for (const cat of INITIAL_CATEGORIES) {
          await addDoc(collection(db, 'categories'), {
            name: cat.name,
            active: true,
            createdAt: serverTimestamp(),
          });
          seededItemsCount++;
        }
      }

      // 2. Locations
      const locSnap = await getDocs(collection(db, 'locations'));
      if (locSnap.empty) {
        for (const loc of INITIAL_LOCATIONS) {
          await addDoc(collection(db, 'locations'), {
            name: loc.name,
            active: true,
            createdAt: serverTimestamp(),
          });
          seededItemsCount++;
        }
      }

      // 3. Workers
      const workSnap = await getDocs(collection(db, 'workers'));
      if (workSnap.empty) {
        for (const w of INITIAL_WORKERS) {
          await addDoc(collection(db, 'workers'), {
            name: w.name,
            department: w.department,
            active: true,
            createdAt: serverTimestamp(),
          });
          seededItemsCount++;
        }
      }

      if (seededItemsCount === 0) {
        return { success: true, message: 'البيانات الأساسية مهيأة مسبقاً بالفعل في Firestore.' };
      }

      return { success: true, message: `تمت تهيئة ${seededItemsCount} عنصراً أساسياً بنجاح في قاعدة البيانات!` };
    } catch (err: any) {
      console.error('Seed Starter Data Error:', err);
      return { success: false, message: 'تعذر تهيئة البيانات الأساسية في Firestore. تأكد من إعداد القواعد والاتصال.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        observations,
        workers,
        locations,
        categories,
        supervisors,
        loading,
        error,
        addObservation,
        closeObservation,
        pauseObservation,
        reopenObservation,
        addWorker,
        toggleWorkerStatus,
        addLocation,
        toggleLocationStatus,
        addCategory,
        toggleCategoryStatus,
        seedStarterData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
