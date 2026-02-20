import { taskService } from '../services/api/task.service';
import { missionService } from '../services/api/mission.service';
import { galleryService } from '../services/api/gallery.service';
import { tagService } from '../services/api/tag.service';
import { employeeService } from '../services/api/employee.service';
import { peopleNoteService } from '../services/api/people-note.service';

const MIGRATION_VERSION_KEY = 'data-migration-version';
const CURRENT_MIGRATION_VERSION = 1;

interface MigrationResult {
  success: boolean;
  tasksCount: number;
  missionsCount: number;
  galleryCount: number;
  tagsCount: number;
  employeesCount: number;
  peopleNotesCount: number;
  errors: string[];
}

export class DataMigrationService {
  async checkMigrationStatus(): Promise<boolean> {
    const version = localStorage.getItem(MIGRATION_VERSION_KEY);
    return version === String(CURRENT_MIGRATION_VERSION);
  }

  async needsMigration(): Promise<boolean> {
    const hasMigrated = await this.checkMigrationStatus();
    if (hasMigrated) return false;

    const hasLocalData =
      this.hasLocalStorageData('onboard-buddy-tasks') ||
      this.hasLocalStorageData('onboard-buddy-missions') ||
      this.hasLocalStorageData('onboard-buddy-gallery') ||
      this.hasLocalStorageData('onboard-buddy-tags') ||
      this.hasLocalStorageData('onboard-buddy-employees') ||
      this.hasLocalStorageData('onboard-buddy-people-notes');

    return hasLocalData;
  }

  private hasLocalStorageData(key: string): boolean {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed?.state && Object.keys(parsed.state).length > 0;
    } catch {
      return false;
    }
  }

  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      tasksCount: 0,
      missionsCount: 0,
      galleryCount: 0,
      tagsCount: 0,
      employeesCount: 0,
      peopleNotesCount: 0,
      errors: [],
    };

    try {
      const tagsResult = await this.migrateTags();
      result.tagsCount = tagsResult.count;
      if (tagsResult.errors.length > 0) {
        result.errors.push(...tagsResult.errors);
      }

      const tasksResult = await this.migrateTasks();
      result.tasksCount = tasksResult.count;
      if (tasksResult.errors.length > 0) {
        result.errors.push(...tasksResult.errors);
      }

      const missionsResult = await this.migrateMissions();
      result.missionsCount = missionsResult.count;
      if (missionsResult.errors.length > 0) {
        result.errors.push(...missionsResult.errors);
      }

      const galleryResult = await this.migrateGallery();
      result.galleryCount = galleryResult.count;
      if (galleryResult.errors.length > 0) {
        result.errors.push(...galleryResult.errors);
      }

      const employeesResult = await this.migrateEmployees();
      result.employeesCount = employeesResult.count;
      if (employeesResult.errors.length > 0) {
        result.errors.push(...employeesResult.errors);
      }

      const peopleNotesResult = await this.migratePeopleNotes();
      result.peopleNotesCount = peopleNotesResult.count;
      if (peopleNotesResult.errors.length > 0) {
        result.errors.push(...peopleNotesResult.errors);
      }

      localStorage.setItem(MIGRATION_VERSION_KEY, String(CURRENT_MIGRATION_VERSION));

      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private async migrateTags(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = localStorage.getItem('onboard-buddy-tags');
      if (!data) return { count, errors };

      const parsed = JSON.parse(data);
      const tags = parsed?.state?.tags || [];

      for (const tag of tags) {
        try {
          const result = await tagService.createTag({
            name: tag.name,
            color: tag.color,
            icon: tag.icon || null,
          });

          if (result.error) {
            if (!result.error.includes('already exists')) {
              errors.push(`Tag "${tag.name}": ${result.error}`);
            }
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Tag "${tag.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Tags migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  private async migrateTasks(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = localStorage.getItem('onboard-buddy-tasks');
      if (!data) return { count, errors };

      const parsed = JSON.parse(data);
      const tasks = parsed?.state?.tasks || [];

      for (const task of tasks) {
        try {
          const result = await taskService.createTask({
            title: task.title,
            description: task.description || null,
            due_date: task.dueDate,
            completed: task.completed || false,
            notes: task.notes || null,
            link: task.link || null,
            priority: task.priority || null,
            department: task.department || null,
          });

          if (result.error) {
            errors.push(`Task "${task.title}": ${result.error}`);
          } else if (result.data && task.tags && task.tags.length > 0) {
            await taskService.addTaskTags(result.data.id, task.tags);
            count++;
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Tasks migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  private async migrateMissions(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = localStorage.getItem('onboard-buddy-missions');
      if (!data) return { count, errors };

      const parsed = JSON.parse(data);
      const missions = parsed?.state?.missions || [];

      for (const mission of missions) {
        try {
          const requirements = mission.requirements?.map((req: { tag: string; count: number; current: number }) => ({
            tag: req.tag,
            count: req.count,
            current: req.current || 0,
          })) || [];

          const result = await missionService.createMission({
            title: mission.title,
            description: mission.description || null,
            deadline: mission.deadline || null,
            link: mission.link || null,
            progress: mission.progress || 0,
            completed: mission.completed || false,
            reward_type: mission.rewardType || null,
            reward_value: mission.rewardValue || null,
          }, requirements);

          if (result.error) {
            errors.push(`Mission "${mission.title}": ${result.error}`);
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Mission "${mission.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Missions migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  private async migrateGallery(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = localStorage.getItem('onboard-buddy-gallery');
      if (!data) return { count, errors };

      const parsed = JSON.parse(data);
      const items = parsed?.state?.items || [];

      for (const item of items) {
        try {
          const result = await galleryService.createItem({
            type: item.type,
            title: item.title,
            description: item.description || null,
            content: item.content || null,
            location: item.location || null,
            date: item.date,
            image_url: item.imageUrl || null,
            alt_text: item.altText || null,
            metadata: item.metadata || {},
            permissions: item.permissions || { public: false, editable: true, allowComments: true },
          }, item.tags || []);

          if (result.error) {
            errors.push(`Gallery item "${item.title}": ${result.error}`);
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Gallery item "${item.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Gallery migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  private async migrateEmployees(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = localStorage.getItem('onboard-buddy-employees');
      if (!data) return { count, errors };

      const parsed = JSON.parse(data);
      const employees = parsed?.state?.employees || [];

      for (const employee of employees) {
        try {
          const result = await employeeService.createEmployee({
            full_name: employee.fullName,
            start_date: employee.startDate,
            position: employee.position,
            department: employee.department,
            work_arrangement: employee.workArrangement,
            work_arrangement_details: employee.workArrangementDetails || {},
            supervisor: employee.supervisor || {},
            contact: employee.contact,
            onboarding_progress: employee.onboardingProgress || {},
            status: employee.status || 'active',
            priority: employee.priority || 'medium',
            tags: employee.tags || [],
            notes: employee.notes || '',
          });

          if (result.error) {
            errors.push(`Employee "${employee.fullName}": ${result.error}`);
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Employee "${employee.fullName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Employees migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  private async migratePeopleNotes(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const peopleData = localStorage.getItem('people-notes-storage');
      if (!peopleData) return { count, errors };

      const parsed = JSON.parse(peopleData);
      const people = parsed?.state?.people || [];

      for (const person of people) {
        try {
          const result = await peopleNoteService.createPeopleNote({
            name: person.name,
            role: person.role,
            department: person.department,
            meeting_date: person.meetingDate || null,
            meeting_time: person.meetingTime || null,
            topics: person.topics || [],
            notes: person.notes || '',
            follow_up: person.followUp || '',
            photo_url: person.photoUrl || null,
          });

          if (result.error) {
            errors.push(`Person "${person.name}": ${result.error}`);
          } else {
            count++;
          }
        } catch (error) {
          errors.push(`Person "${person.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`People notes migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { count, errors };
  }

  async clearLocalStorageData(): Promise<void> {
    const keys = [
      'onboard-buddy-tasks',
      'onboard-buddy-missions',
      'onboard-buddy-gallery',
      'onboard-buddy-tags',
      'onboard-buddy-employees',
      'people-notes-storage',
    ];

    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }
}

export const dataMigrationService = new DataMigrationService();
