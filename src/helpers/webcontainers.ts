import { FileSystemTree, WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";

export async function createWebcontainer(filesystem: FileSystemTree, terminal: Terminal): Promise<WebContainer> {
  const webcontainer = await WebContainer.boot();
  webcontainer.mount(filesystem);

  webcontainer.on("error", (err) => {
    terminal.writeln("An error occurred: " + err);
    throw new Error("An error occurred: " + err);
  });

  webcontainer.on("server-ready", () => {
    console.log("Server is ready");
  });

  console.log("Installing Dependencies...");
  void terminal.writeln("Installing dependencies using pnpm...")
  await webcontainer.spawn("pnpm", ["install"])
  void terminal.writeln("")

  console.log("Starting Shell...");
  void terminal.writeln("Starting shell...")
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
  })

  return webcontainer;
}

export async function writeFileToContainer(webcontainer: WebContainer, filename: string, contents: string) {
  await webcontainer.fs.writeFile(filename, contents);
}

export async function readFileFromContainer(webcontainer: WebContainer, filename: string): Promise<string> {
  return await webcontainer.fs.readFile(filename, "utf-8");
}