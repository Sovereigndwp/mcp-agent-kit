declare global {
  interface NodeModule {
    hot?: {
      accept(): void;
      accept(dependencies: string | string[], callback?: () => void): void;
      decline(): void;
      decline(dependencies: string | string[]): void;
      dispose(callback: (data: any) => void): void;
      addDisposeHandler(callback: (data: any) => void): void;
      removeDisposeHandler(callback: (data: any) => void): void;
      check(autoApply?: boolean): Promise<string[] | null>;
      apply(options?: any): Promise<string[] | null>;
      status(): string;
      addStatusHandler(callback: (status: string) => void): void;
      removeStatusHandler(callback: (status: string) => void): void;
      data?: any;
    };
  }
}

export {};