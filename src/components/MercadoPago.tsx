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
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => {
      const mp = new window.MercadoPago("TEST-7080fcd8-5b67-4723-baf0-4e26e7773cd3", {
        locale: "es-AR"
      });

      const bricksBuilder = mp.bricks();

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
                theme: "flat",
                customVariables: {
                  formBackgroundColor: "#FFFFFF",
                  baseColor: "#009EE3"
                }
              }
            }
          },
          callbacks: {
            onReady: () => {
              console.log("Payment form is ready");
            },
            onSubmit: async (cardFormData: any) => {
              try {
                // Convert the data to FormData format
                const formData = new FormData();
                formData.append("transaction_amount", amount.toString());
                formData.append("token", cardFormData.token);
                formData.append("description", "Payment for order");
                formData.append("installments", cardFormData.installments.toString());
                formData.append("payment_method_id", cardFormData.payment_method_id);
                formData.append("cardholderEmail", email);
                formData.append("identificationType", cardFormData.payer.identification.type);
                formData.append("identificationNumber", cardFormData.payer.identification.number);
                formData.append("cardholderName", cardFormData.payer.first_name);

                const response = await fetch("http://127.0.0.1:8000/payment/mercadopago_payment/", {
                  method: "POST",
                  body: formData,
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Payment failed');
                }

                const data = await response.json();
                onSuccess(data);
              } catch (error) {
                console.error("Payment error:", error);
                if (error instanceof Error) {
                  if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                    onError(new Error('Payment processing is being blocked by your browser. Please disable any ad blockers or security extensions and try again.'));
                  } else {
                    onError(error);
                  }
                } else {
                  onError(new Error('An unexpected error occurred during payment processing. Please try again.'));
                }
              }
            },
            onError: (error: any) => {
              console.error("Form error:", error);
              
              // Handle specific error cases
              if (error.type === 'non_critical') {
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
              } else if (error instanceof Error) {
                if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                  onError(new Error('Payment form is being blocked by your browser. Please disable any ad blockers or security extensions and try again.'));
                } else {
                  onError(error);
                }
              } else {
                onError(new Error('An unexpected error occurred with the payment form. Please try again.'));
              }
            },
          },
        };

        try {
        window.cardPaymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          settings
        );
        } catch (error) {
          console.error("Error creating payment form:", error);
          onError(new Error('Failed to initialize payment form. Please refresh the page and try again.'));
        }
      };

      renderCardPaymentBrick();
    };

    script.onerror = () => {
      onError(new Error('Failed to load MercadoPago SDK. Please check your internet connection and try again.'));
    };

    document.body.appendChild(script);

    return () => {
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
