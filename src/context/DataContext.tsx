import React, { createContext, useContext, useState, useEffect } from 'react';
import { Observation, Worker, LocationItem, Category, SupervisorUser } from '../types';
import { db, isConfigured, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  INITIAL_OBSERVATIONS, 
  INITIAL_WORKERS, 
  INITIAL_LOCATIONS, 
  INITIAL_CATEGORIES,
  INITIAL_SUPERVISORS 
} from '../data/mockData';

interface DataContextType {
  observations: Observation[];
  workers: Worker[];
  locations: LocationItem[];
  categories: Category[];
  supervisors: SupervisorUser[];
  loading: boolean;
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
  resetDemoData: () => void;
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

  // Initialize state from local storage or Firestore
  useEffect(() => {
    if (isFirebaseLive && db && currentUser) {
      setLoading(true);

      // 1. Observations listener
      const obsPath = 'observations';
      const obsQuery = query(collection(db, obsPath), orderBy('createdAt', 'desc'));
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
          handleFirestoreError(err, OperationType.GET, obsPath);
        }
      );

      // 2. Workers listener
      const workersPath = 'workers';
      const unsubWorkers = onSnapshot(
        collection(db, workersPath),
        (snap) => {
          const list: Worker[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setWorkers(list.length > 0 ? list : INITIAL_WORKERS);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, workersPath);
        }
      );

      // 3. Locations listener
      const locPath = 'locations';
      const unsubLoc = onSnapshot(
        collection(db, locPath),
        (snap) => {
          const list: LocationItem[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setLocations(list.length > 0 ? list : INITIAL_LOCATIONS);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, locPath);
        }
      );

      // 4. Categories listener
      const catPath = 'categories';
      const unsubCat = onSnapshot(
        collection(db, catPath),
        (snap) => {
          const list: Category[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setCategories(list.length > 0 ? list : INITIAL_CATEGORIES);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, catPath);
        }
      );

      // 5. Users listener
      const usersPath = 'users';
      const unsubUsers = onSnapshot(
        collection(db, usersPath),
        (snap) => {
          const list: SupervisorUser[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setSupervisors(list.length > 0 ? list : INITIAL_SUPERVISORS);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, usersPath);
        }
      );

      return () => {
        unsubObs();
        unsubWorkers();
        unsubLoc();
        unsubCat();
        unsubUsers();
      };
    } else {
      // Local/Demo Mode Persistence
      try {
        const savedObs = localStorage.getItem('hospital_obs');
        setObservations(savedObs ? JSON.parse(savedObs) : INITIAL_OBSERVATIONS);

        const savedWorkers = localStorage.getItem('hospital_workers');
        setWorkers(savedWorkers ? JSON.parse(savedWorkers) : INITIAL_WORKERS);

        const savedLocations = localStorage.getItem('hospital_locations');
        setLocations(savedLocations ? JSON.parse(savedLocations) : INITIAL_LOCATIONS);

        const savedCategories = localStorage.getItem('hospital_categories');
        setCategories(savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES);

        const savedSupervisors = localStorage.getItem('hospital_demo_supervisors');
        setSupervisors(savedSupervisors ? JSON.parse(savedSupervisors) : INITIAL_SUPERVISORS);
      } catch (e) {
        console.error('Error loading local demo state', e);
        setObservations(INITIAL_OBSERVATIONS);
        setWorkers(INITIAL_WORKERS);
        setLocations(INITIAL_LOCATIONS);
        setCategories(INITIAL_CATEGORIES);
        setSupervisors(INITIAL_SUPERVISORS);
      }
      setLoading(false);
    }
  }, [isFirebaseLive, currentUser]);

  // Save observations locally when changed in demo mode
  const persistLocalObs = (newObs: Observation[]) => {
    setObservations(newObs);
    localStorage.setItem('hospital_obs', JSON.stringify(newObs));
  };

  const persistLocalWorkers = (items: Worker[]) => {
    setWorkers(items);
    localStorage.setItem('hospital_workers', JSON.stringify(items));
  };

  const persistLocalLocations = (items: LocationItem[]) => {
    setLocations(items);
    localStorage.setItem('hospital_locations', JSON.stringify(items));
  };

  const persistLocalCategories = (items: Category[]) => {
    setCategories(items);
    localStorage.setItem('hospital_categories', JSON.stringify(items));
  };

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
    if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');

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
    };

    if (isFirebaseLive && db) {
      try {
        await addDoc(collection(db, 'observations'), {
          ...newObsData,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'observations');
      }
    } else {
      const newObs: Observation = {
        id: `obs-${Date.now()}`,
        ...newObsData,
        createdAt: new Date().toISOString(),
      };
      persistLocalObs([newObs, ...observations]);
    }
  };

  // 2. CLOSE OBSERVATION
  const closeObservation = async (observationId: string) => {
    if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');

    const updatePayload = {
      status: 'CLOSED' as const,
      closedBy: currentUser.id,
      closedByName: currentUser.displayName,
    };

    if (isFirebaseLive && db) {
      try {
        const obsRef = doc(db, 'observations', observationId);
        await updateDoc(obsRef, {
          ...updatePayload,
          closedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `observations/${observationId}`);
      }
    } else {
      const updated = observations.map((o) =>
        o.id === observationId
          ? {
              ...o,
              ...updatePayload,
              closedAt: new Date().toISOString(),
            }
          : o
      );
      persistLocalObs(updated);
    }
  };

  // 3. PAUSE OBSERVATION
  const pauseObservation = async (observationId: string, pauseReason: string, reviewDate: string) => {
    if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');

    const updatePayload = {
      status: 'PAUSED' as const,
      pausedBy: currentUser.id,
      pausedByName: currentUser.displayName,
      pauseReason: pauseReason.trim(),
      reviewDate: reviewDate || null,
    };

    if (isFirebaseLive && db) {
      try {
        const obsRef = doc(db, 'observations', observationId);
        await updateDoc(obsRef, {
          ...updatePayload,
          pausedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `observations/${observationId}`);
      }
    } else {
      const updated = observations.map((o) =>
        o.id === observationId
          ? {
              ...o,
              ...updatePayload,
              pausedAt: new Date().toISOString(),
            }
          : o
      );
      persistLocalObs(updated);
    }
  };

  // 4. REOPEN OBSERVATION
  const reopenObservation = async (observationId: string) => {
    if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');

    const updatePayload = {
      status: 'OPEN' as const,
    };

    if (isFirebaseLive && db) {
      try {
        const obsRef = doc(db, 'observations', observationId);
        await updateDoc(obsRef, updatePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `observations/${observationId}`);
      }
    } else {
      const updated = observations.map((o) =>
        o.id === observationId
          ? {
              ...o,
              ...updatePayload,
            }
          : o
      );
      persistLocalObs(updated);
    }
  };

  // ADMIN OPERATIONS
  const addWorker = async (name: string, department: string) => {
    const item = {
      name: name.trim(),
      department: department.trim(),
      active: true,
    };
    if (isFirebaseLive && db) {
      try {
        await addDoc(collection(db, 'workers'), {
          ...item,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'workers');
      }
    } else {
      const newWorker: Worker = {
        id: `w_${Date.now()}`,
        ...item,
        createdAt: new Date().toISOString(),
      };
      persistLocalWorkers([...workers, newWorker]);
    }
  };

  const toggleWorkerStatus = async (id: string, active: boolean) => {
    if (isFirebaseLive && db) {
      try {
        await updateDoc(doc(db, 'workers', id), { active });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `workers/${id}`);
      }
    } else {
      const updated = workers.map((w) => (w.id === id ? { ...w, active } : w));
      persistLocalWorkers(updated);
    }
  };

  const addLocation = async (name: string) => {
    const item = {
      name: name.trim(),
      active: true,
    };
    if (isFirebaseLive && db) {
      try {
        await addDoc(collection(db, 'locations'), {
          ...item,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'locations');
      }
    } else {
      const newLoc: LocationItem = {
        id: `l_${Date.now()}`,
        ...item,
        createdAt: new Date().toISOString(),
      };
      persistLocalLocations([...locations, newLoc]);
    }
  };

  const toggleLocationStatus = async (id: string, active: boolean) => {
    if (isFirebaseLive && db) {
      try {
        await updateDoc(doc(db, 'locations', id), { active });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `locations/${id}`);
      }
    } else {
      const updated = locations.map((l) => (l.id === id ? { ...l, active } : l));
      persistLocalLocations(updated);
    }
  };

  const addCategory = async (name: string) => {
    const item = {
      name: name.trim(),
      active: true,
    };
    if (isFirebaseLive && db) {
      try {
        await addDoc(collection(db, 'categories'), {
          ...item,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'categories');
      }
    } else {
      const newCat: Category = {
        id: `c_${Date.now()}`,
        ...item,
        createdAt: new Date().toISOString(),
      };
      persistLocalCategories([...categories, newCat]);
    }
  };

  const toggleCategoryStatus = async (id: string, active: boolean) => {
    if (isFirebaseLive && db) {
      try {
        await updateDoc(doc(db, 'categories', id), { active });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
      }
    } else {
      const updated = categories.map((c) => (c.id === id ? { ...c, active } : c));
      persistLocalCategories(updated);
    }
  };

  const resetDemoData = () => {
    localStorage.removeItem('hospital_obs');
    localStorage.removeItem('hospital_workers');
    localStorage.removeItem('hospital_locations');
    localStorage.removeItem('hospital_categories');
    setObservations(INITIAL_OBSERVATIONS);
    setWorkers(INITIAL_WORKERS);
    setLocations(INITIAL_LOCATIONS);
    setCategories(INITIAL_CATEGORIES);
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
        resetDemoData,
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
