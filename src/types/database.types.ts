// Generated TypeScript types for Supabase database schema
// This file provides type-safe access to all database tables

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
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          resource: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          tasks_completed: number
          total_tasks: number
          missions_completed: number
          total_missions: number
          last_activity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tasks_completed?: number
          total_tasks?: number
          missions_completed?: number
          total_missions?: number
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tasks_completed?: number
          total_tasks?: number
          missions_completed?: number
          total_missions?: number
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string
          completed: boolean
          notes: string | null
          link: string | null
          priority: 'high' | 'medium' | 'low' | null
          department: 'HR' | 'IT' | 'Manager' | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date: string
          completed?: boolean
          notes?: string | null
          link?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          department?: 'HR' | 'IT' | 'Manager' | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string
          completed?: boolean
          notes?: string | null
          link?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          department?: 'HR' | 'IT' | 'Manager' | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      task_tags: {
        Row: {
          id: string
          task_id: string | null
          tag: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          tag: string
        }
        Update: {
          id?: string
          task_id?: string | null
          tag?: string
        }
      }
      missions: {
        Row: {
          id: string
          title: string
          description: string | null
          deadline: string | null
          link: string | null
          progress: number
          completed: boolean
          reward_type: 'points' | 'badge' | 'achievement' | null
          reward_value: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          deadline?: string | null
          link?: string | null
          progress?: number
          completed?: boolean
          reward_type?: 'points' | 'badge' | 'achievement' | null
          reward_value?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          deadline?: string | null
          link?: string | null
          progress?: number
          completed?: boolean
          reward_type?: 'points' | 'badge' | 'achievement' | null
          reward_value?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      mission_requirements: {
        Row: {
          id: string
          mission_id: string | null
          tag: string
          count: number
          current: number
        }
        Insert: {
          id?: string
          mission_id?: string | null
          tag: string
          count: number
          current?: number
        }
        Update: {
          id?: string
          mission_id?: string | null
          tag?: string
          count?: number
          current?: number
        }
      }
      gallery_items: {
        Row: {
          id: string
          type: 'photo' | 'note'
          title: string
          description: string | null
          content: string | null
          location: string | null
          date: string
          image_url: string | null
          alt_text: string | null
          metadata: Json
          permissions: Json
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          type: 'photo' | 'note'
          title: string
          description?: string | null
          content?: string | null
          location?: string | null
          date: string
          image_url?: string | null
          alt_text?: string | null
          metadata?: Json
          permissions?: Json
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          type?: 'photo' | 'note'
          title?: string
          description?: string | null
          content?: string | null
          location?: string | null
          date?: string
          image_url?: string | null
          alt_text?: string | null
          metadata?: Json
          permissions?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      gallery_tags: {
        Row: {
          id: string
          item_id: string | null
          tag: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          tag: string
        }
        Update: {
          id?: string
          item_id?: string | null
          tag?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'premium'
          status: string
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'free' | 'premium'
          status: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'premium'
          status?: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shared_workflows: {
        Row: {
          id: string
          owner_id: string
          access_code: string
          expires_at: string | null
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          access_code: string
          expires_at?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          access_code?: string
          expires_at?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      activation_codes: {
        Row: {
          id: string
          email: string
          code: string
          expires_at: string
          used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          code: string
          expires_at: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          code?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          full_name: string
          start_date: string
          position: string
          department: string
          work_arrangement: 'remote' | 'onsite' | 'hybrid'
          work_arrangement_details: Json
          supervisor: Json
          contact: Json
          onboarding_progress: Json
          status: 'active' | 'inactive' | 'archived'
          priority: 'high' | 'medium' | 'low'
          tags: string[]
          notes: string
          created_at: string
          updated_at: string
          created_by: string
          last_modified_by: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          start_date: string
          position: string
          department: string
          work_arrangement: 'remote' | 'onsite' | 'hybrid'
          work_arrangement_details?: Json
          supervisor?: Json
          contact: Json
          onboarding_progress?: Json
          status?: 'active' | 'inactive' | 'archived'
          priority?: 'high' | 'medium' | 'low'
          tags?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
          created_by: string
          last_modified_by: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          start_date?: string
          position?: string
          department?: string
          work_arrangement?: 'remote' | 'onsite' | 'hybrid'
          work_arrangement_details?: Json
          supervisor?: Json
          contact?: Json
          onboarding_progress?: Json
          status?: 'active' | 'inactive' | 'archived'
          priority?: 'high' | 'medium' | 'low'
          tags?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          last_modified_by?: string
        }
      }
      employee_audit_logs: {
        Row: {
          id: string
          employee_id: string
          action: 'created' | 'updated' | 'deleted' | 'archived' | 'restored'
          changes: Json
          performed_by: string
          timestamp: string
          reason: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          action: 'created' | 'updated' | 'deleted' | 'archived' | 'restored'
          changes?: Json
          performed_by: string
          timestamp?: string
          reason?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          action?: 'created' | 'updated' | 'deleted' | 'archived' | 'restored'
          changes?: Json
          performed_by?: string
          timestamp?: string
          reason?: string | null
        }
      }
      people_notes: {
        Row: {
          id: string
          user_id: string
          name: string
          role: string
          department: string
          meeting_date: string | null
          meeting_time: string | null
          topics: string[]
          notes: string
          follow_up: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          role: string
          department: string
          meeting_date?: string | null
          meeting_time?: string | null
          topics?: string[]
          notes?: string
          follow_up?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          role?: string
          department?: string
          meeting_date?: string | null
          meeting_time?: string | null
          topics?: string[]
          notes?: string
          follow_up?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_activation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier database access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific type exports for common use
export type Role = Tables<'roles'>
export type UserRole = Tables<'user_roles'>
export type Permission = Tables<'permissions'>
export type RolePermission = Tables<'role_permissions'>
export type UserProgress = Tables<'user_progress'>
export type Task = Tables<'tasks'>
export type TaskTag = Tables<'task_tags'>
export type Mission = Tables<'missions'>
export type MissionRequirement = Tables<'mission_requirements'>
export type GalleryItem = Tables<'gallery_items'>
export type GalleryTag = Tables<'gallery_tags'>
export type Subscription = Tables<'subscriptions'>
export type SharedWorkflow = Tables<'shared_workflows'>
export type ActivationCode = Tables<'activation_codes'>
export type Employee = Tables<'employees'>
export type EmployeeAuditLog = Tables<'employee_audit_logs'>
export type PeopleNote = Tables<'people_notes'>
export type Tag = Tables<'tags'>
