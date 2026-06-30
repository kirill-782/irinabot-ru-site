import { toByteArray } from "base64-js";
import { ANONYMOUS_AUTHORITIES } from "../config/ApiConfig";

export class ApiTokenHolder {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public getToken() {
        return this.token;
    }

    public hasAuthority(authority: string) {
        return false;
    }

    // Идентификатор владельца токена (claim `sub`). Нужен, например, чтобы сопоставить
    // пользователя с owner-ом wiki. У безтокенных/неразобранных холдеров — undefined.
    public getSubject(): string | undefined {
        return undefined;
    }

    public hasToken() {
        return this.token.length > 0;
    }
}

export class ApiTokenJwtHolder extends ApiTokenHolder {
    private authorities: string[];
    private subject?: string;

    constructor(token: string) {
        super(token);

        this.authorities = [];

        try {
            let data = token.split(".")[1];

            if (data.length % 4 !== 0) data += "=".repeat(4 - (data.length % 4));

            const jwtPayload = JSON.parse(new TextDecoder().decode(toByteArray(data)));

            this.authorities = jwtPayload.authorities;
            this.subject = jwtPayload.sub;
        } catch (e) {
            console.error(e);
        }
    }

    public hasAuthority(authority: string) {
        return !!this.authorities.find((value: string) => {
            return value.toLocaleLowerCase() === authority.toLocaleLowerCase();
        });
    }

    public getSubject() {
        return this.subject;
    }
}

export class AnonymousTokenHolder extends ApiTokenHolder {
    constructor() {
        super("");
    }

    public hasAuthority(authority: string) {
        return !!ANONYMOUS_AUTHORITIES.find((value: string) => {
            return value.toLocaleLowerCase() === authority.toLocaleLowerCase();
        });
    }
}
