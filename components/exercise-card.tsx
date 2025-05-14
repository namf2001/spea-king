import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ExerciseCardProps {
    readonly title: string
    readonly description: string
    readonly content: string
    readonly icon: LucideIcon
    readonly iconColor: string
    readonly href: string
    readonly buttonText: string
    readonly buttonVariant?: "default" | "outline"
}

export function ExerciseCard({
    title,
    description,
    content,
    icon: Icon,
    iconColor,
    href,
    buttonText,
    buttonVariant = "default",
}: ExerciseCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">{content}</p>
            </CardContent>
            <CardFooter className="mt-auto">
                <Link href={href} className="w-full">
                    <Button className="w-full" variant={buttonVariant}>
                        {buttonText}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
