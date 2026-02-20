import { supabase } from '../../lib/supabase';
import type { PeopleNote, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

export class PeopleNoteService extends BaseService {
  async getAllPeopleNotes(): Promise<ServiceListResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .select('*')
        .eq('user_id', userId)
        .order('meeting_date', { ascending: true, nullsFirst: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getPeopleNoteById(id: string): Promise<ServiceResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async createPeopleNote(note: Omit<TablesInsert<'people_notes'>, 'user_id'>): Promise<ServiceResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .insert({ ...note, user_id: userId })
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async updatePeopleNote(id: string, updates: TablesUpdate<'people_notes'>): Promise<ServiceResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async deletePeopleNote(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('people_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async getPeopleNotesByDepartment(department: string): Promise<ServiceListResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('department', department)
        .order('meeting_date', { ascending: true, nullsFirst: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async searchPeopleNotes(query: string): Promise<ServiceListResponse<PeopleNote>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('people_notes')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,role.ilike.%${query}%,department.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('meeting_date', { ascending: true, nullsFirst: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }
}

export const peopleNoteService = new PeopleNoteService();
