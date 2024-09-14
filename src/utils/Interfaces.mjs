// Utils.mjs

export class DebugOptions {
  constructor({
    printAll = false,
    printLength = false,
    printFirst = false,
    printLast = false,
    printRank = null,
    printUser = null,
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
  Other: 3,
});

/*
 *
 * When adding a new permission, make sure you place it in the number that corresponds to the correct weight.
 * A higher weight means a higher permission level.
 *
 */
export const Permissions = Object.freeze({
  ExSplasher: 0,
  HoB: 1,
  Famous: 1,
  Splasher: 2,
  Trusted: 2,
  Staff: 3,
  Admin: 4,
  Owner: 5,
  BotAccount: 5,
});
