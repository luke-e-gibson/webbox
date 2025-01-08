import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css"
import { type Terminal } from '@xterm/xterm'


import { Filesystem } from "./baseFilesystem";
import { createTerminal } from "./helpers/terminal";
import { createWebcontainer } from "./helpers/webcontainers";

export default function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const [currentFile, setCurrentFile] = useState<string>("index.js");
  const [currentLang, setCurrentLang] = useState<string>("javascript");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const webcontainerInstance = useRef<WebContainer | null>(null);

  const terminalDom = useRef<HTMLPreElement>(null);
  const terminal = useRef<Terminal | null>(null);

  async function editorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    
    console.log("Starting VM")
    terminal.current = createTerminal(terminalDom.current!);
    webcontainerInstance.current = await createWebcontainer(Filesystem, terminal.current!)

  }

  function editorFileChange(value: string | undefined): void {
    if(!value) return;  
    console.log(currentLang);
    webcontainerInstance.current?.fs.writeFile(currentFile, value);
  }

  async function updateFile(file: string) {
    const fileContents = await webcontainerInstance.current?.fs.readFile(file, "utf-8");
    Filesystem[file].file.contents = fileContents!; 
  }

  return (
    <div>
      <div className="justify-between flex">
        <select style={{height: "3vh"}} onChange={async (e) => {
          switch (e.target.value.split('.').pop()) {
            case "js":
              setCurrentLang("javascript");
              break;
          
            default:
              setCurrentLang(e.target.value.split('.').pop() as string)
              break;
          }
          await updateFile(e.target.value);
          setCurrentFile(e.target.value);
          
        }}>
          {Object.keys(Filesystem).map((file) => (
            <option key={file} value={file}>{file}</option>
          ))}
        </select>
          <p>Host URL: {currentUrl}</p>
      </div>
      <Editor theme="vs-dark" height="67vh" defaultLanguage="javascript" value={Filesystem[currentFile].file.contents} language={currentLang} defaultValue={Filesystem[currentFile].file.contents} onChange={editorFileChange} onMount={editorDidMount}/>
      <hr className="border border-line"/>
      <pre id="console" style={{height: "30vh", background: "#1e1e1e"}} className="bg-black w-full" ref={terminalDom}>
          
      </pre>
    </div>
  );
}
