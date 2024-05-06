import React from "react";
import { Home } from "lucide-react";

import { Button } from "@acme/ui/button";

interface HomeButtonProps {
  onGoHome: () => void;
  disabled: boolean;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onGoHome, disabled }) => {
  return (
    <Button
      variant="ghost"
      onClick={onGoHome}
      disabled={disabled}
      className="button-small"
    >
      <Home className="size-[5vw] md:size-6" />
    </Button>
  );
};

export default HomeButton;
