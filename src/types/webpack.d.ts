declare module 'webpack' {
  interface Configuration {
    [key: string]: any;
  }
  
  interface Compiler {
    run(callback: (err?: Error, stats?: any) => void): void;
    watch(options: any, handler: (err?: Error, stats?: any) => void): any;
    [key: string]: any;
  }
  
  function webpack(config: Configuration): Compiler;
  function webpack(config: Configuration, callback: (err?: Error, stats?: any) => void): Compiler;
  
  export default webpack;
}