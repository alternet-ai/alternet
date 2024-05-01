import React from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";

import type { HistoryEntry } from "../types";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (index: number) => void;
  setOpen: (open: boolean) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  setOpen,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpand = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    event.stopPropagation(); // Prevent onSelect from being triggered when expanding
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="h-full w-[400px] sm:w-[540px]">
      <div className="flex items-center justify-between border-b bg-background p-2">
        <h1 className="text-lg font-semibold">History</h1>
        <Button onClick={() => setOpen(false)} variant="ghost" className="p-1">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-full">
        {history.map((entry, index) => (
          <div key={index} className="w-full text-left">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onSelect(index)}
            >
              {entry.title}
              <div onClick={(e) => toggleExpand(e, index)} className="inline-block">
                {expandedIndex === index ? <ChevronUp /> : <ChevronDown />}
              </div>
            </Button>
            {expandedIndex === index && (
              <div className="pl-4 text-gray-600">
                Prompt: {entry.prompt}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default HistoryPanel;
