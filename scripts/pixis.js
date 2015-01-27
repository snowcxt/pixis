var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Pixis;
(function (Pixis) {
    Pixis.HitAreaType = {
        None: 0,
        Box: 1,
        Fit: 2
    };
    var AnimStatuses = {
        stopped: 0,
        running: 1
    };
    var Stage = (function () {
        function Stage(width, height, canvas, opts) {
            var _this = this;
            this.animations = [];
            this.animStatus = AnimStatuses.stopped;
            this.runAnimation = function () {
                var thisLoop = new Date;
                var timeSpan = thisLoop - _this.lastLoop;
                _this.lastLoop = thisLoop;
                if (_this.animStatus == AnimStatuses.running) {
                    var i = 0, l = _this.animations.length, anim;
                    while (i < l) {
                        anim = _this.animations[i];
                        if (!anim.stopped && anim.total != null) {
                            if (anim.animate(timeSpan, anim.tag)) {
                                i++;
                            }
                            else {
                                anim.stopped = true;
                                anim.terminate(anim.tag);
                                _this.animations.splice(i, 1);
                                l--;
                            }
                        }
                        else {
                            if (!anim.stopped) {
                                anim.stopped = true;
                                anim.terminate(anim.tag);
                            }
                            _this.animations.splice(i, 1);
                            l--;
                        }
                    }
                    _this.draw();
                    if (_this.animations.length > 0) {
                        requestAnimFrame(_this.runAnimation);
                    }
                    else {
                        _this.animStatus = AnimStatuses.stopped;
                    }
                }
            };
            opts = Util.extend({ webgl: true }, opts);
            this.stage = new PIXI.Stage(0xFFFFFF);
            if (opts.webgl) {
                this.renderer = PIXI.autoDetectRenderer(width, height, {
                    view: canvas,
                    transparent: true,
                    antialias: true
                });
            }
            else {
                this.renderer = new PIXI.CanvasRenderer(width, height, {
                    view: canvas,
                    transparent: true
                });
            }
            if (!canvas) {
                document.body.appendChild(this.renderer.view);
            }
        }
        Stage.prototype.add = function (shape) {
            shape.stage = this;
            this.stage.addChild(shape.shape);
        };
        Stage.prototype.addChild = function (object) {
            this.stage.addChild(object);
        };
        Stage.prototype.draw = function () {
            this.renderer.render(this.stage);
        };
        Stage.prototype.addAnimation = function (anim) {
            this.animations.push(anim);
            if (this.animStatus == AnimStatuses.stopped) {
                this.animStatus = AnimStatuses.running;
                this.lastLoop = new Date;
                this.runAnimation();
            }
        };
        Stage.prototype.startAnim = function (animateFunc) {
            this.addAnimation(new Pixis.Animation(function (timespan) {
                animateFunc(timespan);
                return true;
            }, null));
        };
        Stage.prototype.stopAnimations = function () {
            this.animations = [];
            this.animStatus = AnimStatuses.stopped;
        };
        return Stage;
    })();
    Pixis.Stage = Stage;
    var Shape = (function () {
        function Shape(shape, config) {
            this.stage = null;
            this.shape = shape;
            config = Util.extend({
                x: 0,
                y: 0,
                pivotX: 0,
                pivotY: 0,
                scaleX: 1,
                scaleY: 1,
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
        Shape.prototype.getAttr = function (attr) {
            return this.attrs[attr];
        };
        Shape.prototype.setAttrs = function (config) {
            this.attrs = Util.extend(this.attrs, config);
            this.draw();
        };
        Shape.prototype.draw = function () {
            this.shape.visible = this.attrs.visible;
            this.shape.position.x = this.attrs.x;
            this.shape.position.y = this.attrs.y;
            this.shape.rotation = this.attrs.rotation;
            this.shape.scale = new PIXI.Point(this.attrs.scaleX, this.attrs.scaleY);
            this.shape.pivot = new PIXI.Point(this.attrs.pivotX, this.attrs.pivotY);
            var filters = [];
            if (this.attrs.blur > 0) {
                var blur = new PIXI.BlurFilter();
                blur.blur = this.attrs.blur;
                filters.push(blur);
            }
            if (this.attrs.sepia > 0) {
                var sepiaFilter = new PIXI.SepiaFilter();
                sepiaFilter.sepia = this.attrs.sepia;
                filters.push(sepiaFilter);
            }
            if (this.attrs.invert > 0) {
                var invertFilter = new PIXI.InvertFilter();
                invertFilter.invert = this.attrs.invert;
                filters.push(invertFilter);
            }
            if (this.attrs.gray > 0) {
                var grayFilter = new PIXI.GrayFilter();
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
                this.shape.filters = filters;
            }
            else {
                this.shape.filters = null;
            }
        };
        Shape.prototype.show = function () {
            this.attrs.visible = true;
            this.shape.visible = true;
        };
        Shape.prototype.hide = function () {
            this.attrs.visible = false;
            this.shape.visible = false;
        };
        Shape.prototype.setPostion = function (x, y) {
            this.attrs.x = x;
            this.attrs.y = y;
            this.shape.position.x = this.attrs.x;
            this.shape.position.y = this.attrs.y;
        };
        Shape.prototype.move = function (offsetX, offsetY) {
            this.setPostion(this.attrs.x + offsetX, this.attrs.y + offsetY);
        };
        Shape.prototype.setRotation = function (angle) {
            this.attrs.rotation = angle;
            this.shape.rotation = angle;
        };
        Shape.prototype.rotate = function (offsetAngle) {
            this.setRotation(this.attrs.rotation + offsetAngle);
        };
        Shape.prototype.scale = function (x, y) {
            this.attrs.scaleX = x;
            this.attrs.scaleY = y;
            this.shape.scale = new PIXI.Point(x, y);
        };
        Shape.prototype.setPivot = function (x, y) {
            this.attrs.pivotX = x;
            this.attrs.pivotY = y;
            this.shape.pivot = new PIXI.Point(x, y);
        };
        Shape.prototype.tween = function (duration, to, easing) {
            return new Pixis.Tween({
                shape: this,
                duration: duration,
                to: to
            }, [], easing);
        };
        return Shape;
    })();
    Pixis.Shape = Shape;
    var GraphicsShape = (function (_super) {
        __extends(GraphicsShape, _super);
        function GraphicsShape(config) {
            config = Util.extend({
                fill: null,
                opacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                hitArea: null
            }, config);
            _super.call(this, new PIXI.Graphics(), config);
            if (this.attrs.hitArea && this.attrs.hitArea.type != Pixis.HitAreaType.None) {
                this.shape.interactive = true;
                switch (this.attrs.hitArea.type) {
                    case Pixis.HitAreaType.Box:
                        this.shape.hitArea = this.calHitAreaBox();
                        break;
                }
            }
        }
        GraphicsShape.prototype.calHitAreaBox = function () {
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
        };
        GraphicsShape.prototype.draw = function () {
            if (this.attrs.stroke) {
                this.shape.lineStyle(this.attrs.strokeWidth, this.attrs.stroke, this.attrs.strokeOpacity);
            }
            if (this.attrs.fill) {
                this.shape.beginFill(this.attrs.fill, this.attrs.opacity);
            }
            _super.prototype.draw.call(this);
        };
        GraphicsShape.prototype.setAttrs = function (config) {
            this.attrs = Util.extend(this.attrs, config);
            this.shape.clear();
            this.draw();
        };
        GraphicsShape.prototype.clear = function () {
            this.shape.clear();
        };
        return GraphicsShape;
    })(Shape);
    Pixis.GraphicsShape = GraphicsShape;
    var Util;
    (function (Util) {
        function extend(destination, source) {
            if (source) {
                for (var property in source)
                    if (typeof (source[property]) !== "undefined")
                        destination[property] = source[property];
            }
            return destination;
        }
        Util.extend = extend;
        function getColorInt(str) {
            return parseInt(str.substring(1), 16);
        }
        Util.getColorInt = getColorInt;
        function getRgb(color) {
            var rgb = { r: 0, g: 0, b: 0 };
            rgb.b = color % 0x100;
            color = Math.floor(color / 0x100);
            rgb.g = color % 0x100;
            color = Math.floor(color / 0x100);
            rgb.r = color % 0x100;
            color = Math.floor(color / 0x100);
            return rgb;
        }
        Util.getRgb = getRgb;
        function getColor(r, g, b) {
            return Math.round(r) * 0x10000 + Math.round(g) * 0x100 + Math.round(b);
        }
        Util.getColor = getColor;
        function getColorString(num) {
            return num != null ? "#" + num.toString(16) : null;
        }
        Util.getColorString = getColorString;
    })(Util = Pixis.Util || (Pixis.Util = {}));
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Animation = (function () {
        function Animation(animate, length, opts) {
            var _this = this;
            this.stopped = false;
            this.elapse = 0;
            Pixis.Util.extend(opts, opts || {
                isToward: true,
                finished: function () {
                }
            });
            this.tag = opts.tag;
            this.isToward = opts.isToward;
            this.total = length ? length * 1000 : null;
            if (!this.isToward) {
                this.elapse = this.total;
            }
            this.animate = function (timespan) {
                if (_this.isTerminated(timespan))
                    return false;
                return animate(timespan, _this.tag);
            };
            this.terminate = opts.finished;
        }
        Animation.prototype.isTerminated = function (span) {
            if (this.total) {
                if (this.isToward) {
                    this.elapse += span;
                    if (this.elapse >= this.total) {
                        return true;
                    }
                }
                else {
                    this.elapse -= span;
                    if (this.elapse <= 0) {
                        return true;
                    }
                }
            }
            return false;
        };
        return Animation;
    })();
    Pixis.Animation = Animation;
    var Tween = (function () {
        function Tween(config, tweens, easing) {
            var _this = this;
            this.begin = {};
            this.change = {};
            this.animation = null;
            this.toward = true;
            this.shape = config.shape;
            this.to = config.to;
            this.easing = easing || Pixis.Easings.Linear;
            this.duration = config.duration;
            var attrs = {}, property, value;
            for (property in this.to) {
                value = this.shape.getAttr(property);
                if (value != undefined) {
                    switch (property) {
                        case "fill":
                        case "stroke":
                            this.begin[property] = Pixis.Util.getRgb(value);
                            var to = Pixis.Util.getRgb(this.to[property]);
                            this.change[property] = {
                                r: to.r - this.begin[property].r,
                                g: to.g - this.begin[property].g,
                                b: to.b - this.begin[property].b
                            };
                            break;
                        default:
                            this.begin[property] = value;
                            this.change[property] = this.to[property] - value;
                    }
                }
            }
            this.animation = new Animation(function () {
                for (var p in _this.change) {
                    switch (p) {
                        case "fill":
                        case "stroke":
                            var r = _this.easing(_this.animation.elapse, _this.begin[p].r, _this.change[p].r, _this.animation.total);
                            var g = _this.easing(_this.animation.elapse, _this.begin[p].g, _this.change[p].g, _this.animation.total);
                            var b = _this.easing(_this.animation.elapse, _this.begin[p].b, _this.change[p].b, _this.animation.total);
                            attrs[p] = Pixis.Util.getColor(r, g, b);
                            break;
                        default:
                            attrs[p] = _this.easing(_this.animation.elapse, _this.begin[p], _this.change[p], _this.animation.total);
                            break;
                    }
                }
                _this.shape.setAttrs(attrs);
                return true;
            }, this.duration, { isToward: this.toward });
            this.animation.stopped = true;
        }
        Tween.prototype.animate = function (done) {
            this.animation.isToward = this.toward;
            this.animation.terminate = done || (function () {
            });
            return this.resume();
        };
        Tween.prototype.play = function (done) {
            this.toward = true;
            return this.animate(done);
        };
        Tween.prototype.reverse = function (done) {
            this.toward = false;
            return this.animate(done);
        };
        Tween.prototype.replay = function (done) {
            this.toward = true;
            this.animation.elapse = 0;
            return this.animate(done);
        };
        Tween.prototype.pause = function () {
            if (this.animation) {
                this.animation.stopped = true;
            }
            return this;
        };
        Tween.prototype.resume = function () {
            if (this.shape.stage && this.animation && this.animation.stopped) {
                this.animation.stopped = false;
                this.shape.stage.addAnimation(this.animation);
            }
            return this;
        };
        return Tween;
    })();
    Pixis.Tween = Tween;
    Pixis.Easings = {
        /**
        * back ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseIn': function (t, b, c, d) {
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        /**
        * back ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseOut': function (t, b, c, d) {
            var s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        /**
        * back ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseInOut': function (t, b, c, d) {
            var s = 1.70158;
            if ((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        /**
        * elastic ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseIn': function (t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        /**
        * elastic ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseOut': function (t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        /**
        * elastic ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseInOut': function (t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) == 2) {
                return b + c;
            }
            if (!p) {
                p = d * (0.3 * 1.5);
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        },
        /**
        * bounce ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseOut': function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            }
            else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            }
            else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            }
            else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
            }
        },
        /**
        * bounce ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseIn': function (t, b, c, d) {
            return c - Pixis.Easings.BounceEaseOut(d - t, 0, c, d) + b;
        },
        /**
        * bounce ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseInOut': function (t, b, c, d) {
            if (t < d / 2) {
                return Pixis.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
            }
            else {
                return Pixis.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        },
        /**
        * ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseIn': function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        /**
        * ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseOut': function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        /**
        * ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseInOut': function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        /**
        * strong ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseIn': function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        /**
        * strong ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseOut': function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        /**
        * strong ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseInOut': function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        /**
        * linear
        * @function
        * @memberof Kinetic.Easings
        */
        'Linear': function (t, b, c, d) {
            return c * t / d + b;
        }
    };
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Arc = (function (_super) {
        __extends(Arc, _super);
        function Arc(config) {
            config = Pixis.Util.extend({ clockwise: false }, config);
            _super.call(this, config);
        }
        Arc.prototype.draw = function () {
            _super.prototype.draw.call(this);
            //this.shape.moveTo(0, 0);
            // this.shape.drawCircle(0, 0, this.attrs.outerRadius);
            //this.shape.lineTo(-this.attrs.outerRadius, 0);
            this.shape.moveTo(this.attrs.innerRadius, 0);
            this.shape.lineTo(this.attrs.outerRadius, 0);
            this.shape.arc(0, 0, this.attrs.outerRadius, 0, this.attrs.angle, this.attrs.clockwise);
            this.shape.lineTo(this.attrs.innerRadius * Math.cos(this.attrs.angle), this.attrs.innerRadius * Math.sin(this.attrs.angle));
            this.shape.arc(0, 0, this.attrs.innerRadius, this.attrs.angle, 0, !this.attrs.clockwise);
            this.shape.lineTo(this.attrs.innerRadius, 0);
        };
        return Arc;
    })(Pixis.GraphicsShape);
    Pixis.Arc = Arc;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle(config) {
            config = Pixis.Util.extend({ radius: 100 }, config);
            _super.call(this, config);
        }
        Circle.prototype.draw = function () {
            _super.prototype.draw.call(this);
            this.shape.drawCircle(0, 0, this.attrs.radius);
        };
        return Circle;
    })(Pixis.GraphicsShape);
    Pixis.Circle = Circle;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Draw = (function (_super) {
        __extends(Draw, _super);
        function Draw(config) {
            config.draw = config.draw || (function () {
            });
            this.canvas = document.createElement('canvas');
            this.canvas.width = config.width;
            this.canvas.height = config.height;
            this.ctx = this.canvas.getContext('2d');
            _super.call(this, new PIXI.Sprite(PIXI.Texture.fromCanvas(this.canvas)), config);
        }
        Draw.prototype.draw = function () {
            _super.prototype.draw.call(this);
            this.ctx.beginPath();
            this.attrs.draw(this.ctx);
        };
        Draw.prototype.redraw = function (draw) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.attrs.draw = draw;
            this.draw();
            this.shape.texture.baseTexture.dirty();
        };
        Draw.prototype.clean = function () {
            this.shape.texture.destroy(false);
        };
        return Draw;
    })(Pixis.Shape);
    Pixis.Draw = Draw;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(config) {
            _super.call(this, new PIXI.DisplayObjectContainer(), config);
        }
        Group.prototype.add = function (child) {
            this.shape.addChild(child.shape);
        };
        Group.prototype.removeAll = function () {
            var shape = this.shape;
            while (shape.children.length > 0) {
                shape.removeChild(shape.children[0]);
            }
        };
        return Group;
    })(Pixis.Shape);
    Pixis.Group = Group;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var ImageTexture = (function () {
        function ImageTexture(src) {
            this.src = src;
            this.texture = PIXI.Texture.fromImage(src);
            //this.onLoaded = (onTextureUpdate: (image: ImageTexture) => void) => {
            //    this.texture.addEventListener("update", () => { onTextureUpdate(this); });
            //};
        }
        //public load(onloaded: (texture: ImageTexture) => void= () => { }) {
        //    this.texture = PIXI.Texture.fromImage(this.src);
        //    this.texture.addEventListener("update", () => { alert(" onloaded(this)"); });
        //    onloaded(this);
        //}
        ImageTexture.loadAll = function (images, loaded) {
            //var imageLoader = new PIXI.ImageLoader("http://www.goodboydigital.com/pixijs/logo_small.png", true);
            //imageLoader.addEventListener("loaded", onComplete);
            //imageLoader.load();
            //renderer.render(stage);
            if (loaded === void 0) { loaded = function () {
            }; }
            //function onComplete(e) {
            //    console.log("event data: ", e);
            //    var bunny = new PIXI.Sprite(e.content.texture);
            //    bunny.position = new PIXI.Point(200, 150);
            //    stage.addChild(bunny);
            //    renderer.render(stage);
            //}
            //if (images) {
            //    var count = 0;
            //    if (typeof (images) == 'object') {
            //        for (var key in images) {
            //            count++;
            //            var image: ImageTexture = images[key];
            //            image.onLoaded(() => {
            //                count--;
            //                if (count == 0) {
            //                    loaded();
            //                }
            //            });
            //        }
            //    } else if (images instanceof Array) {
            //        count = (<Array<Pixis.ImageTexture>>images).length;
            //        (<Array<Pixis.ImageTexture>>images).forEach((img) => {
            //            img.onLoaded(() => {
            //                count--;
            //                if (count == 0) {
            //                    loaded();
            //                }
            //            });
            //        });
            //    }
            //} else {
            //    loaded();
            //}
        };
        return ImageTexture;
    })();
    Pixis.ImageTexture = ImageTexture;
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image(config) {
            _super.call(this, new PIXI.Sprite(config.image.texture), config);
        }
        return Image;
    })(Pixis.Shape);
    Pixis.Image = Image;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(config) {
            config = Pixis.Util.extend({ points: null, closed: false }, config);
            _super.call(this, config);
        }
        Line.prototype.draw = function () {
            _super.prototype.draw.call(this);
            if (this.attrs.points && this.attrs.points.length >= 2) {
                var startPoint = this.attrs.points[0];
                this.shape.moveTo(startPoint.x, startPoint.y);
                for (var i = 1; i < this.attrs.points.length; i++) {
                    var point = this.attrs.points[i];
                    this.shape.lineTo(point.x, point.y);
                }
                if (this.attrs.colosed)
                    this.shape.lineTo(startPoint.x, startPoint.y);
            }
        };
        return Line;
    })(Pixis.GraphicsShape);
    Pixis.Line = Line;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Path = (function (_super) {
        __extends(Path, _super);
        function Path(config) {
            config = Pixis.Util.extend({ data: "" }, config);
            _super.call(this, config);
        }
        Path.prototype.draw = function () {
            _super.prototype.draw.call(this);
            var closedPath = false;
            var ca = parsePathData(this.attrs.data);
            var start = null;
            for (var n = 0; n < ca.length; n++) {
                if (start == null)
                    start = ca[n];
                var c = ca[n].command;
                var p = ca[n].points;
                switch (c) {
                    case 'L':
                        this.shape.lineTo(p[0], p[1]);
                        break;
                    case 'M':
                        this.shape.moveTo(p[0], p[1]);
                        break;
                    case 'C':
                        this.shape.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                        break;
                    case 'Q':
                        this.shape.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                        break;
                    case 'A':
                        var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                        var r = (rx > ry) ? rx : ry;
                        var scaleX = (rx > ry) ? 1 : rx / ry;
                        var scaleY = (rx > ry) ? ry / rx : 1;
                        this.move(cx, cy);
                        this.rotate(psi);
                        this.shape.scale = new PIXI.Point(scaleX, scaleY);
                        this.shape.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                        this.shape.scale = new PIXI.Point(1 / scaleX, 1 / scaleY);
                        this.rotate(-psi);
                        this.move(-cx, -cy);
                        break;
                    case 'z':
                        //context.closePath();
                        this.shape.lineTo(start.points[0], start.points[1]);
                        start = null;
                        closedPath = true;
                        break;
                }
            }
            //if (closedPath) {
            //    context.fillStrokeShape(this);
            //}
            //else {
            //    context.strokeShape(this);
            //}
        };
        return Path;
    })(Pixis.GraphicsShape);
    Pixis.Path = Path;
    //#region 
    function convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
        // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        var psi = psiDeg * (Math.PI / 180.0);
        var xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
        var yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;
        var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        var f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));
        if (fa === fs) {
            f *= -1;
        }
        if (isNaN(f)) {
            f = 0;
        }
        var cxp = f * rx * yp / ry;
        var cyp = f * -ry * xp / rx;
        var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
        var vMag = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        var vRatio = function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        };
        var vAngle = function (u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        };
        var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        var u = [(xp - cxp) / rx, (yp - cyp) / ry];
        var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        var dTheta = vAngle(u, v);
        if (vRatio(u, v) <= -1) {
            dTheta = Math.PI;
        }
        if (vRatio(u, v) >= 1) {
            dTheta = 0;
        }
        if (fs === 0 && dTheta > 0) {
            dTheta = dTheta - 2 * Math.PI;
        }
        if (fs === 1 && dTheta < 0) {
            dTheta = dTheta + 2 * Math.PI;
        }
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    }
    function getLineLength(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    function getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
        var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
        var pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta)
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi)
        };
    }
    function getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        var CB1 = function (t) {
            return t * t * t;
        };
        var CB2 = function (t) {
            return 3 * t * t * (1 - t);
        };
        var CB3 = function (t) {
            return 3 * t * (1 - t) * (1 - t);
        };
        var CB4 = function (t) {
            return (1 - t) * (1 - t) * (1 - t);
        };
        var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
        return {
            x: x,
            y: y
        };
    }
    function getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        var QB1 = function (t) {
            return t * t;
        };
        var QB2 = function (t) {
            return 2 * t * (1 - t);
        };
        var QB3 = function (t) {
            return (1 - t) * (1 - t);
        };
        var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
        return {
            x: x,
            y: y
        };
    }
    function calcLength(x, y, cmd, points) {
        var len, p1, p2, t;
        switch (cmd) {
            case 'L':
                return getLineLength(x, y, points[0], points[1]);
            case 'C':
                // Approximates by breaking curve into 100 line segments
                len = 0.0;
                p1 = getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'Q':
                // Approximates by breaking curve into 100 line segments
                len = 0.0;
                p1 = getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'A':
                // Approximates by breaking curve into line segments
                len = 0.0;
                var start = points[4];
                // 4 = theta
                var dTheta = points[5];
                // 5 = dTheta
                var end = points[4] + dTheta;
                var inc = Math.PI / 180.0;
                // 1 degree resolution
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                p1 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                if (dTheta < 0) {
                    for (t = start - inc; t > end; t -= inc) {
                        p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                else {
                    for (t = start + inc; t < end; t += inc) {
                        p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                return len;
        }
        return 0;
    }
    function parsePathData(data) {
        // Path Data Segment must begin with a moveTo
        //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
        //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
        //l (x y)+  Relative lineTo
        //L (x y)+  Absolute LineTo
        //h (x)+    Relative horizontal lineTo
        //H (x)+    Absolute horizontal lineTo
        //v (y)+    Relative vertical lineTo
        //V (y)+    Absolute vertical lineTo
        //z (closepath)
        //Z (closepath)
        //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
        //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
        //q (x1 y1 x y)+       Relative Quadratic Bezier
        //Q (x1 y1 x y)+       Absolute Quadratic Bezier
        //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
        //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
        //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
        //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
        //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
        //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc
        // return early if data is not defined
        if (!data) {
            return [];
        }
        // command string
        var cs = data;
        // command chars
        var cc = ['m', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z', 'c', 'C', 'q', 'Q', 't', 'T', 's', 'S', 'a', 'A'];
        // convert white spaces to commas
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        for (var n = 0; n < cc.length; n++) {
            cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
        }
        // create array
        var arr = cs.split('|');
        var ca = [];
        // init context point
        var cpx = 0;
        var cpy = 0;
        for (n = 1; n < arr.length; n++) {
            var str = arr[n];
            var c = str.charAt(0);
            str = str.slice(1);
            // remove ,- for consistency
            str = str.replace(new RegExp(',-', 'g'), '-');
            // add commas so that it's easy to split
            str = str.replace(new RegExp('-', 'g'), ',-');
            str = str.replace(new RegExp('e,-', 'g'), 'e-');
            var pString = str.split(','), p = [];
            if (pString.length > 0 && pString[0] === '') {
                pString.shift();
            }
            for (var i = 0; i < pString.length; i++) {
                p.push(parseFloat(pString[i]));
            }
            while (p.length > 0) {
                if (isNaN(p[0])) {
                    break;
                }
                var cmd = null;
                var points = [];
                var startX = cpx, startY = cpy;
                // Move var from within the switch to up here (jshint)
                var prevCmd, ctlPtx, ctlPty; // Ss, Tt
                var rx, ry, psi, fa, fs, x1, y1; // Aa
                switch (c) {
                    case 'l':
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'L':
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'm':
                        var dx = p.shift();
                        var dy = p.shift();
                        cpx += dx;
                        cpy += dy;
                        cmd = 'M';
                        // After closing the path move the current position 
                        // to the the first point of the path (if any). 
                        if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                            for (var idx = ca.length - 2; idx >= 0; idx--) {
                                if (ca[idx].command === 'M') {
                                    cpx = ca[idx].points[0] + dx;
                                    cpy = ca[idx].points[1] + dy;
                                    break;
                                }
                            }
                        }
                        points.push(cpx, cpy);
                        c = 'l';
                        break;
                    case 'M':
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'L';
                        break;
                    case 'h':
                        cpx += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'H':
                        cpx = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'v':
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'V':
                        cpy = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'C':
                        points.push(p.shift(), p.shift(), p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'c':
                        points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'S':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 's':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'Q':
                        points.push(p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'q':
                        points.push(cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(cpx, cpy);
                        break;
                    case 'T':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 't':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 'A':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'A';
                        points = convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                    case 'a':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'A';
                        points = convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                }
                ca.push({
                    command: cmd || c,
                    points: points,
                    start: {
                        x: startX,
                        y: startY
                    },
                    pathLength: calcLength(startX, startY, cmd || c, points)
                });
            }
            if (c === 'z' || c === 'Z') {
                ca.push({
                    command: 'z',
                    points: [],
                    start: undefined,
                    pathLength: 0
                });
            }
        }
        return ca;
    }
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Rect = (function (_super) {
        __extends(Rect, _super);
        function Rect(config) {
            config = Pixis.Util.extend({ width: 100, height: 100, cornerRadius: 0 }, config);
            _super.call(this, config);
        }
        Rect.prototype.draw = function () {
            _super.prototype.draw.call(this);
            var cornerRadius = this.attrs.cornerRadius, width = this.attrs.width, height = this.attrs.height;
            if (!cornerRadius || cornerRadius <= 0) {
                this.shape.drawRect(0, 0, width, height);
            }
            else {
                this.shape.moveTo(cornerRadius, 0);
                this.shape.lineTo(width - cornerRadius, 0);
                this.shape.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
                this.shape.lineTo(width, height - cornerRadius);
                this.shape.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
                this.shape.lineTo(cornerRadius, height);
                this.shape.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
                this.shape.lineTo(0, cornerRadius);
                this.shape.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);
            }
        };
        Rect.prototype.calHitAreaBox = function () {
            return new PIXI.Rectangle(0, 0, this.attrs.width, this.attrs.height);
        };
        return Rect;
    })(Pixis.GraphicsShape);
    Pixis.Rect = Rect;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var RegularPolygon = (function (_super) {
        __extends(RegularPolygon, _super);
        function RegularPolygon(config) {
            config = Pixis.Util.extend({ sides: 3, radius: 100 }, config);
            _super.call(this, config);
        }
        RegularPolygon.prototype.draw = function () {
            var sides = this.attrs.sides, radius = this.attrs.radius, n, x, y;
            if (sides >= 3) {
                _super.prototype.draw.call(this);
                this.shape.moveTo(0, 0 - radius);
                for (n = 1; n < sides; n++) {
                    x = radius * Math.sin(n * 2 * Math.PI / sides);
                    y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
                    this.shape.lineTo(x, y);
                }
                this.shape.lineTo(0, 0 - radius);
            }
        };
        return RegularPolygon;
    })(Pixis.GraphicsShape);
    Pixis.RegularPolygon = RegularPolygon;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Star = (function (_super) {
        __extends(Star, _super);
        function Star(config) {
            _super.call(this, config);
        }
        Star.prototype.draw = function () {
            _super.prototype.draw.call(this);
            var innerRadius = this.attrs.innerRadius, outerRadius = this.attrs.outerRadius, numPoints = this.attrs.numPoints;
            this.shape.moveTo(0, 0 - outerRadius);
            for (var n = 1; n < numPoints * 2; n++) {
                var radius = n % 2 === 0 ? outerRadius : innerRadius;
                var x = radius * Math.sin(n * Math.PI / numPoints);
                var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
                this.shape.lineTo(x, y);
            }
            this.shape.lineTo(0, 0 - outerRadius);
        };
        return Star;
    })(Pixis.GraphicsShape);
    Pixis.Star = Star;
})(Pixis || (Pixis = {}));
var Pixis;
(function (Pixis) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(config) {
            //config = Util.extend({ fill: "transparent", align: "left", width: 0 }, config);
            _super.call(this, new PIXI.Text(config.text, {
                font: config.font,
                fill: Pixis.Util.getColorString(config.fill),
                //align: config.align,
                stroke: Pixis.Util.getColorString(config.stroke),
                strokeThickness: config.strokeWidth
            }), config);
        }
        Text.prototype.updatePosition = function () {
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
        };
        Text.prototype.draw = function () {
            this.shape.setText(this.attrs.text);
            this.shape.setStyle({
                font: this.attrs.font,
                fill: Pixis.Util.getColorString(this.attrs.fill),
                stroke: Pixis.Util.getColorString(this.attrs.stroke),
                strokeThickness: this.attrs.strokeWidth
            });
            _super.prototype.draw.call(this);
            this.updatePosition();
        };
        Text.prototype.setAttrs = function (config) {
            this.attrs = Pixis.Util.extend(this.attrs, config);
            this.draw();
        };
        Text.prototype.setText = function (text) {
            this.attrs.text = text;
            this.shape.setText(text);
            //this.shape.updateBounds();
            this.updatePosition();
        };
        return Text;
    })(Pixis.Shape);
    Pixis.Text = Text;
})(Pixis || (Pixis = {}));
//# sourceMappingURL=pixis.js.map