import { PaystackProvider } from './paystack';
import { FlutterwaveProvider } from './flutterwave';

export interface PaymentProvider {
  name: string;
  initialize(config: any): Promise<void>;
  processPayment(data: PaymentData): Promise<PaymentResult>;
  processRefund(data: RefundData): Promise<RefundResult>;
  verifyTransaction(reference: string): Promise<VerificationResult>;
}

export interface PaymentData {
  amount: number;
  email: string;
  reference: string;
  metadata?: any;
  callback_url?: string;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  error?: string;
  data?: any;
}

export interface RefundData {
  transactionId: string;
  amount: number;
  reason: string;
  metadata?: any;
}

export interface RefundResult {
  success: boolean;
  reference?: string;
  error?: string;
  data?: any;
}

export interface VerificationResult {
  success: boolean;
  status: string;
  amount?: number;
  error?: string;
  data?: any;
}

class PaymentProviderFactory {
  private static providers: { [key: string]: PaymentProvider } = {
    paystack: new PaystackProvider(),
    flutterwave: new FlutterwaveProvider(),
  };

  static async getProvider(name: string): Promise<PaymentProvider> {
    const provider = this.providers[name.toLowerCase()];
    if (!provider) {
      throw new Error(`Payment provider '${name}' not supported`);
    }
    return provider;
  }

  static async initializeProvider(name: string, config: any): Promise<void> {
    const provider = await this.getProvider(name);
    await provider.initialize(config);
  }

  static getSupportedProviders(): string[] {
    return Object.keys(this.providers);
  }
}

export default PaymentProviderFactory;
