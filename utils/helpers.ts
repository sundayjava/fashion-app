export const maskContact = (contact?: string, method?: 'email' | 'phone') => {
    if (!contact) return '';

    if (method === 'email' || contact.includes('@')) {
        const [local, domain] = contact.split('@');
        if (!domain || local.length <= 3) {
            return `${local[0]}***@${domain || ''}`;
        }
        const firstChar = local[0];
        const lastTwoChars = local.slice(-2);
        const asterisks = '*'.repeat(local.length - 3);
        return `${firstChar}${asterisks}${lastTwoChars}@${domain}`;
    }

    // Phone number masking
    if (contact.length <= 3) {
        return `${contact[0]}***`;
    }
    const firstChar = contact[0];
    const lastTwoDigits = contact.slice(-2);
    const asterisks = '*'.repeat(contact.length - 3);
    return `${firstChar}${asterisks}${lastTwoDigits}`;
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};