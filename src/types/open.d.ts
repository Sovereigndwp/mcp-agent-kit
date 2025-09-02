declare module 'open' {
  interface OpenOptions {
    app?: string | { name: string; arguments?: string[] };
    wait?: boolean;
    background?: boolean;
    newInstance?: boolean;
    allowNonzeroExit?: boolean;
    [key: string]: any;
  }
  
  function open(target: string, options?: OpenOptions): Promise<any>;
  export = open;
}