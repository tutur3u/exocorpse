export type WindowState = "normal" | "minimized" | "maximized";
export type RestorableWindowState = Exclude<WindowState, "minimized">;
export type AppId =
  | "about"
  | "portfolio"
  | "commission"
  | "wiki"
  | "blog"
  | "heaven-space";

export interface WindowConfig {
  id: AppId;
  title: string;
  /** Icon name (for PNG/GIF icons) or emoji fallback */
  icon: string;
  component: React.ComponentType;
  defaultState?: RestorableWindowState;
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
  lastNonMinimizedState?: RestorableWindowState;
}
