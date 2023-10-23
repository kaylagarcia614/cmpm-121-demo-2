interface Coordinate {
    x: number;
    y: number;
}

export class Line {
    coords: Coordinate[];
    thickness: string;

    constructor(thickness = "1") {
        this.coords = [];
        this.thickness = thickness;
    }

    drag(x: number, y: number) {
        this.coords.push({ x: x, y: y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.coords.length == 0) {
            return;
        }
        const lineWidthBefore = ctx.lineWidth;
        ctx.lineWidth = parseInt(this.thickness);
        const first = this.coords[0];

        ctx.beginPath();
        ctx.moveTo(first.x, first.y);

        for (const c of this.coords) {
            ctx.lineTo(c.x, c.y);
        }

        ctx.stroke();
        ctx.lineWidth = lineWidthBefore;
    }
}

export class Stickers {
    coord: Coordinate;
    text: string;
    size: number;
    xOffset: number;
    yOffset: number;

    constructor(x: number, y: number, text: string, size: string) {
        this.coord = { x: x, y: y };
        this.text = text;

        const outMin = 16;
        const outMax = 16;
        const inMinimun = 1;
        const inMaximum = 5;
        const newSize: number =
            ((parseInt(size) - inMinimun) * (outMax - outMin)) / (inMaximum - inMinimun) + outMin;
        this.xOffset = (4 * newSize) / outMin;
        this.yOffset = (8 * newSize) / outMin;
        this.size = newSize;
    }

    drag(x: number, y: number) {
        this.coord = { x: x, y: y };
    }

    display(ctx: CanvasRenderingContext2D) {
        const fontBefore: string = ctx.font;

        ctx.font = this.size + "px monospace";
        ctx.fillText(
            this.text,
            this.coord.x - this.xOffset,
            this.coord.y + this.yOffset
        );

        ctx.font = fontBefore;
    }
}


export class CursorCommand {
    x: number;
    y: number;
    text: string;
    constructor(x: number, y: number, text: string) {
        this.x = x;
        this.y = y;
        this.text = text;
    }

    display(ctx: CanvasRenderingContext2D) {
        const lineWidthBefore = ctx.lineWidth;
        const outMin = 16;
        const outMax = 16;
        const inMinimun = 1;
        const inMaximum = 5;
        const newSize: number = ((ctx.lineWidth - inMinimun) * (outMax - outMin)) / (inMaximum - inMinimun) + outMin;
        const xOffset = (4 * newSize) / outMin;
        const yOffset = (8 * newSize) / outMin;
        const fontBefore = ctx.font;
        ctx.font = newSize + "px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(".", this.x - xOffset, this.y + yOffset);
        ctx.fillText(this.text, this.x - xOffset, this.y + yOffset);
        ctx.lineWidth = lineWidthBefore;
        ctx.font = fontBefore;
    }
}