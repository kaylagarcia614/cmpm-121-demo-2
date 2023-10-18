import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const drawingChanged = new CustomEvent("drawing-changed");
//GAME SETUP/////////////////////////////////////
const gameName = "Doodle It";
document.title = gameName;
const header = document.createElement("h1");
header.id = "game-name";
header.innerHTML = gameName;
app.append(header);
type ClickHandler = () => void;
const cursor = { active: false, x: 0, y: 0 };
let drawing: { x: number; y: number }[][] = [];
let currentDrawing: { x: number; y: number }[] | null = [];
let redoDrawing: { x: number; y: number }[][] = [];

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
//////////////////////////////////////////////


///////DRAWING///////////////////
function addCanvasEvents() {
    canvas.addEventListener("mousedown", (event) => {
        cursor.active = true;
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentDrawing = [];
        drawing.push(currentDrawing);
        currentDrawing.push({ x: cursor.x, y: cursor.y });

        canvas.dispatchEvent(drawingChanged);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (!cursor.active) {
            return;
        }
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentDrawing!.push({ x: cursor.x, y: cursor.y });
        redoDrawing = [];

        canvas.dispatchEvent(drawingChanged);
    });

    canvas.addEventListener("mouseup", () => {
        cursor.active = false;
        currentDrawing = null;
    });

    canvas.addEventListener("drawing-changed", () => {
        drawIT();
    });
}
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
    for (const line of drawing) {
        if (line.length > 1) {
            ctx.beginPath();
            const { x, y } = line[0];
            ctx.moveTo(x, y);
            for (const { x, y } of line) {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
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
function addButton(name: string, funct: ClickHandler) {
    const button = document.createElement("button");
    button.innerHTML = name;
    app.append(button);

    //click
    button.addEventListener("click", () => {
        funct();
    });



}
//////////////////////////////////////////////////