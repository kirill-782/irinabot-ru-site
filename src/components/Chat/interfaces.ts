/** Вид сообщения */
export interface Message {
    /** Дата прихода сообщения */
    date: Date;
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
    lastMessage: Message;
    isPinned: boolean;
}

/** Пропсы чата */
export interface ChatProps {
    /** Изменить иконку непрочитанных сообщений в footer */
    setUnreadMessages(val: boolean): void;
    open: boolean;
    setOpen: React.Dispatch<boolean>;
}

export enum SelectionType {
    CONSOLE,
    USER,
}
