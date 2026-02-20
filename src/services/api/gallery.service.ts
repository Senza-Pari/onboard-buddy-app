import { supabase } from '../../lib/supabase';
import type { GalleryItem, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

interface GalleryItemWithTags extends GalleryItem {
  tags: string[];
}

export class GalleryService extends BaseService {
  async getAllItems(): Promise<ServiceListResponse<GalleryItemWithTags>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('gallery_items')
        .select(`
          *,
          gallery_tags(tag)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      const items = (data || []).map(item => ({
        ...item,
        tags: item.gallery_tags?.map((t: { tag: string }) => t.tag) || []
      }));

      return { data: items, error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getItemById(id: string): Promise<ServiceResponse<GalleryItemWithTags>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('gallery_items')
        .select(`
          *,
          gallery_tags(tag)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      if (!data) {
        return { data: null, error: 'Gallery item not found' };
      }

      const item = {
        ...data,
        tags: data.gallery_tags?.map((t: { tag: string }) => t.tag) || []
      };

      return { data: item, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async createItem(
    item: Omit<TablesInsert<'gallery_items'>, 'user_id'>,
    tags: string[]
  ): Promise<ServiceResponse<GalleryItemWithTags>> {
    try {
      const userId = await this.requireAuth();

      const { data: itemData, error: itemError } = await supabase
        .from('gallery_items')
        .insert({ ...item, user_id: userId })
        .select()
        .single();

      if (itemError) {
        return { data: null, error: this.handleError(itemError) };
      }

      if (tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('gallery_tags')
          .insert(tags.map(tag => ({ item_id: itemData.id, tag })));

        if (tagsError) {
          await supabase.from('gallery_items').delete().eq('id', itemData.id);
          return { data: null, error: this.handleError(tagsError) };
        }
      }

      return this.getItemById(itemData.id);
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async updateItem(id: string, updates: TablesUpdate<'gallery_items'>): Promise<ServiceResponse<GalleryItem>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('gallery_items')
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

  async deleteItem(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('gallery_items')
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

  async getItemsByTag(tag: string): Promise<ServiceListResponse<GalleryItemWithTags>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('gallery_items')
        .select(`
          *,
          gallery_tags!inner(tag)
        `)
        .eq('user_id', userId)
        .eq('gallery_tags.tag', tag)
        .order('date', { ascending: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      const items = (data || []).map(item => ({
        ...item,
        tags: [tag]
      }));

      return { data: items, error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getItemsByType(type: 'photo' | 'note'): Promise<ServiceListResponse<GalleryItemWithTags>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('gallery_items')
        .select(`
          *,
          gallery_tags(tag)
        `)
        .eq('user_id', userId)
        .eq('type', type)
        .order('date', { ascending: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      const items = (data || []).map(item => ({
        ...item,
        tags: item.gallery_tags?.map((t: { tag: string }) => t.tag) || []
      }));

      return { data: items, error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async updateItemTags(itemId: string, tags: string[]): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const item = await this.getItemById(itemId);
      if (!item.data) {
        return { data: null, error: 'Gallery item not found' };
      }

      await supabase
        .from('gallery_tags')
        .delete()
        .eq('item_id', itemId);

      if (tags.length > 0) {
        const { error } = await supabase
          .from('gallery_tags')
          .insert(tags.map(tag => ({ item_id: itemId, tag })));

        if (error) {
          return { data: null, error: this.handleError(error) };
        }
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }
}

export const galleryService = new GalleryService();
