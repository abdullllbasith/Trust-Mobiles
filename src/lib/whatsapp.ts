import { WHATSAPP_NUMBER } from "@/constants";

export type CheckoutItem = {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  discount: number;
};

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
};

export function lineTotal(item: CheckoutItem) {
  return item.price * (1 - (item.discount || 0) / 100) * item.quantity;
}

export function buildWhatsAppOrderMessage(
  customer: CheckoutCustomer,
  items: CheckoutItem[],
  total: number,
) {
  const lines = items.map((item) => {
    const unit = item.price * (1 - (item.discount || 0) / 100);
    return `• ${item.name} x${item.quantity} — LKR ${unit.toFixed(2)}`;
  });

  return [
    `Hello Trust Mobile, I'd like to place an order.`,
    ``,
    `Name: ${customer.firstName} ${customer.lastName}`,
    `Phone: ${customer.phone}`,
    customer.email ? `Email: ${customer.email}` : null,
    `Address: ${customer.address}, ${customer.city}`,
    customer.note ? `Note: ${customer.note}` : null,
    ``,
    `Order:`,
    ...lines,
    ``,
    `Total: LKR ${total.toFixed(2)}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function openWhatsAppCheckout(
  customer: CheckoutCustomer,
  items: CheckoutItem[],
  total: number,
) {
  const text = encodeURIComponent(
    buildWhatsAppOrderMessage(customer, items, total),
  );
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
