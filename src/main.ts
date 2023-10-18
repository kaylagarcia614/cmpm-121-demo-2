import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const drawingChanged = new CustomEvent("drawing-changed");
//GAME SETUP/////////////////////////////////////
const gameName = "Kayla's Sketch Pad";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const cursor = { active: false, x: 0, y: 0 };
let drawing: { x: number; y: number }[][] = [];
let currentDrawing: { x: number; y: number }[] | null = [];


//////////////////////////////////////////////

///BUILD CANVAS/////////////////
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
//////////////////////////////////////////////

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);

addCanvasEvents();

addClearButton();


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
function addClearButton() {
    //Add clear button
    const clearButton = document.createElement("button");
    clearButton.innerHTML = "clear";
    app.append(document.createElement("br"));
    app.append(clearButton);

    //Add click functionality
    clearButton.addEventListener("click", () => {
        clearCanvas();
        drawing = [];
    });
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