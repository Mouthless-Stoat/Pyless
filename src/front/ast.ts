export enum NodeType {
    Block,

    // stmt
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
export class Block implements Stmt {
    type = NodeType.Block
    body: Stmt[]

    constructor(body: Stmt[]) {
        this.body = body
    }
}

// expr class
export class Identifier implements Expr {
    type = NodeType.Identifier
    symbol: string

    constructor(sym: string) {
        this.symbol = sym
    }
}

// literal class
export class NumberLiteral implements Expr {
    type = NodeType.NumberLiteral
    number: string

    constructor(num: string) {
        this.number = num
    }
}

export class Assignment implements Expr {
    type = NodeType.Assignment
    symbol: string
    value: Expr | Assignment

    constructor(sym: string, val: Expr | Assignment) {
        this.symbol = sym
        this.value = val
    }
}

export type BinaryType = "+" | "-" | "*" | "/" | "%"

export class BinaryExpr implements Expr {
    type = NodeType.BinaryExpr
    left: Expr
    right: Expr
    operator: BinaryType

    constructor(left: Expr, right: Expr, op: BinaryType) {
        this.left = left
        this.right = right
        this.operator = op
    }
}
