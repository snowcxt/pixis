module Pixis {
    export interface IDrawConfig extends IShapeConfig {
        width: number;
        height: number;
        draw: (ctx: CanvasRenderingContext2D) => void;
    }

    export class Draw extends Shape {
        public shape: PIXI.Sprite;
        public attrs: IDrawConfig;

        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;

        constructor(config: IDrawConfig) {
            config.draw = config.draw || (() => { });

            this.canvas = document.createElement('canvas');
            this.canvas.width = config.width;
            this.canvas.height = config.height;
            this.ctx = this.canvas.getContext('2d');

            super(new PIXI.Sprite(PIXI.Texture.fromCanvas(this.canvas)), config);
        }

        draw() {
            super.draw();
            this.ctx.beginPath();
            this.attrs.draw(this.ctx);
        }

        public redraw(draw: (ctx: CanvasRenderingContext2D) => void) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.attrs.draw = draw;
            this.draw();
            (<any>this.shape.texture.baseTexture).dirty();
        }

        public clean() {
            this.shape.texture.destroy(false);
        }
    }
} 