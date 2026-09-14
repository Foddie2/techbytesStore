import { Injectable, signal, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AiChatbotService {
  isOpen = signal<boolean>(false);
  hasBeenNudged = signal<boolean>(false);
  messages = signal<any[]>([]);

  openChat(): void {
    this.isOpen.set(true);
  }

  /**
   * Proactive trigger with single-session guard
   */
  triggerProactiveNudge(messageText: string): void {
    if (this.hasBeenNudged()) return; // Session cap

    this.hasBeenNudged.set(true);

    const nudgeMsg = {
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
