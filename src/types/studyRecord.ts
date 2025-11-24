export type StudyRecord = {
  id: string;
  title: string;
  time: number;
};

export type StudyInput = Pick<StudyRecord, "title" | "time">;
