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
    Propety,
    DictionaryLiteral,
    isNodeType,
    NodeType,
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

    private expect(type: TokenType, err: string, detail: boolean = true): Token {
        const tk = this.next()
        if (!tk || !tk.isTypes(type)) {
            throw err + (detail ? ` at line ${tk.row + 1} and column ${tk.col + 1}` : "")
        }
        return tk
    }

    private error(err: string, token: Token, auto: boolean = false): never {
        if (auto) err = `SyntaxError: Unexpected Token \`${token.val}\``
        throw err + ` at line ${token.row + 1} and column ${token.col + 1}`
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
            if (!token.isTypes(TokenType.EOL)) this.error("", token, true)
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
        const symTk = this.current()
        let sym = this.parseAdditiveExpr()
        if (this.isTypes(TokenType.Equal)) {
            if (!isNodeType(sym, NodeType.Identifier)) this.error("SyntaxError: Invalid Left hand of Assignment", symTk)
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
                return new StringLiteral(this.next().val.slice(1, -1))
            case TokenType.Symbol:
                return new Identifier(this.next().val)
            case TokenType.OpenParen:
                this.next()
                const expr = this.parseExpr()
                // nullish cus if undefined then return true which get flip back to false
                if (!(expr.paren ?? true)) expr.paren = true
                this.expect(TokenType.CloseParen, "SyntaxError: Expected `)`")
                return expr
            case TokenType.OpenBrace:
                return this.parseDict()
            default:
                const token = this.current()
                if (token.isTypes(TokenType.EOL)) throw `SyntaxError: Unexpected End of Line on line ${token.row + 1}`
                return this.error("", token, true)
        }
    }

    private parseDict(): Expr {
        this.expect(TokenType.OpenBrace, "PylessBug: Expected `{`")
        const prop: Propety[] = []
        while (!this.isTypes(TokenType.CloseBrace)) {
            const keyTk = this.current()
            const key = this.parseExpr()

            let keyStr

            if (isNodeType(key, NodeType.Identifier)) keyStr = new StringLiteral((key as Identifier).symbol)

            if (this.isTypes(TokenType.Comma) || this.isTypes(TokenType.CloseBrace)) {
                if (this.isTypes(TokenType.Comma)) this.next()
                prop.push(new Propety(keyStr ?? key, key))
                continue
            }

            this.expect(TokenType.Colon, "SyntaxError: Expected `:`")
            let isString = true
            if (this.current().isTypes(TokenType.Equal)) {
                this.next()
                isString = false
            }

            const val = this.parseExpr()

            if (!isNodeType(key, NodeType.Identifier) && !isString)
                this.error(`SyntaxError: Expected Identifier`, keyTk)

            prop.push(new Propety(isString ? keyStr ?? key : key, val))

            if (!this.isTypes(TokenType.CloseBrace)) {
                this.expect(TokenType.Comma, "SyntaxError: Expected `,`")
            }
        }

        this.expect(TokenType.CloseBrace, "SyntaxErrpr: Expected `}`")

        return new DictionaryLiteral(prop)
    }
}
