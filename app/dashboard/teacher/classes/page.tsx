'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  BookOpen, 
  ChevronRight,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export default function TeacherClassesPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchClasses() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('classrooms')
          .select('*, students(count)')
          .eq('teacher_id', user.id)
        
        if (error) toast.error('Error loading classes')
        else setClassrooms(data || [])
      }
      setLoading(false)
    }
    fetchClasses()
  }, [])

  const fetchStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', classId)
    
    if (error) toast.error('Error loading students')
    else setStudents(data || [])
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-cyan">My Classrooms</h1>
          <p className="text-gray-400">View your assigned sections and student rosters.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class List */}
          <div className="space-y-4">
             {loading ? <p className="text-gray-600 italic">Syncing classrooms...</p> : classrooms.map((cls) => (
               <motion.div 
                key={cls.id}
                whileHover={{ x: 5 }}
                onClick={() => { setSelectedClass(cls); fetchStudents(cls.id); }}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedClass?.id === cls.id ? 'bg-neon-cyan/10 border-neon-cyan shadow-neon-cyan/20' : 'glass border-white/10 hover:bg-white/5'}`}
               >
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-neon-cyan"><BookOpen size={20} /></div>
                      <div>
                        <h3 className="font-bold">{cls.name}</h3>
                        <p className="text-xs text-gray-500">{cls.students[0]?.count || 0} Students Enrolled</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className={selectedClass?.id === cls.id ? 'text-neon-cyan' : 'text-gray-600'} />
                 </div>
               </motion.div>
             ))}
          </div>

          {/* Student Roster */}
          <div className="lg:col-span-2">
             {selectedClass ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 glass rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">{selectedClass.name} - Roster</h2>
                    <span className="px-4 py-1.5 bg-neon-cyan/20 text-neon-cyan rounded-full text-xs font-bold uppercase tracking-wider">Official List</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.length > 0 ? students.map((s) => (
                      <div key={s.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-neon-cyan/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-400 font-bold group-hover:from-neon-cyan group-hover:to-neon-purple group-hover:text-black transition-all">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{s.full_name}</p>
                          <p className="text-[10px] text-gray-500">{s.email}</p>
                        </div>
                      </div>
                    )) : <p className="col-span-full py-12 text-center text-gray-600 italic">No students found in this classroom.</p>}
                  </div>
               </motion.div>
             ) : (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 glass border border-dashed border-white/20 rounded-3xl text-gray-500">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="max-w-xs">Select a classroom from the left to view the complete student roster and details.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
