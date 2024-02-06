export enum TokenType {
    Number,
    Symbol,

    OpenParen,
    CloseParen,
    OpenBracket,
    CloseBracket,

    Comma,
    Dot,
    Plus,
    Minus,
    Star,
    Slash,
    Percent,
    Equal,

    Function,

    EOL,
}

const symbolToken = {
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    ",": TokenType.Comma,
    ".": TokenType.Dot,
    "+": TokenType.Plus,
    "-": TokenType.Minus,
    "*": TokenType.Star,
    "/": TokenType.Slash,
    "%": TokenType.Percent,
    "=": TokenType.Equal,
    "\n": TokenType.EOL,
    ";": TokenType.EOL,
} as const

const keywordToken = {
    fn: TokenType.Function,
} as const

export class Token {
    type: TokenType
    row: number
    col: number
    val: string

    constructor(type: TokenType, row: number, col: number, val: string) {
        this.type = type
        this.row = row
        this.col = col
        this.val = val
    }

    isTypes(...types: TokenType[]) {
        return types.some((t) => this.type === t)
    }

    isSymbols(...symbols: (keyof typeof symbolToken)[]) {
        return symbols.some((s) => this.val === s)
    }
}

export function tokenize(input = ""): Token[] {
    const srcLines = input.replace("\r\n", "\n").split("\n") // window shit
    const tokens: Token[] = []

    // behold regex hell
    // if it only letter then it's a multi symbol (mul)
    // if it onlt number then it's a number (num)
    // else it's a symbol (sym)
    for (const [row, line] of srcLines.entries()) {
        for (const { groups: token, index: col } of line.matchAll(
            /(?<mul>[a-zA-Z]+)|(?<num>\d+(?:\.\d+)?(?:e-?\d+)?)|(?<sym>[^\s])/g
        )) {
            if (!token) throw `What is this token type`

            if (token.mul) {
                tokens.push(
                    new Token(
                        keywordToken[token.mul as keyof typeof keywordToken] ?? TokenType.Symbol,
                        row,
                        col ?? -1,
                        token.mul
                    )
                )
            } else if (token.sym) {
                tokens.push(
                    new Token(
                        symbolToken[token.sym as keyof typeof symbolToken] ?? TokenType.Symbol,
                        row,
                        col ?? -1,
                        token.sym
                    )
                )
            } else if (token.num) {
                tokens.push(new Token(TokenType.Number, row, col ?? -1, token.num))
            }
        }

        tokens.push(new Token(TokenType.EOL, row, -1, "EOL"))
    }

    return tokens
}
