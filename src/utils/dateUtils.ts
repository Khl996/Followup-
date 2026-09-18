// Helper to safely parse dates from Firestore timestamp, ISO string, or Date
export function parseDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal.toDate === 'function') return dateVal.toDate();
  if (typeof dateVal === 'string' || typeof dateVal === 'number') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

// Arabic formatted time (e.g. 08:15 ص)
export function formatArabicTime(dateVal: any): string {
  const d = parseDate(dateVal);
  if (!d) return '--:--';
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Arabic formatted full date and time
export function formatArabicDateTime(dateVal: any): string {
  const d = parseDate(dateVal);
  if (!d) return 'غير محدد';
  return `${d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} — ${formatArabicTime(d)}`;
}

// Format short date (YYYY-MM-DD or Arabic date)
export function formatArabicDate(dateVal: any): string {
  const d = parseDate(dateVal);
  if (!d) return 'غير محدد';
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Check if review date is today or overdue
export function checkReviewDue(reviewDateStr?: string | null): { isDue: boolean; isOverdue: boolean; isToday: boolean } {
  if (!reviewDateStr) return { isDue: false, isOverdue: false, isToday: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const review = new Date(reviewDateStr);
  review.setHours(0, 0, 0, 0);

  if (isNaN(review.getTime())) {
    return { isDue: false, isOverdue: false, isToday: false };
  }

  const isToday = review.getTime() === today.getTime();
  const isOverdue = review.getTime() < today.getTime();

  return {
    isDue: isToday || isOverdue,
    isOverdue,
    isToday,
  };
}

// Check if open observation is older than 24 hours
export function isOlderThan24Hours(dateVal: any): boolean {
  const d = parseDate(dateVal);
  if (!d) return false;
  const now = new Date().getTime();
  const diffHours = (now - d.getTime()) / (1000 * 60 * 60);
  return diffHours >= 24;
}

// Get YYYY-MM-DD string
export function getISODateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
