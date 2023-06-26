
export class History {
    undos: Array<string>;
    redos: Array<string>;
    current: string;

    constructor() {
        this.undos = [];
        this.redos = [];
        this.current = "";
    }

    State() {
        return this.current;
    }

    Save(newState: string) {
        if (this.current === "") {
            this.current = newState;
        } else {
            this.undos.push(this.current);
            this.current = newState;
            this.redos = [];
        }
    }

    undo() {
        const state = this.undos.pop();
        if (!state) {
            return
        }
        this.redos.push(this.current)
        this.current = state;
    }

    redo() {
        const state = this.redos.pop();
        if (!state) {
            return
        }
        this.undos.push(this.current);
        this.current = state;
    }

    Clear() {
        this.undos = [];
        this.redos = [];
    }

    HasNext() {
        return this.redos.length > 0
    }

    HasPrevious() {
        return this.undos.length > 0
    }

    GetNext() {
        this.redo();
        return this.current;
    }

    GetPrevious() {
        this.undo();
        return this.current;
    }
}
