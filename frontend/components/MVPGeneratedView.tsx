"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useState } from "react";

export interface MVPGeneratedFile {
  path: string;
  content: string;
}

const FRONTEND_PREFIX = "frontend/";

function isFrontendFile(path: string): boolean {
  return path.startsWith(FRONTEND_PREFIX);
}

function toSandpackPath(path: string): string {
  const withoutPrefix = path.startsWith(FRONTEND_PREFIX) ? path.slice(FRONTEND_PREFIX.length) : path;
  return "/" + withoutPrefix.replace(/^\/+/, "");
}

type Props = {
  files: MVPGeneratedFile[];
  /** When false, hide Sandpack preview (e.g. for full-stack local run flow). Default true. */
  showPreview?: boolean;
};

export default function MVPGeneratedView({ files, showPreview = true }: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);

  useEffect(() => {
    if (files.length && (!selectedPath || !files.some((f) => f.path === selectedPath))) {
      setSelectedPath(files[0].path);
    }
  }, [files, selectedPath]);

  const selectedFile = useMemo(
    () => files.find((f) => f.path === selectedPath) ?? null,
    [files, selectedPath]
  );

  const frontendFiles = useMemo(() => files.filter((f) => isFrontendFile(f.path)), [files]);

  const sandpackFiles = useMemo(() => {
    const map: Record<string, string> = {};
    frontendFiles.forEach((f) => {
      map[toSandpackPath(f.path)] = f.content;
    });
    return map;
  }, [frontendFiles]);

  const hasSandpackFiles = Object.keys(sandpackFiles).length > 0;

  const finalSandpackFiles = useMemo(() => {
    if (!hasSandpackFiles) return {};
    const out = { ...sandpackFiles };
    const mainJsx = out["/src/main.jsx"] ?? out["/main.jsx"];
    const indexJsx = out["/src/index.jsx"] ?? out["/index.jsx"];
    const appJsx = out["/src/App.jsx"] ?? out["/App.jsx"];
    const entry = mainJsx ?? indexJsx;
    if (!out["/index.js"] && (entry || appJsx)) {
      out["/index.js"] =
        entry ||
        `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`;
    }
    if (appJsx && !out["/App.js"]) {
      out["/App.js"] = appJsx;
    }
    return out;
  }, [hasSandpackFiles, sandpackFiles]);

  if (!files.length) return null;

  return (
    <div className="mvp-generated">
      <div className="mvp-generated__layout">
        <div className="mvp-generated__tree-panel">
          <h3 className="mvp-generated__tree-title">Files</h3>
          <ul className="mvp-generated__tree" role="tree">
            {files.map((f) => (
              <li key={f.path} className="mvp-generated__tree-item">
                <button
                  type="button"
                  className={`mvp-generated__tree-btn ${selectedPath === f.path ? "mvp-generated__tree-btn--active" : ""}`}
                  onClick={() => setSelectedPath(f.path)}
                >
                  {f.path}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mvp-generated__code-panel">
          <h3 className="mvp-generated__code-title">
            {selectedFile ? selectedFile.path : "Select a file"}
          </h3>
          <pre className="mvp-generated__code">
            <code>{selectedFile ? selectedFile.content : ""}</code>
          </pre>
        </div>
      </div>
      {showPreview && hasSandpackFiles && (
        <div className="mvp-generated__preview">
          <h3 className="mvp-generated__preview-title">Frontend preview</h3>
          <div className="mvp-generated__sandpack">
            <Sandpack
              template="react"
              files={finalSandpackFiles}
              theme="light"
              options={{
                showNavigator: false,
                showTabs: true,
                showLineNumbers: true,
                editorHeight: 320,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
