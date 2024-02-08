import type { SignatureHelpTriggerReason } from "typescript"
import {
    NodeType,
    type Block,
    type Stmt,
    AssignmentExpr,
    NumberLiteral,
    Identifier,
    BinaryExpr,
    type Expr,
    StringLiteral,
    DictionaryLiteral,
    IfStmt,
    isNodeType,
    CallExpr,
    Comment,
} from "../front/ast"

// trans could stand for transpile or it could just be trans :3

export function trans(node: Stmt, indent: number, top: boolean = false): string {
    const paren = (astNode: Stmt, func: (..._: any[]) => any, ...args: any[]): string =>
        (astNode as Expr).paren ? `(${func(astNode, indent, ...args)})` : func(astNode, indent, ...args)
    switch (node.type) {
        case NodeType.Block:
            return transBlock(node as Block, indent)
        case NodeType.Identifier:
            return (node as Identifier).symbol
        case NodeType.NumberLiteral:
            return (node as NumberLiteral).number
        case NodeType.StringLiteral:
            return `"${(node as StringLiteral).content}"`
        case NodeType.Assignment:
            return transAssignment(node as AssignmentExpr, indent, top)
        case NodeType.BinaryExpr:
            return paren(node, transBinaryExpr)
        case NodeType.DictionaryLiteral:
            return transDict(node as DictionaryLiteral, indent)
        case NodeType.IfStmt:
            return transIfStmt(node as IfStmt, indent)
        case NodeType.CallExpr:
            return transCallExpr(node as CallExpr, indent)
        case NodeType.Comment:
            return `# ${(node as Comment).content.trim()}`
        default:
            throw `This AST node have not been implemented ${NodeType[node.type]}`
    }
}

export const idc = "    " // indent char shorten cus it look nicer
function transBlock(block: Block, indent: number): string {
    let out = ""
    if (block.body.length === 1) {
        return trans(block.body[0], indent + 1, true)
    }
    let i = 0
    while (i < block.body.length) {
        out += trans(block.body[i] as Stmt, indent, true)
            .split("\n")
            .map((s) => idc.repeat(indent + 1) + s)
            .join("\n")

        if (block.body[i + 1] && isNodeType(block.body[i + 1], NodeType.Comment)) {
            i++
            out += ` ${trans(block.body[i] as Stmt, indent)}`
        }
        out += "\n"
        i++
    }
    out = out.slice(0, -1)
    return out
}

function transAssignment(assignment: AssignmentExpr, indent: number, top: boolean): string {
    const sym = trans(assignment.symbol, indent, top)
    let val

    // support chaining assignment without making them funny
    if (assignment.value.type === NodeType.Assignment && top) {
        val = trans(assignment.value, indent, top)
    } else val = trans(assignment.value, indent)

    return top ? `${sym} = ${val}` : `(${sym} := ${val})`
}

function transDict(dict: DictionaryLiteral, ident: number): string {
    let out = "{ "
    for (const prop of dict.propeties) {
        // only put , at the end
        out += `${trans(prop.key, ident, false)}: ${trans(prop.value, ident, false)}` + ", "
    }
    out = out.slice(0, -2)
    return out + " }"
}

function transBinaryExpr(binary: BinaryExpr, indent: number): string {
    return `${trans(binary.left, indent)} ${binary.operator} ${trans(binary.right, indent)}`
}

function transIfStmt(stmt: IfStmt, indent: number): string {
    const cond = trans(stmt.condition, indent)
    const body = trans(stmt.body, indent)

    let elseBody
    if (stmt.elseBody) elseBody = trans(stmt.elseBody, indent)

    const bodyStr = stmt.body.body.length === 1 ? ` ${body}` : `\n${body}`
    let elseStr = ""

    // shit for cleanign single line else
    if (elseBody && stmt.elseBody) {
        elseStr += "\nelse:"
        if (stmt.elseBody.body.length === 1 && isNodeType(stmt.elseBody.body[0], NodeType.IfStmt))
            elseStr = `\nel${trans(stmt.elseBody, indent - 1)}`
        else elseStr += stmt.elseBody.body.length === 1 ? ` ${elseBody}` : `\n${elseBody}`
    }
    return `if ${cond}:${bodyStr}${elseStr}`
}

function transCallExpr(call: CallExpr, indent: number): string {
    const caller = trans(call.caller, indent)

    let args = ""
    for (const arg of call.args) {
        args += trans(arg, indent) + ", "
    }

    args = args.slice(0, -2)

    return `${caller}(${args})`
}
