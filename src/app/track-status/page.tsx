'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

import { useSession } from 'next-auth/react';
import DashboardLayout from '@/app/dashboard/layout';

export default function TrackRegistrationStatusPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [docsStatus, setDocsStatus] = useState<string>('DOCS_SUBMITTED_PENDING_REVIEW');
  const [regId, setRegId] = useState('');
  const [submittedTime, setSubmittedTime] = useState('Hari ini, 09:00 WIB');
  const [isSearched, setIsSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const queryId = new URLSearchParams(window.location.search).get('id');

        // Only auto-search if an explicit ID query param was passed in the URL (e.g. from onboarding redirect)
        if (queryId && queryId.trim().length > 0) {
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-amber-400 border-amber-300 text-slate-950 animate-pulse'
                    }`}>
                      {isApproved ? '' : '4'}
                    </span>
                    <div className="font-bold">
                      <span className={isApproved ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-extrabold'}>
                        4. Audit Keabsahan Oleh Tim Governance Admin
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium block">
                        {isApproved ? 'Audit Selesai & Valid' : 'Estimasi Waktu Audit: Maksimal 1x24 Jam Kerja'}
                      </span>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 font-black text-[11px] flex items-center justify-center ${
                      isApproved
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}>
                      {isApproved ? '' : '5'}
                    </span>
                    <div className="font-bold">
                      <span className={isApproved ? 'text-emerald-300 font-extrabold' : 'text-slate-400 font-medium'}>
                        5. Aktivasi Akun & Penerbitan Sertifikat BPOM Replate
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium block">
                        {isApproved ? 'Akun telah dapat digunakan penuh' : 'Menunggu Penyelesaian Audit Step 4'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              {!isApproved ? (
                <div className="p-4 bg-[#0F1923] border border-[#2C5A8F] rounded-2xl space-y-2.5 text-center shadow-lg pt-3">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                    SIMULASI TESTING ACC SUPERADMIN
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateApprove}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Simulasi SuperAdmin ACC & Aktifkan Akun </span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="gold" size="lg" className="w-full font-black text-slate-950 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                      <span>Masuk Ke Halaman Login </span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          {/* Footer Card */}
          <div className="text-center pt-6 pb-4">
            <p className="text-[11px] font-bold text-slate-500 font-mono">
              SISTEM TERINTEGRASI REPLATE ID &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>

      {!session && <Footer />}
    </div>
  );

  if (session) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
}
