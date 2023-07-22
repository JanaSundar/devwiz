"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "~/helper/shadcnUtils"
import { Button } from "./button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "./command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"


interface Props {
    data: { value: string, label: string }[],
    placeholder: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    value: string
}

export function Combobox({ data, placeholder, value, setValue }: Props) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] mx-2 py-1 justify-between bg-transparent"
                >
                    {value
                        ? data.find((x) => x.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandEmpty>Value not found.</CommandEmpty>
                    <CommandGroup>
                        {data.map((x) => (
                            <CommandItem
                                key={x.value}
                                value={x.value}
                                onSelect={(currentValue) => {
                                    console.log(currentValue,"**")
                                    setValue(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === x.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {x.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
