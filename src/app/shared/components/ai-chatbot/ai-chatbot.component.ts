import { Component, signal, inject, ElementRef, ViewChild, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';
import { AuthService } from '../../../core/services/auth';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  products?: Array<{
    variantId: string;
    title: string;
    price: string;
    imageUrl: string;
  }>;
  leadCapture?: boolean;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Floating Trigger Launcher -->
    <div class="fixed bottom-6 right-6 z-50">
      @if (!isOpen()) {
        <button
          (click)="toggleChat()"
          class="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform-gpu hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
          aria-label="Open AI Shopping Assistant"
        >
          <span class="text-xl">✨</span>
          <span
            class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-2"
          >
            Ask KeyNna AI
          </span>
          <span
            class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"
          ></span>
        </button>
      } @else {
        <!-- Chatbot Window -->
        <div
          class="w-[90vw] sm:w-96 h-[550px] max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
        >
          <!-- Chat Header -->
          <div
            class="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-blue-900/40"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 text-white flex items-center justify-center font-bold text-sm"
              >
                ✨
              </div>
              <div>
                <h3 class="text-xs font-black tracking-wide">KeyNna Sales Concierge</h3>
                <p class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online & Syncing
                  Shopify
                </p>
              </div>
            </div>

            <button
              (click)="toggleChat()"
              class="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Messages Stream Container -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
            @for (msg of messages(); track msg.id) {
              <div [class.justify-end]="msg.sender === 'user'" class="flex items-start gap-2.5">
                @if (msg.sender === 'ai') {
                  <div
                    class="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  >
                    ✨
                  </div>
                }

                <div
                  [class.bg-blue-600]="msg.sender === 'user'"
                  [class.text-white]="msg.sender === 'user'"
                  [class.bg-slate-100]="msg.sender === 'ai'"
                  [class.dark:bg-slate-800]="msg.sender === 'ai'"
                  [class.text-slate-800]="msg.sender === 'ai'"
                  [class.dark:text-slate-200]="msg.sender === 'ai'"
                  class="max-w-[82%] rounded-2xl p-3 space-y-2 shadow-xs"
                >
                  <p class="leading-relaxed whitespace-pre-line">{{ msg.text }}</p>

                  <!-- Inline Product Cards Injection -->
                  @if (msg.products && msg.products.length > 0) {
                    <div
                      class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
                    >
                      @for (p of msg.products; track p.variantId) {
                        <div
                          class="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex gap-2.5 items-center"
                        >
                          <img
                            [src]="p.imageUrl"
                            [alt]="p.title"
                            class="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div class="flex-1 min-w-0">
                            <h4
                              class="font-bold text-slate-900 dark:text-white truncate text-[11px]"
                            >
                              {{ p.title }}
                            </h4>
                            <span
                              class="font-extrabold text-blue-600 dark:text-blue-400 text-[10px] block"
                              >{{ p.price }}</span
                            >
                          </div>
                          <button
                            (click)="addQuickProduct(p.variantId)"
                            class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer active:scale-95"
                          >
                            + Cart
                          </button>
                        </div>
                      }
                    </div>
                  }

                  <!-- Lead Capture Coupon Banner -->
                  @if (msg.leadCapture) {
                    <div
                      class="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-2.5 rounded-xl border border-blue-500/30 space-y-2 mt-2"
                    >
                      <p class="text-[10px] font-bold text-blue-300">
                        Unlock 10% Off + M-Pesa Checkout Voucher:
                      </p>
                      <div class="flex gap-1.5">
                        <input
                          type="email"
                          [(ngModel)]="leadEmail"
                          placeholder="Your email address"
                          class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1 rounded-lg text-[10px] w-full outline-none border border-slate-300 dark:border-slate-700"
                        />
                        <button
                          (click)="submitLead()"
                          class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg shrink-0 cursor-pointer"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  }

                  <span class="text-[9px] text-slate-400 block text-right font-mono">{{
                    msg.timestamp
                  }}</span>
                </div>
              </div>
            }

            @if (isThinking()) {
              <div
                class="flex items-center gap-2 text-slate-400 text-[11px] font-bold animate-pulse"
              >
                <span class="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                KeyNna AI is analyzing hardware catalog...
              </div>
            }
          </div>

          <!-- Quick Action Prompt Chips -->
          <div
            class="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar"
          >
            <button
              (click)="sendQuickPrompt('Track my order status')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-blue-500 cursor-pointer"
            >
              📦 Track Order
            </button>
            <button
              (click)="sendQuickPrompt('Recommend studio wireless headphones')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-blue-500 cursor-pointer"
            >
              🎧 Top Headphones
            </button>
            <button
              (click)="sendQuickPrompt('How does M-Pesa checkout work?')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-blue-500 cursor-pointer"
            >
              📱 Pay via M-Pesa
            </button>
          </div>

          <!-- Message Input Bar -->
          <form
            (submit)="sendMessage($event)"
            class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              [(ngModel)]="inputText"
              name="chatInput"
              placeholder="Ask about products, orders, or M-Pesa..."
              class="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              [disabled]="!inputText.trim() || isThinking()"
              class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold p-2 rounded-xl text-xs cursor-pointer shadow-md transition"
            >
              ➔
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class AiChatbotComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public authService = inject(AuthService);

  isOpen = signal<boolean>(false);
  isThinking = signal<boolean>(false);
  inputText = '';
  leadEmail = '';

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your KeyNna hardware assistant. How can I help you find products or resolve an order today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  constructor() {
    effect(() => {
      if (this.messages().length > 0 && this.isOpen()) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  sendQuickPrompt(promptText: string): void {
    this.inputText = promptText;
    this.sendMessage(new Event('submit'));
  }

  async sendMessage(event: Event): Promise<void> {
    event.preventDefault();
    const prompt = this.inputText.trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.inputText = '';
    this.isThinking.set(true);

    try {
      // 1. Process local intent routing for fast response
      const response = await this.queryAiBackendProxy(prompt);
      this.messages.update((prev) => [...prev, response]);
    } catch (err) {
      console.error('AI Processing error:', err);
    } finally {
      this.isThinking.set(false);
    }
  }

  async addQuickProduct(variantId: string): Promise<void> {
    await this.cartService.addToCart(variantId, 1);
    this.cartService.openDrawer();
  }

  submitLead(): void {
    if (!this.leadEmail.trim()) return;

    this.messages.update((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: `🎉 Thank you! Discount code "KEYNNA10" has been applied to your checkout session for ${this.leadEmail}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    this.leadEmail = '';
  }
  private async queryAiBackendProxy(userPrompt: string): Promise<ChatMessage> {
    const userContext = {
      isLoggedIn: this.authService.isLoggedIn(),
      userName: this.authService.currentUser()?.name || 'Guest',
      userEmail: this.authService.currentUser()?.email || '',
      cartCount: this.cartService.itemCount(),
    };

    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, userContext }),
    });

    const data = await res.json();

    return {
      id: Date.now().toString(),
      sender: 'ai',
      text:
        data.text ||
        'I can help you complete your checkout via M-Pesa or track an existing dispatch.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: data.products || undefined,
      leadCapture: !this.authService.isLoggedIn(),
    };
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  /**
   * Simulates human typing by revealing text character by character
   */
  private typeHumanMessage(fullText: string, products?: any[], leadCapture?: boolean): void {
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create an empty message shell
    this.messages.update((prev) => [
      ...prev,
      { id: messageId, sender: 'ai', text: '', timestamp, products: undefined, leadCapture: false },
    ]);

    let currentLength = 0;
    const typingInterval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 3) + 2; // Vary typing speed naturally
      const charChunk = fullText.slice(0, currentLength);

      this.messages.update((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, text: charChunk } : msg)),
      );

      if (currentLength >= fullText.length) {
        clearInterval(typingInterval);
        // 2. Attach interactive product cards or vouchers after typing completes
        this.messages.update((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, products, leadCapture } : msg)),
        );
      }
    }, 25);
  }
}
