import React, { useEffect, useRef } from "react";

import FloatingLogo from "./logo";

interface IframeContainerProps {
  html: string;
  isLoading: boolean;
  onNavigate: (url: string) => void; // Function to handle navigation
}

interface MessageEventData {
  type: string;
  url: string;
}

const REDIRECT_SCRIPT = `
document.body.addEventListener('click', function(event) {
  const target = event.target.closest('a');
  if (target) {
    event.preventDefault();
    window.parent.postMessage({ type: 'navigate', url: target.href }, '*');
  }
});
document.body.addEventListener('submit', function(event) {
  const form = event.target.closest('form');
  if (form) {
    event.preventDefault();
    const formData = new FormData(form);
    const actionUrl = form.action;
    const searchParams = new URLSearchParams(formData).toString();
    window.parent.postMessage({ type: 'navigate', url: actionUrl + '?' + searchParams }, '*');
  }
}, true); // Use capture phase to ensure the handler runs before any other submit handlers
`;

const ENFORCE_LOCATION_STYLE = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; // High z-index to ensure it's on top
`;

const DEFAULT_STYLE =
  ENFORCE_LOCATION_STYLE +
  ` font-family: var(--font-geist-sans), 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 24px;
  font-weight: bold;`;

const IframeContainer: React.FC<IframeContainerProps> = ({
  html,
  isLoading,
  onNavigate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scriptAddedRef = useRef(false); // Ref to track if the redirect script has been added
  const executedScriptsRef = useRef(new Set()); // Ref to track executed script contents

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDocument =
        iframeRef.current.contentDocument ??
        iframeRef.current.contentWindow?.document;
      if (iframeDocument) {
        if (!scriptAddedRef.current) {
          // Create and append the script element only if it hasn't been added before
          const script = iframeDocument.createElement("script");
          script.textContent = REDIRECT_SCRIPT;
          iframeDocument.body.appendChild(script);
          scriptAddedRef.current = true; // Mark as script added
        }
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
            html +
            `</style> <div style="${styleSection + ENFORCE_LOCATION_STYLE}">Loading...</div>`;
          //overlay loading
        } else if (isLoading || html.length === 0) {
          iframeDocument.body.innerHTML =
            html + `<div style="${DEFAULT_STYLE}">Loading...</div>`;
        } else {
          iframeDocument.body.innerHTML = html;

          const scripts = Array.from(iframeDocument.querySelectorAll("script"));
          const externalScripts = scripts.filter((script) => script.src);
          const inlineScripts = scripts.filter((script) => !script.src);

          // Load external scripts first
          const loadExternalScripts = () => {
            externalScripts.forEach((script) => {
              if (!executedScriptsRef.current.has(script.src)) {
                const newScript = iframeDocument.createElement("script");
                newScript.src = script.src;
                newScript.onload = () => {
                  executedScriptsRef.current.add(script.src);
                  executeInlineScripts();
                };
                iframeDocument.body.appendChild(newScript);
              }
            });
          };

          // Execute inline scripts after external scripts are loaded
          const executeInlineScripts = () => {
            inlineScripts.forEach((script) => {
              const scriptContent = script.textContent;
              if (!scriptContent) {
                console.error(
                  "skipping script",
                  script,
                  "with content",
                  scriptContent,
                );
                return;
              }
              if (!executedScriptsRef.current.has(scriptContent)) {
                const newScript = iframeDocument.createElement("script");
                newScript.text = scriptContent;
                iframeDocument.body.appendChild(newScript);
                executedScriptsRef.current.add(scriptContent);
              }
            });
          };

          loadExternalScripts();
        }
      }
    }
  }, [html, isLoading]); // Only update when messages or isLoading changes

  // Listen to messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent<MessageEventData>) => {
      if (event.data.type === "navigate" && !isLoading) {
        onNavigate(event.data.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onNavigate]);

  return (
    <div className="relative h-full w-full">
      <iframe
        ref={iframeRef}
        title="Browser Frame"
        className="h-full w-full"
      ></iframe>
      <FloatingLogo />
    </div>
  );
};

export default IframeContainer;
