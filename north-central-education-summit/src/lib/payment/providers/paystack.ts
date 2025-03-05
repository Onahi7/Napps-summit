import {
  PaymentProvider,
  PaymentData,
  PaymentResult,
  RefundData,
  RefundResult,
  VerificationResult,
} from './index';

interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  testMode: boolean;
}

export class PaystackProvider implements PaymentProvider {
  private config: PaystackConfig | null = null;
  name = 'paystack';

  async initialize(config: PaystackConfig): Promise<void> {
    this.config = config;
  }

  private getBaseUrl(): string {
    return 'https://api.paystack.co';
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<any> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const response = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    return result;
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await this.makeRequest('/transaction/initialize', 'POST', {
        email: data.email,
        amount: Math.round(data.amount * 100), // Convert to kobo
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: {
          ...data.metadata,
          provider: this.name,
        },
      });

      return {
        success: true,
        reference: data.reference,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  async processRefund(data: RefundData): Promise<RefundResult> {
    try {
      const response = await this.makeRequest('/refund', 'POST', {
        transaction: data.transactionId,
        amount: Math.round(data.amount * 100), // Convert to kobo
        merchant_note: data.reason,
        metadata: {
          ...data.metadata,
          provider: this.name,
        },
      });

      return {
        success: true,
        reference: response.data.reference,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund processing failed',
      };
    }
  }

  async verifyTransaction(reference: string): Promise<VerificationResult> {
    try {
      const response = await this.makeRequest(`/transaction/verify/${reference}`);

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount / 100, // Convert from kobo
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        error: error.message || 'Transaction verification failed',
      };
    }
  }
}
