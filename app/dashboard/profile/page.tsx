'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Settings,
  Edit3
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-glow-cyan">Global Profile</h1>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 italic py-12 text-center">Decrypting user data...</p>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Identity Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-8 glass rounded-3xl border border-white/10 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-1 mb-4 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                   <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl font-bold uppercase transition-transform group-hover:scale-110">
                      {profile.full_name?.charAt(0)}
                   </div>
                </div>
                <h2 className="text-xl font-bold">{profile.full_name}</h2>
                <p className="text-xs text-neon-cyan font-bold uppercase tracking-widest mt-1">{profile.role}</p>
              </div>

              <div className="p-6 glass rounded-2xl border border-white/5 space-y-4">
                 <div className="flex items-center gap-4 text-sm">
                    <Mail className="text-gray-500" size={18} />
                    <span className="text-gray-300">{profile.email}</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm">
                    <Shield className="text-gray-500" size={18} />
                    <span className="text-gray-300">Account Secured</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <span className="text-gray-300">Member since {new Date(profile.created_at).getFullYear()}</span>
                 </div>
              </div>
            </div>

            {/* Account Settings / Meta */}
            <div className="lg:col-span-2 space-y-6">
               <div className="p-8 glass rounded-3xl border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20} className="text-neon-cyan" /> Workspace Configuration</h3>
                  <div className="space-y-6">
                     <SettingItem title="Two-Factor Authentication" desc="Add an extra layer of security to your account." active={true} />
                     <SettingItem title="Desktop Notifications" desc="Get alerted for new grades and schedule changes." active={true} />
                     <SettingItem title="Public Directory" desc="Allow other faculty members to see your profile." active={false} />
                  </div>
               </div>

               <div className="p-8 glass rounded-3xl border border-white/10">
                  <h3 className="text-xl font-bold mb-6">Security Logs</h3>
                  <div className="space-y-4">
                     <p className="text-xs text-gray-500">Last login: Today at {new Date().toLocaleTimeString()}</p>
                     <p className="text-xs text-gray-500">Device: Chrome on Windows 11</p>
                     <p className="text-xs text-gray-500">IP: 192.168.1.xxx (Proxied)</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <p className="text-red-400 text-center py-12">Failed to retrieve profile data.</p>
        )}
      </div>
    </DashboardShell>
  )
}

function SettingItem({ title, desc, active }: any) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-neon-cyan/20 border border-neon-cyan/30' : 'bg-gray-800 border border-white/5'}`}>
         <div className={`w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-6 bg-neon-cyan' : 'bg-gray-600'}`} />
      </div>
    </div>
  )
}
