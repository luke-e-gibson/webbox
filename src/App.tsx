import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef, useState } from "react";
import { FileSystemTree, WebContainer } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css"
import { Terminal } from '@xterm/xterm'
import { FitAddon } from "@xterm/addon-fit";

const files: FileSystemTree = {
  "index.js": {
    file: {
      contents: `const express = require("express")

const app = express()

app.get("/", (req, res)=> {
    res.send("Hello world")
})

app.listen(8080, ()=> {
    console.log("App listening at localhost:8080")
})`,
    },
  },
  "package.json": {
      file: {
        contents: `{
  "name": "project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.2"
  }
}`,
      }
    }
}


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

    webcontainerInstance.current = await WebContainer.boot();

    
    await webcontainerInstance.current.mount(files);
    terminal.current = new Terminal({convertEol: true, theme: {background: "#1e1e1e"}});
    const fitAddon = new FitAddon();
    terminal.current.loadAddon(fitAddon)
    terminal.current.open(terminalDom.current!);
    fitAddon.fit();
    
    webcontainerInstance.current.on("error", (err) => {
      console.log(err)
    })
    
    webcontainerInstance.current.on("server-ready", (port, url) => {
      setCurrentUrl(url);
      console.log("Server is ready")
    })
    
    void terminal.current.writeln("Starting pnpm install")
    const install = await webcontainerInstance.current.spawn("pnpm", ["install"])
    install.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.current?.write(data);
        },
      })
    );

   void terminal.current.writeln("")

    const shell = await webcontainerInstance.current.spawn("jsh");
    shell.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.current?.write(data);
        },
      })
    );

    const input = shell.input.getWriter();
    terminal.current.onData((data) => {
      input.write(data);
    })
  }

  function editorFileChange(value: string | undefined): void {
    if(!value) return;  
    console.log(currentLang);
    webcontainerInstance.current?.fs.writeFile(currentFile, value);
  }

  async function updateFile(file: string) {
    const fileContents = await webcontainerInstance.current?.fs.readFile(file, "utf-8");
    files[file].file.contents = fileContents!; 
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
          {Object.keys(files).map((file) => (
            <option key={file} value={file}>{file}</option>
          ))}
        </select>
          <p>Host URL: {currentUrl}</p>
      </div>
      <Editor theme="vs-dark" height="67vh" defaultLanguage="javascript" value={files[currentFile].file.contents} language={currentLang} defaultValue={files[currentFile].file.contents} onChange={editorFileChange} onMount={editorDidMount}/>
      <hr className="border border-line"/>
      <pre id="console" style={{height: "30vh", background: "#1e1e1e"}} className="bg-black w-full" ref={terminalDom}>
          
      </pre>
    </div>
  );
}
