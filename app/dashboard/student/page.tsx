'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/useRealtime'
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Award, 
  Clock
} from 'lucide-react'

export default function StudentDashboard() {
  const [data, setData] = useState<any>({ student: null, lessons: [], gpa: 0 })
  const supabase = createClient()
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: student } = await supabase
          .from('students')
          .select('*, classrooms(name)')
          .eq('user_id', user.id)
          .single()
        
        if (student) {
          setStudentId(student.id)
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('classroom_id', student.classroom_id)
          
          const { data: grades } = await supabase
            .from('grades')
            .select('grade')
            .eq('student_id', student.id)
          
          const gpa = grades?.length 
            ? (grades.reduce((acc, curr) => acc + Number(curr.grade), 0) / grades.length / 25).toFixed(1)
            : '0'

          setData({ student, lessons: lessons || [], gpa })
        }
      }
    }
    init()
  }, [supabase])

  const { data: realtimeGrades } = useRealtime<any>(
    'grades', 
    [], 
    studentId ? { column: 'student_id', value: studentId } : undefined
  )

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">My Progress</h1>
            <p className="text-gray-400">
              Welcome back, {data.student?.full_name || 'Student'}. Here is your live academic summary.
            </p>
          </div>
          <div className="p-4 glass rounded-2xl border border-neon-pink/30 flex items-center gap-4">
             <Award className="text-neon-pink" size={32} />
             <div>
               <p className="text-xs text-gray-400">Calculated GPA</p>
               <p className="text-xl font-bold">{data.gpa} / 4.0</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-neon-cyan" size={20} /> Classroom Schedule
            </h3>
            <div className="space-y-4">
               {data.lessons.length > 0 ? (
                 data.lessons.map((lesson: any) => (
                   <ScheduleItem 
                    key={lesson.id}
                    time={`${new Date(lesson.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} 
                    subject={lesson.title} 
                    teacher="Assigned Teacher" 
                    room="Main Hall" 
                    active={false}
                   />
                 ))
               ) : (
                 <p className="text-gray-500 italic py-4">No lessons scheduled for your classroom.</p>
               )}
            </div>
          </div>

          {/* Performance Summary (Realtime) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Live Grade Summary</h3>
            <div className="glass rounded-3xl border border-white/10 p-6 space-y-6">
               {realtimeGrades.length > 0 ? (
                 realtimeGrades.map((grade: any) => (
                   <GradeRow 
                    key={grade.id}
                    subject={`Lesson ID: ${grade.lesson_id.slice(0, 4)}`} 
                    grade={grade.grade >= 90 ? 'A' : grade.grade >= 80 ? 'B' : 'C'} 
                    color="neon-cyan" 
                    progress={grade.grade} 
                   />
                 ))
               ) : (
                 <p className="text-center text-gray-600 py-4 italic">No grades recorded yet.</p>
               )}
               
               <button className="w-full py-4 mt-4 bg-white/5 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-colors">
                 Full Academic Record
               </button>
            </div>

            <div className="glass rounded-3xl border border-white/10 p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2"><Clock size={16} /> Data Status</h4>
              <p className="text-xs text-gray-500">
                Connected to Supabase Realtime. Your dashboard updates instantly when teachers post new grades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function ScheduleItem({ time, subject, teacher, room, active }: any) {
  return (
    <div className={`
      flex items-center gap-6 p-6 rounded-2xl border transition-all
      ${active 
        ? 'bg-neon-cyan/5 border-neon-cyan shadow-neon-cyan/20' 
        : 'glass border-white/10 hover:bg-white/5'}
    `}>
      <div className="w-24 text-sm font-mono text-gray-500">{time}</div>
      <div className="flex-grow">
        <h4 className="text-lg font-bold">{subject}</h4>
        <p className="text-sm text-gray-500">{teacher} • {room}</p>
      </div>
      {active && (
        <span className="px-3 py-1 bg-neon-cyan text-black text-xs font-bold rounded-full animate-pulse">
          IN SESSION
        </span>
      )}
    </div>
  )
}

function GradeRow({ subject, grade, color, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{subject}</span>
        <span className={`font-bold text-${color}`}>{grade}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overivew-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${progress}%`,
            backgroundColor: color === 'neon-cyan' ? '#00f3ff' : color === 'neon-purple' ? '#bc13fe' : '#ff00ff',
            boxShadow: `0 0 10px ${color === 'neon-cyan' ? '#00f3ff' : color === 'neon-purple' ? '#bc13fe' : '#ff00ff'}`
          }}
        />
      </div>
    </div>
  )
}

function AssignmentCard({ title, topic, due, status }: any) {
  return (
    <div className="p-6 glass rounded-2xl border border-white/10 group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-neon-purple/20 transition-colors">
           <BookOpen size={20} className="text-gray-400 group-hover:text-neon-purple" />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#ff3b9a]">{due}</span>
      </div>
      <h4 className="text-lg font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-4">{topic}</p>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-neon-purple w-0 group-hover:w-full transition-all duration-1000" />
      </div>
    </div>
  )
}
