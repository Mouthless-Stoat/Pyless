import { isModifierLike, type ExponentiationOperator } from "typescript"
import { TokenType } from "./lexer"

export enum NodeType {
    Block,
    Comment,

    // stmt
    Assignment,
    IfStmt,

    // expr
    Identifier,
    BinaryExpr,
    UnaryExpr,
    CallExpr,
    IndexExpr,
    MethodExpr,

    // literal
    NumberLiteral,
    StringLiteral,
    DictionaryLiteral,
    ListLiteral,
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

export class Comment implements Stmt {
    type = NodeType.Comment
    content: string

    constructor(content: string) {
        this.content = content
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

export class ListLiteral implements Expr {
    type = NodeType.ListLiteral
    element: Expr[]

    constructor(elem: Expr[]) {
        this.element = elem
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

export const BinaryTokens = {
    [TokenType.Minus]: "-",
    [TokenType.Plus]: "+",
    [TokenType.Star]: "*",
    [TokenType.Slash]: "/",
    [TokenType.Percent]: "%",
    [TokenType.Equality]: "==",
    [TokenType.Greater]: ">",
    [TokenType.Lesser]: "<",
    [TokenType.GreaterEq]: ">=",
    [TokenType.LesserEq]: "<=",
    [TokenType.And]: "&&",
    [TokenType.Or]: "||",
} as const

export type BinaryType = (typeof BinaryTokens)[keyof typeof BinaryTokens]

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

export const PreUnaryTokens = {
    [TokenType.Exclamation]: "!",
    [TokenType.Minus]: "-",
} as const

export type PreUnaryType = (typeof PreUnaryTokens)[keyof typeof PreUnaryTokens]

export class PreUnaryExpr implements Expr {
    type = NodeType.UnaryExpr
    expr: Expr
    operator: PreUnaryType

    constructor(expr: Expr, op: PreUnaryType) {
        this.expr = expr
        this.operator = op
    }
}

export const PostUnaryTokens = {
    [TokenType.NEVER]: "_",
} as const

export type PostUnaryType = (typeof PostUnaryTokens)[keyof typeof PostUnaryTokens]

export class PostUnaryExpr implements Expr {
    type = NodeType.UnaryExpr
    expr: Expr
    operator: PostUnaryType

    constructor(expr: Expr, op: PostUnaryType) {
        this.expr = expr
        this.operator = op
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

export class IndexExpr implements Expr {
    type = NodeType.IndexExpr
    indexable: Expr
    index: Expr

    constructor(indexable: Expr, index: Expr) {
        this.indexable = indexable
        this.index = index
    }
}

export class MethodExpr implements Expr {
    type = NodeType.MethodExpr
    value: Expr
    method: Expr

    constructor(val: Expr, method: Expr) {
        this.value = val
        this.method = method
    }
}
