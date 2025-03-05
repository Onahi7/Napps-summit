import {
  PaymentProvider,
  PaymentData,
  PaymentResult,
  RefundData,
  RefundResult,
  VerificationResult,
} from './index';

interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  testMode: boolean;
}

export class FlutterwaveProvider implements PaymentProvider {
  private config: FlutterwaveConfig | null = null;
  name = 'flutterwave';

  async initialize(config: FlutterwaveConfig): Promise<void> {
    this.config = config;
  }

  private getBaseUrl(): string {
    return 'https://api.flutterwave.com/v3';
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
      const response = await this.makeRequest('/payments', 'POST', {
        tx_ref: data.reference,
        amount: data.amount,
        currency: 'NGN',
        redirect_url: data.callback_url,
        customer: {
          email: data.email,
        },
        meta: {
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
      const response = await this.makeRequest('/transactions/refund', 'POST', {
        transaction_id: data.transactionId,
        amount: data.amount,
        note: data.reason,
        meta: {
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
      const response = await this.makeRequest(`/transactions/${reference}/verify`);

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
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
