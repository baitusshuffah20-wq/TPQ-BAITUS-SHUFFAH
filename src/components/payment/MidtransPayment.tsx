'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

interface MidtransPaymentProps {
  token: string;
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap: any;
  }
}

const MidtransPayment: React.FC<MidtransPaymentProps> = ({
  token,
  onSuccess,
  onPending,
  onError,
  onClose
}) => {
  useEffect(() => {
    if (window.snap && token) {
      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          onSuccess?.(result);
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
          onPending?.(result);
        },
        onError: (result: any) => {
          console.log('Payment error:', result);
          onError?.(result);
        },
        onClose: () => {
          console.log('Payment popup closed');
          onClose?.();
        }
      });
    }
  }, [token, onSuccess, onPending, onError, onClose]);

  return (
    <>
      <Script
        src={`https://app.${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? '' : 'sandbox.'}midtrans.com/snap/snap.js`}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </>
  );
};

export default MidtransPayment;
