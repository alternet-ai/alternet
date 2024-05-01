import { Label } from "@acme/ui/label";
import React from 'react';

const FloatingLogo = ({ src }: { src: string }) => {
  return (
    <Label className="absolute bottom-6 right-16" style={{ fontSize: '24px', fontWeight: 'bold', textShadow: '2px 2px 2px rgba(0, 0, 0, 0.6)' }}>
      {src}
    </Label>
  );
};

export default FloatingLogo;