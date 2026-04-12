import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useRealtime<T extends { id: string }>(
  table: string,
  initialData: T[] = [],
  filter?: { column: string; value: string }
) {
  const [data, setData] = useState<T[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch handled by parent component usually, but we filter if needed
    const channel = supabase
      .channel(`realtime_${table}_${filter?.value || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as T, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as T) : item))
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter?.value, filter?.column, supabase])

  return { data, setData }
}
