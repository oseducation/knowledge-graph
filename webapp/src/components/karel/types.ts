const MAX_CORNER_SIZE = 160;
export const BORDER_SIZE = 2;

export type Dir = 'east' | 'west' | 'north' | 'south';

export type World = {
    karelRow: number;
    karelCol: number;
    karelDir: Dir;
    beepers: number[][];
    topWalls: number[][];
    rightWalls: number[][];
    rows: number;
    columns: number;
    images: Images;
}

export const deepCopyWorld = (oldWorld: World): World => {
    return {
        karelRow: oldWorld.karelRow,
        karelCol: oldWorld.karelCol,
        karelDir: oldWorld.karelDir,
        beepers: oldWorld.beepers.map(row => row.slice()),
        topWalls: oldWorld.topWalls.map(row => row.slice()),
        rightWalls: oldWorld.rightWalls.map(row => row.slice()),
        rows: oldWorld.rows,
        columns: oldWorld.columns,
        images: oldWorld.images,
    };
}

export const move = (world: World) => {
    let newRow = world.karelRow;
    let newCol = world.karelCol;
    switch(world.karelDir) {
    case 'east': newCol = newCol + 1; break;
    case 'west': newCol = newCol - 1; break;
    case 'north': newRow = newRow - 1; break;
    case 'south': newRow = newRow + 1; break;
    }

    if (isMoveValid(world, world.karelRow, world.karelCol, newRow, newCol)) {
        world.karelRow = newRow;
        world.karelCol = newCol;
    } else {
        throw('Front Is Blocked');
    }
}

export const turnLeft = (world: World) => {
    let newD = world.karelDir;
    switch(world.karelDir) {
    case 'east':  newD = 'north'; break;
    case 'west':  newD = 'south'; break;
    case 'north': newD = 'west'; break;
    case 'south': newD = 'east'; break;
    }
    world.karelDir = newD;
}

export const turnRight = (world: World) => {
    let newD = world.karelDir;
    switch(world.karelDir) {
    case 'east':  newD = 'south'; break;
    case 'west':  newD = 'north'; break;
    case 'north': newD = 'east'; break;
    case 'south': newD = 'west'; break;
    }
    world.karelDir = newD;
}

export const pickBeeper = (world: World) => {
    if (world.beepers[world.karelRow][world.karelCol] !== 0) {
        world.beepers[world.karelRow][world.karelCol]--;
    } else {
        throw('No Beepers Present');
    }
}

export const putBeeper = (world: World) => {
    world.beepers[world.karelRow][world.karelCol]++;
}

export const turnAround = (world: World) => {
    let newD = world.karelDir;
    switch(world.karelDir) {
    case 'east':  newD = 'west'; break;
    case 'west':  newD = 'east'; break;
    case 'north': newD = 'south'; break;
    case 'south': newD = 'north'; break;
    }
    world.karelDir = newD;
}

export const beepersPresent = (world: World): boolean => {
    return world.beepers[world.karelRow][world.karelCol] !== 0;
}

export const frontIsClear = (world: World): boolean => {
    let newRow = world.karelRow;
    let newCol = world.karelCol;
    switch(world.karelDir) {
    case 'east': newCol = newCol + 1; break;
    case 'west': newCol = newCol - 1; break;
    case 'north': newRow = newRow - 1; break;
    case 'south': newRow = newRow + 1; break;
    }
    const valid = isMoveValid(world, world.karelRow, world.karelCol, newRow, newCol);
    return valid;
}

export const rightIsClear = (world: World): boolean => {
    let newRow = world.karelRow;
    let newCol = world.karelCol;
    switch(world.karelDir) {
    case 'east': newRow = newRow + 1; break;
    case 'west': newRow = newRow - 1; break;
    case 'north': newCol = newCol + 1; break;
    case 'south': newCol = newCol - 1; break;
    }
    return isMoveValid(world, world.karelRow, world.karelCol, newRow, newCol);
}

export const leftIsClear = (world: World): boolean => {
    let newRow = world.karelRow;
    let newCol = world.karelCol;
    switch(world.karelDir) {
    case 'east': newRow = newRow - 1; break;
    case 'west': newRow = newRow + 1; break;
    case 'north': newCol = newCol - 1; break;
    case 'south': newCol = newCol + 1; break;
    }
    return isMoveValid(world, world.karelRow, world.karelCol, newRow, newCol);
}

export const facingNorth = (world: World): boolean => {
    return world.karelDir == 'north';
}

export const facingSouth = (world: World): boolean => {
    return world.karelDir == 'south';
}

export const facingEast = (world: World): boolean => {
    return world.karelDir == 'east';
}

export const facingWest = (world: World): boolean => {
    return world.karelDir == 'west';
}

export const createWorld = (worldText: string): World => {
    const world = {} as World;
    const lines = worldText.split("\n");

    // get world dimension
    loadDimensionLine(world, lines[0]);

    world.beepers = [];
    world.topWalls = [];
    world.rightWalls = [];
    for (let i = 0; i < world.rows; i++) {
        world.beepers[i] = [];
        world.topWalls[i] = [];
        world.rightWalls[i] = [];
        for (let j = 0; j < world.columns; j++) {
            world.beepers[i][j] = 0;
            world.topWalls[i][j] = 0;
            world.rightWalls[i][j] = 0;
        }
    }

    world.karelDir = 'east';

    placeKarel(world, world.rows - 1, 0);

    // load world details
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] != '') {
            loadLine(world, lines[i]);
        }
    }

    return world;
}

export type Images = {
    karelNorth: HTMLImageElement;
    karelSouth: HTMLImageElement;
    karelEast: HTMLImageElement;
    karelWest: HTMLImageElement;
    cross: HTMLImageElement;
    beeper: HTMLImageElement;
    karelNorthSmall: HTMLImageElement;
    karelSouthSmall: HTMLImageElement;
    karelEastSmall: HTMLImageElement;
    karelWestSmall: HTMLImageElement;
    karelNorthTiny: HTMLImageElement;
    karelSouthTiny: HTMLImageElement;
    karelEastTiny: HTMLImageElement;
    karelWestTiny: HTMLImageElement;
}

export const setImages = (world: World, images: Images) => {
    world.images = images;
}

export const loadImages = async (): Promise<Images> => {
    const imageNames = [];
    imageNames[0] = "../karel/images/karelNorth.png";
    imageNames[1] = "../karel/images/karelSouth.png";
    imageNames[2] = "../karel/images/karelEast.png";
    imageNames[3] = "../karel/images/karelWest.png";
    imageNames[4] = "../karel/images/cross.png";
    imageNames[5] = "../karel/images/beeper.jpg";
    imageNames[6] = "../karel/images/karelNorthSmall.png";
    imageNames[7] = "../karel/images/karelSouthSmall.png";
    imageNames[8] = "../karel/images/karelEastSmall.png";
    imageNames[9] = "../karel/images/karelWestSmall.png";
    imageNames[10] = "../karel/images/karelNorthTiny.png";
    imageNames[11] = "../karel/images/karelSouthTiny.png";
    imageNames[12] = "../karel/images/karelEastTiny.png";
    imageNames[13] = "../karel/images/karelWestTiny.png";

    const images = await Promise.all(imageNames.map(src => loadImage(src)));

    return {
        karelNorth: images[0],
        karelSouth: images[1],
        karelEast: images[2],
        karelWest: images[3],
        cross: images[4],
        beeper: images[5],
        karelNorthSmall: images[6],
        karelSouthSmall: images[7],
        karelEastSmall: images[8],
        karelWestSmall: images[9],
        karelNorthTiny: images[10],
        karelSouthTiny: images[11],
        karelEastTiny: images[12],
        karelWestTiny: images[13],
    }
}

const loadImage = async (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

// Canvas functions
export type CanvasModel = {
    cornerSize: number;
    worldLeft: number;
    worldTop: number;
    worldWidth: number;
    worldHeight: number;

    worldRows: number;
    worldCols: number;

    canvasWidth: number;
    canvasHeight: number;
}

export const resizeCanvas = (c: CanvasModel, width: number, height: number, worldLoaded: boolean) => {
    c.canvasWidth = width;
    c.canvasHeight = height;
    if (worldLoaded) {
        setKarelDimensions(c, c.worldRows, c.worldCols);
    }
}

// private functions

export const setKarelDimensions = (c: CanvasModel, rows: number, cols: number) => {
    c.worldRows = rows;
    c.worldCols = cols;
    c.cornerSize = MAX_CORNER_SIZE;
    c.worldWidth = cols * c.cornerSize;
    c.worldHeight = rows * c.cornerSize;
    const maxWorldWidth = c.canvasWidth - BORDER_SIZE * 2;
    const maxWorldHeight = c.canvasHeight - BORDER_SIZE * 2;
    if (c.worldWidth > maxWorldWidth || c.worldHeight > maxWorldHeight) {
        const xScale = maxWorldWidth / c.worldWidth;
        const yScale = maxWorldHeight / c.worldHeight;
        const maxScale = Math.min(xScale, yScale);
        //var maxScale = Math.min(maxScale, 0.4);
        c.worldWidth = c.worldWidth * maxScale;
        c.worldHeight = c.worldHeight * maxScale;
        c.cornerSize = c.cornerSize * maxScale;
    }

    c.worldTop = (maxWorldHeight - c.worldHeight)/2 + BORDER_SIZE;
    c.worldLeft =  BORDER_SIZE;
}

const placeKarel = (world: World, row: number, col: number) => {
    world.karelRow = row;
    world.karelCol = col;
}

const loadLine = (world: World, line: string) => {
    const elements = line.split(":");
    assert(elements.length == 2, line + 'World file missing :');
    const key = elements[0];

    if (key == "Karel")  {
        loadKarelLine(world, elements[1]);
    } else if (key == "Wall")  {
        loadWallLine(world, elements[1]);
    } else if (key == "Beeper") {
        loadBeeperLine(world, elements[1]);
    }
}

const loadKarelLine = (world: World, line: string) => {
    const coord = extractCoord(line);
    const row = world.rows - coord[0];
    const col = coord[1] - 1;
    placeKarel(world, row, col);
    if (line.indexOf('west') !== -1) {
        world.karelDir = 'west';
    } else if (line.indexOf('south') !== -1) {
        world.karelDir = 'south';
    } else if (line.indexOf('north') !== -1) {
        world.karelDir = 'north';
    }
}

const loadWallLine = (world: World, line: string) => {
    const coord = extractCoord(line);
    if (line.toLowerCase().indexOf('west') !== -1) {
        const row = world.rows - coord[1];
        const col = coord[0] - 2;
        world.rightWalls[row][col] = 1;
    } else {
        const row = world.rows - coord[1] + 1;
        const col = coord[0] - 1;
        world.topWalls[row][col] = 1;
    }
}

const loadBeeperLine = (world: World, line: string) => {
    const coord = extractCoord(line);
    const row = world.rows - coord[1];
    const col = coord[0] - 1;
    world.beepers[row][col] += 1;
}

const loadDimensionLine = (world: World, line: string) => {
    const dimensionStrings = line.split(":");
    assert(dimensionStrings[0] === 'Dimension', 'World file malformed');
    const coord = extractCoord(dimensionStrings[1]);

    world.rows = coord[1];
    world.columns = coord[0];
}

const assert = (exp: boolean, message: string) => {
    if (!exp) {
        throw ('AssertException: ' + message);
    }
}

const extractCoord = (coordString: string): number[] => {
    const rParenIndex = coordString.indexOf('(');
    const lParenIndex = coordString.indexOf(')');
    coordString = coordString.substring(rParenIndex + 1, lParenIndex);
    const coordStrings = coordString.split(',');
    const row = parseInt(coordStrings[0]);
    const col = parseInt(coordStrings[1]);
    return [row, col];
}

const isMoveValid = (world: World, startR: number, startC: number, endR: number, endC: number): boolean => {
    if (endC < 0 || endC >= world.columns) return false;
    if (endR < 0 || endR >= world.rows) return false;

    if (startC + 1 == endC && world.rightWalls[startR][startC] !== 0) return false;
    if (startC - 1 == endC && world.rightWalls[startR][endC] !== 0) return false;

    if (startR + 1 == endR && world.topWalls[endR][endC] !== 0) return false;
    if (startR - 1 == endR && world.topWalls[startR][endC] !== 0) return false;

    return true;
}
