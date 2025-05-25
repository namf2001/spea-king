import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cache configuration
const CACHE_DURATION = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
}

// In-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

function getCacheKey(userId: string, type: string, params?: Record<string, any>): string {
  const paramsStr = params ? JSON.stringify(params) : ''
  return `${userId}:${type}:${paramsStr}`
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > cached.ttl * 1000) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Enhanced getUserSpeakingStats with caching
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const cacheKey = getCacheKey(userId, 'speaking-stats')
    
    // Try to get from cache first
    const cachedStats = getFromCache(cacheKey)
    if (cachedStats) {
      return NextResponse.json({ 
        success: true, 
        data: cachedStats,
        cached: true 
      })
    }

    // Fetch from database with optimized queries
    const [
      pronunciationRecords,
      conversationRecords,
      reflexRecords,
      totalCount
    ] = await Promise.all([
      // Pronunciation records (neither conversation nor reflex)
      prisma.userSpeakingRecord.findMany({
        where: { 
          userId,
          conversationTopicId: null,
          reflexQuestionId: null
        },
        select: {
          id: true,
          duration: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for performance
      }),
      // Conversation records
      prisma.userSpeakingRecord.findMany({
        where: { 
          userId,
          conversationTopicId: { not: null }
        },
        select: {
          id: true,
          duration: true,
          createdAt: true,
          conversationTopic: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      // Reflex records
      prisma.userSpeakingRecord.findMany({
        where: { 
          userId,
          reflexQuestionId: { not: null }
        },
        select: {
          id: true,
          duration: true,
          createdAt: true,
          reflexQuestion: {
            select: { question: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.userSpeakingRecord.count({
        where: { userId }
      })
    ])

    // Calculate stats
    const allRecords = [
      ...pronunciationRecords.map(r => ({ ...r, type: 'pronunciation' })),
      ...conversationRecords.map(r => ({ ...r, type: 'conversation' })),
      ...reflexRecords.map(r => ({ ...r, type: 'reflex' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate practice streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let practiceStreak = 0
    let checkDate = new Date(today)
    
    while (true) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const hasRecordOnDay = allRecords.some(record => {
        const recordDate = new Date(record.createdAt)
        return recordDate >= dayStart && recordDate <= dayEnd
      })
      
      if (hasRecordOnDay) {
        practiceStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // This month's exercises
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const exercisesThisMonth = allRecords.filter(record => 
      new Date(record.createdAt) >= startOfMonth
    ).length

    // Progress over time (last 7 days)
    const progressOverTime = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const count = allRecords.filter(record => {
        const recordDate = new Date(record.createdAt)
        return recordDate >= dayStart && recordDate <= dayEnd
      }).length
      
      progressOverTime.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count
      })
    }

    // Recent records with details
    const recentRecords = allRecords.slice(0, 10).map(record => ({
      id: record.id,
      type: record.type,
      duration: record.duration,
      date: record.createdAt.toISOString(),
      topicTitle: record.type === 'conversation' ? 
        (record as any).conversationTopic?.title : undefined,
      questionText: record.type === 'reflex' ? 
        (record as any).reflexQuestion?.question : undefined
    }))

    const stats = {
      totalSpeakingCount: totalCount,
      practiceStreak,
      exercisesThisMonth,
      pronunciationCount: pronunciationRecords.length,
      conversationCount: conversationRecords.length,
      reflexCount: reflexRecords.length,
      recentRecords,
      progressOverTime,
      skillsBreakdown: [
        { name: 'Pronunciation', value: pronunciationRecords.length },
        { name: 'Conversation', value: conversationRecords.length },
        { name: 'Reflex Training', value: reflexRecords.length },
        { name: 'Fluency', value: Math.floor(totalCount * 0.7) },
        { name: 'Comprehension', value: Math.floor(totalCount * 0.8) },
      ]
    }

    // Cache the results
    setCache(cacheKey, stats, CACHE_DURATION.medium)

    return NextResponse.json({ 
      success: true, 
      data: stats,
      cached: false 
    })

  } catch (error) {
    console.error('Error fetching speaking stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Failed to fetch speaking statistics' } 
      },
      { status: 500 }
    )
  }
}