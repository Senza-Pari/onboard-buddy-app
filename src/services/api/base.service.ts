import { supabase } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ServiceListResponse<T> {
  data: T[];
  error: string | null;
  count?: number;
}

export class BaseService {
  protected handleError(error: PostgrestError | Error | null): string {
    if (!error) return 'An unknown error occurred';

    if ('code' in error) {
      switch (error.code) {
        case '23505':
          return 'This record already exists';
        case '23503':
          return 'Cannot delete this record as it is referenced by other data';
        case '42501':
          return 'You do not have permission to perform this action';
        case 'PGRST116':
          return 'No data found';
        default:
          return error.message || 'A database error occurred';
      }
    }

    return error.message || 'An error occurred';
  }

  protected async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  protected async requireAuth(): Promise<string> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Authentication required');
    }
    return userId;
  }
}
