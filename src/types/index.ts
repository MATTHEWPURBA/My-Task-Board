export type Task = {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    status: 'In Progress' | 'Completed' | "Won't do";
    createdAt: Date;
    updatedAt: Date;
    boardId: string;
  };
  
  export type Board = {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasks: Task[];
  };
  
  export type TaskFormData = {
    name: string;
    description?: string;
    icon?: string;
    status: 'In Progress' | 'Completed' | "Won't do";
  };
  
  export type BoardFormData = {
    name: string;
    description?: string;
  };