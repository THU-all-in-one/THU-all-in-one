export class Bijection<T, U> {
    _aTob: Map<T, U>;
    _bToa: Map<U, T>;
    _reversed: BijectionReversed<U, T> | undefined;

    constructor(a: T[], b: U[], buildReversed = true) {
        this._aTob = new Map(a.map((x, i) => [x, b[i]]));
        this._bToa = new Map(b.map((x, i) => [x, a[i]]));
        this._reversed = buildReversed
            ? new BijectionReversed(this)
            : undefined;
    }

    push(a: T, b: U) {
        this._aTob.set(a, b);
        this._bToa.set(b, a);
    }

    reverse(): Bijection<U, T> {
        return this._reversed!;
    }

    get(a: T): U | undefined {
        return this._aTob.get(a);
    }

    getInverse(b: U): T | undefined {
        return this._bToa.get(b);
    }

    inA(a: T): boolean {
        return this._aTob.has(a);
    }

    inB(b: U): boolean {
        return this._bToa.has(b);
    }
}

class BijectionReversed<U, T> extends Bijection<U, T> {
    _parent: Bijection<T, U>;

    constructor(parent: Bijection<T, U>) {
        super([], [], false);
        this._parent = parent;
    }

    push(a: U, b: T) {
        this._parent.push(b, a);
    }

    reverse() {
        return this._parent;
    }

    get(a: U) {
        return this._parent.getInverse(a);
    }

    getInverse(a: T) {
        return this._parent.get(a);
    }

    inA(a: U): boolean {
        return this._parent.inB(a);
    }

    inB(b: T): boolean {
        return this._parent.inA(b);
    }
}
