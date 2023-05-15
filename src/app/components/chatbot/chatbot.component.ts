import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ChatMessage, ChatOptionsButton } from 'src/app/models/chat-message.model';
import { ChatService } from 'src/app/services/chat.service';
import { DataService } from 'src/app/services/data.service';
import { VoiceRecognitionService } from 'src/app/services/voice-recognition.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})

export class ChatbotComponent implements OnInit {

  //icons
  public productLogo: string = '/assets/images/renaissance-logo.png';

  @ViewChild('chatWrapper') chatWrapper: ElementRef = new ElementRef(null);
  @Output() closeChatbot_: EventEmitter<boolean> = new EventEmitter(false)

  public messages: Array<ChatMessage> = [];
  public searchQuery: string = '';
  public isUserSpeaking: boolean = false;
  public botMsgLoader: boolean = false;

  constructor(private dataService: DataService, private chatService: ChatService, 
    private voiceRecognitionService: VoiceRecognitionService) { }

  ngOnInit() {
    this.initVoiceInput();
    this.messages = this.chatService.getMsgList();
    const msgObject2: ChatMessage = {
      id: 1,
      msg: 'Hi! How may I help you?',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'bot'
      // options: {
      //   type: 'buttons',
      //   buttons: [
      //     {
      //       value: 'option_1',
      //       text: 'Option 1',
      //       disabled: false,
      //       styleClass: 'success'
      //     },
      //     {
      //       value: 'option_2',
      //       text: 'Option 2',
      //       disabled: false,
      //       styleClass: 'danger'
      //     },
      //     {
      //       value: 'option_3',
      //       text: 'Option 3',
      //       disabled: false,
      //       styleClass: 'info'
      //     }
      //   ]
      // }
    };
    // this.messages.push(msgObject2);
    this.chatService.addMsg(msgObject2);
    this.scrollToBottom();

    //
    this.chatService.chatMsgListUpdated.subscribe(() => {
      this.messages = this.chatService.getMsgList();
      console.log(this.messages);
      this.scrollToBottom();
    });
  }

  sendQuery(userInput?: string) {
    // const botMessages = [...this.chatService.getMsgList().filter((msg) => msg.type === 'bot')];
    // if(botMessages[botMessages.length-1]?.options?.buttons?.length) {
    //   this.chatService.hideMsgOptions(botMessages[botMessages.length-1].id-1);
    // }
    this.isUserSpeaking = false;
    const msgObject: ChatMessage = {
      id: this.messages[this.messages.length-1].id+1,
      msg: userInput ?? this.searchQuery,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'user'
    };
    // this.messages.push(msgObject);
    this.chatService.addMsg(msgObject);
    this.searchQuery = '';
    //send message to api & get bot resp & push it in msg array
    this.botMsgLoader = true;
    this.chatService.sendMessage(msgObject).subscribe((resp: any) => {
      if(resp.payload.msg) {
        this.chatService.addMsg(resp.payload.msg);
      }
      this.dataService.setSearchQuery(resp.payload);
      this.botMsgLoader = false;
    }, (err) => {
      this.botMsgLoader = false;
    });

    //adding loader
    // const msgObject_loader: ChatMessage = {
    //   id: this.messages[this.messages.length-1].id+1,
    //   msg: '',
    //   type: 'loader',
    //   timestamp: new Date()
    // };
    // this.chatService.addMsg(msgObject_loader);
    // setTimeout(() => {
    //   this.chatService.removeMsg(this.messages[this.messages.length-1].id+1);
    //   if(userInput?.toLowerCase().includes('hi') || this.searchQuery?.toLowerCase().includes('hi')) {
    //     this.chatService.addBotMsg();
    //   }
  
    //   this.searchQuery = '';
    //   this.scrollToBottom();
    // }, 5000)
    // // this.scrollToBottom();
    // console.log(this.messages);
  }

  scrollToBottom(): void {
    // console.log(this.chatWrapper.nativeElement, this.chatWrapper.nativeElement.top, this.chatWrapper.nativeElement.scrollHeight)
    setTimeout(() => {
      this.chatWrapper?.nativeElement?.scrollTo({
        top: this.chatWrapper?.nativeElement?.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
    }, 100);
  }

  onClickButtonOption(buttonItem: ChatOptionsButton, msgIndex: number): void {
    this.sendQuery(buttonItem.text);
    // this.chatService.hideMsgOptions(msgIndex);
    // if (buttonItem.value === 'option_3') {
      // this.dataService.setSearchQuery(buttonItem.text);
    // }
  }

  closeChatbot(): void {
    this.closeChatbot_.emit(true)
  }

  stopRecording(): void {
    this.voiceRecognitionService.stop();
    this.isUserSpeaking = false;
  }

  /**
   * @description Function for initializing voice input so user can chat with machine.
   */
   initVoiceInput() {
    // Subscription for initializing and this will call when user stopped speaking.
    this.voiceRecognitionService.init().subscribe(() => {
      // User has stopped recording
      // Do whatever when mic finished listening
    });

    // Subscription to detect user input from voice to text.
    this.voiceRecognitionService.speechInput().subscribe((input: string) => {
      // Set voice text output to
      // this.searchForm.controls.searchText.setValue(input);
      // console.log(input);
      this.searchQuery = this.isUserSpeaking ? input : this.searchQuery;
    });
  }

  /**
   * @description Function to enable voice input.
   */
  startRecording() {
    this.isUserSpeaking = true;
    this.voiceRecognitionService.start();
    this.searchQuery = '';
  }

}
