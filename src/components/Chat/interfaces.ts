/** Вид сообщения */
export interface Message {
  /** Дата прихода сообщения */
  date: string;
  /** Сообщение */
  message: string;
  /** Является ли входящим */
  isIncoming: boolean;
}

/** Польователь в чате */
export interface User {
  name: string;
  messages: Message[];
  /** Признак новых сообщений */
  newMessages: boolean;
}
