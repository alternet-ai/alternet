import React from "react";
import Image from "next/image";

const FloatingLogo = () => {
  return (
    <Image
      src="/alternet-cloud.png"
      alt="alternet.ai watermark"
      width={200}
      height={100}
      style={{
        position: "absolute",
        bottom: "1rem",
        right: "1.5rem",
        maxWidth: "25vw",
      }}
    />
  );
};

export default FloatingLogo;