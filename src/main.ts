import "./style.css";
import { BuildCanvas } from "./elements";
const app: HTMLDivElement = document.querySelector("#app")!;
//GAME SETUP/////////////////////////////////////
const gameName = "Kayla's Sketch Pad";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const paintCanvas = createCanvas();
const cursor = { active: false, x: 0, y: 0 };
addCanvasEvents(paintCanvas);
////////////////////////////////////////////////

///BUILD CANVAS/////////////////
function createCanvas(): BuildCanvas {
    const build = document.createElement("canvas");
    build.id = "canvas";
    build.width = 256;
    build.height = 256;

    const canvasCTX = build.getContext("2d");
    clearCanvas({ canvas: build, context: canvasCTX! });

    app.append(build);
    return { canvas: build, context: canvasCTX! };
}
//////////////////////////////////

///////DRAWING///////////////////
function addCanvasEvents(bC: BuildCanvas) {
    bC.canvas.addEventListener("mousedown", (event) => {
        cursor.active = true;
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
    });

    bC.canvas.addEventListener("mousemove", (event) => {
        if (!cursor.active) {
            return;
        }
        bC.context.beginPath();
        bC.context.moveTo(cursor.x, cursor.y);
        bC.context.lineTo(event.offsetX, event.offsetY);
        bC.context.stroke();
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
    });

    bC.canvas.addEventListener("mouseup", () => {
        cursor.active = false;
    });
}
/////////////////////////////////////

//CLEAR BUTTON/////////////////
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("br"));
app.append(clearButton);

//Add click functionality
clearButton.addEventListener("click", () => {
    clearCanvas(paintCanvas);
});

function clearCanvas(bC: BuildCanvas) {
    bC.context.clearRect(0, 0, bC.canvas.width, bC.canvas.height);
    bC.context.fillStyle = "white";

    bC.context.fillRect(0, 0, 256, 256);
}
/////////////////////////////////////