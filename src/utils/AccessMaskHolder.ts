import { AccessListRecord } from "../models/websocket/ServerAccessList";

export class AccessMaskHolder {

  constructor() {
  }

  public getRecords(): AccessListRecord[] {
    return [];
  }

  public hasAccess(accessMask: number, spaceId?: number): boolean {
    return false;
  }
}

export class AccessMaskHolderImpl extends AccessMaskHolder {
  private records: AccessListRecord[];

  constructor(records: AccessListRecord[]) {
    super();
    this.records = records;
  }

  public getRecords() {
    return [...this.records];
  }

  public hasAccess(accessMask: number, spaceId?: number) {
    let resultAccessMask = 0;

    this.records.forEach((i) => {
      if (!spaceId || i.spaceId === spaceId) {
        resultAccessMask |= i.accessMask;
      }
    });

    return (resultAccessMask & accessMask) === accessMask;
  }
}


export class AnonymousAccessMaskHolder extends AccessMaskHolder {
  constructor() {
    super();
  }
}
