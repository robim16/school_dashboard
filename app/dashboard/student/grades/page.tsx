'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  Award, 
  BookOpen, 
  Calendar,
  FileText
} from 'lucide-react'

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGrades() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Need to find the internal student record first
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (student) {
          const { data, error } = await supabase
            .from('grades')
            .select('*, lessons(title), profiles(full_name)')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
          
          if (!error) setGrades(data || [])
        }
      }
      setLoading(false)
    }
    fetchGrades()
  }, [])

  const averageGrade = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + Number(curr.grade), 0) / grades.length).toFixed(1)
    : '0'

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">Report Card</h1>
            <p className="text-gray-400">Review your academic performance across all subjects.</p>
          </div>
          <div className="flex items-center gap-6 glass p-6 rounded-3xl border border-white/10">
             <div className="w-12 h-12 bg-neon-cyan/10 rounded-2xl flex items-center justify-center text-neon-cyan">
                <Award size={32} />
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Global GPA</p>
               <p className="text-2xl font-bold">{(Number(averageGrade) / 25).toFixed(1)} / 4.0</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {loading ? (
             <p className="py-12 text-center text-gray-500 italic">Compiling academic records...</p>
           ) : grades.length > 0 ? (
             grades.map((grade, idx) => (
               <motion.div 
                key={grade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 glass rounded-2xl border border-white/5 hover:border-neon-cyan/20 transition-all flex flex-col md:flex-row items-center gap-8 group"
               >
                 <div className="w-full md:w-48">
                    <p className="text-xs text-neon-cyan font-bold uppercase mb-1">{new Date(grade.created_at).toLocaleDateString()}</p>
                    <h3 className="text-lg font-bold">{grade.lessons?.title}</h3>
                    <p className="text-xs text-gray-500">Instructor: {grade.profiles?.full_name}</p>
                 </div>
                 
                 <div className="flex-grow w-full">
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-xs text-gray-400">Evaluation Score</p>
                       <p className="text-sm font-bold">{grade.grade}%</p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${grade.grade}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple shadow-neon-cyan"
                       />
                    </div>
                 </div>

                 <div className="w-full md:w-64 p-4 bg-black/20 rounded-xl border border-white/5">
                   <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Teacher Comments</p>
                   <p className="text-[11px] text-gray-400 leading-relaxed shrink-0 italic">
                     {grade.comments || "Comprehensive work demonstrated. Keep maintaining this level of academic rigor."}
                   </p>
                 </div>
               </motion.div>
             ))
           ) : (
             <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <FileText size={48} className="mx-auto mb-4 text-gray-600 opacity-20" />
                <p className="text-gray-500 italic">No grading records found in the official registry.</p>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  )
}
