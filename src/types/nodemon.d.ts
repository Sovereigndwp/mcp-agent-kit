declare module 'nodemon' {
  interface NodemonOptions {
    script?: string;
    ext?: string;
    ignore?: string[];
    watch?: string[];
    delay?: number;
    env?: { [key: string]: string };
    [key: string]: any;
  }
  
  interface Nodemon {
    on(event: string, callback: Function): this;
    restart(): this;
    emit(event: string, ...args: any[]): boolean;
    [key: string]: any;
  }
  
  function nodemon(options: NodemonOptions | string): Nodemon;
  export = nodemon;
}