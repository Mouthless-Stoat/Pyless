export enum NodeType {
    Block,

    // stmt
    Assignment,

    // expr
    Identifier,
    BinaryExpr,

    // literal
    NumberLiteral,
    StringLiteral,
}

export function isNodeType(node: Stmt, ...types: NodeType[]) {
    return types.some((t) => node.type === t)
}

export interface Stmt {
    type: NodeType
}

export interface Expr extends Stmt {
    paren: boolean
}

// stmt class
export class Block implements Stmt {
    type = NodeType.Block
    body: Stmt[]

    constructor(body: Stmt[]) {
        this.body = body
    }
}

// literal class
export class NumberLiteral implements Expr {
    type = NodeType.NumberLiteral
    number: string
    paren: boolean

    constructor(num: string, paren?: boolean) {
        this.number = num
        this.paren = paren ?? false
    }
}

export class StringLiteral implements Expr {
    type = NodeType.StringLiteral
    content: string
    paren: boolean

    constructor(content: string, paren?: boolean) {
        this.content = content
        this.paren = paren ?? false
    }
}

// expr class
export class Identifier implements Expr {
    type = NodeType.Identifier
    symbol: string
    paren: boolean

    constructor(sym: string, paren?: boolean) {
        this.symbol = sym
        this.paren = paren ?? false
    }
}

export class AssignmentExpr implements Expr {
    type = NodeType.Assignment
    symbol: Expr
    value: Expr
    paren: boolean

    constructor(sym: Expr, val: Expr, paren?: boolean) {
        this.symbol = sym
        this.value = val
        this.paren = paren ?? false
    }
}

export type BinaryType = "+" | "-" | "*" | "/" | "%"

export class BinaryExpr implements Expr {
    type = NodeType.BinaryExpr
    left: Expr
    right: Expr
    operator: BinaryType
    paren: boolean

    constructor(left: Expr, right: Expr, op: BinaryType, paren?: boolean) {
        this.left = left
        this.right = right
        this.operator = op
        this.paren = paren ?? false
    }
}
