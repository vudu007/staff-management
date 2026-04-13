export interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Staff {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  storeId: string;
  status: string;
  hireDate?: string;
  plainPassword?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
    code: string;
  };
  attendance?: Attendance[];
  performanceReviews?: PerformanceReview[];
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  region?: string;
  isActive: boolean;
  managerId?: string;
  manager?: { id: string; username: string; email?: string };
  _count?: { staff: number };
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  notes?: string;
  staff?: {
    firstName: string;
    lastName: string;
    staffId: string;
    store?: { name: string };
  };
  recordedBy?: { username: string };
}

export interface PerformanceReview {
  id: string;
  staffId: string;
  reviewDate: string;
  score: number;
  category: string;
  comments?: string;
  reviewer?: { username: string };
  staff?: { firstName: string; lastName: string; staffId: string };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user?: { username: string };
}

export interface StoreAnalytics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  attendanceThisMonth: number;
  avgPerformance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
