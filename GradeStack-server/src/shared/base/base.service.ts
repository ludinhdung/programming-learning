import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Cursor = {
    id?: string | number;
    [key: string]: any;
};
// T = Entity type
// C = Create input type
// U = Update input type
export abstract class BaseService<T, C = any, U = any> {
    // Abstract properties
    protected abstract get model(): any;
    // Abstract methods
    protected abstract getModelName(): string;

    // Basic CRUD
    async create(data: C): Promise<T> {
        const preparedData = this.beforeCreate(data);
        const result = await this.model.create({
            data: preparedData,
        });
        return this.afterCreate(result);
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Cursor;
        where?: any;
        orderBy?: any;
        include?: any;
    } = {}): Promise<T[]> {
        return this.model.findMany(params);
    }

    async findOne(id: string, include?: any): Promise<T | null> {
        return this.model.findUnique({
            where: { id },
            include
        });
    }

    async update(id: string, data: U): Promise<T> {
        const preparedData = this.beforeUpdate(id, data);
        const result = await this.model.update({
            where: { id },
            data: preparedData,
        });
        return this.afterUpdate(result);
    }

    async remove(id: string): Promise<T> {
        const preparedId = this.beforeRemove(id);
        const result = await this.model.delete({
            where: { id: preparedId },
        });
        return this.afterRemove(result);
    }
    // Advanced features
    async findOneOrFail(id: string): Promise<T> {
        const result = await this.findOne(id);
        if (!result) {
            throw new Error(`Entity with id ${id} not found`);
        }
        return result;
    }
    async paginate(params: {
        page?: number;
        limit?: number;
        where?: any;
        orderBy?: any;
        include?: any;
    }): Promise<{ data: T[]; meta: { total: number; page: number; limit: number } }> {
        const { page = 1, limit = 10, where, orderBy, include } = params;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
        this.model.findMany({
            skip,
            take: limit,
            where,
            orderBy,
            include
        }),
        this.model.count({ where })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit
            }
        };
    }

    // Hook methods
    protected beforeCreate(data: C): C {
        return data;
    }
    protected afterCreate(result: T): T {
        return result;
    }
    protected beforeUpdate(id: string, data: U): U {
        return data;
    }
    protected afterUpdate(result: T): T {
        return result;
    }
    protected beforeRemove(id: string): string {
        return id;
    }
    protected afterRemove(result: T): T {
        return result;
    }
}