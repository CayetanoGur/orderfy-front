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
      const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "", {
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
                  throw new Error('Payment failed');
                }

                const data = await response.json();
                onSuccess(data);
              } catch (error) {
                console.error("Payment error:", error);
                onError(error);
              }
            },
            onError: (error: any) => {
              console.error("Form error:", error);
              onError(error);
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
          onError(error);
        }
      };

      renderCardPaymentBrick();
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
