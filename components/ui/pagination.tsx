'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRange = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/5 bg-white/5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-400">
          {totalPages <= 1 ? (
            <>Mostrando <span className="text-white font-medium">{totalCount}</span> {totalCount === 1 ? 'registro' : 'registros'} de <span className="text-white font-medium">{totalCount}</span></>
          ) : (
            <>Mostrando <span className="text-white font-medium">{startRange}-{endRange}</span> de <span className="text-white font-medium">{totalCount}</span> registros</>
          )}
        </p>
        <p className="text-xs text-gray-500">
          Página {currentPage} de {totalPages}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                currentPage === page 
                  ? 'bg-neon-cyan text-black shadow-neon-cyan/50 shadow-lg' 
                  : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
