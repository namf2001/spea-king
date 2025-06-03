'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from '@/types/response';
import { Role } from '@prisma/client';

// Check if user has admin privileges
async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return session.user;
}

// Get admin dashboard statistics
export async function getAdminStats(): Promise<
  ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalExercises: number;
    totalSpeakingRecords: number;
    userGrowth: Array<{ date: string; count: number }>;
    activityStats: Array<{ name: string; value: number }>;
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      lastActive?: string;
    }>;
    systemHealth: {
      dbConnection: boolean;
      totalRecords: number;
      avgResponseTime: number;
    };
  }>
> {
  try {
    await requireAdmin();

    // Total users
    const totalUsers = await prisma.user.count();

    // Active users (users with speaking records in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersCount = await prisma.user.count({
      where: {
        speakingRecords: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Total exercises
    const totalExercises = await prisma.vocabularyExercise.count();

    // Total speaking records
    const totalSpeakingRecords = await prisma.userSpeakingRecord.count();

    // User growth over last 7 days (using speaking records as proxy for user activity)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.userSpeakingRecord.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      userGrowth.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      });
    }

    // Activity statistics
    const pronunciationCount = await prisma.userSpeakingRecord.count({
      where: {
        conversationTopicId: null,
        reflexQuestionId: null,
      },
    });

    const conversationCount = await prisma.userSpeakingRecord.count({
      where: {
        conversationTopicId: { not: null },
      },
    });

    const reflexCount = await prisma.userSpeakingRecord.count({
      where: {
        reflexQuestionId: { not: null },
      },
    });

    const vocabularyCount = await prisma.exerciseResult.count();

    const activityStats = [
      { name: 'Pronunciation', value: pronunciationCount },
      { name: 'Conversation', value: conversationCount },
      { name: 'Reflex', value: reflexCount },
      { name: 'Vocabulary', value: vocabularyCount },
    ];

    // Recent users (last 10) - get all users and add their latest activity
    const recentUsersData = await prisma.user.findMany({
      take: 10,
      include: {
        speakingRecords: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const recentUsers = recentUsersData.map((user) => ({
      id: user.id,
      name: user.name ?? 'Unknown',
      email: user.email ?? 'No email',
      role: user.role,
      createdAt: user.emailVerified?.toISOString().split('T')[0] ?? 'Unknown',
      lastActive: user.speakingRecords[0]?.createdAt.toISOString().split('T')[0],
    }));

    // System health
    const dbStartTime = Date.now();
    await prisma.user.findFirst();
    const dbResponseTime = Date.now() - dbStartTime;

    const totalRecords = await prisma.userSpeakingRecord.count();

    const systemHealth = {
      dbConnection: true,
      totalRecords,
      avgResponseTime: dbResponseTime,
    };

    return createSuccessResponse({
      totalUsers,
      activeUsers: activeUsersCount,
      totalExercises,
      totalSpeakingRecords,
      userGrowth,
      activityStats,
      recentUsers,
      systemHealth,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return createErrorResponse(
      'ADMIN_STATS_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch admin statistics',
    );
  }
}

// Get all users with pagination
export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<
  ApiResponse<{
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      exerciseCount: number;
      speakingRecordCount: number;
      lastActive?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>
> {
  try {
    await requireAdmin();

    const skip = (page - 1) * limit;
    
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              vocabularyExercises: true,
              speakingRecords: true,
            },
          },
          speakingRecords: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name ?? 'Unknown',
      email: user.email ?? 'No email',
      role: user.role,
      createdAt: user.emailVerified?.toISOString().split('T')[0] ?? 'Unknown',
      exerciseCount: user._count.vocabularyExercises,
      speakingRecordCount: user._count.speakingRecords,
      lastActive: user.speakingRecords[0]?.createdAt.toISOString().split('T')[0],
    }));

    return createSuccessResponse({
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return createErrorResponse(
      'FETCH_USERS_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch users',
    );
  }
}

// Update user role
export async function updateUserRole(
  userId: string,
  newRole: Role,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return createErrorResponse(
      'UPDATE_ROLE_ERROR',
      error instanceof Error ? error.message : 'Failed to update user role',
    );
  }
}

// Delete user
export async function deleteUser(
  userId: string,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const admin = await requireAdmin();
    
    // Prevent admin from deleting themselves
    if (admin.id === userId) {
      throw new Error('Cannot delete your own account');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return createErrorResponse(
      'DELETE_USER_ERROR',
      error instanceof Error ? error.message : 'Failed to delete user',
    );
  }
}

// Get system activity logs
export async function getActivityLogs(
  limit: number = 50,
): Promise<
  ApiResponse<{
    logs: Array<{
      id: string;
      userId: string;
      userName: string;
      action: string;
      details: string;
      timestamp: string;
    }>;
  }>
> {
  try {
    await requireAdmin();

    // Get recent speaking records as activity logs
    const speakingRecords = await prisma.userSpeakingRecord.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        conversationTopic: true,
        reflexQuestion: true,
      },
    });

    const logs = speakingRecords.map((record) => {
      let action = 'PRONUNCIATION_PRACTICE';
      let details = 'Practiced pronunciation';

      if (record.conversationTopicId) {
        action = 'CONVERSATION_PRACTICE';
        details = `Practiced conversation: ${record.conversationTopic?.title}`;
      } else if (record.reflexQuestionId) {
        action = 'REFLEX_PRACTICE';
        details = `Practiced reflex question`;
      }

      return {
        id: record.id,
        userId: record.userId,
        userName: record.user.name ?? 'Unknown',
        action,
        details,
        timestamp: record.createdAt.toISOString(),
      };
    });

    return createSuccessResponse({ logs });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return createErrorResponse(
      'FETCH_LOGS_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch activity logs',
    );
  }
}

// Clean up old data
export async function cleanupOldData(
  daysOld: number = 90,
): Promise<ApiResponse<{ deletedRecords: number }>> {
  try {
    await requireAdmin();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.userSpeakingRecord.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return createSuccessResponse({ deletedRecords: result.count });
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return createErrorResponse(
      'CLEANUP_ERROR',
      error instanceof Error ? error.message : 'Failed to clean up old data',
    );
  }
}

// Export user data
export async function exportUserData(): Promise<
  ApiResponse<{
    users: any[];
    exercises: any[];
    speakingRecords: any[];
    exportedAt: string;
  }>
> {
  try {
    await requireAdmin();

    const [users, exercises, speakingRecords] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
        },
      }),
      prisma.vocabularyExercise.findMany({
        include: {
          pairs: true,
          results: true,
        },
      }),
      prisma.userSpeakingRecord.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return createSuccessResponse({
      users,
      exercises,
      speakingRecords,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return createErrorResponse(
      'EXPORT_ERROR',
      error instanceof Error ? error.message : 'Failed to export user data',
    );
  }
}