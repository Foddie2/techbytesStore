import { TestBed } from '@angular/core/testing';

import { AiChatbot } from './ai-chatbot';

describe('AiChatbot', () => {
  let service: AiChatbot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiChatbot);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
