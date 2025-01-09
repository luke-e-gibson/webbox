import { FileSystemTree, WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";

import { Filesystem, FileTree } from "../baseFilesystem";

let ready = false;

const delay = (delayInms: number) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
};


export async function createWebcontainer(
filesystem: FileSystemTree, terminal: Terminal): Promise<WebContainer> {
  const webcontainer = await WebContainer.boot();
  webcontainer.mount(filesystem);

  webcontainer.on("error", (err) => {
    terminal.writeln("An error occurred: " + err);
    throw new Error("An error occurred: " + err);
  });

  webcontainer.on("server-ready", () => {
    console.log("Server is ready");
  });

  webcontainer.on("preview-message", (message) => {
    console.log("Preview message: ", message);
  });

  webcontainer.fs.watch(".", {encoding: "utf-8", recursive: true}, (event, filename) => {
    console.log("File change detected: ", event, filename);
  })

  console.log("Installing Dependencies...");
  void terminal.writeln("Installing dependencies using pnpm...");
  await webcontainer.spawn("pnpm", ["install"])
  void terminal.writeln("");

  //Allow deps to install
  await delay(3000);

  console.log("Starting Shell...");
  void terminal.writeln("Starting shell...");
  const shell = await webcontainer.spawn("jsh");
  shell.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );

  const input = shell.input.getWriter();
  terminal.onData((data) => {
    input.write(data);
  });
  ready = true;
  return webcontainer;
}

export async function exportWebcontainer(webcontainer: WebContainer) {
  if (!ready) return;
  const filesystem = await webcontainer.export(".", {
    excludes: ["node_modules"],
    format: "json",
  });

  const donwnloadLink = document.createElement("a");
  donwnloadLink.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filesystem))
  );
  donwnloadLink.setAttribute("download", `box.boxfs`);

  donwnloadLink.style.display = "none";
  document.body.appendChild(donwnloadLink);

  donwnloadLink.click();

  document.body.removeChild(donwnloadLink);
}

export async function importWebcontainer(
  webcontainer: WebContainer,
  setFilesystem: (filesystem: FileTree) => void
) {
  if (
    confirm(
      "This will overwrite the current filesystem. Are you sure you want to continue?"
    ) !== true
  )
    return;

  const uploadElement = document.createElement("input");
  uploadElement.type = "file";
  uploadElement.accept = ".boxfs";

  uploadElement.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result as string;
      setFilesystem(JSON.parse(contents));
      await webcontainer.mount(JSON.parse(contents));
      document.body.removeChild(uploadElement);
    };
    reader.readAsText(file);
  };
  uploadElement.style.display = "none";
  document.body.appendChild(uploadElement);
  uploadElement.click();
}

export async function writeFileToContainer(
  webcontainer: WebContainer,
  filename: string,
  contents: string
) {
  if (!ready) return;
  if (!Filesystem[filename]) console.log("File does not exist");
  await webcontainer.fs.writeFile(filename, contents);
}

export async function readFileFromContainer(
  webcontainer: WebContainer,
  filename: string
): Promise<string> {
  if (!ready) return "";
  return await webcontainer.fs.readFile(filename, "utf-8");
}
