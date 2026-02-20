import { supabase } from '../../lib/supabase';
import type { Task, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

export class TaskService extends BaseService {
  async getAllTasks(): Promise<ServiceListResponse<Task>> {
    try {
      const userId = await this.requireAuth();

      const { data, error, count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getTaskById(id: string): Promise<ServiceResponse<Task>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tasks')
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

  async createTask(task: Omit<TablesInsert<'tasks'>, 'user_id'>): Promise<ServiceResponse<Task>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: userId })
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

  async updateTask(id: string, updates: TablesUpdate<'tasks'>): Promise<ServiceResponse<Task>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tasks')
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

  async deleteTask(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('tasks')
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

  async toggleTaskCompletion(id: string, completed: boolean): Promise<ServiceResponse<Task>> {
    return this.updateTask(id, { completed });
  }

  async getTasksByTag(tag: string): Promise<ServiceListResponse<Task>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags!inner(tag)
        `)
        .eq('user_id', userId)
        .eq('task_tags.tag', tag)
        .order('due_date', { ascending: true });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async addTaskTags(taskId: string, tags: string[]): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const task = await this.getTaskById(taskId);
      if (!task.data) {
        return { data: null, error: 'Task not found' };
      }

      const { error } = await supabase
        .from('task_tags')
        .insert(tags.map(tag => ({ task_id: taskId, tag })));

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async removeTaskTag(taskId: string, tag: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag', tag);

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async getTaskTags(taskId: string): Promise<ServiceListResponse<string>> {
    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select('tag')
        .eq('task_id', taskId);

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data?.map(t => t.tag) || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }
}

export const taskService = new TaskService();
