import React from "react";
import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";
import { X } from "lucide-react";

interface HistoryPanelProps {
  history: string[];
  onSelect: (index: number) => void;
  setOpen: (open: boolean) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, setOpen }) => {
    return (
        <div className="w-[400px] sm:w-[540px] h-full">
        <div className="flex items-center justify-between border-b bg-background p-2">
          <h1 className="text-lg font-semibold">History</h1>
          <Button onClick={() => setOpen(false)} variant="ghost" className="p-1">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator />
          <ScrollArea className="h-full">
            {history.map((address, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left"
                onClick={() => {
                  onSelect(index);
                  setOpen(false);
                }}
              >
                {address}
              </Button>
            ))}
          </ScrollArea>
        </div>
      );
    };
  
  export default HistoryPanel;
