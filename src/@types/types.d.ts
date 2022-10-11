import { World } from "@src/app";
import { TextProps } from "@src/utils/Text";
import {
  BufferGeometry,
  Data3DTexture,
  Group,
  IUniform,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  Vector4,
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

export interface _TitleMesh extends Mesh<_TextGeometry, ShaderMaterial> {
  uniforms: Record<string, IUniform>;
  setTextBoundingUv(baseWidth: number): void;
  setGeometrySpecs({
    text,
    fontData,
    baseWidth,
  }: {
    text: string;
    fontData: FontData;
    baseWidth: number;
  }): void;
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

export interface _HomeTitle {
  world: _World;
  scene: Scene;
  group: Group;
  raycaster: Raycaster;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  flowmap: _Flowmap;
  textTexture: _TextTexture;
  aspect: number;
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  mesh: Mesh;
}

export interface _HomeViewManager {
  world: _World;
  scene: Scene;
  curlBubble: _CurlBubble;
  title: _HomeTitle;
  contact: _HomeContact;
  nav: _HomeNav;
  raycaster: Raycaster;
  rayOrigin: Vector3;
  rayTarget: Vector3;
  resizeSettings: Record<string, number>;
  debug: FolderApi;
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
  preloader: _Preloader;
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

export interface _Mirror {
  textureWidth: number;
  textureHeight: number;
  clipBias: number;
  mirrorPlane: Plane;
  normal: Vector3;
  mirrorWorldPosition: Vector3;
  cameraWorldPosition: Vector3;
  rotationMatrix: Matrix4;
  lookAtPosition: Vector3;
  clipPlane: Vector4;
  view: Vector3;
  target: Vector3;
  q: Vector4;
  textureMatrix: Matrix4;
  mirrorCamera: PerspectiveCamera;
  renderTarget: WebGLRenderTarget;
  updateTextureMatrix(object: Object3D, camera: PerspectiveCamera): void;
  drawTexture(renderer: WebGLRenderer, object: Object3D, scene: Scene): void;
  update(
    object: Object3D,
    renderer: WebGLRenderer,
    camera: PerspectiveCamera,
    scene: Scene
  ): void;
}

export interface _WaterHeightMap extends _RenderBuffer {
  bounds: number;
  mesh: Mesh;
  uniforms: Record<string, IUniform>;
  material: ShaderMaterial;
}
export interface _Water extends _Mirror {
  world: _World;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  raycaster: Raycaster;
  bounds: number;
  scale: number;
  heightMap: _WaterHeightMap;
  geometry: PlaneGeometry;
  uniforms: Record<string, IUniform>;
  material: ShaderMaterial;
  mesh: Mesh;
  intersectionPlane: Mesh;
  debug: FolderApi;
  hiddenObjects: { [key in View]?: Array<Object3D> };
}

export interface _Post {
  world: _World;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  renderTarget: WebGLRenderTarget;
  geometry: PlaneGeometry;
  transitionEffects: Record<TransitionEffect, _TransitionScene>;
  activeEffect: TransitionEffect;
  debug: FolderApi;
}

export enum TransitionEffect {
  HomeProjects = "HomeProjects",
  ProjectsAbout = "ProjectsAbout",
}

export interface _TransitionScene extends Scene {
  uniforms: Record<string, IUniform>;
  updateScreen(texture: Texture): void;
}

export interface _Sky {
  world: _World;
  scene: Scene;
  debug: FolderApi;
  uniforms: Record<string, IUniform>;
  material: ShaderMaterial;
  mesh: Mesh;
  geometry: SphereGeometry;
}

export interface _ProjectScreen {
  world: _World;
  scene: Scene;
  projectState: ProjectState;
  data: Array<Project>;
  geometry: PlaneGeometry;
  uniforms: Record<string, IUniform>;
  material: ShaderMaterial;
  mesh: Mesh;
  debug: FolderApi;
}

export interface _RotateAlert {}

export interface _TransitionManager {}

export interface _GradientLinear {}

export interface _AboutOverlay {
  socialIcons: _AboutSocialIcons;
  footer: _AboutFooter;
  nav: _AboutNav;
  group: Group;
}

export interface _AboutFooter {
  world: _World;
  font: Font;
  group: Group;
  textMaterial: ShaderMaterial;
  iconGeometry: PlaneGeometry;
  iconMaterial: ShaderMaterial;
  locationGroup: Group;
  location: Mesh;
  locationIcon: Mesh;
  cvGroup: Group;
  cv: Mesh;
  cvIcon: Mesh;
  emailGroup: Group;
  email: Mesh;
  emailIcon: Mesh;
  line: Mesh;
}

export interface _AboutSocialIcons {
  world: _World;
  group: Group;
  iconMaterial: ShaderMaterial;
  geometry: PlaneGeometry;
  twitter: Mesh<PlaneGeometry, ShaderMaterial>;
  github: Mesh<PlaneGeometry, ShaderMaterial>;
  linkedin: Mesh<PlaneGeometry, ShaderMaterial>;
}

export interface _AboutNav {
  group: Group;
  font: Font;
  material: ShaderMaterial;
  geometry: _TextGeometry;
  mesh: Mesh;
}

export interface Scroll {
  current: number;
  target: number;
  active: boolean;
  limitTop: number;
  limitBottom: number;
}

export interface _ProjectTitles {
  world: _World;
  scene: Scene;
  scroll: Scroll;
  gap: number;
  baseWidth: number;
  group: Group;
  outerGroup: Group;
  initialScrollOffset: number;
  data: Array<Project>;
  font: Font;
  meshes: Array<_TitleMesh>;
  debug: FolderApi;
}

export interface _ProjectsNav {}

export interface _ProjectsFilters {}

export interface _ProjectsViewManager {
  world: _World;
  scene: Scene;
  projectScreen: _ProjectScreen;
  projectState: ProjectState;
  activeFilter?: string;
  sky: _Sky;
  water: _Water;
  timeline: GSAPTimeline;
  raycaster: Raycaster;
  ndcRaycaster: Raycaster;
  rayOrigin: Vector3;
  rayTarget: Vector3;
  colorGradient: _GradientLinear;
  debug: FolderApi;
  titlesTimeline: GSAPTimeline;
  hover: boolean;
  hoverTitles: boolean;
  down: boolean;
  target: string;
  titleIndex: number;
  titles: _ProjectTitles;
  nav: _ProjectsNav;
  filters: _ProjectsFilters;
}

export interface _ProjectDetailViewManager {}

export interface _AboutScreen {
  world: _World;
  geometry: PlaneGeometry;
  textTexture: _AboutTextTexture;
  aspect: number;
  material: ShaderMaterial;
  mesh: Mesh;
}

export interface _AboutGreeting {
  world: _World;
  font: Font;
  group: Group;
  textMaterial: ShaderMaterial;
  geometry1: _TextGeometry;
  geometry2: _TextGeometry;
  mesh1: Mesh;
  mesh2: Mesh;
}

export interface _AboutViewManager {
  world: _World;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  screen: _AboutScreen;
  greeting: _AboutGreeting;
  overlay: _AboutOverlay;
  raycaster: Raycaster;
  rayOrigin: Vector3;
  rayTarget: Vector3;
  debug: FolderApi;
  hover: boolean;
  target: string;
  down: boolean;
}

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

export interface Padding {
  x: number;
  y: number;
}

export interface _TextTexture {
  font: Font;
  geometry: _TextGeometry;
  geometryAspect: number;
  scale: number;
  material: ShaderMaterial;
  mesh: Mesh;
  renderTarget: WebGLRenderTarget;
  texture: IUniform<Texture>;
  scene: Scene;
  lineHeight: number;
  padding: Padding;
}

export interface _AboutTextTexture {
  font: Font;
  geometry: _TextGeometry;
  lineHeight: number;
  material: ShaderMaterial;
  mesh: Mesh;
  renderTarget: WebGLRenderTarget;
  texture: IUniform<Texture>;
  scene: Scene;
  initialOffset: number;
  maxScroll: number;
}

export interface _HomeContact {
  world: _World;
  group: Group;
  font: Font;
  textMaterial: ShaderMaterial;
  iconMaterial: ShaderMaterial;
  email: Mesh;
  touchPlane: Mesh;
  icon: Mesh;
  cta: Mesh;
  hover: boolean;
  down: boolean;
  resize(sizes: any): void;
  update(time: number): void;
}

export interface _HomeNav {
  world: _World;
  group: Group;
  textMaterial: ShaderMaterial;
  underlineMaterial: ShaderMaterial;
  geometry: _TextGeometry;
  mesh: Mesh;
  font: Font;
  hover: boolean;
  down: boolean;
}
