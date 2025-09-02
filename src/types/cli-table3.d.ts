declare module 'cli-table3' {
  interface TableOptions {
    head?: string[];
    colWidths?: number[];
    style?: {
      head?: string[];
      border?: string[];
      compact?: boolean;
    };
    [key: string]: any;
  }
  
  class Table {
    constructor(options?: TableOptions);
    push(...args: any[]): void;
    toString(): string;
    [key: string]: any;
  }
  
  interface CliTable3Constructor {
    new (options?: TableOptions): Table;
    (options?: TableOptions): Table;
    Table: typeof Table;
  }
  
  const CliTable3: CliTable3Constructor;
  export default CliTable3;
  export { Table };
}