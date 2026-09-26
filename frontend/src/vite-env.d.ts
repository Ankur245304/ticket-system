/// <reference types="vite/client" />

declare module '*.css';

declare module 'react' {
  export = React;
}

declare namespace React {
  export type ReactNode = any;
  export type ReactElement = any;
  export type FC<P = {}> = (props: P) => ReactElement | null;
  export interface FormEvent<T = Element> {
    preventDefault(): void;
    currentTarget: T;
    target: T;
  }
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
    currentTarget: T;
  }
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useRef<T>(initialValue?: T): { current: T };
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export const Fragment: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: any): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
