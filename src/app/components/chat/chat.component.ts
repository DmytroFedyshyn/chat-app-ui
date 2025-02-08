import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.startConnection();
    this.chatService.messages$.subscribe((messages: ChatMessage[]) => {
      this.messages = messages.map((msg: ChatMessage) => ({
        ...msg,
        id: msg.id || crypto.randomUUID(),
        isEditing: false
      }));
    });
  }

  sendMessage() {
    this.chatService.sendMessage('User', this.newMessage);
    this.newMessage = '';
  }

  editMessage(msg: ChatMessage) {
    msg.isEditing = true;
  }

  saveEdit(msg: ChatMessage) {
    this.chatService.editMessage(msg.id, msg.content);
    msg.isEditing = false;
  }

  deleteMessage(messageId: string) {
    this.chatService.deleteMessage(messageId);
  }

  reactToMessage(messageId: string, reaction: string) {
    this.chatService.reactToMessage(messageId, reaction);
  }
}
