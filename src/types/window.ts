export type WindowState = "normal" | "minimized" | "maximized";
export type AppId = "about" | "portfolio" | "commission" | "wiki" | "blog";

export interface WindowConfig {
  id: AppId;
  title: string;
  icon: string;
  component: React.ComponentType;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
}

export interface WindowInstance {
  id: AppId;
  state: WindowState;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  previousState?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
}
