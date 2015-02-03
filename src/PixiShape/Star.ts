module Pixis {
    export interface IStarConfig extends IGraphicsShapeConfig {
        innerRadius: number;
        outerRadius: number;
        numPoints: number;
    }

    export class Star extends GraphicsShape {
        public attrs: IStarConfig;

        constructor(config: IStarConfig) {
            super(config);
        }

        draw() {
            super.draw();

            var innerRadius = this.attrs.innerRadius,
                outerRadius = this.attrs.outerRadius,
                numPoints = this.attrs.numPoints;
            this.shape.moveTo(0, 0 - outerRadius);

            for (var n = 1; n < numPoints * 2; n++) {
                var radius = n % 2 === 0 ? outerRadius : innerRadius;
                var x = radius * Math.sin(n * Math.PI / numPoints);
                var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
                this.shape.lineTo(x, y);
            }

            this.shape.lineTo(0, 0 - outerRadius);
        }
    }
} 