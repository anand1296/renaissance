import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public searchQuery$: Subject<{ msg: ChatMessage, showCharts: boolean, showTradeArea: boolean }> = new Subject();

  constructor() { }

  setSearchQuery(botRespObj: { msg: ChatMessage, showCharts: boolean, showTradeArea: boolean }) {
    this.searchQuery$.next(botRespObj);
  }
}
