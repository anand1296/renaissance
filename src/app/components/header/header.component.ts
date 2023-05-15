import { Component, OnInit } from '@angular/core';
import { ChatMessage, ChatOptionsButton } from 'src/app/models/chat-message.model';
import { ChatService } from 'src/app/services/chat.service';
import { DataService } from 'src/app/services/data.service';
import { VoiceRecognitionService } from 'src/app/services/voice-recognition.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  //icons
  public productLogo: string = '/assets/images/renaissance-logo.png';

  public searchQuery = '';
  public botMessage: ChatMessage | any;
  public showDefaultPlaceholder: boolean = false;
  public isUserSpeaking: boolean = false;

  constructor(private dataService: DataService, private chatService: ChatService,
    private voiceRecognitionService: VoiceRecognitionService) { }

  ngOnInit(): void {
    //
    this.initVoiceInput();
    this.chatService.chatMsgListUpdated.subscribe(() => {
      const botMsgList = this.chatService.getMsgList().filter((msg) => msg.type === 'bot');
      this.botMessage = botMsgList[botMsgList.length-1];
      this.showDefaultPlaceholder = false;
    });
  }

  sendQuery(userInput?: string) {
    this.isUserSpeaking = false;
    const msgList: Array<ChatMessage> = this.chatService.getMsgList();
    const msgObject: ChatMessage = {
      id: msgList[msgList.length-1].id+1,
      msg: userInput ?? this.searchQuery,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'user'
    };
    this.chatService.addMsg(msgObject);

    //
    // if(userInput?.toLowerCase().includes('hi') || this.searchQuery?.toLowerCase().includes('hi')) {
    //   this.chatService.addBotMsg();
    // }
    // else {
    //   this.showDefaultPlaceholder = true;
    // }

    // this.dataService.setSearchQuery(msgObject);
    this.searchQuery = '';
    //send message to api & get bot resp & push it in msg array
    this.chatService.sendMessage(msgObject).subscribe((resp: any) => {
      if(resp.payload.msg) {
        this.chatService.addMsg(resp.payload.msg);
      }
    }, (err) => {
    });
  }

  onClickButtonOption(buttonItem: ChatOptionsButton): void {
    // this.sendQuery(buttonItem.text);
    // // this.chatService.hideMsgOptions(msgIndex);
    // if (buttonItem.value === 'option_3') {
    //   this.dataService.setSearchQuery(buttonItem.text);
    // }
    this.searchQuery = buttonItem.text;
    // if (buttonItem.value === 'option_3') {
      // this.dataService.setSearchQuery(buttonItem.text);
      this.showDefaultPlaceholder = true;
    // }
    this.searchQuery = '';
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
