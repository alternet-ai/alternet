import React from "react";

import { Label } from "@acme/ui/label";

const FloatingLogo = ({ src }: { src: string }) => {
  return (
    <Label
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        textShadow: "2px 2px 2px rgba(0, 0, 0, 0.6)",
      }}
    >
      {src}
    </Label>
  );
};

export default FloatingLogo;
