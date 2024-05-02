import React from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  RotateCw,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { ThemeToggle } from "@acme/ui/theme";

interface BottomBarProps {
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onBookmark: () => void;
  onGoHome: () => void;
  onOpenHistory: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  onBack,
  onForward,
  onRefresh,
  onBookmark,
  onGoHome,
  onOpenHistory,
}) => {
  return (
    <div className="flex items-center justify-between border-b bg-background p-2" style={{ flexShrink: 0 }}>
      <div className="flex space-x-2">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" onClick={onForward}>
          <ChevronRight />
        </Button>
        <Button variant="ghost" onClick={onRefresh}>
          <RotateCw />
        </Button>
        <Button variant="ghost" onClick={onGoHome}>
          <Home />
        </Button>
        <Button variant="ghost" onClick={onBookmark}>
          <Bookmark />
        </Button>
        <Button variant="ghost" onClick={onOpenHistory}>
          <Clock />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default BottomBar;
