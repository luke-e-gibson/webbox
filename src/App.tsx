import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css"
import { type Terminal } from '@xterm/xterm'


import { Filesystem } from "./baseFilesystem";
import { createTerminal } from "./helpers/terminal";
import { createWebcontainer, readFileFromContainer, writeFileToContainer } from "./helpers/webcontainers";
import { File } from "./helpers/File";

export default function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  
  const [currentFile, setCurrentFile] = useState<string>("index.js");
  const [file, setFile] = useState<File>({contents: Filesystem[currentFile].file.contents, path: currentFile, type: "javascript"});

  const [currentUrl, setCurrentUrl] = useState<string>("");
  const webcontainerInstance = useRef<WebContainer | null>(null);

  const terminalDom = useRef<HTMLPreElement>(null);
  const terminal = useRef<Terminal | null>(null);

  async function editorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    
    console.log("Starting VM")
    terminal.current = createTerminal(terminalDom.current!);
    webcontainerInstance.current = await createWebcontainer(Filesystem, terminal.current!)

    webcontainerInstance.current.on("server-ready", (port, url) => {
      setCurrentUrl(url);
    })
  }

  async function editorFileChange(value: string | undefined) {
    if(!value) return;  
    await writeFileToContainer(webcontainerInstance.current!, currentFile, value);
  }

  async function handleFileChange(file: string) {
    switch (file.split('.').pop()) {
      case "js":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, file), path: file, type: "javascript"});
        break;
      case "ts":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, file), path: file, type: "typescript"});
        break;
      case "md":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, file), path: file, type: "markdown"});
        break;
      case "plaintext":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, file), path: file, type: "markdown"}); 
        break;
      case "browser":
        throw new Error("Not implemented");
        break;
      default:
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, file), path: file, type: file.split('.').pop() as string}); 
        break;
    }
  }
  
  return (
    <div>
      <div className="justify-between flex">
        <select style={{height: "3vh"}} onChange={async (e) => { await handleFileChange(e.target.value) }}>
          {Object.keys(Filesystem).map((file) => (
            <option key={file} value={file}>{file}</option>
          ))}
          <option value="browser">Browser</option>
        </select>
      </div>
      <Editor theme="vs-dark" height="67vh" value={file.contents} language={file.type} onChange={editorFileChange} onMount={editorDidMount}/>
      <hr className="border border-line"/>
      <pre id="console" style={{height: "30vh", background: "#1e1e1e"}} className="bg-black w-full" ref={terminalDom}>
          
      </pre>
    </div>
  );
}
