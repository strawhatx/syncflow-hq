
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> & {
    showIcon?: boolean
  }
>(({ className, children, showIcon = true, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-md p-2 text-sm font-medium hover:bg-accent transition-all [&[data-state=open]>svg]:rotate-180",
      className
    )}
    {...props}
  >
    {children}
    {showIcon && (
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
      />
    )}
  </CollapsiblePrimitive.Trigger>
))
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> & {
    animationDuration?: number
  }
>(({ className, children, animationDuration = 200, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down",
      className
    )}
    style={{ 
      '--animation-duration': `${animationDuration}ms`,
    } as React.CSSProperties}
    {...props}
  >
    <div className="pt-2 pb-1">{children}</div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
