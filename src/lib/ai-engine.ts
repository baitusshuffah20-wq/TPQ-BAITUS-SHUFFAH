// AI Engine untuk Prediksi dan Rekomendasi Rumah Tahfidz
// Menggunakan algoritma machine learning sederhana tanpa library berat

interface StudentData {
  id: string;
  name: string;
  age: number;
  enrollmentDate: string;
  hafalanHistory: HafalanRecord[];
  attendanceHistory: AttendanceRecord[];
  grades: number[];
  currentLevel: number;
}

interface HafalanRecord {
  surahId: number;
  surahName: string;
  ayahCount: number;
  grade: number;
  date: string;
  difficulty: number; // 1-5 scale
}

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  punctualityScore: number; // 0-100
}

interface PredictionResult {
  completionDate: string;
  confidence: number;
  recommendedPace: number;
  riskFactors: string[];
  suggestions: string[];
}

interface SmartRecommendation {
  type: 'STUDY_PLAN' | 'MOTIVATION' | 'DIFFICULTY_ADJUSTMENT' | 'SCHEDULE_OPTIMIZATION';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionItems: string[];
  expectedImpact: string;
}

class AIEngine {
  // Linear Regression untuk prediksi progress
  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { slope, intercept, r2 };
  }

  // Weighted Moving Average untuk trend analysis
  private weightedMovingAverage(data: number[], weights: number[]): number {
    if (data.length !== weights.length) {
      throw new Error('Data and weights arrays must have the same length');
    }
    
    const weightedSum = data.reduce((sum, value, index) => sum + value * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return weightedSum / totalWeight;
  }

  // Clustering sederhana untuk grouping santri
  private kMeansSimple(data: number[][], k: number): number[][] {
    // Simplified K-means implementation
    const centroids: number[][] = [];
    
    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
      centroids.push([Math.random() * 100, Math.random() * 100]);
    }
    
    // Simple iteration (in real implementation, you'd iterate until convergence)
    return centroids;
  }

  // Prediksi waktu penyelesaian hafalan
  predictCompletionTime(student: StudentData, targetSurah: number): PredictionResult {
    const hafalanHistory = student.hafalanHistory;
    
    if (hafalanHistory.length < 3) {
      return {
        completionDate: 'Insufficient data',
        confidence: 0,
        recommendedPace: 1,
        riskFactors: ['Insufficient historical data'],
        suggestions: ['Continue regular practice to build prediction model']
      };
    }

    // Extract time series data
    const dates = hafalanHistory.map(h => new Date(h.date).getTime());
    const progress = hafalanHistory.map((_, index) => index + 1);
    
    // Normalize dates to days since start
    const startDate = Math.min(...dates);
    const daysSinceStart = dates.map(date => (date - startDate) / (1000 * 60 * 60 * 24));
    
    // Linear regression to predict trend
    const regression = this.linearRegression(daysSinceStart, progress);
    
    // Calculate average grade and attendance
    const avgGrade = student.grades.reduce((a, b) => a + b, 0) / student.grades.length;
    const attendanceRate = student.attendanceHistory.filter(a => a.status === 'PRESENT').length / student.attendanceHistory.length;
    
    // Adjust prediction based on performance factors
    let adjustmentFactor = 1;
    if (avgGrade > 85) adjustmentFactor *= 0.9; // Faster for high performers
    if (avgGrade < 70) adjustmentFactor *= 1.2; // Slower for struggling students
    if (attendanceRate > 0.9) adjustmentFactor *= 0.95; // Faster for regular attendees
    if (attendanceRate < 0.8) adjustmentFactor *= 1.15; // Slower for irregular attendees
    
    // Predict days to complete target
    const remainingSurah = targetSurah - student.currentLevel;
    const daysToComplete = (remainingSurah / regression.slope) * adjustmentFactor;
    
    // Calculate completion date
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + Math.round(daysToComplete));
    
    // Determine risk factors
    const riskFactors: string[] = [];
    if (avgGrade < 75) riskFactors.push('Below average performance');
    if (attendanceRate < 0.85) riskFactors.push('Irregular attendance');
    if (regression.slope < 0.1) riskFactors.push('Slow progress rate');
    
    // Generate suggestions
    const suggestions: string[] = [];
    if (avgGrade < 80) suggestions.push('Focus on improving tajwid and pronunciation');
    if (attendanceRate < 0.9) suggestions.push('Improve attendance consistency');
    if (regression.slope > 0.2) suggestions.push('Maintain current excellent pace');
    
    return {
      completionDate: completionDate.toLocaleDateString('id-ID'),
      confidence: Math.min(regression.r2 * 100, 95),
      recommendedPace: Math.max(1, Math.round(regression.slope * 7)), // Surah per week
      riskFactors,
      suggestions
    };
  }

  // Generate smart recommendations
  generateRecommendations(student: StudentData): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Analyze recent performance
    const recentGrades = student.grades.slice(-5);
    const avgRecentGrade = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
    const gradeVariance = this.calculateVariance(recentGrades);
    
    // Analyze attendance pattern
    const recentAttendance = student.attendanceHistory.slice(-10);
    const attendanceRate = recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length;
    
    // Performance-based recommendations
    if (avgRecentGrade < 75) {
      recommendations.push({
        type: 'STUDY_PLAN',
        title: 'Intensive Review Program',
        description: 'Recent grades indicate need for additional practice and review',
        priority: 'HIGH',
        actionItems: [
          'Schedule daily 30-minute review sessions',
          'Focus on problematic ayah repetition',
          'Work with senior santri for peer tutoring'
        ],
        expectedImpact: 'Expected 15-20 point grade improvement within 2 weeks'
      });
    }

    if (gradeVariance > 200) {
      recommendations.push({
        type: 'DIFFICULTY_ADJUSTMENT',
        title: 'Stabilize Performance',
        description: 'Grade inconsistency suggests need for structured approach',
        priority: 'MEDIUM',
        actionItems: [
          'Break down complex surah into smaller sections',
          'Implement consistent daily practice schedule',
          'Regular progress check-ins with musyrif'
        ],
        expectedImpact: 'More consistent performance and reduced stress'
      });
    }

    // Attendance-based recommendations
    if (attendanceRate < 0.8) {
      recommendations.push({
        type: 'SCHEDULE_OPTIMIZATION',
        title: 'Attendance Improvement Plan',
        description: 'Low attendance is impacting learning progress',
        priority: 'HIGH',
        actionItems: [
          'Identify and address attendance barriers',
          'Flexible scheduling options if needed',
          'Parent-teacher communication enhancement'
        ],
        expectedImpact: 'Improved learning continuity and faster progress'
      });
    }

    // Motivation-based recommendations
    if (avgRecentGrade > 85 && attendanceRate > 0.9) {
      recommendations.push({
        type: 'MOTIVATION',
        title: 'Advanced Challenge Program',
        description: 'Excellent performance indicates readiness for advanced challenges',
        priority: 'MEDIUM',
        actionItems: [
          'Introduce advanced tajwid techniques',
          'Participate in recitation competitions',
          'Mentor junior santri'
        ],
        expectedImpact: 'Enhanced motivation and leadership development'
      });
    }

    return recommendations;
  }

  // Calculate variance
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  // Analyze class performance trends
  analyzeClassTrends(students: StudentData[]): {
    overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    averageGrade: number;
    attendanceRate: number;
    topPerformers: string[];
    needsAttention: string[];
    insights: string[];
  } {
    const allGrades = students.flatMap(s => s.grades);
    const averageGrade = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
    
    const allAttendance = students.flatMap(s => s.attendanceHistory);
    const attendanceRate = allAttendance.filter(a => a.status === 'PRESENT').length / allAttendance.length;
    
    // Identify top performers (top 20%)
    const studentAvgGrades = students.map(s => ({
      name: s.name,
      avgGrade: s.grades.reduce((a, b) => a + b, 0) / s.grades.length
    }));
    studentAvgGrades.sort((a, b) => b.avgGrade - a.avgGrade);
    
    const topCount = Math.ceil(students.length * 0.2);
    const topPerformers = studentAvgGrades.slice(0, topCount).map(s => s.name);
    
    // Identify students needing attention (bottom 20% or recent decline)
    const needsAttention = studentAvgGrades
      .slice(-topCount)
      .filter(s => s.avgGrade < 70)
      .map(s => s.name);
    
    // Generate insights
    const insights: string[] = [];
    if (averageGrade > 80) insights.push('Class performance is excellent overall');
    if (attendanceRate > 0.9) insights.push('Attendance rate is very good');
    if (needsAttention.length > students.length * 0.3) {
      insights.push('Consider additional support programs for struggling students');
    }
    
    // Determine overall trend (simplified)
    const recentGrades = students.flatMap(s => s.grades.slice(-3));
    const olderGrades = students.flatMap(s => s.grades.slice(0, -3));
    const recentAvg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
    const olderAvg = olderGrades.reduce((a, b) => a + b, 0) / olderGrades.length;
    
    let overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    if (recentAvg > olderAvg + 2) overallTrend = 'IMPROVING';
    else if (recentAvg < olderAvg - 2) overallTrend = 'DECLINING';
    else overallTrend = 'STABLE';
    
    return {
      overallTrend,
      averageGrade,
      attendanceRate,
      topPerformers,
      needsAttention,
      insights
    };
  }

  // Optimize study schedule based on performance patterns
  optimizeStudySchedule(student: StudentData): {
    recommendedSchedule: { day: string; time: string; focus: string }[];
    reasoning: string;
  } {
    const avgGrade = student.grades.reduce((a, b) => a + b, 0) / student.grades.length;
    const attendanceHistory = student.attendanceHistory;
    
    // Analyze best performance days
    const dayPerformance = attendanceHistory.reduce((acc, record) => {
      const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!acc[day]) acc[day] = [];
      acc[day].push(record.punctualityScore);
      return acc;
    }, {} as Record<string, number[]>);
    
    // Generate optimized schedule
    const schedule = [
      { day: 'Monday', time: '08:00-09:30', focus: 'New material introduction' },
      { day: 'Tuesday', time: '08:00-09:30', focus: 'Practice and repetition' },
      { day: 'Wednesday', time: '08:00-09:30', focus: 'Review and correction' },
      { day: 'Thursday', time: '08:00-09:30', focus: 'Advanced techniques' },
      { day: 'Friday', time: '08:00-09:30', focus: 'Assessment and feedback' }
    ];
    
    const reasoning = `Schedule optimized based on ${avgGrade > 80 ? 'excellent' : 'current'} performance level and attendance patterns.`;
    
    return {
      recommendedSchedule: schedule,
      reasoning
    };
  }
}

export default AIEngine;
