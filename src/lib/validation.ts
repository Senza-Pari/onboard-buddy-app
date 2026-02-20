import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  completed: z.boolean().optional().default(false),
  notes: z.string().optional(),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  department: z.enum(['HR', 'IT', 'Manager']).optional(),
});

export const missionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  progress: z.number().min(0).max(100).optional().default(0),
  completed: z.boolean().optional().default(false),
  reward_type: z.enum(['points', 'badge', 'achievement']).optional(),
  reward_value: z.string().optional(),
});

export const missionRequirementSchema = z.object({
  tag: z.string().min(1, 'Tag is required'),
  count: z.number().min(1, 'Count must be at least 1'),
  current: z.number().min(0).optional().default(0),
});

export const galleryItemSchema = z.object({
  type: z.enum(['photo', 'note'], { required_error: 'Type is required' }),
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  content: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  alt_text: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  permissions: z.object({
    public: z.boolean().optional().default(false),
    editable: z.boolean().optional().default(true),
    allowComments: z.boolean().optional().default(true),
  }).optional(),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  icon: z.string().optional(),
});

export const employeeContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(1, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Relationship is required'),
  }).optional(),
});

export const employeeSupervisorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Supervisor name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
});

export const employeeWorkArrangementDetailsSchema = z.object({
  location: z.string().optional(),
  schedule: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  remoteTools: z.array(z.string()).optional(),
  officeAccess: z.boolean().optional(),
  hybridSchedule: z.object({
    inOffice: z.array(z.string()),
    remote: z.array(z.string()),
  }).optional(),
});

export const employeeOnboardingProgressSchema = z.object({
  tasksCompleted: z.number().min(0).default(0),
  totalTasks: z.number().min(0).default(0),
  missionsCompleted: z.number().min(0).default(0),
  totalMissions: z.number().min(0).default(0),
  currentPhase: z.enum(['pre-boarding', 'first-day', 'first-week', 'first-month', 'completed']).default('pre-boarding'),
});

export const employeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255, 'Name is too long'),
  start_date: z.string().min(1, 'Start date is required'),
  position: z.string().min(1, 'Position is required').max(255, 'Position is too long'),
  department: z.string().min(1, 'Department is required').max(255, 'Department is too long'),
  work_arrangement: z.enum(['remote', 'onsite', 'hybrid'], { required_error: 'Work arrangement is required' }),
  work_arrangement_details: employeeWorkArrangementDetailsSchema.optional(),
  supervisor: employeeSupervisorSchema.optional(),
  contact: employeeContactSchema,
  onboarding_progress: employeeOnboardingProgressSchema.optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
});

export const peopleNoteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  role: z.string().min(1, 'Role is required').max(255, 'Role is too long'),
  department: z.string().min(1, 'Department is required').max(255, 'Department is too long'),
  meeting_date: z.string().optional(),
  meeting_time: z.string().optional(),
  topics: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  follow_up: z.string().optional().default(''),
  photo_url: z.string().url('Invalid photo URL').optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type TaskFormData = z.infer<typeof taskSchema>;
export type MissionFormData = z.infer<typeof missionSchema>;
export type MissionRequirementFormData = z.infer<typeof missionRequirementSchema>;
export type GalleryItemFormData = z.infer<typeof galleryItemSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type PeopleNoteFormData = z.infer<typeof peopleNoteSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
