export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: 'client' | 'provider';
  bio?: string;
  specialty?: string;
  hourlyRate?: number;
  avatar?: string;
}

export interface Service {
  _id: string;
  provider: User;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  client: User;
  provider: User;
  service: Service;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes: string;
  cancellationReason: string;
  createdAt: string;
}

export interface AvailabilitySlot {
  _id: string;
  provider: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServicesResponse {
  services: Service[];
  pagination: Pagination;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: Pagination;
}

export interface AvailabilityResponse {
  availability: AvailabilitySlot[];
}
