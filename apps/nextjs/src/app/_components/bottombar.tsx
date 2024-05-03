import React from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  RotateCw,
  X,
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
  disabled: boolean;
  onCancel: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  onBack,
  onForward,
  onRefresh,
  onBookmark,
  onGoHome,
  onOpenHistory,
  disabled,
  onCancel,
}) => {
  return (
    <div className="flex items-center justify-between border-b bg-background p-2">
      <div className="flex space-x-2">
        <Button variant="ghost" onClick={onBack} disabled={disabled}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" onClick={onForward} disabled={disabled}>
          <ChevronRight />
        </Button>
        {disabled ? (
          <Button variant="ghost" onClick={onCancel}>
            <X />
          </Button>
        ) : (
          <Button variant="ghost" onClick={onRefresh} disabled={disabled}>
            <RotateCw />
          </Button>
        )}
        <Button variant="ghost" onClick={onGoHome} disabled={disabled}>
          <Home />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" onClick={onBookmark}>
          <Bookmark />
        </Button>
        <Button variant="ghost" onClick={onOpenHistory}>
          <Clock />
        </Button>
      </div>
    </div>
  );
};

export default BottomBar;
