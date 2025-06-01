'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const [voiceGender, setVoiceGender] = useState('female');
  const [speechRate, setSpeechRate] = useState(1);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [accentPreference, setAccentPreference] = useState('american');

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to a database or local storage
    toast.success('Settings saved', {
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-blue-500 hover:underline"
          >
            ← Back to Home
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your learning experience
          </p>
        </div>

        <Tabs defaultValue="voice" className="mb-8">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="voice">Voice Settings</TabsTrigger>
            <TabsTrigger value="practice">Practice Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
                <CardDescription>
                  Customize the voice used for text-to-speech
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Voice Gender</Label>
                  <RadioGroup
                    defaultValue={voiceGender}
                    onValueChange={setVoiceGender}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Accent Preference</Label>
                  <Select
                    value={accentPreference}
                    onValueChange={setAccentPreference}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="british">British</SelectItem>
                      <SelectItem value="australian">Australian</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Speech Rate</Label>
                    <span className="text-sm text-gray-500">
                      {speechRate === 0.5
                        ? 'Slow'
                        : speechRate === 1
                          ? 'Normal'
                          : 'Fast'}
                    </span>
                  </div>
                  <Slider
                    value={[speechRate]}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    onValueChange={(value) => setSpeechRate(value[0])}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-play">Auto-play audio examples</Label>
                  <Switch
                    id="auto-play"
                    checked={autoPlayAudio}
                    onCheckedChange={setAutoPlayAudio}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice">
            <Card>
              <CardHeader>
                <CardTitle>Practice Settings</CardTitle>
                <CardDescription>
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={difficultyLevel}
                    onValueChange={setDifficultyLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="detailed-feedback">
                    Detailed pronunciation feedback
                  </Label>
                  <Switch id="detailed-feedback" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-transcription">
                    Show phonetic transcription
                  </Label>
                  <Switch id="show-transcription" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="progress-updates">
                        Weekly progress updates
                      </Label>
                      <Switch id="progress-updates" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-exercises">
                        New exercises available
                      </Label>
                      <Switch id="new-exercises" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data & Privacy</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="save-recordings">
                        Save voice recordings for improvement
                      </Label>
                      <Switch id="save-recordings" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anonymous-data">
                        Share anonymous usage data
                      </Label>
                      <Switch id="anonymous-data" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
