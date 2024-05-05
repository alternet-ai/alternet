import React from "react";
import { Home } from "lucide-react";

import { Button } from "@acme/ui/button";

interface HomeButtonProps {
  onGoHome: () => void;
  disabled: boolean;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onGoHome, disabled }) => {
  return (
    <Button variant="ghost" onClick={onGoHome} disabled={disabled}>
      <Home />
    </Button>
  );
};

export default HomeButton;
