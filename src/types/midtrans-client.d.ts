declare module 'midtrans-client' {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    
    createTransaction(parameter: any): Promise<{
      token: string;
      redirect_url: string;
    }>;
  }
  
  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    
    transaction: {
      status(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      approve(orderId: string): Promise<any>;
      deny(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameter?: any): Promise<any>;
    };
    
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    cardToken(parameter: any): Promise<any>;
    cardPointInquiry(tokenId: string): Promise<any>;
  }
}