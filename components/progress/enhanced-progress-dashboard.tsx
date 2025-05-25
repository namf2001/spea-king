"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
  category: 'pronunciation' | 'consistency' | 'accuracy' | 'milestone'
}

interface LearningStreak {
  current: number
  longest: number
  lastPracticeDate: string
}

interface SkillProgress {
  pronunciation: number
  fluency: number
  accuracy: number
  consistency: number
}

export function EnhancedProgressDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [streak, setStreak] = useState<LearningStreak>({ current: 0, longest: 0, lastPracticeDate: '' })
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({ 
    pronunciation: 0, fluency: 0, accuracy: 0, consistency: 0 
  })

  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first pronunciation exercise',
      icon: '👶',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      category: 'milestone'
    },
    {
      id: '2', 
      title: 'Week Warrior',
      description: 'Practice for 7 consecutive days',
      icon: '🔥',
      unlocked: false,
      progress: 3,
      maxProgress: 7,
      category: 'consistency'
    },
    {
      id: '3',
      title: 'Pronunciation Pro',
      description: 'Get 90%+ accuracy on 10 exercises',
      icon: '🎯',
      unlocked: false,
      progress: 6,
      maxProgress: 10,
      category: 'accuracy'
    }
  ]

  useEffect(() => {
    setAchievements(sampleAchievements)
    setStreak({ current: 5, longest: 12, lastPracticeDate: new Date().toISOString() })
    setSkillProgress({ pronunciation: 75, fluency: 68, accuracy: 82, consistency: 90 })
  }, [])

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Skill Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(skillProgress).map(([skill, progress]) => (
              <motion.div 
                key={skill}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-sm font-medium capitalize mb-2">{skill}</h4>
                <div className="relative">
                  <Progress value={progress} className="h-2 mb-1" />
                  <span className={`text-xs font-bold ${getProgressColor(progress)}`}>
                    {progress}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{streak.current}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{streak.longest}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2 flex-1" 
                      />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}