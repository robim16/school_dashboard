import { createClient } from '@/lib/supabase/server'

/**
 * @swagger
 * /api/students/{studentId}/grades:
 *   get:
 *     summary: Obtener calificaciones de un estudiante
 *     description: Retorna una lista de calificaciones para un estudiante especfico, incluyendo detalles de la leccin.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del estudiante
 *     responses:
 *       200:
 *         description: Lista de calificaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: {type: string}
 *                   grade: {type: number}
 *                   comments: {type: string}
 *                   lessons:
 *                     type: object
 *                     properties:
 *                       title: {type: string}
 *                       start_time: {type: string}
 */
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

/**
 * @swagger
 * /api/teachers/classes:
 *   get:
 *     summary: Obtener clases del profesor
 *     description: Retorna una lista de salones de clase junto con sus estudiantes.
 *     responses:
 *       200:
 *         description: Lista de clases obtenida exitosamente
 */
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

/**
 * @swagger
 * /api/grades/{gradeId}:
 *   patch:
 *     summary: Actualizar una calificacin
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade: {type: number}
 *               comments: {type: string}
 *     responses:
 *       200:
 *         description: Calificacin actualizada exitosamente
 */
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

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Obtener analticas escolares
 *     description: Retorna el total de estudiantes y el promedio de calificaciones. (Solo admin)
 *     responses:
 *       200:
 *         description: Datos analticos obtenidos correctamente
 */
export async function getSchoolAnalytics() {
  const supabase = createClient()
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

