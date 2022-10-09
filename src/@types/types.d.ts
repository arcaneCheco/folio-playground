import { World } from "@src/app";
import { Preloader } from "@src/components";
import { TextProps } from "@src/utils/Text";
import { Contact, Nav, Title } from "@src/viewManagers/home/components";
import {
  BufferGeometry,
  Data3DTexture,
  IUniform,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  VideoTexture,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetOptions,
} from "three";
import { FolderApi, Pane } from "tweakpane";

export interface Project {
  category: string;
  demo: string;
  path: string;
  source: string;
  texture: VideoTexture;
  title: string;
}

export interface FontChar {
  char: string;
  chnl: number;
  height: number;
  id: number;
  index: number;
  page: number;
  width: number;
  x: number;
  xadvance: number;
  xoffset: number;
  y: number;
  yoffset: number;
}

interface FontCommon {
  alphaChnl: number;
  base: number;
  blueChnl: number;
  greenChnl: number;
  lineHeight: number;
  packed: number;
  pages: number;
  redChnl: number;
  scaleH: number;
  scaleW: number;
}

interface FontInfo {
  aa: number;
  bold: number;
  charset: Array<string>;
  face: string;
  italic: number;
  padding: Array<number>;
  size: number;
  smooth: number;
  spacing: Array<number>;
  stretchH: number;
  unicode: number;
}

export interface FontKerning {
  first: number;
  second: number;
  amount: number;
}

export interface FontData {
  chars: Array<FontChar>;
  common: FontCommon;
  distanceFiled: {
    distanceRange: number;
    fieldType: string;
  };
  info: FontInfo;
  kernings: Array<FontKerning>;
  pages: Array<string>;
}

export interface Font {
  map: Texture;
  data: FontData;
}

export enum TextAlign {
  Left = "left",
  Right = "right",
  Center = "center",
}

export enum TextBufferAttributes {
  Position = "position",
  Id = "id",
  Uv = "uv",
  Index = "index",
}

export interface _TextLine {
  width: number;
  glyphs: Array<[FontChar, number]>;
}

export interface _Text {
  fontData: FontData;
  text: string;
  size: number;
  letterSpacing: number;
  wordSpacing: number;
  wordBreak: boolean;
  lineWidth: number;
  align: TextAlign;
  lineHeight: number;
  newline: RegExp;
  whitespace: RegExp;
  buffers: Record<TextBufferAttributes, Float32Array | Uint16Array>;
  glyphs: Record<string, FontChar>;
  scale: number;
  lines: Array<_TextLine>;
  numLines: number;
  height: number;
  width: number;
  parseFont(): void;
  createGeometry(): void;
  layout(): void;
  getKernPairOffset(id1: number, id2: number): number;
  populateBuffers(): void;
  onResize(): void;
  update(text: string): void;
  updateSize(size: number, lineHeight: number, lineWidth?: number): void;
}

export interface _TextGeometry extends BufferGeometry {
  text: _Text;
  setText(opt: TextProps): void;
}

export interface _RenderBuffer {
  size: number;
  texture: IUniform<Texture | null>;
  scene: Scene;
  geometry: PlaneGeometry;
  camera: PerspectiveCamera;
  rtOptions: WebGLRenderTargetOptions;
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
  swap(): void;
  update(renderer: WebGLRenderer): void;
}

export interface _Flowmap extends _RenderBuffer {
  velocity: Vector2 & { needsUpdate?: boolean };
  mouse: Vector2;
  lastMouse: Vector2;
  lastTime: number | null;
  uniforms: Record<string, IUniform>;
  material: ShaderMaterial;
  mesh: Mesh;
}

export enum Shape {
  Sphere = "sphere",
  Blob = "blob",
  Goursat = "goursat",
  Torus = "torus",
  Hyperelliptic = "hyperelliptic",
  TorusKnot = "torusKnot",
}

export interface CurlSeed {
  s: number;
  ox: number;
  oy: number;
  oz: number;
}

export interface _CurlBubble {
  world: World;
  scene: Scene;
  size: number;
  shapeArray: Float32Array;
  noiseArray: Float32Array;
  shape: Data3DTexture;
  noise: Data3DTexture;
  geometry: SphereGeometry;
  material: ShaderMaterial;
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  shapeType: Shape;
  noiseSeed: CurlSeed;
  debug: FolderApi;
  uniforms: Record<string, IUniform>;
  scale: number;
}

export interface _HomeViewManager {
  world: World;
  scene: Scene;
  curlBubble: _CurlBubble;
  title: Title;
  contact: Contact;
  nav: Nav;
  raycaster: Raycaster;
  rayOrigin: Vector3;
  rayTarget: Vector3;
  resizeSettings: Record<string, number>;
  debug: FolderApi;
  onPreloaded(): void;
  setDebug(): void;
}

export interface _Parallax {
  world: World;
  camera: PerspectiveCamera;
  initialHeight: number;
  mouse: Vector2;
  lerp: number;
  magX: number;
  magY: number;
  enabled: boolean;
  direction: 1 | -1;
  target: Vector2;
  updateTarget(): void;
  update(): void;
}

export interface _Resources {
  world: World;
  textureLoader: TextureLoader;
  numAssets: number;
  assetsLoaded: number;
  progress: number;
  projects: Array<Project>;
  fonts: Record<string, Font>;
  assets: Record<string, Texture>;
  preloader: Preloader;
  onAssetLoaded(): void;
  loadFonts(): Promise<void>;
  loadProjects(): Promise<void>;
  loadAssets(): Promise<void>;
  load(): Promise<void>;
}

export enum View {
  Home = "Home",
  About = "About",
  Projects = "Projects",
  ProjectDetail = "ProjectDetail",
  Error = "404",
}

interface ProjectState {
  active: number;
  progress: IUniform<number>;
  target: number;
  isTransitioning: IUniform<boolean>;
  min: number;
  max: number;
}

export interface _Water {}

export interface _Post {}

export interface _Sky {}

export interface _ProjectScreen {}

export interface _RotateAlert {}

export interface _TransitionManager {}

export interface _ProjectsViewManager {}

export interface _ProjectDetailViewManager {}

export interface _AboutViewManager {}

export interface _Preloader {}

export interface _World {
  usePost: boolean;
  projectState: ProjectState;
  view: View;
  time: number;
  mouse: Vector2;
  container: HTMLDivElement;
  width: number;
  height: number;
  scene: Scene;
  camera: PerspectiveCamera;
  initialHeight: number;
  renderer: WebGLRenderer;
  raycaster: Raycaster;
  ndcRaycaster: Raycaster;
  resources: _Resources;
  water: _Water;
  post: _Post;
  sky: _Sky;
  curlBubble: _CurlBubble;
  projectScreen: _ProjectScreen;
  rotateAlert: _RotateAlert;
  transitionManager: _TransitionManager;
  projectsViewManager: _ProjectsViewManager;
  projectDetailViewManager: _ProjectDetailViewManager;
  aboutViewManager: _AboutViewManager;
  homeViewManager: _HomeViewManager;
  parallax: _Parallax;
  preloader: _Preloader;
  dataCount: number;
  debug: FolderApi;
  pane: FolderApi;
  paneContainer: Pane;
}
