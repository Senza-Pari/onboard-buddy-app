import { supabase } from '../../lib/supabase';
import type { Employee, EmployeeAuditLog, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

export class EmployeeService extends BaseService {
  async getAllEmployees(): Promise<ServiceListResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getEmployeeById(id: string): Promise<ServiceResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
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

  async createEmployee(employee: Omit<TablesInsert<'employees'>, 'user_id' | 'created_by' | 'last_modified_by'>): Promise<ServiceResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employee,
          user_id: userId,
          created_by: userId,
          last_modified_by: userId
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      await this.createAuditLog({
        employee_id: data.id,
        action: 'created',
        changes: [],
        performed_by: userId
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async updateEmployee(
    id: string,
    updates: TablesUpdate<'employees'>,
    reason?: string
  ): Promise<ServiceResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const oldData = await this.getEmployeeById(id);
      if (!oldData.data) {
        return { data: null, error: 'Employee not found' };
      }

      const { data, error } = await supabase
        .from('employees')
        .update({ ...updates, last_modified_by: userId })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      const changes = this.detectChanges(oldData.data, data);

      await this.createAuditLog({
        employee_id: id,
        action: 'updated',
        changes,
        performed_by: userId,
        reason
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async deleteEmployee(id: string, reason?: string, archive = false): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      if (archive) {
        const result = await this.updateEmployee(id, { status: 'archived' }, reason);
        return { data: result.data !== null, error: result.error };
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      await this.createAuditLog({
        employee_id: id,
        action: 'deleted',
        changes: [],
        performed_by: userId,
        reason
      });

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async restoreEmployee(id: string): Promise<ServiceResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
        .update({ status: 'active', last_modified_by: userId })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      await this.createAuditLog({
        employee_id: id,
        action: 'restored',
        changes: [],
        performed_by: userId
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async getEmployeesByDepartment(department: string): Promise<ServiceListResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .eq('department', department)
        .order('full_name', { ascending: true });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getEmployeesByStatus(status: 'active' | 'inactive' | 'archived'): Promise<ServiceListResponse<Employee>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('full_name', { ascending: true });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getAuditLogs(employeeId?: string): Promise<ServiceListResponse<EmployeeAuditLog>> {
    try {
      await this.requireAuth();

      let query = supabase
        .from('employee_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  private async createAuditLog(log: Omit<TablesInsert<'employee_audit_logs'>, 'id' | 'timestamp'>): Promise<void> {
    await supabase
      .from('employee_audit_logs')
      .insert(log);
  }

  private detectChanges(oldData: Employee, newData: Employee): Array<{ field: string; oldValue: unknown; newValue: unknown }> {
    const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
    const keys = Object.keys(newData) as Array<keyof Employee>;

    for (const key of keys) {
      if (key !== 'updated_at' && key !== 'last_modified_by') {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changes.push({
            field: key,
            oldValue: oldData[key],
            newValue: newData[key]
          });
        }
      }
    }

    return changes;
  }
}

export const employeeService = new EmployeeService();
