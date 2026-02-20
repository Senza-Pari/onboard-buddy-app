import { supabase } from '../../lib/supabase';
import type { Tag, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

export class TagService extends BaseService {
  async getAllTags(): Promise<ServiceListResponse<Tag>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getTagByName(name: string): Promise<ServiceResponse<Tag>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .eq('name', name)
        .maybeSingle();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async createTag(tag: Omit<TablesInsert<'tags'>, 'user_id'>): Promise<ServiceResponse<Tag>> {
    try {
      const userId = await this.requireAuth();

      const existing = await this.getTagByName(tag.name);
      if (existing.data) {
        return { data: existing.data, error: null };
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tag, user_id: userId })
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

  async updateTag(id: string, updates: TablesUpdate<'tags'>): Promise<ServiceResponse<Tag>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tags')
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

  async deleteTag(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('tags')
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

  async ensureDefaultTags(): Promise<ServiceResponse<Tag[]>> {
    try {
      const userId = await this.requireAuth();

      const defaultTags = [
        { name: 'IT', color: '#3B82F6', icon: 'monitor' },
        { name: 'Admin', color: '#F59E0B', icon: 'briefcase' },
        { name: 'Training', color: '#10B981', icon: 'graduation-cap' },
        { name: 'Equipment', color: '#8B5CF6', icon: 'package' },
        { name: 'HR', color: '#EC4899', icon: 'users' }
      ];

      const createdTags: Tag[] = [];

      for (const tag of defaultTags) {
        const result = await this.createTag(tag);
        if (result.data) {
          createdTags.push(result.data);
        }
      }

      return { data: createdTags, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }
}

export const tagService = new TagService();
