'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  Clock, 
  MapPin,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'

export default function TeacherSchedulePage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSchedule() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('lessons')
          .select('*, classrooms(name)')
          .eq('teacher_id', user.id)
          .order('start_time')
        
        if (error) toast.error('Error loading schedule')
        else setLessons(data || [])
      }
      setLoading(false)
    }
    fetchSchedule()
  }, [])

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-purple">Academic Schedule</h1>
          <p className="text-gray-400">Manage your weekly teaching agenda and sessions.</p>
        </div>

        {/* Schedule Timeline */}
        <div className="glass rounded-3xl border border-white/10 p-8">
          <div className="space-y-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {loading ? <p className="ml-16 italic text-gray-500">Syncing schedule...</p> : lessons.length > 0 ? lessons.map((lesson, idx) => (
              <motion.div 
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-16 group"
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-neon-purple border-4 border-[#050505] shadow-neon-purple z-10 group-hover:scale-125 transition-transform" />
                
                <div className="glass p-6 rounded-2xl border border-white/5 hover:border-neon-purple/30 hover:bg-white/5 transition-all">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-neon-purple text-xs font-bold uppercase tracking-widest">
                           <Clock size={14} />
                           {new Date(lesson.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(lesson.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="text-xl font-bold">{lesson.title}</h3>
                        <p className="text-xs text-gray-400 max-w-lg leading-relaxed">{lesson.description || 'No description provided for this session.'}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                           <MapPin size={14} /> Room 302
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-purple/10 text-neon-purple rounded-full">
                           <BookOpen size={14} /> {lesson.classrooms?.name}
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )) : (
              <div className="ml-16 py-12 text-center text-gray-600 italic">No scheduled lessons found in the registry.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
