'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'
import { registerTeacher } from '@/app/auth/actions'

const PAGE_SIZE = 10

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchTeachers = async () => {
    setLoading(true)
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'teacher')
      .order('full_name')
      .range(from, to)
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    
    if (error) {
      toast.error('Failed to fetch teachers')
    } else {
      setTeachers(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTeachers()
  }, [currentPage, search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the teacher role/profile.')) return
    
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) toast.error('Error deleting teacher')
    else {
      toast.success('Teacher removed')
      fetchTeachers()
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
    }

    if (editingTeacher) {
      const { error } = await supabase.from('profiles').update(payload).eq('id', editingTeacher.id)
      if (error) toast.error('Error updating profile')
      else {
        toast.success('Profile updated')
        setIsModalOpen(false)
        fetchTeachers()
      }
    } else {
      // Registration logic
      const result = await registerTeacher(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Teacher registered successfully. Default password: Welcome123!')
        setIsModalOpen(false)
        fetchTeachers()
      }
    }
  }

  const filtered = teachers.filter(t => 
    t.full_name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-purple">Teacher Directory</h1>
            <p className="text-gray-400">Manage school faculty and their access levels.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-neon-purple/30"
            />
          </div>
          <button 
            onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(188,19,254,0.3)] shrink-0"
          >
            <Plus size={18} />
            Register Teacher
          </button>
        </div>

        {/* Teachers Table */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm uppercase">
                <th className="p-4 pl-6">Full Name</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-500">Loading faculty...</td></tr>
              ) : teachers.length > 0 ? teachers.map((teacher) => (
                <tr key={teacher.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold text-xs uppercase">
                      {teacher.full_name.charAt(0)}
                    </div>
                    {teacher.full_name}
                  </td>
                  <td className="p-4 text-gray-400">{teacher.email}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                      Active
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-white transition-colors">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(teacher.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-12 text-center text-gray-500 italic">No faculty members found.</td></tr>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md glass rounded-3xl border border-white/20 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingTeacher ? 'Edit Teacher Profile' : 'Register New Teacher'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input name="full_name" defaultValue={editingTeacher?.full_name} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-purple/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingTeacher?.email} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-purple/30" />
                </div>
                <button type="submit" className="w-full bg-neon-purple text-white py-3 rounded-xl font-bold hover:shadow-neon-purple/50 transition-all mt-6 shadow-[0_0_15px_rgba(188,19,254,0.3)]">
                  {editingTeacher ? 'Save Profile' : 'Register Teacher'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
