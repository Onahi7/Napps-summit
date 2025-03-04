export type UserRole = 'superadmin' | 'admin' | 'validation_team' | 'participant';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone_number: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
  phone: string | null;
  state: string | null;
  chapter: string | null;
  passport_url: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  payment_reference: string;
  payment_status: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  meal_date: string;
  meal_type: string;
  created_at: string;
  updated_at: string;
}

export interface MealValidation {
  id: string;
  meal_id: string;
  user_id: string;
  validation_time: string;
  validator_id: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  event_id: string;
  name: string;
  type: string;
  description: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  resource_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  profiles: Profile;
  events: Event;
  registrations: Registration;
  payments: Payment;
  meals: Meal;
  meal_validations: MealValidation;
  resources: Resource;
  schedules: Schedule;
}
