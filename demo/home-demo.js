/// <reference path="../scripts/typings/box2d/box2dweb.d.ts" />
var radius = 0.4;
var scale = 30.0;
var b2Vec2 = Box2D.Common.Math.b2Vec2, b2AABB = Box2D.Collision.b2AABB, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw, b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
function init() {
    var world = new b2World(new b2Vec2(0, 0), true);
    function collision(userData) {
        if (userData != null) {
            shapeList[parseInt(userData)].collision();
        }
    }
    //linsterner
    var b2Listener = Box2D.Dynamics.b2ContactListener;
    //Add listeners for contact
    var listener = new b2Listener;
    listener.PostSolve = function (contact, impulse) {
        var force = impulse.normalImpulses[0];
        if (force > 0) {
            collision(contact.GetFixtureA().GetBody().GetUserData());
            collision(contact.GetFixtureB().GetBody().GetUserData());
            if (force > 7) {
                var worldManifold = new Box2D.Collision.b2WorldManifold();
                contact.GetWorldManifold(worldManifold);
                var point = worldManifold.m_points[0];
                //var point = geo2d.vector.productNum(worldManifold.m_points[0], config.scale);
                var l = Math.random() * 3 + 5;
                for (i = 0; i < l; i++) {
                    explode(point.x * scale, point.y * scale, 5, 0xffffff, explosion);
                }
            }
        }
    };
    world.SetContactListener(listener);
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 2;
    fixDef.restitution = 1;
    var bodyDef = new b2BodyDef;
    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(20, 2);
    bodyDef.position.Set(10, 400 / 30 + 1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(10, -1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    fixDef.shape.SetAsBox(2, 14);
    bodyDef.position.Set(-1.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(21.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    var stage = new Pixis.Stage(600, 400, document.getElementById("stage"), { webgl: false });
    var back = new Pixis.Image({
        x: 0,
        y: 0,
        image: new Pixis.ImageTexture("demo/home-demo.jpg")
    });
    stage.add(back);
    var warm = new Worm(stage);
    var explosion = new Pixis.Group({});
    stage.add(explosion);
    stage.add(new Pixis.Text({
        x: 380,
        y: 360,
        fill: 0x888888,
        font: "18px Arial",
        text: "Click to drive the triangles"
    }));
    var shapeList = [];
    //create some objects
    bodyDef.type = b2Body.b2_dynamicBody;
    for (var i = 0; i < 30; ++i) {
        fixDef.shape = new b2CircleShape(radius);
        bodyDef.position.x = Math.random() * 10;
        bodyDef.position.y = Math.random() * 10;
        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        shapeList.push(new Shape(i, body, stage, explosion, bodyDef.position.x, bodyDef.position.y));
    }
    var meter = new FPSMeter(document.body, {
        theme: 'transparent',
        heat: true,
        graph: true
    });
    stage.startAnim(function () {
        shapeList.forEach(function (s) {
            s.animate();
        });
        warm.animate();
        meter.tick();
    });
    function getCellByMouseData(mouseData) {
        var localCoordsPosition = mouseData.getLocalPosition(stage.stage);
        var x = localCoordsPosition.x, y = localCoordsPosition.y;
        return { x: x, y: y };
    }
    stage.stage.touchstart = stage.stage.mousedown = function (mouseData) {
        var position = getCellByMouseData(mouseData);
        var hit = new Pixis.Circle({
            x: position.x,
            y: position.y,
            stroke: 0xFFFF00,
            strokeWidth: 3,
            radius: 1
        });
        stage.add(hit);
        hit.tween(1, {
            radius: 40,
            strokeOpacity: 0
        }).play({
            done: function () {
                hit.clear();
            }
        });
        shapeList.forEach(function (s) {
            s.impulse(position);
        });
    };
    shapeList.forEach(function (s) {
        s.impulse({ x: 600 * Math.random(), y: 400 * Math.random() });
    });
    //setup debug draw
    //var debugDraw = new b2DebugDraw();
    //debugDraw.SetSprite((<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d"));
    //debugDraw.SetDrawScale(scale);
    //debugDraw.SetFillAlpha(0.5);
    //debugDraw.SetLineThickness(1.0);
    //debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //world.SetDebugDraw(debugDraw);
    window.setInterval(update, 1000 / 60);
    //update
    function update() {
        world.Step(1 / 60, 10, 10);
        world.DrawDebugData();
        world.ClearForces();
        shapeList.forEach(function (s) {
            s.sync();
        });
    }
}
function explode(x, y, size, color, explosion) {
    var v = { x: Math.random() * 3 * 2 - 3, y: Math.random() * 3 * 2 - 3 };
    var c = new Pixis.RegularPolygon({
        sides: 3,
        x: x + v.x,
        y: y + v.y,
        radius: size,
        fill: color,
        rotation: Math.random()
    });
    explosion.add(c);
    c.tween(1, {
        opacity: 0,
        x: x + v.x * 50,
        y: y + v.y * 50
    }).play({
        done: function () {
            c.clear();
        }
    });
}
var Shape = (function () {
    function Shape(index, body, stage, explosion, x, y) {
        body.SetUserData(index);
        var offset2 = { x: radius * scale / 4, y: 0 }, offset = { x: radius * scale / 6, y: 0 }, rotation = Math.random();
        this.group = new Pixis.Group({
            x: x * scale,
            y: y * scale
        });
        this.shape2 = new Pixis.RegularPolygon({
            sides: 3,
            radius: radius * 1.1 * scale,
            stroke: 0x4499d6,
            strokeWidth: 2,
            pivotX: offset2.x,
            pivotY: offset2.y,
            rotation: rotation
        });
        this.group.add(this.shape2);
        this.shape1 = new Pixis.RegularPolygon({
            sides: 3,
            radius: radius * 0.9 * scale,
            fill: 0xa0f69d,
            stroke: 0x4499d6,
            strokeWidth: 2,
            pivotX: offset.x,
            pivotY: offset.y,
            rotation: rotation
        });
        this.group.add(this.shape1);
        stage.add(this.group);
        this.body = body;
        this.stage = stage;
        this.explosion = explosion;
        this.step = (Math.random() - 0.5) * 0.2;
        this.collisionTween = this.shape1.tween(0.5, {
            fill: 0xFF0000,
            radius: 20
        });
    }
    Shape.prototype.animate = function () {
        this.shape1.rotate(-this.step);
        this.shape2.rotate(this.step);
    };
    Shape.prototype.sync = function () {
        var position = this.body.GetPosition();
        this.group.setPostion(position.x * scale, position.y * scale);
        if (Math.random() < 0.3) {
            explode(position.x * scale, position.y * scale, 3, this.shape1.getAttr("fill"), this.explosion);
        }
    };
    Shape.prototype.impulse = function (position) {
        var p = this.body.GetPosition(), x = position.x / scale - p.x, y = position.y / scale - p.y;
        this.body.ApplyImpulse(new b2Vec2(x, y), this.body.GetWorldCenter());
    };
    Shape.prototype.collision = function () {
        var _this = this;
        this.collisionTween.play({
            done: function () {
                _this.collisionTween.reverse();
            }
        });
    };
    return Shape;
})();
var Worm = (function () {
    function Worm(stage) {
        this.pointsNum = 50;
        this.width = 600;
        this.height = 400;
        this.points = [];
        for (var i = 0; i < this.pointsNum; i++) {
            this.points.push({ x: Math.random() * this.width, y: Math.random() * this.height });
        }
        this.worm = new Pixis.Line({
            points: this.points,
            fill: 0x020202,
            strokeWidth: 2,
            stroke: 0x010101,
            strokeOpacity: 0.4,
            closed: true,
            opacity: 0.2
        });
        stage.add(this.worm);
    }
    Worm.prototype.animate = function () {
        if (Math.random() < 0.1) {
            this.points[Math.floor(Math.random() * this.pointsNum)] = { x: Math.random() * this.width, y: Math.random() * this.height };
            this.worm.setAttrs({ points: this.points });
        }
    };
    return Worm;
})();
//# sourceMappingURL=home-demo.js.map