import { FileSystemTree } from "@webcontainer/api";

export const Filesystem: FileSystemTree = {
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
