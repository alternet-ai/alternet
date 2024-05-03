import React from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";

import type { Page } from "../types";

interface HistoryPanelProps {
  history: Page[];
  onSelect: (index: number) => void;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}

//todo: fix long text exceeding width of history panel
const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  setOpen,
  disabled,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    event.stopPropagation(); // Prevent onSelect from being triggered when expanding
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="h-full w-[200px] sm:w-[300px]">
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
              disabled={disabled} // Disable interaction with history entries
            >
              {entry.title}
              <div
                onClick={(e) => {
                  e.stopPropagation(); // Prevent onSelect from being triggered when expanding
                  if (!disabled) {
                    // Check if not disabled before toggling
                    toggleExpand(e, index);
                  }
                }}
                className="inline-block"
              >
                {expandedIndex === index ? <ChevronUp /> : <ChevronDown />}
              </div>
            </Button>
            {expandedIndex === index && (
              <>
                <div className="text-gray-6000 pl-4">URL: {entry.fakeUrl}</div>
                <div className="text-gray-6000 pl-4">
                  Prompt: {entry.prompt}
                </div>
              </>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default HistoryPanel;
