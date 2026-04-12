'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, BookOpen, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BookOpen className="text-neon-cyan w-8 h-8" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple leading-[normal]">
            EduStream
          </span>
        </div>
        <div className="hidden md:flex gap-8">
          <Link href="#features" className="hover:text-neon-cyan transition-colors">Features</Link>
          <Link href="#about" className="hover:text-neon-purple transition-colors">About</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/signin">
             <button className="px-4 py-2 hover:text-neon-cyan transition-colors">Sign In</button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-6 py-2 bg-neon-purple rounded-full font-semibold hover:shadow-neon-purple transition-all duration-300">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-neon-cyan/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-neon-purple/20 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Future of <br />
            <span className="text-neon-cyan text-glow-cyan">Smart Learning</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Experience a seamless, AI-powered educational management system designed for modern schools. Real-time analytics, automated attendance, and interactive grading.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <button className="flex items-center gap-2 px-8 py-4 bg-neon-cyan text-black rounded-lg font-bold hover:scale-105 transition-transform">
                Get Started Free <ArrowRight />
              </button>
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 glass rounded-lg font-bold hover:bg-white/10 transition-colors">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Floating Feature Icons */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
           <FeatureCard 
             icon={<Zap className="text-neon-cyan" />}
             title="Lightning Fast"
             description="Real-time updates for grades and schedules with zero lag."
             borderColor="neon-cyan"
           />
           <FeatureCard 
             icon={<Shield className="text-neon-purple" />}
             title="Secure by Default"
             description="Enterprise-grade security with role-based access control."
             borderColor="neon-purple"
           />
           <FeatureCard 
             icon={<BookOpen className="text-neon-pink" />}
             title="Smart Analytics"
             description="Visualize student progress with advanced AI-driven charts."
             borderColor="neon-pink"
           />
        </div>
      </main>

      <footer className="p-10 border-t border-white/10 text-center text-gray-500">
        <p>&copy; 2024 EduStream AI. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, borderColor }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  borderColor: string
}) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-8 rounded-2xl glass border-l-4 border-${borderColor}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
