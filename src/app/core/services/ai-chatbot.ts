import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private platformId = inject(PLATFORM_ID);

  isOpen = signal<boolean>(false);
  isThinking = signal<boolean>(false);
  hasBeenNudged = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hey! Byte here. What hardware or setup query can I assist with?',
      timestamp: this.getFormattedTime(),
    },
  ]);

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  triggerProactiveNudge(messageText: string): void {
    if (this.hasBeenNudged()) return;
    this.hasBeenNudged.set(true);

    this.messages.update((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: messageText,
        timestamp: this.getFormattedTime(),
        leadCapture: true,
      },
    ]);
    this.isOpen.set(true);
  }

  async sendMessage(
    userText: string,
    userContext: {
      userName?: string;
      userEmail?: string;
      isLoggedIn?: boolean;
      cartCount?: number;
    } = {},
  ): Promise<void> {
    const trimmedText = userText.trim();
    if (!trimmedText || this.isThinking()) return;

    // Build history excluding initial greeting
    const cleanHistory = this.messages()
      .filter((m) => m.id !== '1')
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedText,
      timestamp: this.getFormattedTime(),
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.isThinking.set(true);

    let fullResponseText = '';
    let responseProducts: ChatProduct[] = [];

    try {
      // ✅ ALWAYS USE RELATIVE PATH:
      // Local dev uses proxy.conf.json -> https://techbytes-store.vercel.app
      // Production uses native Vercel route directly on the same origin
      const apiUrl = '/api/ai-chat';

      if (isPlatformBrowser(this.platformId)) {
        console.log('📡 [Byte Sending Request via proxy]:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmedText,
            history: cleanHistory.slice(-6),
            userContext,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error('Backend Status Error:', response.status, data);
          fullResponseText =
            data.text ||
            data.error ||
            'Connection dipped for a second. Mind firing that query over once more?';
        } else {
          fullResponseText = data.text || 'Byte online! How can I assist with your setup?';
          responseProducts = data.products || [];
        }
      }
    } catch (err: any) {
      console.error('💥 [Fetch Exception]:', err);
      fullResponseText = 'Connection dipped for a second. Mind firing that query over once more?';
    } finally {
      this.isThinking.set(false);
    }

    if (fullResponseText) {
      await this.streamToSignal(fullResponseText, responseProducts);
    }
  }

  private async streamToSignal(fullText: string, products?: ChatProduct[]): Promise<void> {
    const msgId = (Date.now() + 1).toString();
    const timestamp = this.getFormattedTime();

    this.messages.update((prev) => [...prev, { id: msgId, sender: 'ai', text: '', timestamp }]);

    if (!isPlatformBrowser(this.platformId)) {
      this.messages.update((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: fullText, products } : m)),
      );
      return;
    }

    let charIndex = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        charIndex += Math.floor(Math.random() * 3) + 2;
        const textChunk = fullText.slice(0, charIndex);

        this.messages.update((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: textChunk } : m)),
        );

        if (charIndex >= fullText.length) {
          clearInterval(interval);
          this.messages.update((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, text: fullText, products } : m)),
          );
          resolve();
        }
      }, 15);
    });
  }

  private getFormattedTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
