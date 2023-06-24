export const enum UserStatus {
  OFFLINE = 0,
  ONLINE = 1,
  ACTIVE = 2,
  BUSY = 3,
  INVISIBILITY = 4,
  DO_NOT_DISTURB = 5,
}

export const enum UserPrivilege {}

export const enum UserGender {
  MAN = 0,
  WOMAN = 1,
  NONE = 3,
}

/**
 * 聊天的角色方
 */
export const enum MessageRole {
  /**我 */
  ME = 0,
  /**对方 */
  OTHER = 1,
}

/**
 * 消息类型
 */
export enum MessageType {
  FRIEND_MSG = 0,
  GROUP_MSG = 1,
}
