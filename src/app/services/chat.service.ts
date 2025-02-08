import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  user: string;
  content: string;
  isEditing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  constructor() {}

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connected to SignalR!'))
      .catch(err => console.error('SignalR Error:', err));

    this.hubConnection.on('ReceiveMessage', (user: string, content: string) => {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(), // Генерація унікального ID
        user,
        content,
        isEditing: false
      };

      const currentMessages = this.messagesSubject.getValue();
      this.messagesSubject.next([...currentMessages, newMessage]);
    });
  }

  sendMessage(user: string, content: string): void {
    if (this.hubConnection) {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        user,
        content,
        isEditing: false
      };

      this.hubConnection.invoke('SendMessage', newMessage)
        .catch(err => console.error('Error sending message:', err));
    }
  }

  deleteMessage(messageId: string) {
    this.hubConnection.invoke('DeleteMessage', messageId)
      .catch(err => console.error('Error deleting message:', err));
  }

  editMessage(messageId: string, newContent: string) {
    this.hubConnection.invoke('EditMessage', messageId, newContent)
      .catch(err => console.error('Error editing message:', err));
  }

  reactToMessage(messageId: string, reaction: string) {
    this.hubConnection.invoke('ReactToMessage', messageId, reaction)
      .catch(err => console.error('Error reacting to message:', err));
  }
}