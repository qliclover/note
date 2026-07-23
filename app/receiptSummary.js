// Turn a parsed receipt into a single-line note, since Transaction.note is
// just a plain string — no dedicated fields for items/tax/tip/discount.
export function receiptSummary(receipt) {
    const parts = [];
    if (receipt.items?.length) parts.push(receipt.items.map((i) => i.name).join(', '));

    const extras = [];
    if (receipt.tax) extras.push(`tax $${receipt.tax.toFixed(2)}`);
    if (receipt.tips) extras.push(`tip $${receipt.tips.toFixed(2)}`);
    if (receipt.discount) extras.push(`−$${receipt.discount.toFixed(2)} off`);
    if (receipt.shipping) extras.push(`shipping $${receipt.shipping.toFixed(2)}`);
    if (extras.length) parts.push(extras.join(', '));

    const detail = parts.join(' · ');
    return detail ? `${receipt.merchant} — ${detail}` : receipt.merchant;
}
