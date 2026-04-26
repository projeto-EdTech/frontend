export type CourseStatus = 'approved' | 'borderline' | 'reproved';

export interface CourseResult {
  id: string;
  courseName: string;
  institution: string;
  cutoffScore: number;
  userScore: number;
  difference: number;
  status: CourseStatus;
  area: string;
}

export interface ApiResponse {
  targetCourseResults: CourseResult[];
  allResults: CourseResult[];
  availableAreas: string[];
}
