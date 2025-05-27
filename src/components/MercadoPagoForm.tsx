import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    Mercadopago: any;
  }
}

interface MercadoPagoFormProps {
  total: number;
}

const MercadoPagoForm: React.FC<MercadoPagoFormProps> = ({ total }) => {
  const { branchSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      try {
        const mercadopago = new window.MercadoPago('TEST-7080fcd8-5b67-4723-baf0-4e26e7773cd3', {
          locale: 'es-AR',
          advancedFraudPrevention: false
        });
        setMp(mercadopago);
      } catch (error) {
        console.error('Error initializing MercadoPago:', error);
      }
    };
    script.onerror = (error) => {
      console.error('Error loading MercadoPago SDK:', error);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mp) return;

    try {
      const cf = mp.cardForm({
        amount: total.toString(),
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Titular de la tarjeta",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail",
          },
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número de la tarjeta",
          },
          cardExpirationMonth: {
            id: "form-checkout__cardExpirationMonth",
            placeholder: "Mes",
          },
          cardExpirationYear: {
            id: "form-checkout__cardExpirationYear",
            placeholder: "Año",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "Código de seguridad",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Cuotas",
          },
          identificationType: {
            id: "form-checkout__identificationType",
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "Número de documento",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emisor",
          },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.error("Form Mounted error:", error);
              return;
            }
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            setLoading(true);
            try {
              const cardData = cf.getCardFormData();
              console.log('Form data collected from SDK:', cardData);
            
              const formData = {
                transaction_amount: total,
                token: cardData.token,
                description: "Test payment",
                installments: Number(cardData.installments),
                payment_method_id: cardData.paymentMethodId,
                payer: {
                  email: cardData.cardholderEmail,
                  identification: {
                    type: cardData.identificationType,
                    number: cardData.identificationNumber
                  },
                  first_name: cardData.cardholderName
                }
              };
            
              console.log('Sending form data to backend:', formData);
            
              const response = await fetch(`http://127.0.0.1:8000/payment/mercado_pago/${branchSlug}/process_payment/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
              });
            
              const data = await response.json();
              console.log('Backend response data:', data);
            } catch (error) {
              console.error('Error processing payment:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      });
      setCardForm(cf);
    } catch (error) {
      console.error('Error creating card form:', error);
    }
  }, [mp, branchSlug, total]);

  return (
    <div className="max-w-md mx-auto p-6">
      <form id="form-checkout" className="space-y-4">
        <div>
          <input type="text" id="form-checkout__cardholderName" className="w-full p-2 border rounded" />
        </div>
        <div>
          <input type="email" id="form-checkout__cardholderEmail" className="w-full p-2 border rounded" />
        </div>
        <div>
          <input type="text" id="form-checkout__cardNumber" className="w-full p-2 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input type="text" id="form-checkout__cardExpirationMonth" className="w-full p-2 border rounded" />
          </div>
          <div>
            <input type="text" id="form-checkout__cardExpirationYear" className="w-full p-2 border rounded" />
          </div>
        </div>
        <div>
          <input type="text" id="form-checkout__securityCode" className="w-full p-2 border rounded" />
        </div>
        <div>
          <select id="form-checkout__installments" className="w-full p-2 border rounded">
            <option value="">Seleccione cuotas</option>
          </select>
        </div>
        <div>
          <select id="form-checkout__identificationType" className="w-full p-2 border rounded">
            <option value="">Tipo de documento</option>
          </select>
        </div>
        <div>
          <input type="text" id="form-checkout__identificationNumber" className="w-full p-2 border rounded" />
        </div>
        <div>
          <select id="form-checkout__issuer" className="w-full p-2 border rounded">
            <option value="">Banco emisor</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
    </div>
  );
};

export default MercadoPagoForm; 