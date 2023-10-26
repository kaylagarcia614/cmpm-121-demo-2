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
const cursor = { active: false, x: 0, y: 0 };
const cursorChanged = new CustomEvent("cursor-changed");
let strokes: (Line | Stickers)[] = [];
let thisStroke: (Line | Stickers) | null = null;
let redoStroke: (Line | Stickers)[] = [];
let currentCursor = ".";
let cursorCommand: CursorCommand | null = null;
//////////////////////////////////////////////

////////////////Buttons//////////////////////
addButton("clear", eraseCanvas);
addButton("undo", undoCanvas);
addButton("redo", redoCanvas);
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
const thickSlider = addThicknessSlider();

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
            thisStroke = new Line(thickSlider.value);
        } else {
            thisStroke = new Stickers(
                cursor.x,
                cursor.y,
                currentCursor,
                thickSlider.value
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
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentCursor);
    canvas.dispatchEvent(cursorChanged);
});

canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentCursor);
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
    label.textContent = "thickness: ";

    app.append(label);
    app.append(thickness);
    return thickness;
}

function changeThickness(value: number) {
    ctx.lineWidth = value;
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
