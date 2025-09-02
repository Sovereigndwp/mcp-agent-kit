declare module '@canva/cli' {
  export interface CliOptions {
    [key: string]: any;
  }
  
  export interface CanvaCli {
    [key: string]: any;
  }
  
  export function generatePreviewUrl(...args: any[]): any;
  export default function cli(...args: any[]): any;
}