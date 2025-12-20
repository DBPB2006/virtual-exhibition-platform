import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Renders a loading spinner icon with customizable sizing animations
function Spinner({ className, ...props }) {
    return (
        <Loader2
            className={cn("h-4 w-4 animate-spin", className)}
            {...props}
        />
    )
}

export { Spinner }
