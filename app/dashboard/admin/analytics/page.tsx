'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen,
  Calendar,
  ArrowUpRight,
  Target
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#00f3ff', '#bc13fe', '#ff00ff', '#facc15']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>({ gradeHistory: [], roleDistrib: [], topClasses: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      const [grades, students, teachers, classes] = await Promise.all([
        supabase.from('grades').select('grade, created_at').order('created_at'),
        supabase.from('students').select('count'),
        supabase.from('profiles').select('count').eq('role', 'teacher'),
        supabase.from('classrooms').select('name, students(count)')
      ])

      // Process Grade History
      const history = grades.data?.map(g => ({
        date: new Date(g.created_at).toLocaleDateString(),
        score: g.grade
      })) || []

      // Role Distribution
      const roleDistrib = [
        { name: 'Students', value: students.count || 0 },
        { name: 'Teachers', value: teachers.count || 0 }
      ]

      // Top Classes by Student Count
      const topClasses = classes.data?.map(c => ({
        name: c.name,
        count: c.students[0]?.count || 0
      })).sort((a, b) => b.count - a.count).slice(0, 5) || []

      setData({ gradeHistory: history, roleDistrib, topClasses })
      setLoading(false)
    }
    fetchAnalytics()
  }, [supabase])

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-cyan">School-wide Analytics</h1>
          <p className="text-gray-400">Deep dive into performance metrics and institutional growth.</p>
        </div>

        {/* Top Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard icon={<Target className="text-neon-cyan" />} label="Avg Academic Score" value="88.4%" sub="Top 5% Regionally" />
          <MetricCard icon={<Award className="text-neon-purple" />} label="Graduation Rate" value="96.2%" sub="+2.1% from last semester" />
          <MetricCard icon={<TrendingUp className="text-neon-pink" />} label="Retention Rate" value="99.1%" sub="Industry leading" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grade Trends */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 glass rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ArrowUpRight size={20} className="text-neon-cyan" /> Score Trajectory</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.gradeHistory}>
                  <defs>
                    <linearGradient id="colScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#0b0b0f', border: '1px solid #ffffff10' }} />
                  <Area type="monotone" dataKey="score" stroke="#00f3ff" fill="url(#colScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Class Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 glass rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-6">Class Load Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topClasses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0b0f', border: '1px solid #ffffff10' }} />
                  <Bar dataKey="count" fill="#bc13fe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demographic Pie */}
          <div className="p-8 glass rounded-3xl border border-white/10">
             <h3 className="text-xl font-bold mb-6">Staff vs Students</h3>
             <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={data.roleDistrib} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {data.roleDistrib.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-4 flex justify-center gap-4">
                {data.roleDistrib.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-400">{d.name}: {d.value}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Additional Stats */}
          <div className="lg:col-span-2 p-8 glass rounded-3xl border border-white/10">
             <h3 className="text-xl font-bold mb-6">System Health & Engagement</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-neon-cyan font-mono text-sm mb-1">99.9%</p>
                   <p className="text-xs text-gray-500">Real-time Uptime</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-neon-purple font-mono text-sm mb-1">12s</p>
                   <p className="text-xs text-gray-500">Avg Update Latency</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-neon-pink font-mono text-sm mb-1">2.4k</p>
                   <p className="text-xs text-gray-500">Daily API Events</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-yellow-400 font-mono text-sm mb-1">High</p>
                   <p className="text-xs text-gray-500">Database Sync Status</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function MetricCard({ icon, label, value, sub }: any) {
  return (
    <div className="p-8 glass rounded-3xl border border-white/10 flex items-center gap-6">
      <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs text-green-400">{sub}</p>
      </div>
    </div>
  )
}
