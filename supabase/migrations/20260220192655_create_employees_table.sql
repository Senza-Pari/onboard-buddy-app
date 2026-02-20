/*
  # Employees Management Schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - The user who owns this employee record
      - `full_name` (text) - Employee's full name
      - `start_date` (date) - Employment start date
      - `position` (text) - Job title/position
      - `department` (text) - Department name
      - `work_arrangement` (text) - remote, onsite, or hybrid
      - `work_arrangement_details` (jsonb) - Detailed work arrangement settings
      - `supervisor` (jsonb) - Supervisor information
      - `contact` (jsonb) - Contact information including emergency contact
      - `onboarding_progress` (jsonb) - Onboarding completion tracking
      - `status` (text) - active, inactive, or archived
      - `priority` (text) - high, medium, or low
      - `tags` (text[]) - Array of tags for categorization
      - `notes` (text) - General notes about the employee
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - User who created the record
      - `last_modified_by` (uuid) - User who last modified the record

    - `employee_audit_logs`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `action` (text) - created, updated, deleted, archived, restored
      - `changes` (jsonb) - Array of changes made
      - `performed_by` (uuid) - User who performed the action
      - `timestamp` (timestamptz)
      - `reason` (text) - Optional reason for the change

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own employee records
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  start_date date NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  work_arrangement text CHECK (work_arrangement IN ('remote', 'onsite', 'hybrid')) NOT NULL,
  work_arrangement_details jsonb DEFAULT '{}'::jsonb,
  supervisor jsonb DEFAULT '{}'::jsonb,
  contact jsonb DEFAULT '{}'::jsonb NOT NULL,
  onboarding_progress jsonb DEFAULT '{"tasksCompleted": 0, "totalTasks": 0, "missionsCompleted": 0, "totalMissions": 0, "currentPhase": "pre-boarding"}'::jsonb,
  status text CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  priority text CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  tags text[] DEFAULT ARRAY[]::text[],
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  last_modified_by uuid REFERENCES auth.users NOT NULL
);

-- Create employee_audit_logs table
CREATE TABLE IF NOT EXISTS employee_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees ON DELETE CASCADE NOT NULL,
  action text CHECK (action IN ('created', 'updated', 'deleted', 'archived', 'restored')) NOT NULL,
  changes jsonb DEFAULT '[]'::jsonb,
  performed_by uuid REFERENCES auth.users NOT NULL,
  timestamp timestamptz DEFAULT now(),
  reason text
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for employees
CREATE POLICY "Users can view their own employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by AND auth.uid() = last_modified_by);

CREATE POLICY "Users can update their own employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND auth.uid() = last_modified_by);

CREATE POLICY "Users can delete their own employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for employee_audit_logs
CREATE POLICY "Users can view audit logs for their employees"
  ON employee_audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = employee_audit_logs.employee_id 
    AND employees.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert audit logs for their employees"
  ON employee_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = performed_by AND
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = employee_audit_logs.employee_id 
      AND employees.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for employees
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employee_audit_logs_employee_id ON employee_audit_logs(employee_id);
