import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } from "ogl";
import type { Category } from "../types/models";
import { useNavigate } from "react-router-dom";

import "./CircularGallery.css";

type GL = Renderer["gl"];

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: unknown, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: Record<string, unknown>): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = (instance[key] as (...args: unknown[]) => unknown).bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl: GL, text: string, font: string = "bold 30px monospace", color: string = "black"): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  context.font = font;
  const metrics = context.measureText(text.toUpperCase());
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = "#545050", font = "30px sans-serif" }: TitleProps) {
    autoBind(this as Record<string, unknown>);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    // Create title mesh only (no price/sold)
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.15;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  categoryId: string;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  categoryId: string;
  isHovered: boolean = false;
  hoverProgress: number = 0;

  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font, categoryId }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.categoryId = categoryId;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uHoverProgress;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float hoverOffset = uHoverProgress * 0.1;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5) + hoverOffset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uHoverProgress;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          if(d > 0.0) {
            discard;
          }
          
          float shadowIntensity = uHoverProgress * 0.3;
          vec3 shadowColor = vec3(0.0, 0.0, 0.0);
          color.rgb = mix(color.rgb, shadowColor, shadowIntensity);
          
          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uHoverProgress: { value: 0 },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }

  update(scroll: { current: number; last: number }, direction: "right" | "left") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    // Vertical offset to move images up
    const verticalOffset = this.plane.scale.y * 0.35; // Adjusted offset for better visibility

    if (this.bend === 0) {
      this.plane.position.y = 0 + verticalOffset;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc + verticalOffset;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc + verticalOffset;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    // Update hover effect
    const targetHoverProgress = this.isHovered ? 1.0 : 0.0;
    this.hoverProgress = lerp(this.hoverProgress, targetHoverProgress, 0.1);
    this.program.uniforms.uHoverProgress.value = this.hoverProgress;
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1400;
    this.plane.scale.y = (this.viewport.height * (800 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (750 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }

  getBounds() {
    return {
      x: this.plane.position.x - this.plane.scale.x / 2,
      y: this.plane.position.y - this.plane.scale.y / 2,
      width: this.plane.scale.x,
      height: this.plane.scale.y
    };
  }

  isPointInside(x: number, y: number): boolean {
    const bounds = this.getBounds();
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  setHovered(hovered: boolean) {
    this.isHovered = hovered;
  }
}

interface AppConfig {
  items?: Category[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
}

class App {
  container: HTMLElement;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: unknown[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: Category[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;

  boundOnResize!: () => void;
  boundOnWheel!: (e: WheelEvent) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: (e: MouseEvent | TouchEvent) => void;
  boundOnMouseMove!: (e: MouseEvent) => void;
  boundOnHoverMove!: (e: MouseEvent) => void;

  isDown: boolean = false;
  start: number = 0;
  private touchStartTime: number = 0;
  private touchEndTime: number = 0;
  private moved: boolean = false;

  constructor(container: HTMLElement, { items, bend = 1, textColor = "#ff0000", borderRadius = 0, font = "bold 36px adobe-clean, \"Source Sans Pro\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Ubuntu, \"Trebuchet MS\", \"Lucida Grande\", sans-serif" }: AppConfig) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scroll = { ease: 0.05, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    
    // Set initial position to center the first set of items
    if (this.medias && this.medias.length > 0) {
      const itemWidth = this.medias[0].width;
      const totalItems = this.mediasImages.length;
      const centerOffset = itemWidth * totalItems;
      this.scroll.current = centerOffset;
      this.scroll.target = centerOffset;
      this.scroll.last = centerOffset;
    }
    
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(items: Category[] | undefined, bend: number = 1, textColor: string, borderRadius: number, font: string) {
    if (!items || items.length === 0) {
      console.warn("No items provided to CircularGallery");
      return;
    }
    this.mediasImages = items;
    // Duplicate items to create a seamless loop
    const duplicatedItems = [...items, ...items, ...items];
    this.medias = duplicatedItems.map((category, index) => {
      const image = category.products[0]?.imageUrl || "https://via.placeholder.com/800x600?text=No+Image";
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image,
        index,
        length: duplicatedItems.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: category.name,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        categoryId: category.id
      });
    });
  }

  onWheel(e: WheelEvent) {
    if (!this.container.contains(e.target as Node)) return;
    this.scroll.target += 2;
    this.onCheckDebounce();
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    if (!this.container.contains(e.target as Node)) return;
    this.isDown = true;
    this.moved = false;
    this.touchStartTime = Date.now();
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.container.contains(e.target as Node)) return;
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * 0.05;
    this.scroll.target = (this.scroll.position ?? 0) + distance;

    // If there's significant movement, mark as moved
    if (Math.abs(this.start - x) > 5) { // Threshold of 5 pixels for movement
      this.moved = true;
    }
  }

  onTouchUp(e: MouseEvent | TouchEvent) {
    if (!this.container.contains(e.target as Node)) return;
    this.isDown = false;
    this.touchEndTime = Date.now();
    // Determine if it was a click (not a drag and not a long press)
    if (!this.moved && (this.touchEndTime - this.touchStartTime <= 200)) {
      const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
      const rect = this.container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      // Convert to WebGL coordinates
      const webglX = x * this.viewport.width / 2;
      const webglY = y * this.viewport.height / 2;
      // Check each media
      for (const media of this.medias) {
        const bounds = media.getBounds();
        if (
          webglX >= bounds.x &&
          webglX <= bounds.x + bounds.width &&
          webglY >= bounds.y &&
          webglY <= bounds.y + bounds.height
        ) {
          // Dispatch categoryClick event instead of productClick
          const event = new CustomEvent('categoryClick', { detail: { categoryId: media.categoryId } });
          this.container.dispatchEvent(event);
          break;
        }
      }
    }
    this.onCheck();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnHoverMove = this.onHoverMove.bind(this);

    this.container.addEventListener("wheel", this.boundOnWheel);
    this.container.addEventListener("mousedown", this.boundOnTouchDown);
    this.container.addEventListener("mousemove", this.boundOnMouseMove);
    this.container.addEventListener("mousemove", this.boundOnHoverMove);
    this.container.addEventListener("mouseup", this.boundOnTouchUp);
    this.container.addEventListener("touchstart", this.boundOnTouchDown);
    this.container.addEventListener("touchmove", this.boundOnTouchMove);
    this.container.addEventListener("touchend", this.boundOnTouchUp);
    window.addEventListener("resize", this.boundOnResize);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.container.contains(e.target as Node)) return;
    if (!this.isDown) return;
    const x = e.clientX;
    const distance = (this.start - x) * 0.05;
    this.scroll.target = (this.scroll.position ?? 0) + distance;

    // If there's significant movement, mark as moved
    if (Math.abs(this.start - x) > 5) {
      this.moved = true;
    }
  }

  onHoverMove(e: MouseEvent) {
    if (!this.container.contains(e.target as Node)) return;
    if (this.isDown) return; // Don't process hover while dragging
    
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const webglX = x * this.viewport.width / 2;
    const webglY = y * this.viewport.height / 2;

    this.medias.forEach(media => {
      media.setHovered(media.isPointInside(webglX, webglY));
    });
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    
    this.container.removeEventListener("wheel", this.boundOnWheel);
    this.container.removeEventListener("mousedown", this.boundOnTouchDown);
    this.container.removeEventListener("mousemove", this.boundOnMouseMove);
    this.container.removeEventListener("mousemove", this.boundOnHoverMove);
    this.container.removeEventListener("mouseup", this.boundOnTouchUp);
    this.container.removeEventListener("touchstart", this.boundOnTouchDown);
    this.container.removeEventListener("touchmove", this.boundOnTouchMove);
    this.container.removeEventListener("touchend", this.boundOnTouchUp);
    
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

interface CircularGalleryProps {
  items?: Category[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
}

const CircularGallery = forwardRef<HTMLDivElement | { [key: string]: HTMLDivElement | null }, CircularGalleryProps>(
  ({ items, bend = 3, textColor = "#ff0000", borderRadius = 0.05, font = "bold 36px adobe-clean, \"Source Sans Pro\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Ubuntu, \"Trebuchet MS\", \"Lucida Grande\", sans-serif" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appInstanceRef = useRef<App | null>(null);
    const navigate = useNavigate();
    const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useImperativeHandle(ref, () => itemRefs.current);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      if (appInstanceRef.current) {
        appInstanceRef.current.destroy();
      }
      appInstanceRef.current = new App(container, {
        items,
        bend,
        textColor,
        borderRadius,
        font,
      });
      const handleCategoryClick = (e: CustomEvent<{ categoryId: string }>) => {
        navigate(`/products?categoryId=${e.detail.categoryId}`);
      };
      container.addEventListener('categoryClick', handleCategoryClick as EventListener);
      return () => {
        if (appInstanceRef.current) {
          appInstanceRef.current.destroy();
          appInstanceRef.current = null;
        }
        container.removeEventListener('categoryClick', handleCategoryClick as EventListener);
      };
    }, [items, bend, textColor, borderRadius, font, navigate]);

    return (
      <div className="circular-gallery-container" ref={containerRef}>
        <div className="circular-gallery" />
        {items && items.map((item) => (
          <div
            key={item.id}
            ref={el => { itemRefs.current[item.id] = el; }}
            style={{ display: 'none' }}
          />
        ))}
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export default CircularGallery;
