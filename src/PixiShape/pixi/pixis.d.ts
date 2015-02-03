///<reference path="webgl.d.ts"/>
///<reference path="pixi.d.ts"/>
declare module Pixis {
    interface IPoint {
        x: number;
        y: number;
    }
    interface IShapeConfig {
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
    interface IGraphicsShapeConfig extends IShapeConfig {
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
    interface IContainer {
        add: (shape: Shape) => void;
        getStage: () => Stage;
        remove: (shape: Shape) => void;
    }
    var HitAreaType: {
        None: number;
        Box: number;
        Fit: number;
    };
    class Stage implements IContainer {
        public stage: PIXI.Stage;
        private renderer;
        private animations;
        constructor(width: number, height: number, canvas?: HTMLCanvasElement, opts?: {
            webgl?: boolean;
        });
        public add(shape: Shape): void;
        public remove(shape: Shape): void;
        public addChild(object: PIXI.DisplayObject): void;
        public getStage(): Stage;
        public draw(): void;
        public animStatus: number;
        private lastLoop;
        public runAnimation: () => void;
        public addAnimation(anim: Animation): void;
        public startAnim(animateFunc: (animation: Animation) => void): void;
        public stopAnimations(): void;
    }
    class Shape {
        public attrs: IShapeConfig;
        public shape: PIXI.DisplayObject;
        public parent: IContainer;
        constructor(shape: any, config: IGraphicsShapeConfig);
        public getAttr(attr: string): any;
        public setAttrs(config: IGraphicsShapeConfig): void;
        public draw(): void;
        public show(): void;
        public hide(): void;
        public setPostion(x: number, y: number): void;
        public move(offsetX: number, offsetY: number): void;
        public setRotation(angle: number): void;
        public rotate(offsetAngle: number): void;
        public scale(x: number, y: number): void;
        public setPivot(x: number, y: number): void;
        public tween(duration: number, to: any, easing?: (t: number, b: number, c: number, d: number) => number): Tween;
    }
    class GraphicsShape extends Shape {
        public className: string;
        public shape: PIXI.Graphics;
        public attrs: IGraphicsShapeConfig;
        constructor(config: any);
        public calHitAreaBox(): PIXI.Rectangle;
        public draw(): void;
        public setAttrs(config: IGraphicsShapeConfig): void;
        public clear(): void;
    }
    module Util {
        function extend(destination: any, source: any): any;
        function getColorInt(str: string): number;
        function getRgb(color: number): {
            r: number;
            g: number;
            b: number;
        };
        function getColor(r: number, g: number, b: number): number;
        function getColorString(num: number): string;
    }
}
declare module Pixis {
    interface ITweenCallback {
        done?: () => void;
        progress?: (animation: Animation) => void;
    }
    class Animation {
        public tag: any;
        public animate: (timespan: number, tag: any) => void;
        public finish: (animation: Animation) => void;
        public stopped: boolean;
        public isToward: boolean;
        public elapse: number;
        public total: number;
        constructor(animate: (animation: Animation) => boolean, length: number, opts?: {
            finish?: (animation: Animation) => void;
            tag?: any;
            isToward?: boolean;
        });
        private isTerminated(span);
    }
    interface ITweenConfig {
        shape: Shape;
        duration: number;
        to: any;
    }
    class Tween {
        private shape;
        private easing;
        private duration;
        private to;
        private begin;
        private change;
        private attrs;
        private animation;
        private toward;
        private progress;
        constructor(config: ITweenConfig, easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => number);
        private setAttrs();
        private animate(callback?);
        public play(callback?: ITweenCallback): Tween;
        public reverse(callback?: ITweenCallback): Tween;
        public seek(postion: number): void;
        public pause(): Tween;
        public resume(): Tween;
    }
    var Easings: {
        'BackEaseIn': (t: any, b: any, c: any, d: any) => any;
        'BackEaseOut': (t: any, b: any, c: any, d: any) => any;
        'BackEaseInOut': (t: any, b: any, c: any, d: any) => any;
        'ElasticEaseIn': (t: any, b: any, c: any, d: any, a: any, p: any) => any;
        'ElasticEaseOut': (t: any, b: any, c: any, d: any, a: any, p: any) => any;
        'ElasticEaseInOut': (t: any, b: any, c: any, d: any, a: any, p: any) => any;
        'BounceEaseOut': (t: any, b: any, c: any, d: any) => any;
        'BounceEaseIn': (t: any, b: any, c: any, d: any) => any;
        'BounceEaseInOut': (t: any, b: any, c: any, d: any) => any;
        'EaseIn': (t: any, b: any, c: any, d: any) => any;
        'EaseOut': (t: any, b: any, c: any, d: any) => any;
        'EaseInOut': (t: any, b: any, c: any, d: any) => any;
        'StrongEaseIn': (t: any, b: any, c: any, d: any) => any;
        'StrongEaseOut': (t: any, b: any, c: any, d: any) => any;
        'StrongEaseInOut': (t: any, b: any, c: any, d: any) => any;
        'Linear': (t: any, b: any, c: any, d: any) => any;
    };
}
declare module Pixis {
    interface IArcConfig extends IGraphicsShapeConfig {
        innerRadius: number;
        outerRadius: number;
        angle: number;
        clockwise?: boolean;
    }
    class Arc extends GraphicsShape {
        public attrs: IArcConfig;
        constructor(config: IArcConfig);
        public draw(): void;
    }
}
declare module Pixis {
    interface ICircleConfig extends IGraphicsShapeConfig {
        radius: number;
    }
    class Circle extends GraphicsShape {
        public attrs: ICircleConfig;
        constructor(config: ICircleConfig);
        public draw(): void;
    }
}
declare module Pixis {
    interface IDrawConfig extends IShapeConfig {
        width: number;
        height: number;
        draw: (ctx: CanvasRenderingContext2D) => void;
    }
    class Draw extends Shape {
        public shape: PIXI.Sprite;
        public attrs: IDrawConfig;
        public canvas: HTMLCanvasElement;
        public ctx: CanvasRenderingContext2D;
        constructor(config: IDrawConfig);
        public draw(): void;
        public redraw(draw: (ctx: CanvasRenderingContext2D) => void): void;
        public clean(): void;
    }
}
declare module Pixis {
    class Group extends Shape implements IContainer {
        public shape: PIXI.DisplayObjectContainer;
        constructor(config: IShapeConfig);
        public add(child: Shape): void;
        public remove(child: Shape): void;
        public getStage(): Stage;
        public removeAll(): void;
    }
}
declare module Pixis {
    interface IImageConfig extends IShapeConfig {
        image: ImageTexture;
    }
    class ImageTexture {
        public texture: PIXI.Texture;
        private src;
        constructor(src: any);
    }
    class Image extends Shape {
        constructor(config: IImageConfig);
    }
}
declare module Pixis {
    interface ILineConfig extends IGraphicsShapeConfig {
        points: IPoint[];
        colosed?: boolean;
    }
    class Line extends GraphicsShape {
        public attrs: ILineConfig;
        constructor(config: ILineConfig);
        public draw(): void;
    }
}
declare module Pixis {
    interface IPathConfig extends IGraphicsShapeConfig {
        data: string;
    }
    interface IPathData {
        command: string;
        points: number[];
        start: {
            x: number;
            y: number;
        };
        pathLength: number;
    }
    class Path extends GraphicsShape {
        public attrs: IPathConfig;
        constructor(config: any);
        public draw(): void;
    }
}
declare module Pixis {
    interface IRectConfig extends IGraphicsShapeConfig {
        width: number;
        height: number;
        cornerRadius?: number;
    }
    class Rect extends GraphicsShape {
        public attrs: IRectConfig;
        constructor(config: IRectConfig);
        public draw(): void;
        public calHitAreaBox(): PIXI.Rectangle;
    }
}
declare module Pixis {
    interface IRegularPolygonConfig extends IGraphicsShapeConfig {
        sides: number;
        radius: number;
    }
    class RegularPolygon extends GraphicsShape {
        public attrs: IRegularPolygonConfig;
        constructor(config: IRegularPolygonConfig);
        public draw(): void;
    }
}
declare module Pixis {
    interface IStarConfig extends IGraphicsShapeConfig {
        innerRadius: number;
        outerRadius: number;
        numPoints: number;
    }
    class Star extends GraphicsShape {
        public attrs: IStarConfig;
        constructor(config: IStarConfig);
        public draw(): void;
    }
}
declare module Pixis {
    interface ITextConfig extends IGraphicsShapeConfig {
        text: string;
        font?: string;
        align?: string;
        width?: number;
    }
    class Text extends Shape {
        public shape: PIXI.Text;
        public attrs: ITextConfig;
        constructor(config: ITextConfig);
        public updatePosition(): void;
        public draw(): void;
        public setAttrs(config: any): void;
        public setText(text: any): void;
    }
}
