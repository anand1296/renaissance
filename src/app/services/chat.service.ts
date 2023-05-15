import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatMessage, ChatMsgOptions } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private messages: Array<ChatMessage> = [];
  public chatMsgListUpdated: Subject<{}> = new Subject();
  private baseUrl: string = environment.baseUrl;
  private endpoint: string = 'AI';

  constructor(private httpClient: HttpClient) { }

  addMsg(msg: ChatMessage) {
    const botMessages = this.messages.filter((msg) => msg.type === 'bot');
    if (botMessages[botMessages.length - 1]?.options?.buttons?.length) {
      this.hideMsgOptions(botMessages[botMessages.length - 1].id - 1);
    }
    if (!this.messages.some((item) => item.id === msg.id)) {
      this.messages.push(msg);
    }
    this.chatMsgListUpdated.next({});
    // this.addBotMsg();
  }

  //localtest
  addBotMsg() {
    const msgObject2: ChatMessage = {
      id: this.messages[this.messages.length - 1].id + 1,
      msg: 'Please select one of the options to proceed further.',
      timestamp: new Date(+1).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'bot',
      options: {
        type: 'buttons',
        buttons: [
          {
            value: 'option_1',
            text: 'Option 1',
            disabled: false,
            styleClass: 'success'
          },
          {
            value: 'option_2',
            text: 'Option 2',
            disabled: false,
            styleClass: 'danger'
          },
          {
            value: 'option_3',
            text: 'Option 3',
            disabled: false,
            styleClass: 'info'
          }
        ]
      }
    };
    this.addMsg(msgObject2);
  }

  removeMsg(index: number) {
    if (this.messages.some((item) => item.id === index+1)) {
      this.messages.splice(index, 1);
    }
    this.chatMsgListUpdated.next({});
  }

  hideMsgOptions(index: number): void {
    this.messages = [...this.messages].map((msg: ChatMessage, currIndex: number) => {
      if (index === currIndex) {
        return {
          ...msg,
          options: this.getUpdatedOptions(msg.options)
        }
      }
      else {
        return msg
      }
    });
    console.log(this.messages);
    this.chatMsgListUpdated.next({});
  }

  getUpdatedOptions(options: ChatMsgOptions | null | undefined): ChatMsgOptions | null | undefined {
    if (options?.type === 'buttons' && options.buttons?.length) {
      return {
        ...options,
        buttons: [...options.buttons].map((btn) => {
          return {
            ...btn,
            disabled: true
          }
        })
      }
    }
    else {
      return options;
    }
  }

  getMsgList(): Array<ChatMessage> {
    return this.messages;
  }

  sendMessage(payload: ChatMessage) {
    const url: string = `${this.baseUrl}/${this.endpoint}`;
    return this.httpClient.post(url, payload)
      .pipe(catchError(this.formatErrors));
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }
}
