'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

const PAGE_SIZE = 10

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchStudents = async () => {
    setLoading(true)
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('students')
      .select('*, classrooms(name)', { count: 'exact' })
      .order('full_name')
      .range(from, to)
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    
    if (error) {
      toast.error('Failed to fetch students')
    } else {
      setStudents(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [currentPage, search])

  // Reset to page 1 when searching
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) {
      toast.error('Error deleting student')
    } else {
      toast.success('Student deleted')
      fetchStudents()
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      classroom_id: formData.get('classroom_id') || null,
    }

    if (editingStudent) {
      const { error } = await supabase.from('students').update(payload).eq('id', editingStudent.id)
      if (error) toast.error('Error updating student')
      else {
        toast.success('Student updated')
        setIsModalOpen(false)
        fetchStudents()
      }
    } else {
      const { error } = await supabase.from('students').insert([payload])
      if (error) toast.error('Error creating student')
      else {
        toast.success('Student created')
        setIsModalOpen(false)
        fetchStudents()
      }
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">Student Management</h1>
            <p className="text-gray-400">View and manage all students in the system.</p>
          </div>
          <button 
            onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-neon-cyan text-black px-6 py-3 rounded-xl font-bold hover:shadow-neon-cyan/50 transition-all transform hover:scale-105"
          >
            <UserPlus size={20} /> Add Student
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Classroom</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 italic">Loading students...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-medium">{student.full_name}</td>
                    <td className="p-4 text-gray-400">{student.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs font-semibold">
                        {student.classrooms?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingStudent(student); setIsModalOpen(true); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-neon-cyan transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 italic">No students found.</td>
                </tr>
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass rounded-3xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input 
                    name="full_name" 
                    defaultValue={editingStudent?.full_name}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input 
                    name="email" 
                    type="email"
                    defaultValue={editingStudent?.email}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Classroom ID (Optional)</label>
                  <input 
                    name="classroom_id" 
                    defaultValue={editingStudent?.classroom_id}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-neon-cyan text-black py-3 rounded-xl font-bold hover:shadow-neon-cyan/50 transition-all mt-6"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
