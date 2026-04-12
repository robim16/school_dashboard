import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentGrades, getTeacherClasses, updateGrade, getSchoolAnalytics } from './school-service';
import { createClient } from '@/lib/supabase/server';

// Mock del cliente de Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('school-service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    // Reset implementations to return this by default
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.single.mockReturnThis();
  });

  it('getStudentGrades should fetch grades for a student', async () => {
    const mockData = [{ id: '1', grade: 10, lessons: { title: 'Math' } }];
    // In getStudentGrades, .eq() is the last call
    (mockSupabase.eq as any).mockResolvedValue({ data: mockData, error: null });

    const result = await getStudentGrades('student-123');

    expect(mockSupabase.from).toHaveBeenCalledWith('grades');
    expect(mockSupabase.eq).toHaveBeenCalledWith('student_id', 'student-123');
    expect(result).toEqual(mockData);
  });

  it('getTeacherClasses should fetch classrooms and students', async () => {
    const mockData = [{ id: 'c1', name: 'Class 1', students: [] }];
    // In getTeacherClasses, .select() is the last call
    (mockSupabase.select as any).mockResolvedValue({ data: mockData, error: null });

    const result = await getTeacherClasses();

    expect(mockSupabase.from).toHaveBeenCalledWith('classrooms');
    expect(result).toEqual(mockData);
  });

  it('updateGrade should update a grade and return the result', async () => {
    const mockData = { id: 'g1', grade: 9 };
    // In updateGrade, .single() is the last call
    (mockSupabase.single as any).mockResolvedValue({ data: mockData, error: null });

    const result = await updateGrade('g1', 9, 'Good job');

    expect(mockSupabase.from).toHaveBeenCalledWith('grades');
    expect(mockSupabase.update).toHaveBeenCalledWith({ grade: 9, comments: 'Good job' });
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'g1');
    expect(result).toEqual(mockData);
  });

  it('getSchoolAnalytics should calculate average grade', async () => {
    const mockGrades = [{ grade: 10 }, { grade: 8 }];
    // In getSchoolAnalytics, .select() is the last call
    (mockSupabase.select as any).mockResolvedValue({ data: mockGrades, error: null });

    const result = await getSchoolAnalytics();

    expect(result).toEqual({
      totalStudents: 2,
      averageGrade: '9.00',
    });
  });

  it('should throw error if supabase returns error', async () => {
    // In getStudentGrades, .eq() is the last call
    (mockSupabase.eq as any).mockResolvedValue({ data: null, error: new Error('DB Error') });

    await expect(getStudentGrades('123')).rejects.toThrow('DB Error');
  });
});
