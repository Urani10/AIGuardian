export const scanTypes = ['email', 'sms', 'url', 'qr', 'screenshot'] as const;
export type ScanType = (typeof scanTypes)[number];
