export type ObservationStatus = 'OPEN' | 'PAUSED' | 'CLOSED';

export interface SupervisorUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'supervisor';
  active: boolean;
  createdAt?: any;
}

export interface Worker {
  id: string;
  name: string;
  department: string;
  active: boolean;
  createdAt?: any;
}

export interface LocationItem {
  id: string;
  name: string;
  active: boolean;
  createdAt?: any;
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
  createdAt?: any;
}

export interface Observation {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  locationId: string;
  locationName: string;
  workerId: string;
  workerName: string;
  status: ObservationStatus;

  // Creator
  createdBy: string;
  createdByName: string;
  createdAt: any;

  // Paused
  pausedBy?: string | null;
  pausedByName?: string | null;
  pausedAt?: any;
  pauseReason?: string | null;
  reviewDate?: any; // Expected review date (timestamp or YYYY-MM-DD)

  // Closed
  closedBy?: string | null;
  closedByName?: string | null;
  closedAt?: any;
}

export type ScreenType = 'home' | 'add' | 'paused' | 'log' | 'admin';

export type HomeTab = 'my' | 'all' | 'paused';
