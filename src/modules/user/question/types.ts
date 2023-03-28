export type subject = 'Mathématique' | 'Anglais' | 'Science' | 'Physique';
export type level = '1ére année' | '2éme année' | '3éme année' | '4éme année';

export type QuestionQueryParams = {
  type?: 'answered' | 'unanswered';
  subjects?: subject[];
  levels?: level[];
  dateOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  page?: number;
  teachers?: string[];
};
