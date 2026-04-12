'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  Layout
} from 'lucide-react'

export default function StudentSchedulePage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStudentSchedule() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find student and classroom
        const { data: student } = await supabase
          .from('students')
          .select('classroom_id, classrooms(name)')
          .eq('user_id', user.id)
          .single()
        
        if (student) {
          const { data, error } = await supabase
            .from('lessons')
            .select('*, profiles(full_name)')
            .eq('classroom_id', student.classroom_id)
            .order('start_time')
          
          if (!error) setLessons(data || [])
        }
      }
      setLoading(false)
    }
    fetchStudentSchedule()
  }, [])

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-cyan">Class Schedule</h1>
          <p className="text-gray-400">Keep track of your upcoming lectures and academic sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             <p className="col-span-full py-12 text-center text-gray-500 italic">Syncing classroom agenda...</p>
           ) : lessons.length > 0 ? (
             lessons.map((lesson, idx) => (
               <motion.div 
                key={lesson.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 glass rounded-3xl border border-white/10 hover:border-neon-cyan/30 transition-all flex flex-col justify-between group"
               >
                 <div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-neon-cyan/10 rounded-2xl text-neon-cyan">
                          <Layout size={24} />
                       </div>
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Clock size={12} className="text-neon-cyan" />
                          {new Date(lesson.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-neon-cyan transition-colors">{lesson.title}</h3>
                    <p className="text-xs text-gray-500 mb-6 line-clamp-2">{lesson.description || 'Core academic session covering curriculum objectives.'}</p>
                 </div>

                 <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold">
                          {lesson.profiles?.full_name?.charAt(0)}
                       </div>
                       <div className="text-xs">
                          <p className="text-gray-500">Instructor</p>
                          <p className="font-bold">{lesson.profiles?.full_name}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                       <MapPin size={14} className="text-neon-pink" />
                       Main Building • Room 204
                    </div>
                 </div>
               </motion.div>
             ))
           ) : (
             <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>Relax! No lessons scheduled for your classroom today.</p>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  )
}
