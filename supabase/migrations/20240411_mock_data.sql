-- 1. Insert dummy users into auth.users (minimum required fields)
-- Note: In a real app, you'd use supabase.auth.signUp, but for mock data we can insert directly.
-- We use gen_random_uuid() for IDs.

DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    teacher1_id UUID := gen_random_uuid();
    teacher2_id UUID := gen_random_uuid();
    teacher3_id UUID := gen_random_uuid();
    student1_id UUID := gen_random_uuid();
    student2_id UUID := gen_random_uuid();
    student3_id UUID := gen_random_uuid();
    student4_id UUID := gen_random_uuid();
    student5_id UUID := gen_random_uuid();
    classroom1_id UUID := gen_random_uuid();
    classroom2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
BEGIN
    -- Auth Users (Insert dummy records)
    INSERT INTO auth.users (id, email, raw_user_meta_data, confirmed_at)
    VALUES 
        (admin_id, 'admin@edustream.com', '{"full_name": "Edustream Admin", "role": "admin"}', NOW()),
        (teacher1_id, 'sarah.green@edustream.com', '{"full_name": "Sarah Green", "role": "teacher"}', NOW()),
        (teacher2_id, 'mark.wilson@edustream.com', '{"full_name": "Mark Wilson", "role": "teacher"}', NOW()),
        (teacher3_id, 'elena.rod@edustream.com', '{"full_name": "Elena Rodriguez", "role": "teacher"}', NOW()),
        (student1_id, 'john.doe@student.com', '{"full_name": "John Doe", "role": "student"}', NOW()),
        (student2_id, 'jane.smith@student.com', '{"full_name": "Jane Smith", "role": "student"}', NOW()),
        (student3_id, 'mike.ross@student.com', '{"full_name": "Mike Ross", "role": "student"}', NOW()),
        (student4_id, 'sarah.lee@student.com', '{"full_name": "Sarah Lee", "role": "student"}', NOW()),
        (student5_id, 'alex.vance@student.com', '{"full_name": "Alex Vance", "role": "student"}', NOW());

    -- The trigger 'on_auth_user_created' will automatically create the profiles in public.profiles.
    -- However, we might want to ensure they are created or update them.

    -- Classrooms
    INSERT INTO public.classrooms (id, name, teacher_id)
    VALUES 
        (classroom1_id, 'Advanced Physics', teacher1_id),
        (classroom2_id, 'Applied Mathematics', teacher2_id),
        (gen_random_uuid(), 'History II', teacher3_id),
        (gen_random_uuid(), 'Chemistry Lab', teacher1_id);

    -- Students (Updating classroom_id)
    UPDATE public.students SET classroom_id = classroom1_id WHERE user_id IN (student1_id, student2_id);
    UPDATE public.students SET classroom_id = classroom2_id WHERE user_id IN (student3_id, student4_id, student5_id);

    -- Lessons
    INSERT INTO public.lessons (id, title, classroom_id, teacher_id, start_time, end_time)
    VALUES 
        (lesson1_id, 'Introduction to Thermodynamics', classroom1_id, teacher1_id, NOW() + interval '1 day', NOW() + interval '1 day 2 hours'),
        (lesson2_id, 'Calculus III: Integration', classroom2_id, teacher2_id, NOW() + interval '2 days', NOW() + interval '2 days 2 hours'),
        (gen_random_uuid(), 'Quantum Mechanics Basics', classroom1_id, teacher1_id, NOW() - interval '2 hours', NOW() + interval '1 hour');

    -- Grades
    INSERT INTO public.grades (student_id, lesson_id, grade, comments, teacher_id)
    VALUES 
        ((SELECT id FROM public.students WHERE user_id = student1_id), lesson1_id, 92.5, 'Excellent participation', teacher1_id),
        ((SELECT id FROM public.students WHERE user_id = student2_id), lesson1_id, 88.0, 'Good work', teacher1_id),
        ((SELECT id FROM public.students WHERE user_id = student3_id), lesson2_id, 75.0, 'Needs more practice with integrals', teacher2_id),
        ((SELECT id FROM public.students WHERE user_id = student4_id), lesson2_id, 95.0, 'Perfect score', teacher2_id);

END $$;
