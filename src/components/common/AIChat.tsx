import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { InputAI } from "@/components/common/InputAI";
import { BotMessageSquare } from 'lucide-react';

interface AIChatProps {
  className?: string
}
    
export function AIChat({ className }: AIChatProps) {
  return (
    <div className={className}>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline">
                <BotMessageSquare />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-150" align="start">
            <div className="h-200"></div>
            <InputAI />
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}
