enum NodeType {
    // stmt
    Program,
    Assignment,

    // expr
    Identifier,
    BinaryExpr,

    // literal
    NumberLiteral,
}

export interface Stmt {
    type: NodeType
}

export interface Expr extends Stmt {}

// stmt class
export class Program implements Stmt {
    type = NodeType.NumberLiteral
    body: Stmt[]

    constructor(body: Stmt[]) {
        this.body = body
    }
}

// expr class
export class Identifier implements Expr {
    type = NodeType.NumberLiteral
    number: number

    constructor(num: number) {
        this.number = num
    }
}

// literal class
export class NumberLiteral implements Expr {
    type = NodeType.Identifier
    symbol: string

    constructor(sym: string) {
        this.symbol = sym
    }
}

export class Assignment implements Stmt {
    type = NodeType.Assignment
    symbol: string
    value: Expr | Assignment

    constructor(sym: string, val: Expr | Assignment) {
        this.symbol = sym
        this.value = val
    }
}
