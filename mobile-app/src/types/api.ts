// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateSantriRequest {
  nis: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phone?: string;
  email?: string;
  waliId?: string;
  halaqahId?: string;
  enrollmentDate?: string;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string;
}

export interface UpdateSantriRequest extends Partial<CreateSantriRequest> {
  id: string;
}

export interface CreateHafalanProgressRequest {
  santriId: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  totalAyah: number;
  status?: "IN_PROGRESS" | "COMPLETED" | "REVIEW";
}

export interface UpdateHafalanProgressRequest
  extends Partial<CreateHafalanProgressRequest> {
  id: string;
}

export interface CreateAttendanceRequest {
  santriId: string;
  halaqahId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "SICK" | "PERMISSION";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface UpdateAttendanceRequest
  extends Partial<CreateAttendanceRequest> {
  id: string;
}

export interface CreateDonationRequest {
  amount: number;
  category: string;
  description?: string;
  anonymous?: boolean;
  paymentMethod?: string;
}

export interface CreateMessageRequest {
  receiverId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE";
}

// API Response Types
export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    santri?: any[];
  };
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    santri?: any[];
  };
}

export interface SantriListResponse {
  success: boolean;
  message?: string;
  santri?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HalaqahListResponse {
  success: boolean;
  message?: string;
  halaqah?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HafalanProgressListResponse {
  success: boolean;
  message?: string;
  progress?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AttendanceListResponse {
  success: boolean;
  message?: string;
  attendance?: any[];
  data?: {
    attendanceRecords?: any[];
    records?: any[];
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SPPRecordsResponse {
  success: boolean;
  message?: string;
  sppRecords?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalAmount: number;
    totalPaid: number;
    totalDiscount: number;
    totalFine: number;
  };
}

export interface DonationListResponse {
  success: boolean;
  message?: string;
  donations?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageListResponse {
  success: boolean;
  message?: string;
  messages?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationListResponse {
  success: boolean;
  message?: string;
  notifications?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SantriQueryParams extends PaginationParams {
  search?: string;
  halaqahId?: string;
  status?: string;
  gender?: string;
}

export interface HafalanProgressQueryParams extends PaginationParams {
  santriId?: string;
  surahId?: number;
  status?: string;
}

export interface AttendanceQueryParams extends PaginationParams {
  santriId?: string;
  halaqahId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SPPRecordsQueryParams extends PaginationParams {
  santriId?: string;
  status?: string;
  month?: number;
  year?: number;
}

export interface DonationQueryParams extends PaginationParams {
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageQueryParams extends PaginationParams {
  senderId?: string;
  receiverId?: string;
  type?: string;
  read?: boolean;
}

export interface NotificationQueryParams extends PaginationParams {
  userId?: string;
  type?: string;
  read?: boolean;
}
