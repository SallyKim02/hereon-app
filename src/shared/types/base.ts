export type BaseEntity = {
  id: string;          // uuid
  createdAt: number;   // epoch ms
  updatedAt: number;   // epoch ms
  isDeleted?: boolean; // soft delete (sync 대비)
};
