# Pixis.JS
Inspired by [KineticJS](https://github.com/lavrton/KineticJS) and based on [pixi.js](https://github.com/GoodBoyDigital/pixi.js/). With “Pixis” you can easily create any shapes, like circle, rectangle, star or svg path, and move, resize, change color. Even animate the shape.

### Example
```javascript
// create a 500x500 stage 
var stage = new Pixis.Stage(500, 500, document.getElementById("stage")); 
// create a circle 
var circle = new Pixis.Circle({ 
    x: 10, 
    y: 20, 
    stroke: 0xA8ADBF, 
    strokeWidth: 1, 
    strokeOpacity: 0.3, 
    fill: 0xAB946D, 
    radius: 5, 
    blur: 50 
}); 
 
// add the circle to the stage 
stage.add(circle); 

// create an animation 
var tween = stage.tween(circle, 0.5, { 
    fill: 0x4D4B69, 
    strokeOpacity: 1, 
    x: 500, 
    y: 390, 
    blur: 0 
}, Pixis.Easings.EaseInOut); 

//play the animation and reverse the animation when it’s finished 
tween.play(function () { 
    tween.reverse(); 
});
```

### Todo's
 - Sample code

License
----
MIT
