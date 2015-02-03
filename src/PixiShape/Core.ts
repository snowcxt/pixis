module Pixis {
    export interface IPoint {
        x: number;
        y: number;
    }

    export interface IShapeConfig {
        x?: number;
        y?: number;
        pivotX?: number;
        pivotY?: number;
        scaleX?: number;
        scaleY?: number;

        blur?: number;
        sepia?: number;
        invert?: number;
        gray?: number;

        rotation?: number;
        visible?: boolean;
    }

    export interface IGraphicsShapeConfig extends IShapeConfig {
        fill?: number;
        opacity?: number;

        stroke?: number;
        strokeWidth?: number;
        strokeOpacity?: number;

        hitArea?: {
            type: number;
            padding?: number;
        };
    }

    export interface IContainer {
        add: (shape: Shape) => void;
        getStage: () => Stage;
        remove: (shape: Shape) => void;
    }

    export var HitAreaType = {
        None: 0,
        Box: 1,
        Fit: 2
    };

    var AnimStatuses = {
        stopped: 0,
        running: 1
    };

    export class Stage implements IContainer {
        public stage: PIXI.Stage;
        private renderer: PIXI.IPixiRenderer;
        private animations: Array<Animation> = [];

        constructor(width: number, height: number, canvas?: HTMLCanvasElement, opts?: { webgl?: boolean }) {
            opts = Util.extend({ webgl: true }, opts);

            this.stage = new PIXI.Stage(0xFFFFFF);

            if (opts.webgl) {
                this.renderer = (<any>PIXI).autoDetectRenderer(width, height, {
                    view: canvas,
                    transparent: true,
                    antialias: true
                });
            } else {
                this.renderer = new (<any>PIXI).CanvasRenderer(width, height, {
                    view: canvas,
                    transparent: true
                });
            }

            if (!canvas) {
                document.body.appendChild(this.renderer.view);
            }
        }

        public add(shape: Shape): void {
            shape.parent = this;
            this.stage.addChild(shape.shape);
        }

        public remove(shape: Shape): void {
            this.stage.removeChild(shape.shape);
            shape.parent = null;
        }

        public addChild(object: PIXI.DisplayObject) {
            this.stage.addChild(object);
        }

        public getStage() {
            return this;
        }

        public draw(): void {
            this.renderer.render(this.stage);
        }

        animStatus = AnimStatuses.stopped;

        private lastLoop;

        runAnimation = () => {
            var thisLoop = new Date;
            var timeSpan = (<any>thisLoop - <any>this.lastLoop) / 1000;

            this.lastLoop = thisLoop;
            if (this.animStatus == AnimStatuses.running) {
                var i = 0, l = this.animations.length, anim: Animation;
                while (i < l) {
                    anim = this.animations[i];
                    if (!anim.stopped) {
                        if (anim.animate(timeSpan, anim.tag)) {
                            i++;
                        } else {
                            anim.stopped = true;
                            anim.finish(anim);
                            this.animations.splice(i, 1);
                            l--;
                        }
                    } else {
                        anim.finish(anim);
                        this.animations.splice(i, 1);
                        l--;
                    }
                }

                this.draw();

                if (this.animations.length > 0) {
                    requestAnimFrame(this.runAnimation);
                } else {
                    this.animStatus = AnimStatuses.stopped;
                }
            }
        };

        public addAnimation(anim: Animation) {
            this.animations.push(anim);
            if (this.animStatus == AnimStatuses.stopped) {
                this.animStatus = AnimStatuses.running;
                this.lastLoop = new Date;
                this.runAnimation();
            }
        }

        public startAnim(animateFunc: (animation: Animation) => void) {
            this.addAnimation(new Animation((animation) => {
                animateFunc(animation);
                return true;
            }, null));
        }

        public stopAnimations() {
            this.animations = [];
            this.animStatus = AnimStatuses.stopped;
        }
    }

    export class Shape {
        public attrs: IShapeConfig;
        public shape: PIXI.DisplayObject;
        public parent: IContainer = null;

        constructor(shape, config: IGraphicsShapeConfig) {
            this.shape = shape;
            config = Util.extend({
                x: 0, y: 0,
                pivotX: 0, pivotY: 0,
                scaleX: 1, scaleY: 1,
                rotation: 0,
                visible: true,
                fill: null,
                opacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                blur: 0,
                sepia: 0,
                invert: 0,
                gray: 0
            }, config);

            this.attrs = config;
            this.draw();
        }

        public getAttr(attr: string) {
            return this.attrs[attr];
        }

        public setAttrs(config: IGraphicsShapeConfig): void {
            this.attrs = Util.extend(this.attrs, config);
            this.draw();
        }

        draw() {
            this.shape.visible = this.attrs.visible;

            this.shape.position.x = this.attrs.x;
            this.shape.position.y = this.attrs.y;

            this.shape.rotation = this.attrs.rotation;

            this.shape.scale = new PIXI.Point(this.attrs.scaleX, this.attrs.scaleY);

            this.shape.pivot = new PIXI.Point(this.attrs.pivotX, this.attrs.pivotY);

            var filters = [];

            if (this.attrs.blur > 0) {
                var blur = new (<any>PIXI).BlurFilter();
                (<any>blur).blur = this.attrs.blur;
                filters.push(blur);
            }

            if (this.attrs.sepia > 0) {
                var sepiaFilter = new (<any>PIXI).SepiaFilter();
                sepiaFilter.sepia = this.attrs.sepia;
                filters.push(sepiaFilter);
            }

            if (this.attrs.invert > 0) {
                var invertFilter = new (<any> PIXI).InvertFilter();
                invertFilter.invert = this.attrs.invert;
                filters.push(invertFilter);
            }

            if (this.attrs.gray > 0) {
                var grayFilter = new (<any> PIXI).GrayFilter();
                grayFilter.gray = this.attrs.gray;
                filters.push(grayFilter);
            }

            //var pixelateFilter = new PIXI.PixelateFilter();
            //var grayFilter = new PIXI.GrayFilter();
            //var twistFilter = new PIXI.TwistFilter();
            //var dotScreenFilter = new (<any> PIXI).DotScreenFilter();
            //var colorStepFilter = new PIXI.ColorStepFilter();
            //var crossHatchFilter = new PIXI.CrossHatchFilter();
            //var rgbSplitterFilter = new PIXI.RGBSplitFilter();

            if (filters.length > 0) {
                (<any>this.shape).filters = filters;
            } else {
                (<any>this.shape).filters = null;
            }
        }

        public show() {
            this.attrs.visible = true;
            this.shape.visible = true;
        }

        public hide() {
            this.attrs.visible = false;
            this.shape.visible = false;
        }

        public setPostion(x: number, y: number) {
            this.attrs.x = x;
            this.attrs.y = y;

            this.shape.position.x = this.attrs.x;
            this.shape.position.y = this.attrs.y;
        }

        public move(offsetX: number, offsetY: number) {
            this.setPostion(this.attrs.x + offsetX, this.attrs.y + offsetY);
        }

        public setRotation(angle: number) {
            this.attrs.rotation = angle;
            this.shape.rotation = angle;
        }

        public rotate(offsetAngle: number) {
            this.setRotation(this.attrs.rotation + offsetAngle);
        }

        public scale(x: number, y: number) {
            this.attrs.scaleX = x;
            this.attrs.scaleY = y;

            this.shape.scale = new PIXI.Point(x, y);
        }

        public setPivot(x: number, y: number) {
            this.attrs.pivotX = x;
            this.attrs.pivotY = y;

            this.shape.pivot = new PIXI.Point(x, y);
        }

        public tween(duration: number, to: any, easing?: (t: number, b: number, c: number, d: number) => number): Tween {
            return new Tween({
                shape: this,
                duration: duration,
                to: to
            }, easing);
        }
    }

    export class GraphicsShape extends Shape {
        public className: string;
        public shape: PIXI.Graphics;
        public attrs: IGraphicsShapeConfig;

        constructor(config) {
            config = Util.extend({
                fill: null,
                opacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                hitArea: null
            }, config);

            super(new PIXI.Graphics(), config);

            if (this.attrs.hitArea && this.attrs.hitArea.type != HitAreaType.None) {
                this.shape.interactive = true;
                switch (this.attrs.hitArea.type) {
                    case HitAreaType.Box:
                        this.shape.hitArea = this.calHitAreaBox();
                        break;
                }
            }
        }

        calHitAreaBox(): PIXI.Rectangle {
            var box = this.shape.getLocalBounds();
            var padding = this.attrs.hitArea.padding || 0;

            var paddingX = padding / this.attrs.scaleX;
            var paddingY = padding / this.attrs.scaleY;

            //var width = this.attrs.scale ? box.width / this.attrs.scale.x : box.width;
            //var height = this.attrs.scale ? box.height / this.attrs.scale.y : box.height;
            var width = box.width;
            var height = box.height;

            if (this.attrs.hitArea.padding) {
                width += paddingX / 2;
                height += paddingY / 2;
            }

            return new PIXI.Rectangle(-width / 2, -height / 2, width, height);
        }

        draw() {
            if (this.attrs.stroke) {
                this.shape.lineStyle(this.attrs.strokeWidth, this.attrs.stroke, this.attrs.strokeOpacity);
            }

            if (this.attrs.fill != null) {
                this.shape.beginFill(this.attrs.fill, this.attrs.opacity);
            }

            super.draw();
        }

        public setAttrs(config: IGraphicsShapeConfig): void {
            this.attrs = Util.extend(this.attrs, config);
            this.shape.clear();
            this.draw();
        }

        public clear() {
            this.shape.clear();
            if (this.parent) {
                this.parent.remove(this);
            }
        }
    }

    export module Util {
        export function extend(destination, source): any {
            if (source) {
                for (var property in source)
                    if (typeof (source[property]) !== "undefined")
                        destination[property] = source[property];
            }
            return destination;
        }

        export function getColorInt(str: string): number {
            return parseInt(str.substring(1), 16);
        }

        export function getRgb(color: number) {
            var rgb = { r: 0, g: 0, b: 0 };

            rgb.b = color % 0x100;
            color = Math.floor(color / 0x100);

            rgb.g = color % 0x100;
            color = Math.floor(color / 0x100);

            rgb.r = color % 0x100;

            return rgb;
        }

        export function getColor(r: number, g: number, b: number) {
            return Math.round(r) * 0x10000 + Math.round(g) * 0x100 + Math.round(b);
        }

        export function getColorString(num: number): string {
            return num != null ? "#" + num.toString(16) : null;
        }
    }
} 