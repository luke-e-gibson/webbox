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
  const webcontainerInstance = useRef<WebContainer | null>(null);
  const terminalDom = useRef<HTMLPreElement>(null);
  const terminal = useRef<Terminal | null>(null);

  const [file, setFile] = useState<File>({contents: Filesystem["readme"].file.contents, path: "readme", type: "text"});
  const [currentUrl, setCurrentUrl] = useState<string>("");
  

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
    await writeFileToContainer(webcontainerInstance.current!, file.path, value);
  }

  async function handleFileChange(reqfile: string) {
    switch (reqfile.split('.').pop()) {
      case "js":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: "javascript"});
        break;
      case "ts":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: "typescript"});
        break;
      case "md":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: "markdown"});
        break;
      case "plaintext":
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: "markdown"}); 
        break;
      case "browser":
        throw new Error("Not implemented");
        break;
      default:
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: reqfile.split('.').pop() as string}); 
        break;
    }

    console.log(reqfile)
  }

  return (
    <div>
      <div className="">
        <div className="justify-between flex bg-background drop-shadow">
            <div className="flex justify-between">
              {Object.keys(Filesystem).map((_file) => (
                <button key={_file} value={_file} className={`w-fit p-2 text-text font-normal ${ file.path === _file ? "bg-tabActive": "bg-tab border-l border-tabLine" }`} onClick={()=> {handleFileChange(_file)}}>{_file}</button>
              ))}
            </div>
           <div className="px-2">
            <button value="browser" className="w-fit p-2 text-slate-400 bg-tab text-text font-normal">Open Browser</button>
           </div>
        </div>
      </div>
      <Editor theme="vs-dark" height="67vh" value={file.contents} language={file.type} onChange={editorFileChange} onMount={editorDidMount}/>
      <hr className="border border-line"/>
      <pre id="console" style={{height: "30vh", background: "#1e1e1e"}} className="bg-black w-full" ref={terminalDom}>
          
      </pre>
    </div>
  );
}
