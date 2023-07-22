"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "~/helper/shadcnUtils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    className={cn("relative flex items-center select-none touch-none w-[200px] h-5", className)}
    {...props}
  >
    <SliderPrimitive.Track className="bg-zinc-50/20 relative grow rounded-full h-[3px]">
      <SliderPrimitive.Range className="absolute bg-white rounded-full h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block w-5 h-5 bg-white shadow-[0_0_0.5rem] rounded-[10px] focus:outline-none"
      aria-label="Volume"

    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
