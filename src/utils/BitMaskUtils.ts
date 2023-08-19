export const invertSelectedBits = (mask, bits) => {
    if ((mask & bits) === bits) return mask & ~bits;

    return mask | bits;
};
