"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg"
    fullScreen?: boolean
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
}

export function LoadingSpinner({
    size = "md",
    fullScreen = true,
    className,
    ...props
}: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center",
                fullScreen && "h-[100dvh]",
                className
            )}
            {...props}
        >
            <Loader2
                className={cn(
                    "animate-spin text-muted-foreground",
                    sizeClasses[size]
                )}
            />
        </div>
    )
} 