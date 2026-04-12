'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/useRealtime'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock,
  ArrowRight
} from 'lucide-react'

export default function TeacherDashboard() {
  const [data, setData] = useState<any>({ classrooms: [], stats: { students: 0, classes: 0 } })
  const supabase = createClient()
  const [teacherId, setTeacherId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setTeacherId(user.id)
        
        // Fetch classrooms & student counts
        const { data: classrooms } = await supabase
          .from('classrooms')
          .select('*, students(count)')
          .eq('teacher_id', user.id)
        
        const totalStudents = classrooms?.reduce((acc, curr) => acc + (curr.students[0]?.count || 0), 0) || 0
        
        setData({
          classrooms: classrooms || [],
          stats: {
            students: totalStudents,
            classes: classrooms?.length || 0
          }
        })
      }
    }
    init()
  }, [supabase])

  const { data: recentGrades } = useRealtime<any>(
    'grades', 
    [], 
    teacherId ? { column: 'teacher_id', value: teacherId } : undefined
  )

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">Teacher Dashboard</h1>
            <p className="text-gray-400">Manage your classes and grades in real-time.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-neon-purple">Active Status</p>
            <p className="text-lg font-bold">Online</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TeacherStatCard 
            icon={<Users className="text-neon-cyan" />}
            label="My Total Students"
            value={data.stats.students.toString()}
          />
          <TeacherStatCard 
            icon={<BookOpen className="text-neon-purple" />}
            label="Assigned Classes"
            value={data.stats.classes.toString()}
          />
          <TeacherStatCard 
            icon={<Clock className="text-neon-pink" />}
            label="Live Updates"
            value={recentGrades.length.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Classes List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold">My Classrooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.classrooms.length > 0 ? (
                 data.classrooms.map((cls: any, idx: number) => (
                   <ClassCard 
                    key={cls.id}
                    name={cls.name} 
                    room="Main Hall" 
                    time="Check Schedule" 
                    students={cls.students[0]?.count || 0} 
                    color={idx % 2 === 0 ? 'cyan' : 'purple'} 
                   />
                 ))
               ) : (
                 <p className="text-gray-500 italic">No classrooms assigned yet.</p>
               )}
            </div>
          </div>

          {/* Recent Gradings (Realtime) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Live Grading Activity</h3>
            <div className="glass rounded-3xl border border-white/10 p-6 space-y-4">
               {recentGrades.length > 0 ? (
                 recentGrades.map((grade: any) => (
                   <GradingItem 
                    key={grade.id}
                    student="View Profile" 
                    assignment={`Row ID: ${grade.id.slice(0,4)}`} 
                    grade={`${grade.grade}%`} 
                    time={new Date(grade.created_at).toLocaleTimeString()} 
                   />
                 ))
               ) : (
                 <p className="text-center text-gray-600 py-4 italic">No recent grades submitted.</p>
               )}
               
               <button className="w-full py-3 mt-4 text-sm font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                 View Full Gradebook <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function TeacherStatCard({ icon, label, value }: any) {
  return (
    <div className="p-6 glass rounded-2xl border border-white/10 flex items-center gap-6">
      <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function ClassCard({ name, room, time, students, color }: any) {
  const colorMap: any = {
    cyan: 'border-neon-cyan text-neon-cyan',
    purple: 'border-neon-purple text-neon-purple',
    pink: 'border-neon-pink text-neon-pink',
    orange: 'border-orange-400 text-orange-400'
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-6 glass rounded-2xl border-l-4 ${colorMap[color]} cursor-pointer`}
    >
      <h4 className="text-lg font-bold mb-1">{name}</h4>
      <p className="text-sm text-gray-500 mb-4">{room} • {time}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-400">
           <Users size={14} /> {students} Students
        </span>
        <span className="text-white hover:underline">Manage</span>
      </div>
    </motion.div>
  )
}

function GradingItem({ student, assignment, grade, time }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div>
        <p className="font-semibold text-sm">{student}</p>
        <p className="text-xs text-gray-500">{assignment}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-neon-cyan">{grade}</p>
        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">{time}</p>
      </div>
    </div>
  )
}
