'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface QRGeneratorProps {
  value: string;
  codeTitle?: string;
  codeSubtitle?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  value,
  codeTitle = 'Replate Verification Code',
  codeSubtitle = 'Tunjukkan QR Code ini kepada Provider saat penjemputan',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#DEE2E6] shadow-sm max-w-sm mx-auto text-center space-y-4">
      <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
        <QRCodeSVG value={value} size={200} level="H" includeMargin={true} />
      </div>
      <div>
        <h4 className="font-extrabold text-[#1B3A5C] text-sm">{codeTitle}</h4>
        <p className="text-xs text-[#6C757D] mt-1">{codeSubtitle}</p>
        <div className="mt-3 px-3 py-1.5 bg-[#1B3A5C]/5 text-[#1B3A5C] rounded-lg font-mono text-xs font-bold border border-[#1B3A5C]/20 inline-block">
          {value.length > 30 ? value.substring(0, 30) + '...' : value}
        </div>
      </div>
    </div>
  );
};
