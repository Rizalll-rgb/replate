export interface CertificateData {
  recipientName: string;
  organizationName?: string;
  role: string;
  totalSavedKg: number;
  totalCo2SavedKg: number;
  totalPeopleFed: number;
  issuedDate: string;
  certificateId: string;
}

export function formatCertificateData(
  name: string,
  role: string,
  totalSavedKg: number,
  organizationName?: string
): CertificateData {
  const co2 = parseFloat((totalSavedKg * 2.5).toFixed(1));
  const fed = Math.round(totalSavedKg * 2);
  const certId = 'CERT-RPL-2026-8812';
  const issuedDate = '21 Agustus 2026';

  return {
    recipientName: name,
    organizationName,
    role,
    totalSavedKg: parseFloat(totalSavedKg.toFixed(1)),
    totalCo2SavedKg: co2,
    totalPeopleFed: fed,
    issuedDate,
    certificateId: certId,
  };
}
