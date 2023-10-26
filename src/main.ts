import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const drawingChanged = new CustomEvent("drawing-changed");
import { Line, CursorCommand, Stickers } from "./elements";
//GAME SETUP/////////////////////////////////////
const gameName = "Doodle It";
document.title = gameName;
const header = document.createElement("h1");
header.id = "game-name";
header.innerHTML = gameName;
app.append(header);
type ClickHandler = () => void;
type SliderHandler = (num: number) => void;
const cursor = { active: false, x: 0, y: 0 };
const cursorChanged = new CustomEvent("cursor-changed");
let strokes: (Line | Stickers)[] = [];
let thisStroke: (Line | Stickers) | null = null;
let redoStroke: (Line | Stickers)[] = [];
let currentCursor = ".";
let cursorCommand: CursorCommand | null = null;
let newColor = "#000000";
//////////////////////////////////////////////

////////////////Buttons//////////////////////
addButton("clear", eraseCanvas);
addButton("undo", undoCanvas);
addButton("redo", redoCanvas);
app.append(document.createElement("br"));
addButton("Export", exportPicture);
app.append(document.createElement("br"));
//////////////////////////////////////////////

/////////////Build Canvas////////////////////
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
const thickSlider = addSlider("Thickness", "1", "11", "1", changeThickness);

/////////////////Stickers/////////////////////
const emojis = ["🐟", "⚽️", "🧸", "⭐️", "clear emoji"];
app.append(document.createElement("br"));
emojis.forEach((text) => {
    addEmojiButton(text);
});

addEmojiButton("custom emoji"); // Add a button for custom stickers
app.append(document.createElement("br"));
//////////////////////////////////////////////

//////////////Drawing////////////////////////
function addCanvasEvents() {
    canvas.addEventListener("mousedown", (event) => {
        cursor.active = true;
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        if (currentCursor == ".") {
            thisStroke = new Line(thickSlider.value, newColor);
        } else {
            thisStroke = new Stickers(
                cursor.x,
                cursor.y,
                currentCursor,
                thickSlider.value,
                newColor
            );
        }

        strokes.push(thisStroke);
        redoStroke.splice(0, redoStroke.length);

        thisStroke.drag(cursor.x, cursor.y);

        canvas.dispatchEvent(drawingChanged);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (cursor.active) {
            cursor.x = event.offsetX;
            cursor.y = event.offsetY;
            thisStroke!.drag(cursor.x, cursor.y);
            redoStroke = [];

            canvas.dispatchEvent(drawingChanged);
        }
    });

    canvas.addEventListener("mouseup", () => {
        cursor.active = false;
        thisStroke = null;
    });

    canvas.addEventListener("drawing-changed", () => {
        drawIT();
    });
}

canvas.addEventListener("cursor-changed", () => {
    drawIT();
});


canvas.addEventListener("mouseout", () => {
    cursorCommand = null;
    canvas.dispatchEvent(cursorChanged);
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(
        e.offsetX,
        e.offsetY,
        currentCursor,
        newColor
    );
});

canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(
        e.offsetX,
        e.offsetY,
        currentCursor,
        colorSlider.value
    );
    canvas.dispatchEvent(cursorChanged);
});

//////////////////////////////////////////////

////////////Clear////////////////////////////
function eraseCanvas() {
    redoStroke = strokes;
    strokes = [];
    clearCanvas();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 256, 256);
}

//////////////////////////////////////////////

//////////////Draw It////////////////////////

function drawIT() {
    clearCanvas();
    strokes.forEach((l) => {
        l.display(ctx);
    });
    const lineWidthBefore = ctx.lineWidth;
    if (cursorCommand) {
        cursorCommand.display(ctx);
    }
    ctx.lineWidth = lineWidthBefore;
}
//////////////////////////////////////////////

//////undo///////////////////////////////////
function undoCanvas() {
    if (strokes.length == 0) {
        return;
    }
    redoStroke.push(strokes.pop()!);
    canvas.dispatchEvent(drawingChanged);
}
///////////////////////////////////////////////

///////////////redo///////////////////////////
function redoCanvas() {
    if (redoStroke.length == 0) {
        return;
    }
    strokes.push(redoStroke.pop()!);
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
//////////////////////////////////////////////

/////////////////THICKNESS SLIDER/////////////
function addSlider(
    name: string,
    min: string,
    max: string,
    initial: string,
    func: SliderHandler
) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = initial;

    slider.addEventListener("input", () => {
        func(parseInt(slider.value));
    });

    const label = document.createElement("label");
    label.textContent = name + ": ";

    app.append(label);
    app.append(slider);
    return slider;
}

function changeThickness(val: number) {
    ctx.lineWidth = val;
    drawIT();
}
//////////////////////////////////////////////

/////////////////sticker buttons//////////////
function addEmojiButton(text: string) {
    const button = document.createElement("button");
    button.innerHTML = text;
    app.append(button);

    button.addEventListener("click", () => {
        currentCursor = text;
        if (text == "clear emoji") {
            currentCursor = ".";
        } else if (text == "custom emoji") {
            const customSticker = prompt("enter a new emoji:");
            if (customSticker) {
                emojis.push(customSticker);
                currentCursor = customSticker;

            }
        }
        canvas.dispatchEvent(cursorChanged);
    });
}
//////////////////////////////////////////////

////////////////////EXPORT///////////////////
function exportPicture() {
    const hdCanvas = document.createElement("canvas");
    hdCanvas.width = canvas.width * 4;
    hdCanvas.height = canvas.height * 4;

    const hdCtx = hdCanvas.getContext("2d")!;
    hdCtx.fillStyle = "white";

    hdCtx.scale(4, 4);
    hdCtx.fillRect(0, 0, 256, 256);

    strokes.forEach((stroke) => {
        stroke.display(hdCtx);
    });

    const anchor = document.createElement("a");
    anchor.href = hdCanvas.toDataURL("image/png");
    anchor.download = "doodle.png";
    anchor.click();
}
//////////////////////////////////////////////

/////////////////COLOR///////////////////////
const colorSlider = addSlider(
    "Color",
    "0",
    0xffffff + "",
    0x000000 + "",
    changeColor
);

function changeColor(val: number) {
    newColor = "#" + val.toString(16).padStart(6, "0");
    ctx.fillStyle = newColor;
    drawIT();
}

//////////////////////////////////////////////