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
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `CERT-FB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  return {
    recipientName: name,
    organizationName,
    role,
    totalSavedKg: parseFloat(totalSavedKg.toFixed(1)),
    totalCo2SavedKg: co2,
    totalPeopleFed: fed,
    issuedDate: dateStr,
    certificateId: certId,
  };
}
