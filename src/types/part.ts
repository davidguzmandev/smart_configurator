export interface Part {
  id: number;
  task_id: number;
  base_model?: string;
  file_name: string;
  file_path: string;
  version_label?: string;
  volume?: number;
  created_at: Date;
}

export type NewPartInput = {
  task_id: number;
  base_model: string;
  file_name: string;
  file_path: string;
  version_label: string;
  volume: number | null;
};
