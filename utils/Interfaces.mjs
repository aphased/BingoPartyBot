// Utils.mjs

export class DebugOptions {
  constructor({
    printAll = false,
    printLength = false,
    printFirst = false,
    printLast = false,
    printRank = null,
    printUser = null
  } = {}) {
    this.printAll = printAll;
    this.printLength = printLength;
    this.printFirst = printFirst;
    this.printLast = printLast;
    this.printRank = printRank;
    this.printUser = printUser;
  }
}

export const MessageType = Object.freeze({
  Whisper: 0,
  PartyInvite: 1,
  PartyMessage: 2,
  Other: 3
});
