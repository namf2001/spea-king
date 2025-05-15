"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Scenario } from "../data/scenarios"

interface ScenarioTabsProps {
    readonly scenarios: Scenario[]
    readonly activeScenario: Scenario
    readonly onScenarioChange: (scenarioId: string) => void
}

export function ScenarioTabs({ scenarios, activeScenario, onScenarioChange }: ScenarioTabsProps) {
    return (
        <Tabs defaultValue={activeScenario.id} onValueChange={onScenarioChange} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-4">
                {scenarios.map((scenario) => (
                    <TabsTrigger key={scenario.id} value={scenario.id}>
                        {scenario.title}
                    </TabsTrigger>
                ))}
            </TabsList>

            {scenarios.map((scenario) => (
                <TabsContent key={scenario.id} value={scenario.id}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{scenario.title}</CardTitle>
                            <CardDescription>{scenario.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    )
}
