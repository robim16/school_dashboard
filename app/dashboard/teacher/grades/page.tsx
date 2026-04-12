'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  FileText,
  Save,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

const PAGE_SIZE = 10

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<any>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setTeacherId(user.id)
      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('grades')
        .select('*, students(full_name), lessons(title)', { count: 'exact' })
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`students.full_name.ilike.%${search}%,lessons.title.ilike.%${search}%`)
      }

      const [gradeRes, studentRes, lessonRes] = await Promise.all([
        query,
        supabase.from('students').select('id, full_name, classroom_id'),
        supabase.from('lessons').select('id, title').eq('teacher_id', user.id)
      ])
      
      setGrades(gradeRes.data || [])
      setTotalCount(gradeRes.count || 0)
      setStudents(studentRes.data || [])
      setLessons(lessonRes.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this grade record?')) return
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) toast.error('Error deleting record')
    else {
      toast.success('Record removed')
      fetchData()
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      student_id: formData.get('student_id'),
      lesson_id: formData.get('lesson_id'),
      grade: Number(formData.get('grade')),
      comments: formData.get('comments'),
      teacher_id: teacherId
    }

    if (editingGrade) {
      const { error } = await supabase.from('grades').update(payload).eq('id', editingGrade.id)
      if (error) toast.error('Error updating grade')
      else {
        toast.success('Grade updated')
        setIsModalOpen(false)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('grades').insert([payload])
      if (error) toast.error('Error submitting grade')
      else {
        toast.success('Grade submitted')
        setIsModalOpen(false)
        fetchData()
      }
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">Grading Interface</h1>
            <p className="text-gray-400">Record and monitor student academic performance.</p>
          </div>
          <button 
            onClick={() => { setEditingGrade(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-neon-cyan text-black px-6 py-3 rounded-xl font-bold hover:shadow-neon-cyan/50 transition-all transform hover:scale-105"
          >
            <Plus size={20} /> New Entry
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by student or lesson..." 
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
            />
          </div>
        </div>

        {/* Grades Table */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm uppercase">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Lesson</th>
                <th className="p-4">Score</th>
                <th className="p-4">Comments</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr><td colSpan={5} className="p-12 text-center text-gray-500">Loading records...</td></tr>
              ) : grades.length > 0 ? grades.map((g) => (
                <tr key={g.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 font-medium">{g.students?.full_name}</td>
                  <td className="p-4 text-gray-400 text-sm">{g.lessons?.title}</td>
                  <td className="p-4">
                    <span className={`font-bold ${g.grade >= 90 ? 'text-neon-cyan' : g.grade >= 70 ? 'text-neon-purple' : 'text-neon-pink'}`}>
                      {g.grade}%
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs italic truncate max-w-[200px]">{g.comments || 'N/A'}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingGrade(g); setIsModalOpen(true); }} className="hover:text-neon-cyan"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(g.id)} className="hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 italic">No grading records found.</td></tr>
              )}
            </tbody>
          </table>

          <Pagination 
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg glass rounded-3xl border border-white/20 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="text-neon-cyan" /> {editingGrade ? 'Update Grade' : 'Log New Grade'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Student</label>
                    <select name="student_id" defaultValue={editingGrade?.student_id || ''} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-cyan/30 text-white appearance-none">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.id} className="bg-[#0b0b0f]">{s.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Lesson</label>
                    <select name="lesson_id" defaultValue={editingGrade?.lesson_id || ''} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-cyan/30 text-white appearance-none">
                      <option value="">Select Lesson</option>
                      {lessons.map(l => <option key={l.id} value={l.id} className="bg-[#0b0b0f]">{l.title}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Score (%)</label>
                  <input name="grade" type="number" min="0" max="100" defaultValue={editingGrade?.grade} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-cyan/30" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Comments</label>
                  <textarea name="comments" defaultValue={editingGrade?.comments} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-cyan/30 min-h-[100px]" />
                </div>
                <button type="submit" className="w-full bg-neon-cyan text-black py-4 rounded-xl font-bold hover:shadow-neon-cyan/50 transition-all flex items-center justify-center gap-2 mt-4">
                  <Save size={20} /> {editingGrade ? 'Apply Changes' : 'Submit Grade Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
