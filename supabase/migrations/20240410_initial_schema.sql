-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked to auth if they have accounts
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  grade NUMERIC(4, 2) CHECK (grade >= 0 AND grade <= 100),
  comments TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Handle Updated At
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Classrooms Policies
CREATE POLICY "Admin can do everything on classrooms"
ON public.classrooms FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Teachers can view assigned classrooms"
ON public.classrooms FOR SELECT USING (teacher_id = auth.uid());

-- Students Policies
CREATE POLICY "Admin has global access to students"
ON public.students FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Teachers can view/CRUD students in their classrooms"
ON public.students FOR ALL USING (
  auth.uid() IN (SELECT teacher_id FROM public.classrooms WHERE id = classroom_id)
);

CREATE POLICY "Students can view their own data"
ON public.students FOR SELECT USING (user_id = auth.uid());

-- Lessons Policies
CREATE POLICY "Admin access to lessons"
ON public.lessons FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Teachers can manage lessons for their classes"
ON public.lessons FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view lessons for their classroom"
ON public.lessons FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM public.students WHERE user_id = auth.uid())
);

-- Grades Policies
CREATE POLICY "Admin access to grades"
ON public.grades FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Teachers can manage grades for their students"
ON public.grades FOR ALL USING (
  auth.uid() IN (
    SELECT c.teacher_id 
    FROM public.classrooms c 
    JOIN public.students s ON s.classroom_id = c.id
    WHERE s.id = student_id
  )
);

CREATE POLICY "Students can view their own grades"
ON public.grades FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- 10. Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
