declare module 'yargs' {
  interface Argv<T = {}> {
    option(key: string, options: any): Argv<T>;
    command(cmd: string, desc: string, builder?: any, handler?: (args: any) => void): Argv<T>;
    help(): Argv<T>;
    argv: T;
    parse(): T;
    [key: string]: any;
  }
  
  function yargs(args?: string[]): Argv;
  export = yargs;
}