import type { Message } from "ai";
import React from "react";

interface IframeContainerProps {
  html: string;
  messages: Message[];
  isLoading: boolean;
}

const IframeContainer: React.FC<IframeContainerProps> = ({
  html,
  messages,
  isLoading,
}) => {
  if (
    isLoading &&
    (messages.length == 0 || messages[messages.length - 1].role == "user")
  ) {
    return <div className="flex-1">Loading...</div>;
  }

  if (messages.length == 0 || messages[messages.length - 1].role == "user") {
    return (
      <div className="flex-1">
        <iframe
          srcDoc={html}
          title="Browser Frame"
          className="h-full w-full"
        ></iframe>
      </div>
    );
  }

  if (isLoading && messages[messages.length - 1].role == "assistant") {
    return (
      <div className="flex-1">
        <iframe
          srcDoc={messages[messages.length - 1].content}
          title="Browser Frame"
          className="h-full w-full"
        ></iframe>
      </div>
    );
  }
};

export default IframeContainer;
