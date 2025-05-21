import { useEffect } from "react";

interface MercadoPagoProps {
  amount: number;
  email: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    MercadoPago: any;
    cardPaymentBrickController: any;
  }
}

const CardPaymentBrick: React.FC<MercadoPagoProps> = ({ amount, email, onSuccess, onError }) => {
  useEffect(() => {
    console.log('Initializing MercadoPago with amount:', amount, 'email:', email);
    
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    
    script.onload = () => {
      console.log('MercadoPago SDK loaded successfully');
      
      const mp = new window.MercadoPago("TEST-7080fcd8-5b67-4723-baf0-4e26e7773cd3", {
        locale: "es-AR"
      });

      const bricksBuilder = mp.bricks();
      console.log('Bricks builder initialized');

      const renderCardPaymentBrick = async () => {
        const settings = {
          initialization: {
            amount: amount,
            payer: {
              email: email,
            },
          },
          customization: {
            visual: {
              style: {
                theme: "default",
              },
            },
            paymentMethods: {
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {
              console.log("Payment form is ready");
            },
            onSubmit: (cardFormData: any) => {
              console.log('=== FORM SUBMISSION DETAILS ===');
              console.log('Card Form Data:', JSON.stringify(cardFormData, null, 2));
              
              const paymentData = {
                transaction_amount: amount,
                token: cardFormData.token,
                description: "Payment for order",
                installments: cardFormData.installments,
                payment_method_id: cardFormData.payment_method_id,
                payer: {
                  email: email,
                  identification: {
                    type: cardFormData.payer.identification.type,
                    number: cardFormData.payer.identification.number
                  },
                  first_name: cardFormData.payer.first_name
                }
              };

              console.log('=== PAYMENT REQUEST DATA ===');
              console.log('URL:', "http://127.0.0.1:8000/payment/mercadopago_payment/");
              console.log('Request Data:', JSON.stringify(paymentData, null, 2));
              
              return new Promise<void>((resolve, reject) => {
                fetch("http://127.0.0.1:8000/payment/mercadopago_payment/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(paymentData)
                })
                .then((response) => {
                  console.log('=== BACKEND RESPONSE ===');
                  console.log('Status:', response.status);
                  console.log('Headers:', Object.fromEntries(response.headers.entries()));
                  return response.json();
                })
                .then((data) => {
                  console.log('Response Data:', data);
                  if (data.status === 'approved') {
                    onSuccess(data);
                    resolve();
                  } else {
                    reject(new Error(data.message || 'Payment failed'));
                  }
                })
                .catch((error) => {
                  console.error("=== PAYMENT ERROR DETAILS ===");
                  console.error("Error:", error);
                  console.error("Error stack:", error.stack);
                  onError(error);
                  reject();
                });
              });
            },
            onError: (error: any) => {
              console.error("=== FORM ERROR DETAILS ===");
              console.error("Error type:", error.type);
              console.error("Error cause:", error.cause);
              console.error("Error message:", error.message);
              console.error("Full error object:", JSON.stringify(error, null, 2));
              
              if (error.type === 'non_critical') {
                console.log('Non-critical error:', error.cause);
                switch (error.cause) {
                  case 'secure_fields_card_token_creation_failed':
                    onError(new Error('Failed to process card information. Please check your card details and try again.'));
                    break;
                  case 'invalid_card_number':
                    onError(new Error('Invalid card number. Please check and try again.'));
                    break;
                  case 'invalid_cardholder_name':
                    onError(new Error('Invalid cardholder name. Please check and try again.'));
                    break;
                  case 'invalid_expiration_date':
                    onError(new Error('Invalid expiration date. Please check and try again.'));
                    break;
                  case 'invalid_security_code':
                    onError(new Error('Invalid security code. Please check and try again.'));
                    break;
                  default:
                    onError(new Error(error.message || 'An error occurred with the payment form. Please try again.'));
                }
              } else {
                onError(new Error('An unexpected error occurred with the payment form. Please try again.'));
              }
            },
          },
        };

        try {
          console.log('Creating payment form...');
          window.cardPaymentBrickController = await bricksBuilder.create(
            "cardPayment",
            "cardPaymentBrick_container",
            settings
          );
          console.log('Payment form created successfully');
        } catch (error) {
          console.error("=== FORM CREATION ERROR ===");
          console.error("Error creating payment form:", error);
          onError(new Error('Failed to initialize payment form. Please refresh the page and try again.'));
        }
      };

      renderCardPaymentBrick();
    };

    script.onerror = () => {
      console.error('Failed to load MercadoPago SDK');
      onError(new Error('Failed to load MercadoPago SDK. Please check your internet connection and try again.'));
    };

    document.body.appendChild(script);

    return () => {
      console.log('Cleaning up MercadoPago component...');
      if (window.cardPaymentBrickController) {
        window.cardPaymentBrickController.unmount();
      }
      document.body.removeChild(script);
    };
  }, [amount, email, onSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="cardPaymentBrick_container"></div>
    </div>
  );
};

export default CardPaymentBrick;
