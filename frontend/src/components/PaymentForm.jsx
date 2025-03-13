import { useState } from "react";

const PaymentForm = ({ onPaymentMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleSelect = (method) => {
    setSelectedMethod(method);
    onPaymentMethodSelect(method);
  };

  return (
    <div>
      <h3>Select Payment Method</h3>
      <button onClick={() => handleSelect("COD")}>Cash on Delivery</button>
      <button onClick={() => handleSelect("CARD")}>Credit/Debit Card</button>
      <button onClick={() => handleSelect("UPI")}>UPI</button>
    </div>
  );
};

export default PaymentForm;
