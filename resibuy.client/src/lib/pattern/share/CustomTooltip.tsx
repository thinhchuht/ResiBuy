import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type TooltipPosition = "top" | "bottom" | "left" | "right"

interface CustomTooltipProps {
  position: TooltipPosition
  text: string
  children: React.ReactNode
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ position, text, children }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={position} className="bg-pink-500">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CustomTooltip

