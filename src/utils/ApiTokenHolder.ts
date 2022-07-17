import { toByteArray } from "base64-js";

export class ApiTokenHolder {
  private token;

  constructor(token: string) {
    this.token = token;
  }

  public getToken() {
    return this.token;
  }

  public hasAuthority(authority: string) {
    return false;
  }
}

export class ApiTokenJwtHolder extends ApiTokenHolder {

  private authorities: string[];

  constructor(token: string) {
    super(token);

    this.authorities = [];

    try {
      let data = token.split(".")[1];

      if(data.length % 4 != 0)
        data += "=".repeat(4 - data.length % 4 );

      const jwtPayload = JSON.parse( new TextDecoder().decode(toByteArray( data )) );

      this.authorities = jwtPayload.authorities;
    }
    catch(e) {
      console.error(e);
    }
  }
}