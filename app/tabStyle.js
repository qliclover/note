// Faking bold via text-shadow (instead of toggling font-weight) keeps the
// glyph width identical between active/inactive states, so switching tabs
// doesn't reflow sibling items in the row.
export const BOLD_SHADOW = '0.35px 0 0 currentColor, -0.35px 0 0 currentColor';

export function activeShadow(active) {
    return active ? BOLD_SHADOW : 'none';
}
