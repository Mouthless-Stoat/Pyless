import { NodeType, type Block, type Stmt, Assignment, NumberLiteral, Identifier, BinaryExpr } from "../front/ast"

// trans could stand for transpile or it could just be trans :3

export function trans(astNode: Stmt, indent: number): string {
    switch (astNode.type) {
        case NodeType.Block:
            return transBlock(astNode as Block, indent)
        case NodeType.Identifier:
            return (astNode as Identifier).symbol
        case NodeType.NumberLiteral:
            return (astNode as NumberLiteral).number
        case NodeType.Assignment:
            return transAssignment(astNode as Assignment, indent)
        case NodeType.BinaryExpr:
            return transBinaryExpr(astNode as BinaryExpr, indent)

        default:
            throw `This AST node have not been implemented ${NodeType[astNode.type]}`
    }
}

function transBlock(block: Block, indent: number): string {
    let out = ""
    for (const stmt of block.body) {
        out += trans(stmt, indent + 1)
    }
    return out
}

function transAssignment(assignment: Assignment, indent: number): string {
    return `${assignment.symbol} = ${trans(assignment.value, indent)}`
}

function transBinaryExpr(binary: BinaryExpr, indent: number): string {
    return `${trans(binary.left, indent)} ${binary.operator} ${trans(binary.right, indent)}`
}
