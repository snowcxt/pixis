module Pixis {
    export interface ITextConfig extends IGraphicsShapeConfig {
        text: string;
        font?: string;
        align?: string;
        width?: number;
    }

    export class Text extends Shape {
        public shape: PIXI.Text;
        public attrs: ITextConfig;

        constructor(config: ITextConfig) {
            //config = Util.extend({ fill: "transparent", align: "left", width: 0 }, config);

            super(new PIXI.Text(config.text, {
                font: config.font,
                fill: Util.getColorString(config.fill),
                //align: config.align,
                stroke: Util.getColorString(config.stroke),
                strokeThickness: config.strokeWidth
            }), config);
        }

        updatePosition() {
            if (this.attrs.align && this.attrs.width > 0) {
                var bound = this.shape.getLocalBounds();
                var width = bound.width;

                if (this.attrs.width > width) {
                    switch (this.attrs.align) {
                    case "left":
                        break;
                    case "center":
                        this.shape.position.x = this.attrs.x + (this.attrs.width - width) / 2;
                        break;
                    }
                }
            }
        }

        draw() {
            this.shape.setText(this.attrs.text);

            this.shape.setStyle({
                font: this.attrs.font,
                fill: Util.getColorString(this.attrs.fill),
                stroke: Util.getColorString(this.attrs.stroke),
                strokeThickness: this.attrs.strokeWidth
            });

            super.draw();
            this.updatePosition();
        }

        public setAttrs(config) {
            this.attrs = Util.extend(this.attrs, config);
            this.draw();
        }

        public setText(text) {
            this.attrs.text = text;
            this.shape.setText(text);
            //this.shape.updateBounds();
            this.updatePosition();
        }
    }
} 