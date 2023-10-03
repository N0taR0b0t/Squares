let isDragging = false;
let square = null;
let draggedSquare = null;
let currentConstraint = null;  // Current active constraint for dragging
let dragPoint = null;  // The small invisible body to aid dragging

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

let engine;
let squares = [];
let inputFields = [];
let squareColors = [];

let heighty = 900;
let lengthx = 1200;

function getRandomColor() {
    const getRandomChannelValue = () => Math.floor(Math.random() * 256);

    while (true) {
        const red = getRandomChannelValue();
        const green = getRandomChannelValue();
        const blue = getRandomChannelValue();
        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        const maxChannel = Math.max(red, green, blue);
        const minChannel = Math.min(red, green, blue);
        const saturation = (maxChannel === 0) ? 0 : 1 - (minChannel / maxChannel);

        if (luminance > 0.4 && luminance < 0.6 && saturation > 0.4) {
            return color(red, green, blue);
        }
    }
}

function setup() {
    createCanvas(lengthx, heighty);
    engine = Engine.create();
    engine.world.gravity.y = 1.2;

    let ground = Bodies.rectangle(lengthx / 2, heighty - 5, lengthx, 5, { isStatic: true, friction: 5.0 });
    let leftWall = Bodies.rectangle(5, heighty / 2, 5, heighty, { isStatic: true, friction: 1.0 });
    let rightWall = Bodies.rectangle(lengthx - 5, heighty / 2, 5, heighty, { isStatic: true, friction: 1.0 });
    World.add(engine.world, [ground, leftWall, rightWall]);
}

function draw() {
    background(100);
    Engine.update(engine);

    for (let i = 0; i < squares.length; i++) {
        let body = squares[i];
        let colorValue = squareColors[i];
        push();
        fill(colorValue);
        translate(body.position.x, body.position.y);
        rotate(body.angle);
        rectMode(CENTER);
        rect(0, 0, body.width, body.height);
        textSize(20);
        textAlign(CENTER, CENTER);
        fill(0);
        text(inputFields[i].value(), 0, 0);
        pop();
    }

    if (dragPoint) {
        Matter.Body.setPosition(dragPoint, { x: mouseX, y: mouseY });
    } else if (isDragging && square) {
        let size = max(mouseX - square.x, mouseY - square.y);
        rectMode(CORNER);
        rect(square.x, square.y, size, size);
    }
}

function mousePressed() {
    let clickedSquares = Matter.Query.point(squares, createVector(mouseX, mouseY));
    if (clickedSquares.length) {
        draggedSquare = clickedSquares[0];

        // Storing the clicked point
        let clickedPoint = { x: mouseX - draggedSquare.position.x, y: mouseY - draggedSquare.position.y };
        
        dragPoint = Bodies.circle(mouseX, mouseY, 5, { isStatic: true, render: { visible: false } });
        World.add(engine.world, dragPoint);
        
        currentConstraint = Constraint.create({
            bodyA: dragPoint,
            bodyB: draggedSquare,
            pointB: clickedPoint,
            stiffness: 0.01,
            damping: 0.1
        });
        World.add(engine.world, currentConstraint);
    } else {
        isDragging = true;
        square = { x: mouseX, y: mouseY, width: 0, height: 0 };
    }
}

function mouseReleased() {
    if (currentConstraint) {
        World.remove(engine.world, currentConstraint);
        currentConstraint = null;
    }
    
    if (dragPoint) {
        World.remove(engine.world, dragPoint);
        dragPoint = null;
    }

    if (isDragging && mouseX <= lengthx) {
        isDragging = false;
        let size = max(mouseX - square.x, mouseY - square.y);
        if (square.x !== mouseX && square.y !== mouseY) {
            let body = Bodies.rectangle(square.x + size / 2, square.y + size / 2, size, size, {
                friction: 0.8,
                frictionStatic: 1.0,
                frictionAir: 0.01
            });
            body.width = size;
            body.height = size;
            let colorValue = getRandomColor();
            squareColors.push(colorValue);
            World.add(engine.world, [body]);
            squares.push(body);

            let inputField = createInput((inputFields.length + 1).toString());
            inputField.position(lengthx * 0.85 + 200, 30 * inputFields.length);
            inputFields.push(inputField);
        }
    }
}

setInterval(() => {
    // Placeholder for the functionality to increase square size
}, 3600000);
