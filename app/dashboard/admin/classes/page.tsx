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
  BookOpen,
  Layout
} from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

const PAGE_SIZE = 6

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<any>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('classrooms')
      .select('*, profiles(full_name)', { count: 'exact' })
      .order('name')
      .range(from, to)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const [classRes, teacherRes] = await Promise.all([
      query,
      supabase.from('profiles').select('id, full_name').eq('role', 'teacher')
    ])
    
    if (classRes.error || teacherRes.error) {
      toast.error('Failed to fetch data')
    } else {
      setClasses(classRes.data || [])
      setTotalCount(classRes.count || 0)
      setTeachers(teacherRes.data || [])
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
    if (!confirm('Are you sure you want to delete this classroom?')) return
    const { error } = await supabase.from('classrooms').delete().eq('id', id)
    if (error) toast.error('Error deleting class')
    else {
      toast.success('Classroom deleted')
      fetchData()
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      teacher_id: formData.get('teacher_id') || null,
    }

    if (editingClass) {
      const { error } = await supabase.from('classrooms').update(payload).eq('id', editingClass.id)
      if (error) toast.error('Error updating classroom')
      else {
        toast.success('Classroom updated')
        setIsModalOpen(false)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('classrooms').insert([payload])
      if (error) toast.error('Error creating classroom')
      else {
        toast.success('Classroom created')
        setIsModalOpen(false)
        fetchData()
      }
    }
  }

  const filtered = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-pink">Classroom Management</h1>
            <p className="text-gray-400">Curate and assign classrooms to designated teachers.</p>
          </div>
          <button 
            onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-neon-pink text-white px-6 py-3 rounded-xl font-bold hover:shadow-neon-pink/50 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,0,255,0.3)]"
          >
            <Plus size={20} /> Create Class
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by class name..." 
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-1 focus:ring-neon-pink/30"
            />
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full py-12 text-center text-gray-500 italic">Exploring classrooms...</p>
          ) : classes.length > 0 ? classes.map((cls) => (
            <motion.div 
              key={cls.id}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-3xl border border-white/10 group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-pink/10 rounded-2xl text-neon-pink">
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingClass(cls); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cls.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <Layout size={14} /> Assigned Teacher:
              </p>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] font-bold text-neon-cyan">
                   {cls.profiles?.full_name?.charAt(0) || '?'}
                 </div>
                 <span className="text-sm font-medium">{cls.profiles?.full_name || 'No Teacher Assigned'}</span>
              </div>
            </motion.div>
          )) : (
            <p className="col-span-full py-12 text-center text-gray-500 italic">No classrooms found matching your search.</p>
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md glass rounded-3xl border border-white/20 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingClass ? 'Update Classroom' : 'New Classroom'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Classroom Name</label>
                  <input name="name" defaultValue={editingClass?.name} placeholder="e.g. Advanced Physics" required className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-pink/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assigned Teacher</label>
                  <select 
                    name="teacher_id" 
                    defaultValue={editingClass?.teacher_id || ''}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:ring-1 focus:ring-neon-pink/30 appearance-none text-white"
                  >
                    <option value="" className="bg-[#0b0b0f]">None</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0b0b0f]">{t.full_name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-neon-pink text-white py-3 rounded-xl font-bold hover:shadow-neon-pink/50 transition-all mt-6 shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                   {editingClass ? 'Update Configuration' : 'Establish Classroom'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
