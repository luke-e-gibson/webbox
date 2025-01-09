import { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useRef, useState, lazy } from "react";
import { WebContainer } from "@webcontainer/api";
import { type Terminal } from '@xterm/xterm'

import "@xterm/xterm/css/xterm.css"

import { Filesystem, FileTree } from "./baseFilesystem";
import { createTerminal } from "./helpers/terminal";
import { createWebcontainer, exportWebcontainer, importWebcontainer, readFileFromContainer, writeFileToContainer } from "./helpers/webcontainers";
import { File } from "./helpers/File";
import { Browser } from "./browser";
import { AppWindow } from "./interfaces";

const Appwindow = window as unknown as AppWindow;

const Editor = lazy(() => import("@monaco-editor/react"));

export default function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const webcontainerInstance = useRef<WebContainer>();
  const terminalDom = useRef<HTMLPreElement>(null);
  const terminal = useRef<Terminal>();

  const [filesystem, setFilesystem] = useState<FileTree>(Filesystem);
  const [file, setFile] = useState<File>({contents: Filesystem["readme"].file.contents as string, path: "readme", type: "text"});
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isBrowserOpen, setIsBrowserOpen] = useState<boolean>(false);

  const editorFileChange = useCallback(async (value: string | undefined)=>{
    if(!value) return;  
    await writeFileToContainer(webcontainerInstance.current!, file.path, value);
  }, [webcontainerInstance, file]);

  const textEditorMemo = useMemo(()=>(<Editor theme="vs-dark" height="67vh" value={file.contents} language={file.type} onChange={editorFileChange} onMount={editorDidMount}/>), [file, editorFileChange])

  useEffect(() => {
    async function init() {
      if(Appwindow.webcontainerBooted) return;
      Appwindow.webcontainerBooted = true;

      console.log("Starting VM")
      terminal.current = createTerminal(terminalDom.current!);
      webcontainerInstance.current = await createWebcontainer(Filesystem, terminal.current!)

      webcontainerInstance.current.on("server-ready", (_port, url) => {
        setCurrentUrl(url);
      })
    }
    void init();
    return () => {
      
    }
  }, [terminalDom])


  async function editorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;  
  }


  async function handleFileChange(reqfile: string) {
    if(isBrowserOpen) setIsBrowserOpen(false);

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
      default:
        void setFile({contents: await readFileFromContainer(webcontainerInstance.current!, reqfile), path: reqfile, type: reqfile.split('.').pop() as string}); 
        break;
    }
  }

  return (
    <>
      <div>
        <div className="justify-between flex bg-background drop-shadow-md">
            <div className="flex justify-between">
              {Object.keys(filesystem).map((_file) => (
                <button key={_file} value={_file} className={`w-fit p-2 text-text font-normal ${ file.path === _file ? "bg-tabActive": "bg-tab border-l border-tabLine" }`} onClick={()=> {handleFileChange(_file)}}>{_file}</button>
              ))}
            </div>
           <div className="px-2 justify-between">
            <button value="browser" className="w-fit p-2 bg-tab text-text font-normal" onClick={()=>{setIsBrowserOpen(!isBrowserOpen)}}>{isBrowserOpen ? "Close" : "Open"} Browser</button>
            <button value="download" className="w-fit p-2 bg-tab text-text font-normal" onClick={async ()=>{await exportWebcontainer(webcontainerInstance.current!)}}>Download Devbox</button> 
            <button value="load" className="w-fit p-2 bg-tab text-text font-normal" onClick={async ()=>{await importWebcontainer(webcontainerInstance.current!, setFilesystem as (filesystem: FileTree) => void); handleFileChange(file.path)}}>Load Devbox</button> 
            
           </div>
        </div>
      </div>
      {isBrowserOpen ? <Browser url={currentUrl}/> : textEditorMemo }
      <pre id="console" style={{height: "30vh", background: "#1e1e1e"}} className="bg-black w-full overflow-hidden border border-line" ref={terminalDom}></pre>
    </>
  );
}
