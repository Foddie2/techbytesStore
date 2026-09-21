import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment.development';

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

    // Build history excluding current prompt
    const cleanHistory = this.messages()
      .filter((m) => m.id !== '1') // Exclude initial greeting to start history with 'user'
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
      const apiUrl = environment.production
        ? '/api/ai-chat'
        : 'https://techbytes-store.vercel.app/api/ai-chat';

      console.log('📡 [Byte Sending Request to]:', apiUrl);

      if (isPlatformBrowser(this.platformId)) {
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
          // EXPOSE THE BACKEND ERROR DIRECTLY
          fullResponseText = `🚨 BACKEND ERROR (${response.status}): ${data.error || data.text || 'Check Vercel logs'}`;
        } else {
          fullResponseText = data.text || 'No text returned from Gemini.';
          responseProducts = data.products || [];
        }
      }
    } catch (err: any) {
      // EXPOSE THE NETWORK ERROR DIRECTLY
      console.error('💥 [Fetch Exception]:', err);
      fullResponseText = `🚨 NETWORK ERROR: Unable to reach endpoint. Message: ${err.message}`;
    } finally {
      this.isThinking.set(false);
    }

    await this.streamToSignal(fullResponseText, responseProducts);
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
