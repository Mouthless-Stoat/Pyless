import {
    Block,
    type Expr,
    type Stmt,
    BinaryExpr,
    type BinaryType,
    NumberLiteral,
    Identifier,
    AssignmentExpr,
    StringLiteral,
} from "./ast"
import { TokenType, Token, tokenize } from "./lexer"

const Multiplicative = [TokenType.Star, TokenType.Slash] as const
const Additive = [TokenType.Plus, TokenType.Minus] as const

export default class Parser {
    tokens: Token[] = []

    private current(): Token {
        return this.tokens[0]
    }

    private next(): Token {
        return this.tokens.shift() as Token
    }

    private expect(type: TokenType, err: string, detail: boolean = false): Token {
        const tk = this.next()
        if (!tk || !tk.isTypes(type)) {
            throw err + detail ? ` at line ${tk.row} and column ${tk.col}` : ""
        }
        return tk
    }

    private isTypes(...types: TokenType[]): boolean {
        return this.current().isTypes(...types)
    }

    genAST(source: string): Block {
        const body: Stmt[] = []

        this.tokens = tokenize(source)

        while (this.tokens.length > 0) {
            body.push(this.parseStmt())
            const token = this.next()
            if (!token.isTypes(TokenType.EOL)) {
                throw `SyntaxError: Unexpected Token \`${token.val}\` at line ${token.row + 1} and column ${
                    token.col + 1
                }`
            }
        }

        return new Block(body)
    }

    private parseStmt(): Stmt {
        return this.parseExpr()
    }

    private parseExpr(): Expr {
        return this.parseAssignmentExpr()
    }

    private parseAssignmentExpr(): Expr {
        let sym = this.parseAdditiveExpr()
        if (this.isTypes(TokenType.Equal)) {
            this.next()
            const val = this.parseExpr()
            return new AssignmentExpr(sym, val)
        }
        return sym
    }

    private parseAdditiveExpr(): Expr {
        let left = this.parseMutiplicativeExpr()
        while (this.current().isTypes(...Additive)) {
            const op = this.next().val as BinaryType
            const right = this.parseMutiplicativeExpr()
            left = new BinaryExpr(left, right, op)
        }
        return left
    }

    private parseMutiplicativeExpr(): Expr {
        let left = this.parsePrimary()
        while (this.current().isTypes(...Multiplicative)) {
            const op = this.next().val as BinaryType
            const right = this.parsePrimary()
            left = new BinaryExpr(left, right, op)
        }
        return left
    }

    private parsePrimary(): Expr {
        switch (this.current().type) {
            case TokenType.Number:
                return new NumberLiteral(this.next().val)
            case TokenType.String:
                return new StringLiteral(this.next().val)
            case TokenType.Symbol:
                return new Identifier(this.next().val)
            case TokenType.OpenParen:
                this.next()
                const expr = this.parseExpr()
                expr.paren = true
                this.expect(TokenType.CloseParen, "SyntaxError: Expected `)`", true)
                return expr
            default:
                const token = this.current()
                if (token.isTypes(TokenType.EOL)) throw `SyntaxError: Unexpected End of Line on line ${token.row + 1}`
                throw `SyntaxError: Unexpected Token \`${token.val}\` at line ${token.row + 1} and column ${
                    token.col + 1
                }`
        }
    }
}
