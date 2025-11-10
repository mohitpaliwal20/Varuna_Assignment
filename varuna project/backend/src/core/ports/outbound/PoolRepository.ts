export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  id?: number;
  year: number;
  members: PoolMember[];
  createdAt?: Date;
}

export interface PoolRepository {
  createPool(year: number, members: PoolMember[]): Promise<Pool>;
  findById(id: number): Promise<Pool | null>;
  findByYear(year: number): Promise<Pool[]>;
}
