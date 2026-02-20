import { supabase } from '../../lib/supabase';
import type { Mission, MissionRequirement, TablesInsert, TablesUpdate } from '../../types/database.types';
import { BaseService, ServiceResponse, ServiceListResponse } from './base.service';

interface MissionWithRequirements extends Mission {
  requirements: MissionRequirement[];
}

export class MissionService extends BaseService {
  async getAllMissions(): Promise<ServiceListResponse<MissionWithRequirements>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          mission_requirements(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: this.handleError(error) };
      }

      const missions = (data || []).map(mission => ({
        ...mission,
        requirements: mission.mission_requirements || []
      }));

      return { data: missions, error: null };
    } catch (error) {
      return { data: [], error: this.handleError(error as Error) };
    }
  }

  async getMissionById(id: string): Promise<ServiceResponse<MissionWithRequirements>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          mission_requirements(*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      if (!data) {
        return { data: null, error: 'Mission not found' };
      }

      const mission = {
        ...data,
        requirements: data.mission_requirements || []
      };

      return { data: mission, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async createMission(
    mission: Omit<TablesInsert<'missions'>, 'user_id'>,
    requirements: Omit<TablesInsert<'mission_requirements'>, 'mission_id'>[]
  ): Promise<ServiceResponse<MissionWithRequirements>> {
    try {
      const userId = await this.requireAuth();

      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .insert({ ...mission, user_id: userId })
        .select()
        .single();

      if (missionError) {
        return { data: null, error: this.handleError(missionError) };
      }

      if (requirements.length > 0) {
        const { error: reqError } = await supabase
          .from('mission_requirements')
          .insert(requirements.map(req => ({ ...req, mission_id: missionData.id })));

        if (reqError) {
          await supabase.from('missions').delete().eq('id', missionData.id);
          return { data: null, error: this.handleError(reqError) };
        }
      }

      return this.getMissionById(missionData.id);
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async updateMission(id: string, updates: TablesUpdate<'missions'>): Promise<ServiceResponse<Mission>> {
    try {
      const userId = await this.requireAuth();

      const { data, error } = await supabase
        .from('missions')
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

  async deleteMission(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.requireAuth();

      const { error } = await supabase
        .from('missions')
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

  async updateMissionProgress(id: string, progress: number): Promise<ServiceResponse<Mission>> {
    return this.updateMission(id, { progress, completed: progress >= 100 });
  }

  async updateRequirementProgress(
    requirementId: string,
    current: number
  ): Promise<ServiceResponse<MissionRequirement>> {
    try {
      const { data, error } = await supabase
        .from('mission_requirements')
        .update({ current })
        .eq('id', requirementId)
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

  async recalculateMissionProgress(missionId: string): Promise<ServiceResponse<number>> {
    try {
      const mission = await this.getMissionById(missionId);
      if (!mission.data) {
        return { data: null, error: 'Mission not found' };
      }

      const requirements = mission.data.requirements;
      if (requirements.length === 0) {
        return { data: 0, error: null };
      }

      const totalProgress = requirements.reduce((sum, req) => {
        const reqProgress = Math.min((req.current / req.count) * 100, 100);
        return sum + reqProgress;
      }, 0);

      const averageProgress = Math.round(totalProgress / requirements.length);

      await this.updateMissionProgress(missionId, averageProgress);

      return { data: averageProgress, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }
}

export const missionService = new MissionService();
