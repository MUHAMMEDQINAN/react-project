
"use client"

interface PlaceholderViewProps {
    title: string;
}

export function PlaceholderView({ title }: PlaceholderViewProps) {
    return (
        <div className="flex flex-1 items-center justify-center h-full bg-background">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground">This feature is coming soon.</p>
            </div>
        </div>
    )
}
