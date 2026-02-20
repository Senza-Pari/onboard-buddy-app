/*
  # Tags Management Schema

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - The user who owns this tag
      - `name` (text) - Tag name
      - `color` (text) - Hex color code for the tag
      - `icon` (text) - Icon name for the tag
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own tags

  3. Notes
    - This creates a global tags table that users can manage
    - Tags are already associated with tasks, missions, and gallery items via junction tables
    - This provides a centralized way to manage tag definitions
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Insert default tags for demonstration
-- Note: These will be created per-user when they first sign up
-- For now, we won't insert any default data here
