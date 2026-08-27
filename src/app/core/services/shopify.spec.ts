import { TestBed } from '@angular/core/testing';

import { Shopify } from './shopify';

describe('Shopify', () => {
  let service: Shopify;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Shopify);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
