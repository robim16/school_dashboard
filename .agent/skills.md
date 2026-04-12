## Enhanced Role-Based Access Control (RBAC)

### 1. Ownership & Permissions Logic
- **Admin:** Has global access (`role === 'admin'`). Can view/edit all classes, teachers, and students.
- **Teacher:** Restricted to their assigned classes. 
  - A `classrooms` table must link `teacher_id` to `profiles.id`.
  - Teachers can only CRUD students and grades if the `student.classroom_id` matches the `teacher.classroom_id`.
- **Student:** Read-only access to their own data like their lessons and grades (`student_id === auth.uid()`).

### 2. Middleware & Route Protection (Next.js)
- Implement strict path guarding:
  - `/dashboard/admin/*`: Redirect if `user.role !== 'admin'`.
  - `/dashboard/teacher/*`: Redirect if `user.role !== 'teacher'`.
  - `/dashboard/student/*`: Redirect if `user.role !== 'student'`.

### 3. Database Schema Updates
- `classrooms`: Add `teacher_id` (UUID, FK to profiles).
- `students`: Add `classroom_id` (UUID, FK to classrooms).
- `lessons`: Add `classroom_id` to filter schedule per class.

### 4. Supabase RLS Policies (Critical)
- **Table `students`:**
  - `SELECT/ALL`: `USING (auth.uid() IN (SELECT teacher_id FROM classrooms WHERE id = classroom_id) OR role = 'admin')`.
- **Table `grades`:**
  - `INSERT/UPDATE`: Only allowed if the teacher is assigned to the classroom of the student.
- **Table `analytics`:**
  - Admin: Global view.
  - Teacher: Filtered view showing only their class average and student count.

### 5. User Authentication and Authorization System (Critical)  
- create user authentication system (sign up, sign in, sign out, forgot password, reset password).
- create user roles (admin, teacher, student).
- create user profile (name, email, password, role).
- create user dashboard (admin, teacher, student).


### 6. UI Design
- create responsive dashboard with dark theme and neon effects with animations .. 

## App Structure & Pages
Based on the current Next.js App Router structure, the application includes the following main routes:

### Authentication (`/auth/*`)
- `/auth/signin`
- `/auth/signup`
- `/auth/forgot-password`
- `/auth/reset-password`

### Admin Dashboard (`/dashboard/admin/*`)
- `/dashboard/admin`: Main Admin Overview
- `/dashboard/admin/analytics`: School-wide Analytics
- `/dashboard/admin/classes`: Class Management
- `/dashboard/admin/students`: Student Management
- `/dashboard/admin/teachers`: Teacher Management

### Teacher Dashboard (`/dashboard/teacher/*`)
- `/dashboard/teacher`: Main Teacher Overview
- `/dashboard/teacher/classes`: Assigned Classes Management
- `/dashboard/teacher/grades`: Grading Interface
- `/dashboard/teacher/schedule`: Teacher Schedule

### Student Dashboard (`/dashboard/student/*`)
- `/dashboard/student`: Main Student Overview
- `/dashboard/student/grades`: View Grades
- `/dashboard/student/schedule`: View Classroom and Personal Schedule

### Shared/Common
- `/` : Landing Page
- `/dashboard/profile` : Shared User Profile Page

## Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS to create this school dashboard including all the features mentioned above.
- **UI Components:** shadcn/ui (Data Tables, Cards, Forms, Dialogs).
- **Charts:** recharts (AreaChart, BarChart for Analytics).
- **Backend/Auth:** Supabase (PostgreSQL, Auth, RLS).