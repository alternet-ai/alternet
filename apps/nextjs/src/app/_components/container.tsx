import type { Message } from "ai";
import React, { useEffect, useRef } from "react";

interface IframeContainerProps {
  messages: Message[];
}

const IframeContainer: React.FC<IframeContainerProps> = ({ messages }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const lastMessage = messages
      .filter((message) => message.role === "assistant")
      .pop();
    if (iframeRef.current && lastMessage) {
      const iframeDocument = iframeRef.current.contentDocument ?? iframeRef.current.contentWindow?.document;
      if (iframeDocument) {
        // Append new content to the body of the iframe's document
        iframeDocument.body.innerHTML = lastMessage.content;
      }
    }
  }, [messages]); // Only update when messages changes

  return (
    <div className="flex-1">
      <iframe
        ref={iframeRef}
        title="Browser Frame"
        className="h-full w-full"
      ></iframe>
    </div>
  );
};

export default IframeContainer;
