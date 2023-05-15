
export interface ChatOptionsButton {
    value: string,
    text: string,
    disabled: boolean,
    styleClass: string
}

export interface ChatMsgOptions {
    type: string,
    buttons?: Array<ChatOptionsButton>
}

export interface ChatMessage {
    id: number,
    msg: string,
    timestamp: Date | string,
    type: string,
    options?: ChatMsgOptions | null
}