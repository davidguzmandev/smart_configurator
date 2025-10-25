export interface Part {
    id: number;
    task_id: number;
    name: string;
    length: number;
    height: number;
    depth: number;
    created_at: Date;
}

export interface NewPartInput {
    task_id: number;
    name: string;
    length: number;
    height: number;
    depth: number;
}