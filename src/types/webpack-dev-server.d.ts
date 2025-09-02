declare module 'webpack-dev-server' {
  interface ServerOptions {
    port?: number;
    host?: string;
    open?: boolean;
    hot?: boolean;
    static?: any;
    [key: string]: any;
  }
  
  class WebpackDevServer {
    constructor(options: ServerOptions, compiler: any);
    start(): Promise<void>;
    stop(): Promise<void>;
    [key: string]: any;
  }
  
  export default WebpackDevServer;
  export { WebpackDevServer };
}