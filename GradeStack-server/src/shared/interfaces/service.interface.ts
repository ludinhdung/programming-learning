export interface ICrudService<T, C = any, U = any> {
    create(data: C): Promise<T>;
    findAll(params?: any): Promise<T[]>;
    findOne(id: string, include?: any): Promise<T | null>;
    update(id: string, data: U): Promise<T>;
    remove(id: string): Promise<T>;
    findOneOrFail(id: string): Promise<T>;
    paginate(params: any): Promise<{ data: T[]; meta: { total: number; page: number; limit: number } }>;
}