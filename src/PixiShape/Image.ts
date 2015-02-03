module Pixis {
    export interface IImageConfig extends IShapeConfig {
        image: Pixis.ImageTexture;
    }

    export class ImageTexture {
        public texture: PIXI.Texture;
        private src: string;

        constructor(src) {
            this.src = src;
            this.texture = PIXI.Texture.fromImage(src);
        }
    }

    export class Image extends Shape {
        constructor(config: IImageConfig) {
            super(new PIXI.Sprite(config.image.texture), config);
        }
    }
} 