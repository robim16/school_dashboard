import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealtime } from './useRealtime';
import { createClient } from '@/lib/supabase/client';

// Mock del cliente de Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('useRealtime', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  const mockSupabase = {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('should initialize with initialData', () => {
    const initialData = [{ id: '1', name: 'Test' }];
    const { result } = renderHook(() => useRealtime('test_table', initialData));

    expect(result.current.data).toEqual(initialData);
  });

  it('should subscribe to realtime changes on mount', () => {
    renderHook(() => useRealtime('test_table'));

    expect(mockSupabase.channel).toHaveBeenCalled();
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'test_table', event: '*' }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should handle INSERT event', () => {
    let callback: Function = () => {};
    (mockChannel.on as any).mockImplementation((_event: string, _config: any, cb: Function) => {
      callback = cb;
      return mockChannel;
    });

    const { result } = renderHook(() => useRealtime('test_table', []));

    act(() => {
      callback({
        eventType: 'INSERT',
        new: { id: '2', name: 'New Item' },
      });
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0]).toEqual({ id: '2', name: 'New Item' });
  });

  it('should handle UPDATE event', () => {
    let callback: Function = () => {};
    (mockChannel.on as any).mockImplementation((_event: string, _config: any, cb: Function) => {
      callback = cb;
      return mockChannel;
    });

    const initialData = [{ id: '1', name: 'Old Name' }];
    const { result } = renderHook(() => useRealtime('test_table', initialData));

    act(() => {
      callback({
        eventType: 'UPDATE',
        new: { id: '1', name: 'Updated Name' },
      });
    });

    expect(result.current.data[0].name).toBe('Updated Name');
  });

  it('should handle DELETE event', () => {
    let callback: Function = () => {};
    (mockChannel.on as any).mockImplementation((_event: string, _config: any, cb: Function) => {
      callback = cb;
      return mockChannel;
    });

    const initialData = [{ id: '1', name: 'To be deleted' }];
    const { result } = renderHook(() => useRealtime('test_table', initialData));

    act(() => {
      callback({
        eventType: 'DELETE',
        old: { id: '1' },
      });
    });

    expect(result.current.data).toHaveLength(0);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useRealtime('test_table'));
    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
