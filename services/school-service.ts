import { createClient } from '@/lib/supabase/server'

export async function getStudentGrades(studentId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grades')
    .select(`
      id,
      grade,
      comments,
      lessons (
        title,
        start_time
      )
    `)
    .eq('student_id', studentId)
  
  if (error) throw error
  return data
}

export async function getTeacherClasses() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('classrooms')
    .select(`
      id,
      name,
      students (
        id,
        full_name,
        email
      )
    `)
  
  if (error) throw error
  return data
}

export async function updateGrade(gradeId: string, grade: number, comments?: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grades')
    .update({ grade, comments })
    .eq('id', gradeId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getSchoolAnalytics() {
  const supabase = createClient()
  // Admin only logic handled by RLS, but we can structure the query
  const { data: grades, error } = await supabase
    .from('grades')
    .select('grade')
  
  if (error) throw error
  
  const average = grades.reduce((acc, curr) => acc + (Number(curr.grade) || 0), 0) / grades.length
  return {
    totalStudents: grades.length,
    averageGrade: average.toFixed(2)
  }
}
