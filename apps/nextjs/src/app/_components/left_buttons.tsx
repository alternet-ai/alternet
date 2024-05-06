import React from "react";
import { ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";

import { Button } from "@acme/ui/button";

import HomeButton from "./home_button";

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
    <div className="flex">
      <Button variant="ghost" onClick={onBack} disabled={disabled}>
        <ChevronLeft className="size-[5vw] md:size-6" />
      </Button>
      <Button variant="ghost" onClick={onForward} disabled={disabled}>
        <ChevronRight className="size-[5vw] md:size-6" />
      </Button>
      {disabled ? (
        <Button variant="ghost" onClick={onCancel}>
          <X className="size-[5vw] md:size-6" />
        </Button>
      ) : (
        <Button variant="ghost" onClick={onRefresh} disabled={disabled}>
          <RotateCw className="size-[5vw] md:size-6" />
        </Button>
      )}
      <HomeButton onGoHome={onGoHome} disabled={disabled} />
    </div>
  );
};

export default LeftButtons;
