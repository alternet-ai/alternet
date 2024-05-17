"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@acme/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

interface ComboboxProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function Combobox({
  suggestions = [],
  value,
  onChange,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value || "Search or enter address"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search or enter address" value={value} />
          <CommandEmpty>No suggestions found.</CommandEmpty>
          <CommandGroup>
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                value={suggestion}
                onSelect={() => {
                  onChange(suggestion);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === suggestion ? "opacity-100" : "opacity-0",
                  )}
                />
                {suggestion}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
