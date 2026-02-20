/*
  # People Notes Management Schema

  1. New Tables
    - `people_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - The user who owns this note
      - `name` (text) - Person's name
      - `role` (text) - Person's role/title
      - `department` (text) - Department
      - `meeting_date` (date) - Date of meeting
      - `meeting_time` (text) - Time of meeting
      - `topics` (text[]) - Array of topics to discuss
      - `notes` (text) - Meeting notes or general notes
      - `follow_up` (text) - Follow-up actions
      - `photo_url` (text) - URL to person's photo
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own people notes
*/

-- Create people_notes table
CREATE TABLE IF NOT EXISTS people_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  meeting_date date,
  meeting_time text,
  topics text[] DEFAULT ARRAY[]::text[],
  notes text DEFAULT '',
  follow_up text DEFAULT '',
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE people_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own people notes"
  ON people_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_people_notes_updated_at
  BEFORE UPDATE ON people_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_people_notes_user_id ON people_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_people_notes_department ON people_notes(department);
CREATE INDEX IF NOT EXISTS idx_people_notes_meeting_date ON people_notes(meeting_date);
