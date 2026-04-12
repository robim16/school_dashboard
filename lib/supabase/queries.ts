import { createClient } from './client'

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function getAdminStats() {
  const supabase = createClient()
  
  const [teachers, students, classrooms, grades] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('classrooms').select('id', { count: 'exact', head: true }),
    supabase.from('grades').select('grade')
  ])

  return {
    teachers: teachers.count || 0,
    students: students.count || 0,
    classrooms: classrooms.count || 0,
    avgGrade: grades.data?.length 
      ? (grades.data.reduce((acc, curr) => acc + Number(curr.grade), 0) / grades.data.length).toFixed(1)
      : '0'
  }
}

export async function getTeacherData(teacherId: string) {
  const supabase = createClient()
  
  const { data: classrooms, error: classError } = await supabase
    .from('classrooms')
    .select('*, students(id)')
    .eq('teacher_id', teacherId)

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('start_time', { ascending: true })

  return { classrooms, lessons }
}

export async function getStudentData(userId: string) {
  const supabase = createClient()
  
  // First get student profile to know their classroom
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, classrooms(name)')
    .eq('user_id', userId)
    .single()

  if (!student) return null

  const { data: grades } = await supabase
    .from('grades')
    .select('*, lessons(title)')
    .eq('student_id', student.id)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('classroom_id', student.classroom_id)

  return { student, grades, lessons }
}
