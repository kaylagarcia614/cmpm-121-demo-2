import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const drawingChanged = new CustomEvent("drawing-changed");
import { Line, CursorCommand } from "./elements";
//GAME SETUP/////////////////////////////////////
const gameName = "Doodle It";
document.title = gameName;
const header = document.createElement("h1");
header.id = "game-name";
header.innerHTML = gameName;
app.append(header);
type ClickHandler = () => void;
const cursor = { active: false, x: 0, y: 0 };
const cursorChanged = new CustomEvent("cursor-changed");
let drawing: Line[] = [];
let currentDrawing: Line | null = new Line();
let redoDrawing: Line[] = [];
let cursorCommand: CursorCommand | null = null;
//////////////////////////////////////////////

///////////BUTTONS//////////////////
addButton("clear", eraseCanvas);
addButton("undo", undoCanvas);
addButton("redo", redoCanvas);
app.append(document.createElement("br"));
///////////////////////////////////

///BUILD CANVAS/////////////////
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);
addCanvasEvents();
app.append(document.createElement("br"));
canvas.style.cursor = "none";
//////////////////////////////////////////////

app.append(document.createElement("br"));
const thickSlider = addThicknessSlider();

///////DRAWING///////////////////
function addCanvasEvents() {
    canvas.addEventListener("mousedown", (event) => {
        cursor.active = true;
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentDrawing = new Line(thickSlider.value);
        drawing.push(currentDrawing);
        redoDrawing.splice(0, redoDrawing.length);
        currentDrawing.drag(cursor.x, cursor.y);

        canvas.dispatchEvent(drawingChanged);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (cursor.active) {
            cursor.x = event.offsetX;
            cursor.y = event.offsetY;
            currentDrawing!.drag(cursor.x, cursor.y);
            redoDrawing = [];

            canvas.dispatchEvent(drawingChanged);
        }
    });

    canvas.addEventListener("mouseup", () => {
        cursor.active = false;
        currentDrawing = null;
    });

    canvas.addEventListener("drawing-changed", () => {
        drawIT();
    });
}

canvas.addEventListener("cursor-changed", () => {
    drawIT();
});

//Cursor events
canvas.addEventListener("mouseout", () => {
    cursorCommand = null;
    canvas.dispatchEvent(cursorChanged);
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
    canvas.dispatchEvent(cursorChanged);
});

canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
    canvas.dispatchEvent(cursorChanged);
});

//////////////////////////////////////////////

//CLEAR BUTTON/////////////////
function eraseCanvas() {
    redoDrawing = drawing;
    drawing = [];
    clearCanvas();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 256, 256);
}

//////////////////////////////////////////////

/////DRAW IT FOR REAL/////////////////////////

function drawIT() {
    clearCanvas();
    const lineWidthBefore = ctx.lineWidth;
    if (cursorCommand) {
        cursorCommand.display(ctx);
    }
    drawing.forEach((l) => {
        l.display(ctx);
    });
    ctx.lineWidth = lineWidthBefore;
}
//////////////////////////////////////////////

//////undo///////////////////////////////////
function undoCanvas() {
    if (drawing.length == 0) {
        return;
    }
    redoDrawing.push(drawing.pop()!);
    canvas.dispatchEvent(drawingChanged);
}
///////////////////////////////////////////////

///////////////redo///////////////////////////
function redoCanvas() {
    if (redoDrawing.length == 0) {
        return;
    }
    drawing.push(redoDrawing.pop()!);
    canvas.dispatchEvent(drawingChanged);
}

///////////////////////////////////////////////

///////CLICKING ABLILITY//////////////////////
function addButton(text: string, funct: ClickHandler) {
    const button = document.createElement("button");
    button.innerHTML = text;
    app.append(button);

    //click
    button.addEventListener("click", () => {
        funct();
    });
}
//////////////////////////////////////////////////

/////////////////THICKNESS SLIDER/////////////////
function addThicknessSlider() {
    const thickness = document.createElement("input");
    thickness.type = "range";
    thickness.min = "1";
    thickness.max = "5";
    thickness.value = "1";

    thickness.addEventListener("input", () => {
        changeThickness(parseInt(thickness.value));
    });

    const label = document.createElement("label");
    label.textContent = "Thickness: ";

    app.append(label);
    app.append(thickness);
    return thickness;
}

function changeThickness(value: number) {
    ctx.lineWidth = value;
    drawIT();
}
//////////////////////////////////////////////////
