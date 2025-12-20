import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Renders a customizable button component with various style variants (default, destructive, outline, etc.) and size options
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-black text-white hover:bg-gray-800 shadow",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                outline:
                    "border border-gray-200 bg-white hover:bg-gray-100 hover:text-black",
                secondary:
                    "bg-gray-100 text-black hover:bg-gray-200",
                ghost: "hover:bg-gray-100 hover:text-black",
                link: "text-black underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    // Renders the button element with applied variants and forwarded props
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
