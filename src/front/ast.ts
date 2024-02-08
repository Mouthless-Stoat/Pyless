export enum NodeType {
    Block,

    // stmt
    Assignment,
    IfStmt,

    // expr
    Identifier,
    BinaryExpr,
    CallExpr,

    // literal
    NumberLiteral,
    StringLiteral,
    DictionaryLiteral,
}

export function isNodeType(node: Stmt, ...types: NodeType[]) {
    return types.some((t) => node.type === t)
}

export interface Stmt {
    type: NodeType
}

export interface Expr extends Stmt {
    paren?: boolean
}

// stmt class
export class Block implements Stmt {
    type = NodeType.Block
    body: Stmt[]

    constructor(body: Stmt[]) {
        this.body = body
    }
}

export class IfStmt implements Stmt {
    type = NodeType.IfStmt
    condition: Expr
    body: Block
    elseBody?: Block

    constructor(cond: Expr, body: Block, elseBody?: Block) {
        this.condition = cond
        this.body = body
        this.elseBody = elseBody
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

export class StringLiteral implements Expr {
    type = NodeType.StringLiteral
    content: string

    constructor(content: string) {
        this.content = content
    }
}

export class Propety {
    key: Expr
    value: Expr

    constructor(key: Expr, val: Expr) {
        this.key = key
        this.value = val
    }
}
export class DictionaryLiteral implements Expr {
    type = NodeType.DictionaryLiteral
    propeties: Propety[]

    constructor(prop: Propety[]) {
        this.propeties = prop
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

export class AssignmentExpr implements Expr {
    type = NodeType.Assignment
    symbol: Expr
    value: Expr

    constructor(sym: Expr, val: Expr) {
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
    paren: boolean

    constructor(left: Expr, right: Expr, op: BinaryType, paren?: boolean) {
        this.left = left
        this.right = right
        this.operator = op
        this.paren = paren ?? false
    }
}

export class CallExpr implements Expr {
    type = NodeType.CallExpr
    caller: Expr
    args: Expr[]

    constructor(caller: Expr, args: Expr[]) {
        this.caller = caller
        this.args = args
    }
}
