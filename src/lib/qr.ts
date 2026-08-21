export interface QRPayload {
  type: 'CLAIM' | 'RESCUE';
  code: string;
  referenceId: string;
  timestamp: number;
}

export function generateQRPayload(type: 'CLAIM' | 'RESCUE', code: string, referenceId: string): string {
  const payload: QRPayload = {
    type,
    code,
    referenceId,
    timestamp: Date.now(),
  };
  return JSON.stringify(payload);
}

export function parseQRPayload(dataString: string): QRPayload | null {
  try {
    const parsed = JSON.parse(dataString);
    if (parsed && parsed.type && parsed.code && parsed.referenceId) {
      return parsed as QRPayload;
    }
    return null;
  } catch (e) {
    return null;
  }
}
