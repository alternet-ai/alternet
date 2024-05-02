import React from "react";

interface IframeContainerProps {
  html: string;
}

const IframeContainer: React.FC<IframeContainerProps> = ({ html }) => {
  return (
    <div className="flex-1"  style={{ flex: 1 }} >
      <iframe
        srcDoc={html}
        title="Browser Frame"
        className="h-full w-full"
      ></iframe>
    </div>
  );
};

export default IframeContainer;
