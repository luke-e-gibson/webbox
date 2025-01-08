import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export function createTerminal(terminalElm: HTMLElement): Terminal {
  const terminal = new Terminal({ convertEol: true, theme: { background: "#1e1e1e" } });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  
  void terminal.open(terminalElm);
  fitAddon.fit();

  return terminal;
}
