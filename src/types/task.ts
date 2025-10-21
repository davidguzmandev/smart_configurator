export interface Task {
  id: number;
  length: number;
  height: number;
  depth: number;
  status: "pending" | "processing" | "done";
  notes?: string;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface NewTaskInput {
  length: number;
  height: number;
  depth: number;
}