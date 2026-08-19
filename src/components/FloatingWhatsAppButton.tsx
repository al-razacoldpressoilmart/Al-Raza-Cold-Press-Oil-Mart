import React from "react";
import { MessageCircle } from "lucide-react";
import { CartItem } from "../types";
import { StoreConfig } from "../data/storeConfig";

interface FloatingWhatsAppButtonProps {
  storeConfig: StoreConfig;
  cart: CartItem[];
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({ storeConfig, cart }) => {
  const cleanNumber = (storeConfig.whatsappNumber || "923001234567").replace(/[^0-9]/g, "");

  const generateWhatsAppMessage = () => {
    let message = "Salam Al Raza Mart! 👋\n\nI need some support regarding an order.\n\n";

    if (cart.length > 0) {
      message = "Salam Al Raza Mart! 👋\n\nI would like to place an order for the following items in my cart:\n\n";
      cart.forEach((item, index) => {
        const sizeOption = item.product.sizes[item.selectedSizeIndex];
        message += `${index + 1}. *${item.product.name}* (${sizeOption.size})\n`;
        message += `   Quantity: ${item.quantity} x Rs. ${sizeOption.price}\n`;
      });
      
      const subtotal = cart.reduce((total, item) => total + item.product.sizes[item.selectedSizeIndex].price * item.quantity, 0);
      message += `\n*Cart Subtotal:* Rs. ${subtotal}\n\n`;
      message += "Please let me know the delivery details and total amount.\nThank you!";
    }

    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${generateWhatsAppMessage()}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#1ebd5a] transition-all flex items-center justify-center group"
      style={{ animation: 'bounce 3s infinite' }}
      title="Chat with us on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-8 h-8 drop-shadow-md" />
      
      {/* Tooltip on hover */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-max bg-stone-900 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col items-end">
        <span>Need Help or Placing Order?</span>
        <span className="text-emerald-400 font-medium">Chat directly with Owner</span>
      </div>
    </a>
  );
};
