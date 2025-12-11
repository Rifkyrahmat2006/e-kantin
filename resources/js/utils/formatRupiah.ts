export const formatRupiah = (amount: number): string => {
    // Format number with dots as thousand separator, no decimals
    const formatted = Math.round(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${formatted}`;
};
