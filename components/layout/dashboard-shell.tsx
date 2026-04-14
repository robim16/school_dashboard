'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react'
import { logout } from '@/app/auth/actions'

interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  roles: ('admin' | 'teacher' | 'student')[]
}

const sidebarItems: SidebarItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/dashboard', roles: ['admin', 'teacher', 'student'] },
  // Admin Routes
  { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/dashboard/admin/analytics', roles: ['admin'] },
  { icon: <BookOpen size={20} />, label: 'Classes', href: '/dashboard/admin/classes', roles: ['admin'] },
  { icon: <Users size={20} />, label: 'Teachers', href: '/dashboard/admin/teachers', roles: ['admin'] },
  { icon: <GraduationCap size={20} />, label: 'Students', href: '/dashboard/admin/students', roles: ['admin'] },
  // Teacher Routes
  { icon: <BookOpen size={20} />, label: 'My Classes', href: '/dashboard/teacher/classes', roles: ['teacher'] },
  { icon: <BarChart3 size={20} />, label: 'Grades', href: '/dashboard/teacher/grades', roles: ['teacher'] },
  { icon: <Calendar size={20} />, label: 'Teaching Schedule', href: '/dashboard/teacher/schedule', roles: ['teacher'] },
  // Student Routes
  { icon: <BookOpen size={20} />, label: 'My Grades', href: '/dashboard/student/grades', roles: ['student'] },
  { icon: <Calendar size={20} />, label: 'My Schedule', href: '/dashboard/student/schedule', roles: ['student'] },
  // Common
  { icon: <Settings size={20} />, label: 'Profile', href: '/dashboard/profile', roles: ['admin', 'teacher', 'student'] },
]

export function DashboardShell({ 
  children, 
}: { 
  children: React.ReactNode,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/signin')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authUser.id)
        .single()
      
      if (profile) setUser(profile)
    }
    getUser()
  }, [supabase, router])

  const userRole = (user?.role as 'admin'|'teacher'|'student') || 'student'
  const filteredItems = sidebarItems.filter(item => item.roles.includes(userRole))

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass border-r border-white/10 flex flex-col z-30 relative"
      >
        <div className="p-6 flex items-center gap-3">
          <BookOpen className="text-neon-cyan shrink-0" size={32} />
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple whitespace-nowrap"
            >
              EduStream
            </motion.span>
          )}
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href}>
                <div className={`
                  flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-neon-cyan/10 text-neon-cyan shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'}
                `}>
                  <div className={`${isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'} transition-colors`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-cyan" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-grow max-w-xl mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-cyan transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search everything..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30 transition-all font-light"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell size={22} className="text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-neon-pink" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user?.full_name || 'Loading...'}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink border-2 border-white/20 flex items-center justify-center text-sm font-bold">
                {user?.full_name?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-grow overflow-auto p-8 relative">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 blur-[120px] rounded-full -z-10" />
           {children}
        </main>
      </div>
    </div>
  )
}
