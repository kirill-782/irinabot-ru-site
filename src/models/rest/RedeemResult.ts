/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RedeemResult =
    | {
          ok: true;
          statusCode: 200;
          amount: number;
      }
    | {
          ok: false;
          statusCode: 409;
          reason: "code_not_found_or_activated";
      }
    | {
          ok: false;
          statusCode: 429;
          reason: "redeem_too_fast";
      }
    | {
          ok: false;
          statusCode: number;
          reason: "error";
          message: string;
      };
