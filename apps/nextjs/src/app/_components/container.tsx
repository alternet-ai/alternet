import type { Message } from "ai";
import React, { useEffect, useRef } from "react";

interface IframeContainerProps {
  html: string;
  isLoading: boolean;
}

const DEFAULT_STYLE =
  "font-family: var(--font-geist-sans), 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; font-size: 24px; font-weight: bold;;";

const IframeContainer: React.FC<IframeContainerProps> = ({
  html,
  isLoading,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframeDocument =
        iframeRef.current.contentDocument ??
        iframeRef.current.contentWindow?.document;
      if (iframeDocument) {
        //if we're in the style tag, modify the loading div
        if (
          isLoading &&
          html.includes("<style>") &&
          !html.includes("</style>")
        ) {
          //extract the last style tag section
          const styleSection = DEFAULT_STYLE + html.substring(html.lastIndexOf("{") + 1);
          //apply style to Loading div and write to innerHtml
          iframeDocument.body.innerHTML = html + `</style> <div style="${styleSection}">Loading...</div>`;
        } else if (isLoading && !html) {
          iframeDocument.body.innerHTML = `<div style="${DEFAULT_STYLE}">Loading...</div>`;
        } else {
          iframeDocument.body.innerHTML = html;
        }
      }
    }
  }, [html]); // Only update when messages changes

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
