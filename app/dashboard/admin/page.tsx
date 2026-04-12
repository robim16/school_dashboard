'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/useRealtime'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  ArrowUpRight, 
  Plus
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ teachers: 0, students: 0, classrooms: 0, avgGrade: 0 })
  const { data: recentGrades } = useRealtime<any>('grades', [])
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const [teachers, students, classrooms, grades] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('classrooms').select('*', { count: 'exact', head: true }),
        supabase.from('grades').select('grade')
      ])

      const avg = grades.data?.length 
        ? grades.data.reduce((acc, curr) => acc + Number(curr.grade), 0) / grades.data.length
        : 0

      setStats({
        teachers: teachers.count || 0,
        students: students.count || 0,
        classrooms: classrooms.count || 0,
        avgGrade: Number(avg.toFixed(1))
      })
    }
    fetchStats()
  }, [supabase, recentGrades])

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-glow-cyan">School Overview</h1>
            <p className="text-gray-400">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
          </div>
          <button className="flex items-center gap-2 bg-neon-cyan text-black px-6 py-3 rounded-xl font-bold hover:shadow-neon-cyan/50 transition-all transform hover:scale-105">
            <Plus size={20} /> Add New Class
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Users className="text-neon-cyan" />}
            label="Total Teachers"
            value={stats.teachers.toString()}
            trend="Live"
            positive={true}
          />
          <StatCard 
            icon={<GraduationCap className="text-neon-purple" />}
            label="Total Students"
            value={stats.students.toString()}
            trend="Live"
            positive={true}
          />
          <StatCard 
            icon={<BookOpen className="text-neon-pink" />}
            label="Active Classes"
            value={stats.classrooms.toString()}
            trend="Live"
            positive={true}
          />
          <StatCard 
            icon={<TrendingUp className="text-orange-400" />}
            label="Avg. Grade"
            value={`${stats.avgGrade}%`}
            trend="Live"
            positive={true}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 glass rounded-3xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6">Grade Performance (Real-time)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentGrades.slice(-10)}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="created_at" hide />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0b0f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#00f3ff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="grade" 
                    stroke="#00f3ff" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorStudents)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 glass rounded-3xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6">Recent Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentGrades.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="id" hide />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0b0f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="grade" fill="#bc13fe" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Global Recent Activity (Realtime) */}
        <div className="p-6 glass rounded-3xl border border-white/10">
           <h3 className="text-xl font-bold mb-6">Live Logs: Grades & Updates</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-white/5 text-gray-400 text-sm">
                   <th className="pb-4 font-medium pl-2">Record ID</th>
                   <th className="pb-4 font-medium">Value</th>
                   <th className="pb-4 font-medium">Type</th>
                   <th className="pb-4 font-medium text-right pr-2">Update</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {recentGrades.length > 0 ? (
                   recentGrades.map((grade: any) => (
                    <tr key={grade.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 font-mono text-xs text-gray-400">{grade.id.slice(0, 8)}...</td>
                      <td className="py-4 text-neon-cyan font-bold">{grade.grade}%</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs font-semibold">
                          Grade Entry
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 text-gray-500 text-sm">
                        {new Date(grade.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-gray-500 italic">No recent activity found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 glass rounded-3xl border border-white/10"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
        <div className="flex items-center gap-1 text-sm font-bold text-neon-cyan shadow-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/30 text-[10px] uppercase">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </motion.div>
  )
}

function TeacherRow({ name, class: className, action, time }: any) {
  return (
    <tr className="group hover:bg-white/5 transition-colors">
      <td className="py-4 pl-2 font-medium">{name}</td>
      <td className="py-4 text-gray-400">{className}</td>
      <td className="py-4">
        <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs font-semibold">
          {action}
        </span>
      </td>
      <td className="py-4 text-right pr-2 text-gray-500 text-sm">{time}</td>
    </tr>
  )
}
