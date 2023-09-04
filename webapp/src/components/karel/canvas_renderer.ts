import {BORDER_SIZE, CanvasModel, World} from "./types";

const KAREL_TINY_SIZE = 19;
const KAREL_SMALL_SIZE = 30;
const BEEPER_SIZE_FRACTION = 0.85
const BEEPER_LABEL_FRACTION = 0.3;
const BEEPER_LABEL_MAX_SIZE = 18;
const BEEPER_LABEL_MIN_SIZE = 6;
const BEEPER_FILL_COLOR = "#12C4FF";
const BEEPER_LABEL_FONT = "sans-serif";
const BEEPER_LABEL_DY = 0.2;
const CROSS_FRACTION = 0.25;
const MIN_CROSS_SIZE = 5;
const WALL_THICKNESS_FRACTION = 0.1;

export const draw = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    drawBackground(c, w, ctx);
    drawKarel(c, w, ctx);
    drawWalls(c, w, ctx);
}

const getCornerX = (c: CanvasModel, col: number) => {
    return c.worldLeft + col * c.cornerSize;
}

const getCornerY = (c: CanvasModel, row: number) => {
    return c.worldTop + row * c.cornerSize;
}

//-------------------- DRAW KAREL ------------------//
const getImage = (w: World) => {
    switch (w.karelDir) {
    case 'north': return w.images.karelNorth;
    case 'south': return w.images.karelSouth;
    case 'east': return w.images.karelEast;
    case 'west': return w.images.karelWest;
    }
}

const getTinyImage = (w: World) => {
    switch (w.karelDir) {
    case 'north': return w.images.karelNorthTiny;
    case 'south': return w.images.karelSouthTiny;
    case 'east': return w.images.karelEastTiny;
    case 'west': return w.images.karelWestTiny;
    }
}

const getSmallImage = (w: World) => {
    switch (w.karelDir) {
    case 'north': return w.images.karelNorthSmall;
    case 'south': return w.images.karelSouthSmall;
    case 'east': return w.images.karelEastSmall;
    case 'west': return w.images.karelWestSmall;
    }
}

const getKarelImage = (w: World, cornerSize: number) => {
    if (cornerSize <= KAREL_TINY_SIZE) {
        return getTinyImage(w);
    } else if (cornerSize <= KAREL_SMALL_SIZE) {
        return getSmallImage(w);
    } else {
        return getImage(w);
    }
}

const drawKarel = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    const image = getKarelImage(w, c.cornerSize);
    if (typeof image == "undefined" || image == null) {
        alert('karel image loading fail!');
    }

    const karelX = getCornerX(c, w.karelCol);
    const karelY = getCornerY(c, w.karelRow);

    //draw karel one pixel smaller on all sides
    ctx.drawImage(image, karelX+1, karelY+1, c.cornerSize-2, c.cornerSize-2);
}

//----------------- DRAW WORLD -----------------//

const drawBorder = (c: CanvasModel, ctx: CanvasRenderingContext2D) => {
    const borderLeft = c.worldLeft - BORDER_SIZE;
    const borderTop = c.worldTop - BORDER_SIZE;
    const borderWidth = c.worldWidth + BORDER_SIZE*2;
    const borderHeight = c.worldHeight + BORDER_SIZE*2;
    ctx.fillStyle = "#000";
    ctx.fillRect(borderLeft, borderTop, borderWidth, borderHeight);

    ctx.fillStyle = "#fff";
    ctx.fillRect(c.worldLeft, c.worldTop, c.worldWidth, c.worldHeight);
}


const drawBeepers = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    const beeperSize = c.cornerSize * BEEPER_SIZE_FRACTION;

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px courier";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let rIndex = 0; rIndex < w.rows; rIndex++) {
        for (let cIndex = 0; cIndex < w.columns; cIndex++) {
            const x = getCornerX(c, cIndex) + (c.cornerSize)/2;
            const y = getCornerY(c, rIndex) + (c.cornerSize)/2;
            const numBeepers = w.beepers[rIndex][cIndex];
            if (numBeepers > 0) {
                let label = "";
                if (numBeepers > 1) {
                    label = "" + numBeepers;
                }
                drawBeeper(ctx, x, y, beeperSize, label);
            }
        }
    }
}

const drawBeeper = (ctx: CanvasRenderingContext2D, x: number, y: number, sqSize: number, label: string) => {
    const beeperSize = sqSize * BEEPER_SIZE_FRACTION;
    let ps = Math.round(sqSize * BEEPER_LABEL_FRACTION);
    ps = Math.min(ps, BEEPER_LABEL_MAX_SIZE);
    if (ps < BEEPER_LABEL_MIN_SIZE) ps = 0;
    ctx.save();
    ctx.fillStyle = BEEPER_FILL_COLOR;
    ctx.beginPath();
    ctx.moveTo(x - beeperSize / 2, y);
    ctx.lineTo(x, y + beeperSize / 2);
    ctx.lineTo(x + beeperSize / 2, y);
    ctx.lineTo(x, y - beeperSize / 2);
    ctx.lineTo(x - beeperSize / 2, y);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    if (ps && label) {
        ctx.fillStyle = "black";
        ctx.font = ps + "pt " + BEEPER_LABEL_FONT;
        const x0 = x; // - ctx.measureText(label).width / 2;
        const y0 = y + ps * BEEPER_LABEL_DY;
        ctx.fillText(label, x0, y0);
    }
    ctx.restore();
};

const drawCorners = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    const crossSize = c.cornerSize * CROSS_FRACTION;

    for (let rIndex = 0; rIndex < w.rows; rIndex++) {
        for (let cIndex = 0; cIndex < w.columns; cIndex++) {
            const squareLeft = getCornerX(c, cIndex);
            const squareTop = getCornerY(c, rIndex);
            if (crossSize > MIN_CROSS_SIZE) {
                const x = squareLeft + (c.cornerSize - crossSize)/2;
                const y = squareTop + (c.cornerSize - crossSize)/2;
                ctx.drawImage(w.images.cross, x, y, crossSize, crossSize);
            } else {
                const x = squareLeft + (c.cornerSize)/2;
                const y = squareTop + (c.cornerSize)/2;
                const size = Math.max(1, crossSize/2);
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fillStyle = 'blue';
                ctx.fill();
            }
        }
    }
}

const drawBackground = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    if (typeof w.images.cross == "undefined" || w.images.cross == null) {
        alert('image loading fail!');
    }
    drawBorder(c, ctx);
    drawCorners(c, w, ctx);
    drawBeepers(c, w, ctx);
}

const drawWalls = (c: CanvasModel, w: World, ctx: CanvasRenderingContext2D) => {
    let wallThickness = c.cornerSize * WALL_THICKNESS_FRACTION;
    if (wallThickness < 2) wallThickness = 2;
    if (wallThickness > 3) wallThickness = 3;
    ctx.fillStyle = "#000";

    for (let rIndex = 0; rIndex < w.rows; rIndex++) {
        for (let cIndex = 0; cIndex < w.columns; cIndex++) {
            if (w.topWalls[rIndex][cIndex] !== 0) {
                const x = getCornerX(c, cIndex) - wallThickness/2;
                const y = getCornerY(c, rIndex) - wallThickness/2;
                ctx.fillRect(x, y, c.cornerSize + wallThickness, wallThickness);
            }

            if (w.rightWalls[rIndex][cIndex] !== 0) {
                const x = getCornerX(c, cIndex + 1) - wallThickness/2;
                const y = getCornerY(c, rIndex) - wallThickness/2;
                ctx.fillRect(x, y, wallThickness, c.cornerSize + wallThickness);
            }
        }
    }
}
