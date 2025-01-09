export interface File {
  contents: string;
  path: string;

  type:
    | "javascript"
    | "json"
    | "html"
    | "css"
    | "typescript"
    | "markdown"
    | "shell"
    | "plaintext"
    | string;
}
