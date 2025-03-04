export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          role: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          role: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          location: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date: string
          location: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          location?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          status: 'pending' | 'approved' | 'rejected'
          payment_status: 'pending' | 'paid' | 'failed'
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'failed'
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'failed'
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      meal_validations: {
        Row: {
          id: string
          registration_id: string
          validator_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner'
          validated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          validator_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner'
          validated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          validator_id?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner'
          validated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
