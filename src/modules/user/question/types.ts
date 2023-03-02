export type subject = 'Mathématique' | 'Anglais' | 'Science' | 'Physique';

export type QuestionQueryParams = {
  type?: 'answered' | 'unanswered';
  subjects?: subject[];
  dateOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
};
