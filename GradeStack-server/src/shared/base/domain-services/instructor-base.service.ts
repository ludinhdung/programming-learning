import { BaseService } from '../base.service';
import { Instructor, Prisma, Course, Workshop } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type InstructorWithRelations = Instructor & {
    user?: any;
    courses?: Course[];
    wallet?: any;
    workshops?: Workshop[];
};

export abstract class InstructorBaseService<
    T = InstructorWithRelations, 
    C = Prisma.InstructorCreateInput, 
    U = Prisma.InstructorUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // Instructor-specific common methods
    async findByUserId(userId: string, include?: any): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include
        });
    }

    async findWithUser(userId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include: { user: true }
        });
    }

    async findWithCourses(userId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include: { 
                Course: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
    }

    async findWithWallet(userId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include: { 
                Wallet: {
                    include: {
                        transactions: {
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                }
            }
        });
    }

    async findWithWorkshops(userId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include: { 
                Workshop: {
                    orderBy: {
                        scheduledAt: 'desc'
                    }
                }
            }
        });
    }

    async findComplete(userId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { userId },
            include: { 
                user: true,
                Course: true,
                Wallet: {
                    include: {
                        transactions: true
                    }
                },
                Workshop: true
            }
        });
    }
    // NOTE : Not finished yet
    // Statistics and analytics methods
    // async getCourseStats(userId: string): Promise<{
    //     totalCourses: number;
    //     publishedCourses: number;
    //     unpublishedCourses: number;
    //     totalStudents: number;
    // }> {
    //     const instructor = await this.model.findUnique({
    //         where: { userId },
    //         include: {
    //             Course: {
    //                 include: {
    //                     EnrolledCourse: true
    //                 }
    //             }
    //         }
    //     });

    //     if (!instructor) {
    //         throw new Error(`Instructor with userId ${userId} not found`);
    //     }

    //     const courses = instructor.Course || [];
    //     const totalStudents = courses.reduce((acc, course) => 
    //         acc + (course.EnrolledCourse?.length || 0), 0);

    //     return {
    //         totalCourses: courses.length,
    //         publishedCourses: courses.filter(c => c.isPublished).length,
    //         unpublishedCourses: courses.filter(c => !c.isPublished).length,
    //         totalStudents
    //     };
    // }

    // async getEarningStats(userId: string): Promise<{
    //     totalEarnings: number;
    //     pendingWithdrawals: number;
    //     availableBalance: number;
    // }> {
    //     const instructor = await this.model.findUnique({
    //         where: { userId },
    //         include: {
    //             Wallet: {
    //                 include: {
    //                     transactions: true
    //                 }
    //             }
    //         }
    //     });

    //     if (!instructor || !instructor.Wallet) {
    //         return {
    //             totalEarnings: 0,
    //             pendingWithdrawals: 0,
    //             availableBalance: 0
    //         };
    //     }

    //     const { transactions, balance } = instructor.Wallet;
        
    //     const totalEarnings = transactions
    //         .filter(t => t.type === 'REVENUE' && t.status === 'APPROVED')
    //         .reduce((acc, t) => acc + Number(t.amount), 0);
            
    //     const pendingWithdrawals = transactions
    //         .filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING')
    //         .reduce((acc, t) => acc + Number(t.amount), 0);

    //     return {
    //         totalEarnings,
    //         pendingWithdrawals,
    //         availableBalance: Number(balance)
    //     };
    // }

    // Override base hooks with instructor-specific logic
    // protected override beforeCreate(data: C): C {
    //     // Instructor-specific validation or transformation
    //     // For example, ensure social links are valid URLs
    //     if (data.socials) {
    //         // Ensure socials is an array
    //         if (!Array.isArray(data.socials)) {
    //             data.socials = [data.socials as unknown as string];
    //         }
    //     }
    //     return data;
    // }

    protected override afterCreate(result: T): T {
        // Create wallet for new instructor if doesn't exist
        this.ensureWalletExists((result as InstructorWithRelations).userId);
        return result;
    }

    // Helper methods
    private async ensureWalletExists(instructorId: string): Promise<void> {
        const wallet = await prisma.wallet.findUnique({
            where: { instructorId }
        });

        if (!wallet) {
            await prisma.wallet.create({
                data: {
                    instructorId,
                    balance: 0
                }
            });
        }
    }
}