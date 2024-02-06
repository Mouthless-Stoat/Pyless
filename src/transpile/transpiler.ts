import { NodeType, type Block, type Stmt, AssignmentExpr, NumberLiteral, Identifier, BinaryExpr } from "../front/ast"

// trans could stand for transpile or it could just be trans :3

export function trans(astNode: Stmt, indent: number, top: boolean = false): string {
    switch (astNode.type) {
        case NodeType.Block:
            return transBlock(astNode as Block, indent)
        case NodeType.Identifier:
            return (astNode as Identifier).symbol
        case NodeType.NumberLiteral:
            return (astNode as NumberLiteral).number
        case NodeType.Assignment:
            return transAssignment(astNode as AssignmentExpr, indent, top)
        case NodeType.BinaryExpr:
            return transBinaryExpr(astNode as BinaryExpr, indent)

        default:
            throw `This AST node have not been implemented ${NodeType[astNode.type]}`
    }
}

function transBlock(block: Block, indent: number): string {
    let out = ""
    for (const stmt of block.body) {
        out += trans(stmt, indent + 1, true)
    }
    return out
}

function transAssignment(assignment: AssignmentExpr, indent: number, top: boolean): string {
    const sym = trans(assignment.symbol, indent, top)
    let val
    if (assignment.value.type === NodeType.Assignment && top) {
        val = trans(assignment.value, indent, top)
    } else val = trans(assignment.value, indent)

    return top ? `${sym} = ${val}` : `(${sym} := ${val})`
}

function transBinaryExpr(binary: BinaryExpr, indent: number): string {
    return `${trans(binary.left, indent)} ${binary.operator} ${trans(binary.right, indent)}`
}
