export enum TokenType {
    Number,
    Symbol,

    OpenBracket,
    CloseBracket,

    Comma,
    SemiColon,

    EOF,
}

const symbolToken = {
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    ",": TokenType.Comma,
    ";": TokenType.SemiColon,
} as const

export class Token {
    type: TokenType
    col: number
    row: number
    val: string

    constructor(type: TokenType, col: number, row: number, val: string) {
        this.type = type
        this.col = col
        this.row = row
        this.val = val
    }

    isTypes(...types: TokenType[]) {
        return types.some((t) => this.type === t)
    }

    isSymbols(...symbols: (keyof typeof symbolToken)[]) {
        return symbols.some((s) => this.val === s)
    }
}

export function tokenize(input = "") {
    const srcLines = input.replace("\r\n", "\n").split("\n") // window shit
    const tokens: Token[] = []

    // behold regex hell
    // if it only letter then it's a multi symbol (mul)
    // if it onlt number then it's a number (num)
    // else it's a symbol (sym)
    for (const [row, line] of srcLines.entries()) {
        for (const { groups: token, index: col } of line.matchAll(
            /(?<mul>[a-zA-Z]+)|(?<num>\d+(?:\.\d+)?)|(?<sym>[^\r\n\s])/g
        )) {
            // no group match skip
            if (!token) throw `What is this token type`
            if (token.mul) {
                tokens.push(new Token(TokenType.Symbol, col ?? -1, row, token.mul))
            } else if (token.sym) {
                tokens.push(
                    new Token(
                        symbolToken[token.sym as keyof typeof symbolToken] ?? TokenType.Symbol,
                        col ?? -1,
                        row,
                        token.sym
                    )
                )
            } else if (token.num) {
                tokens.push(new Token(TokenType.Number, col ?? -1, row, token.num))
            }
        }
    }

    tokens.push(new Token(TokenType.EOF, -1, -1, "EOF"))

    return tokens
}
