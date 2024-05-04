import React from "react";
import { ChevronLeft, ChevronRight, Home, RotateCw, X } from "lucide-react";

import { Button } from "@acme/ui/button";

interface LeftButtonsProps {
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
  disabled: boolean;
  onCancel: () => void;
}

const LeftButtons: React.FC<LeftButtonsProps> = ({
  onBack,
  onForward,
  onRefresh,
  onGoHome,
  disabled,
  onCancel,
}) => {
  return (
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
      </div>
  );
};

export default LeftButtons;
