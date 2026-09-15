import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth';

export interface ChatProduct {
  variantId: string;
  title: string;
  price: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  products?: ChatProduct[];
  leadCapture?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatbotService {
  private authService = inject(AuthService);

  isOpen = signal<boolean>(false);
  isThinking = signal<boolean>(false);
  hasBeenNudged = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your KeyNna hardware assistant. How can I help you find products or resolve an order today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  openChat(): void {
    this.isOpen.set(true);
  }

  triggerProactiveNudge(messageText: string): void {
    if (this.hasBeenNudged()) return;

    this.hasBeenNudged.set(true);

    const nudgeMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leadCapture: true,
    };

    this.messages.update((prev) => [...prev, nudgeMsg]);
    this.openChat();
  }
}
