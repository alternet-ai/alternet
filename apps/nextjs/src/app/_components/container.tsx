import React, { useEffect, useRef } from "react";

interface IframeContainerProps {
  html: string;
  isLoading: boolean;
  onNavigate: (url: string) => void; // Function to handle navigation
}

interface MessageEventData {
  type: string;
  url: string;
}

const DEFAULT_STYLE = `font-family: var(--font-geist-sans), 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 24px;
  font-weight: bold;`;

const IframeContainer: React.FC<IframeContainerProps> = ({
  html,
  isLoading,
  onNavigate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDocument =
        iframeRef.current.contentDocument ??
        iframeRef.current.contentWindow?.document;
      if (iframeDocument) {
        // Inject script to intercept link clicks
        const script = iframeDocument.createElement("script");
        script.innerHTML = `
                  document.body.addEventListener('click', function(event) {
                    const target = event.target.closest('a');
                    if (target) {
                      event.preventDefault();
                      window.parent.postMessage({ type: 'navigate', url: target.href }, '*');
                    }
                  });
                `;
        iframeDocument.body.appendChild(script);
        //if we're in the style tag, modify the loading div
        if (
          isLoading &&
          html.includes("<style>") &&
          !html.includes("</style>")
        ) {
          //extract the last style tag section
          const styleSection =
            DEFAULT_STYLE + html.substring(html.lastIndexOf("{") + 1);
          //apply style to Loading div and write to innerHtml
          iframeDocument.body.innerHTML =
            html + `</style> <div style="${styleSection}">Loading...</div>`;
          //overlay loading
        } else if (isLoading || html.length === 0) {
          iframeDocument.body.innerHTML =
            html +
            `<div style="${DEFAULT_STYLE} position: absolute; top: 0; left: 0;">Loading...</div>`;
        } else {
          iframeDocument.body.innerHTML = html;
        }
      }
    }
  }, [html, isLoading]); // Only update when messages or isLoading changes

  // Listen to messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<MessageEventData>) => {
      if (event.data.type === 'navigate') {
        onNavigate(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onNavigate]);

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
