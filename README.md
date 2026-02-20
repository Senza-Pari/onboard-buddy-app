# Onboard Buddy - Employee Onboarding Platform

A modern, full-featured employee onboarding application built with React, TypeScript, Supabase, and Tailwind CSS.

## Architecture Overview

This application follows a clean, layered architecture pattern:

```
┌─────────────────────────────────────────┐
│           UI Components Layer           │
│  (Presentational & Container Components) │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          State Management Layer         │
│         (Zustand Stores - Minimal)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Service Layer (NEW)           │
│    (Business Logic & API Interactions)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Database Layer (Supabase)      │
│    (PostgreSQL with Row Level Security) │
└─────────────────────────────────────────┘
```

## Key Features

### Core Functionality
- ✅ **Task Management** - Create, organize, and track onboarding tasks with tags and priorities
- ✅ **Mission System** - Gamified milestone tracking with requirements and rewards
- ✅ **Gallery** - Photo and note storage with tagging and organization
- ✅ **Employee Management** - Comprehensive employee records with audit logs
- ✅ **People Notes** - Meeting notes and contact information for key people
- ✅ **Custom Tags** - User-defined tags with colors and icons

### Technical Features
- ✅ **Database-First Architecture** - All data stored in Supabase PostgreSQL
- ✅ **Type-Safe API** - Full TypeScript coverage with generated types
- ✅ **Row Level Security** - Multi-tenant data isolation at database level
- ✅ **Data Validation** - Zod schemas for all forms and API requests
- ✅ **Service Layer** - Centralized business logic and error handling
- ✅ **Automatic Migration** - One-click data migration from localStorage to database

## Project Structure

```
src/
├── components/           # React components
│   ├── DataMigrationModal.tsx  # Automatic data migration UI
│   ├── *FormModal.tsx          # Form components
│   └── ...
├── pages/               # Page components (routes)
├── layouts/             # Layout wrappers
├── stores/              # Zustand state management
├── services/            # NEW: Service layer
│   └── api/
│       ├── base.service.ts         # Base service with error handling
│       ├── task.service.ts         # Task API operations
│       ├── mission.service.ts      # Mission API operations
│       ├── gallery.service.ts      # Gallery API operations
│       ├── tag.service.ts          # Tag API operations
│       ├── employee.service.ts     # Employee API operations
│       └── people-note.service.ts  # People notes API operations
├── lib/                 # Utilities and helpers
│   ├── supabase.ts             # Supabase client
│   ├── validation.ts           # Zod validation schemas
│   └── dataMigration.ts        # Data migration utility
├── types/               # TypeScript types
│   └── database.types.ts       # Generated database types
└── hooks/               # Custom React hooks
```

## Database Schema

### Core Tables

#### `tasks`
Onboarding tasks with due dates, priorities, and completion tracking.
- RLS Policy: Users can only access their own tasks
- Features: Tags, priorities, departments, notes, links

#### `missions`
Milestone-based quests with requirements and progress tracking.
- RLS Policy: Users can only access their own missions
- Related: `mission_requirements` for tracking requirements

#### `gallery_items`
Photos and notes with metadata and permissions.
- RLS Policy: Users can access their own items and public items
- Related: `gallery_tags` for item categorization

#### `employees`
Complete employee records with onboarding progress.
- RLS Policy: Users can only manage their own employee records
- Related: `employee_audit_logs` for change tracking
- Features: Work arrangements, contact info, supervisor details

#### `people_notes`
Meeting notes and contact information.
- RLS Policy: Users can only access their own notes
- Features: Meeting scheduling, topics, follow-ups

#### `tags`
User-defined tags with colors and icons.
- RLS Policy: Users can only manage their own tags
- Used across: tasks, missions, gallery items, employees

### Supporting Tables

- `roles` - User roles (company_admin, new_hire)
- `permissions` - Granular permissions
- `user_roles` - Role assignments
- `role_permissions` - Permission mappings
- `user_progress` - Onboarding progress tracking
- `subscriptions` - Premium plan management
- `shared_workflows` - Workflow sharing
- `activation_codes` - Account activation

## Service Layer

All database interactions go through type-safe service classes:

### TaskService
```typescript
await taskService.getAllTasks();
await taskService.createTask(taskData);
await taskService.updateTask(id, updates);
await taskService.deleteTask(id);
await taskService.addTaskTags(taskId, tags);
```

### MissionService
```typescript
await missionService.getAllMissions();
await missionService.createMission(missionData, requirements);
await missionService.updateMissionProgress(id, progress);
await missionService.recalculateMissionProgress(id);
```

### GalleryService
```typescript
await galleryService.getAllItems();
await galleryService.createItem(itemData, tags);
await galleryService.getItemsByType('photo');
await galleryService.updateItemTags(itemId, tags);
```

All services return a consistent response format:
```typescript
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}
```

## Data Validation

All forms use Zod schemas for validation:

```typescript
import { taskSchema, type TaskFormData } from './lib/validation';

// Validate task data
const result = taskSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  console.error(result.error.errors);
}
```

Available schemas:
- `taskSchema` - Task validation
- `missionSchema` - Mission validation
- `galleryItemSchema` - Gallery item validation
- `employeeSchema` - Employee validation
- `peopleNoteSchema` - People note validation
- `tagSchema` - Tag validation

## Data Migration

The app automatically detects localStorage data and offers to migrate it:

```typescript
import { dataMigrationService } from './lib/dataMigration';

// Check if migration is needed
const needsMigration = await dataMigrationService.needsMigration();

// Run migration
const result = await dataMigrationService.migrateAllData();
```

The migration modal appears automatically on first login after upgrade.

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase project

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Key Improvements in This Version

### Architecture
- ✅ Complete service layer for all database operations
- ✅ Proper separation of concerns (UI → Services → Database)
- ✅ No more localStorage for primary data storage
- ✅ Removed circular dependencies between stores
- ✅ Consistent error handling across all operations

### Type Safety
- ✅ Generated TypeScript types from database schema
- ✅ Full type coverage for all API interactions
- ✅ Zod validation at form and API boundaries
- ✅ No more `any` types in critical paths

### Data Management
- ✅ All features now use the database
- ✅ Proper multi-user support with RLS
- ✅ Automatic data migration from localStorage
- ✅ No hard-coded mock data

### Developer Experience
- ✅ Clear service interfaces for all operations
- ✅ Consistent response patterns
- ✅ Better error messages
- ✅ Removed unused dependencies
- ✅ Updated to latest stable versions

## Migration Notes

### For Existing Users
- Your data will be automatically migrated on first login
- Original localStorage data is preserved as backup
- Migration typically takes less than a minute
- You can skip migration and start fresh if preferred

### For Developers
- All new features should use the service layer
- Never access Supabase client directly from components
- Use Zod schemas for all form validation
- Follow the established patterns in existing services

## Security

- **Row Level Security (RLS)** enabled on all tables
- **Multi-tenant isolation** - users can only access their own data
- **Type-safe queries** - prevent SQL injection
- **Validation** - Zod schemas prevent invalid data
- **No exposed secrets** - all sensitive keys in environment variables

## Performance

- **Indexed queries** - fast lookups on user_id, dates, departments
- **Optimized bundle** - removed unused dependencies
- **Type-safe** - fewer runtime errors
- **Database-backed** - scalable for many users

## Future Enhancements

Potential improvements for future versions:
- Real-time collaboration with Supabase Realtime
- Offline support with local caching
- Advanced analytics dashboard
- Email notifications and reminders
- Template library for common onboarding workflows
- Mobile app with shared codebase

## License

MIT

## Support

For issues or questions, please file an issue on the repository.
