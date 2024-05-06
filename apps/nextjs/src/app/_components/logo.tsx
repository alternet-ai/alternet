import React from "react";

import { Label } from "@acme/ui/label";

const FloatingLogo = ({
  src,
  isPortrait,
}: {
  src: string;
  isPortrait: boolean;
}) => {
  return (
    <Label
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        textShadow: "2px 2px 2px rgba(0, 0, 0, 0.6)",
        position: "absolute",
        bottom: isPortrait ? "4rem" : "0.5rem",
        right: isPortrait ? "1rem" : "1rem",
      }}
    >
      {src}
    </Label>
  );
};

export default FloatingLogo;
