import {
    NodeType,
    type Block,
    type Stmt,
    AssignmentExpr,
    NumberLiteral,
    Identifier,
    BinaryExpr,
    type Expr,
} from "../front/ast"

// trans could stand for transpile or it could just be trans :3

export function trans(astNode: Stmt, indent: number, top: boolean = false): string {
    let out
    switch (astNode.type) {
        case NodeType.Block:
            out = transBlock(astNode as Block, indent)
            break
        case NodeType.Identifier:
            out = (astNode as Identifier).symbol
            break
        case NodeType.NumberLiteral:
            out = (astNode as NumberLiteral).number
            break
        case NodeType.Assignment:
            out = transAssignment(astNode as AssignmentExpr, indent, top)
            break
        case NodeType.BinaryExpr:
            out = transBinaryExpr(astNode as BinaryExpr, indent)
            break
        default:
            throw `This AST node have not been implemented ${NodeType[astNode.type]}`
    }

    return (astNode as Expr).paren ? `(${out})` : `${out}`
}

function transBlock(block: Block, indent: number): string {
    let out = ""
    for (const stmt of block.body) {
        out += "    ".repeat(indent + 1) + trans(stmt, indent + 1, true)
    }
    return out
}

function transAssignment(assignment: AssignmentExpr, indent: number, top: boolean): string {
    assignment.paren = false
    const sym = trans(assignment.symbol, indent, top)
    let val

    // support chaining assignment without making them funny
    if (assignment.value.type === NodeType.Assignment && top) {
        val = trans(assignment.value, indent, top)
    } else val = trans(assignment.value, indent)

    return top ? `${sym} = ${val}` : `(${sym} := ${val})`
}

function transBinaryExpr(binary: BinaryExpr, indent: number): string {
    return `${trans(binary.left, indent)} ${binary.operator} ${trans(binary.right, indent)}`
}
