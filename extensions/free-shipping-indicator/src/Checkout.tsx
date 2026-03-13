import '@shopify/ui-extensions/preact';
import { render } from "preact";

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const i18n = shopify.i18n;

  const subtotal = shopify.cost.subtotalAmount.value.amount;

  if (!shopify.settings.value.free_shipping_threshold) {
    return null;
  }

  const freeShippingThreshold = shopify.settings.value.free_shipping_threshold as number; // this is populated from the settings page
  const remaining = Math.ceil((freeShippingThreshold - subtotal) * 100) / 100; // x.001 -> x.01

  if (remaining <= 0) {
    return (
      <s-banner heading="Free shipping!" tone="success">
        <s-text>You've unlocked free shipping!</s-text>
      </s-banner>
    );
  }

  return (
    <s-banner heading="Almost there!" tone="info">
      <s-text>
        Add {i18n.formatCurrency(remaining)} more to get free shipping.
      </s-text>
    </s-banner>
  );
}