import { FileNode } from "@webcontainer/api";

export type FileTree = {
  [name: string]: FileNode;
}

export const Filesystem: FileTree = {
  "index.js": {
    file: {
      contents: `const express = require("express")

const app = express()
app.use(express.static('./'))
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
    },
    "readme": {
      file: {
        contents: `A vscode like editor and terminal running a simple express server. Running completely in your browser using webcontainers https://webcontainers.io/.`,
      }
    },
    "index.html": {
      file: {
        contents: `<!DOCTYPE html>
<html>
  <head>
    <title>Web box</title>
  </head>
    <body>
      <h1>Hello world form wasm webcontainers</h1>
      <p>Project running on <pre id="location"></pre></p>
      <script>
        document.getElementById("location").innerText = window.location.href
      </script>
    </body>
</html>`,
      }
    }
}
