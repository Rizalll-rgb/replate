'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';

export default function ExchangePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shelterRequests, setShelterRequests] = useState<any[]>([]);
  const [providerSurplus, setProviderSurplus] = useState<any[]>([]);
  
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [actionLoader, setActionLoader] = useState({ isOpen: false, message: '', submessage: '' });
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    // 1. Load Shelter Requests (Mock data if none in localStorage)
    const rawShelterReq = localStorage.getItem('replate_shelter_requests');
    let requests = [];
    if (rawShelterReq) {
      requests = JSON.parse(rawShelterReq);
    } else {
      requests = [
        {
          id: 'REQ-SH-001',
          shelterName: 'Panti Asuhan Kasih Ibu Wonokromo',
          address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
          phone: '0819-8765-4321',
          foodType: 'Nasi Kotak / Lauk Pauk Siap Saji',
          quantityNeeded: 30,
          quantityUnit: 'Porsi',
          status: 'OPEN',
          date: 'Hari ini',
          timeReq: '12:00 WIB',
          urgency: 'HIGH',
          notes: 'Dibutuhkan untuk makan siang anak-anak yatim.'
        },
        {
          id: 'REQ-SH-002',
          shelterName: 'Rumah Singgah Anak Jalanan',
          address: 'Jl. Pemuda No. 10, Surabaya Pusat',
          phone: '0812-1111-2222',
          foodType: 'Roti / Snack / Jajanan',
          quantityNeeded: 50,
          quantityUnit: 'Pcs',
          status: 'OPEN',
          date: 'Besok',
          timeReq: '15:00 WIB',
          urgency: 'MEDIUM',
          notes: 'Untuk acara belajar sore.'
        }
      ];
      localStorage.setItem('replate_shelter_requests', JSON.stringify(requests));
    }
    setShelterRequests(requests.filter((r: any) => r.status === 'OPEN'));

    // 2. Load Provider Surplus (Available donations)
    const rawDonations = localStorage.getItem('replate_available_donations');
    let donations = [];
    if (rawDonations) {
      donations = JSON.parse(rawDonations);
    } else {
      donations = [
        {
          id: 'DON-PRV-101',
          providerName: 'Hotel Majapahit Surabaya',
          providerAddress: 'Jl. Tunjungan No. 65, Genteng, Surabaya',
          providerPhone: '0812-3456-7890',
          foodName: 'Nasi Goreng Buffet + Ayam Bakar',
          quantity: 35,
          quantityUnit: 'Porsi',
          status: 'AVAILABLE',
          expTime: '20:30 WIB',
          halal: true,
          photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60'
        },
        {
          id: 'DON-PRV-102',
          providerName: 'Dago Bakery Heritage',
          providerAddress: 'Surabaya Pusat',
          providerPhone: '0821-2222-3333',
          foodName: 'Aneka Artisan Sourdough & Croissant',
          quantity: 60,
          quantityUnit: 'Pcs',
          status: 'AVAILABLE',
          expTime: 'Besok 10:00 WIB',
          halal: true,
          photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
        }
      ];
      localStorage.setItem('replate_available_donations', JSON.stringify(donations));
    }
    setProviderSurplus(donations.filter((d: any) => d.status === 'AVAILABLE'));

    setIsLoaded(true);
  }, []);

  const openMatchModal = (req: any) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleClaimDonation = (donation: any) => {
    setIsModalOpen(false);
    setActionLoader({
      isOpen: true,
      message: 'Mengklaim Donasi & Menjodohkan...',
      submessage: 'Membuat tiket penjemputan logistik baru'
    });

    setTimeout(() => {
      try {
        // 1. Save new match to replate_claims
        const rawClaims = localStorage.getItem('replate_claims');
        const claims = rawClaims ? JSON.parse(rawClaims) : [];
        const newClaim = {
          code: 'FB-DON-' + Math.floor(Math.random() * 90000 + 10000),
          foodName: donation.foodName,
          providerName: donation.providerName,
          providerAddress: donation.providerAddress,
          providerPhone: donation.providerPhone,
          shelterName: selectedRequest.shelterName,
          shelterAddress: selectedRequest.address,
          shelterPhone: selectedRequest.phone,
          quantity: `${Math.min(selectedRequest.quantityNeeded, donation.quantity)} ${donation.quantityUnit}`,
          status: 'AWAITING_RESCUE_PICKUP',
          time: `Hari ini ${donation.expTime}`,
          createdAt: new Date().toISOString(),
          auditLogs: [
            {
              status: 'MATCH_CLAIMED',
              title: 'Komunitas Proaktif Klaim Donasi',
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
              desc: `Komunitas secara mandiri menyanggupi permintaan ${selectedRequest.shelterName} dengan surplus dari ${donation.providerName}.`,
              actor: 'Relawan'
            }
          ]
        };
        claims.push(newClaim);
        localStorage.setItem('replate_claims', JSON.stringify(claims));

        // 2. Update Request Status
        const updatedRequests = shelterRequests.map((r) => 
          r.id === selectedRequest.id ? { ...r, status: 'FULFILLED' } : r
        );
        setShelterRequests(updatedRequests.filter((r) => r.status === 'OPEN'));
        localStorage.setItem('replate_shelter_requests', JSON.stringify(updatedRequests));

        // 3. Update Donation Status (if fully claimed)
        if (donation.quantity <= selectedRequest.quantityNeeded) {
           const updatedDonations = providerSurplus.map((d) =>
             d.id === donation.id ? { ...d, status: 'CLAIMED' } : d
           );
           setProviderSurplus(updatedDonations.filter((d) => d.status === 'AVAILABLE'));
           localStorage.setItem('replate_available_donations', JSON.stringify(updatedDonations));
        }

        setToastState({
          isOpen: true,
          message: 'Berhasil! Donasi telah diklaim dan masuk ke Pool Tugas Masuk Anda.',
          type: 'success'
        });
      } catch (e) {
        console.error(e);
      } finally {
        setActionLoader({ isOpen: false, message: '', submessage: '' });
      }
    }, 1500);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16">
      <SuperAppLoader isOpen={actionLoader.isOpen} message={actionLoader.message} submessage={actionLoader.submessage} />
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((p) => ({ ...p, isOpen: false }))}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5A8F] rounded-3xl p-6 border border-[#2C5A8F] shadow-md text-white">
        <div className="flex items-center gap-2 flex-wrap mb-2">
           <span className="px-2.5 py-1 bg-[#D4A843] text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md">
             Matchmaker Proaktif
           </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Bursa Penyaluran Panti</h1>
        <p className="text-sm text-slate-200">
          Sanggupi permintaan panti asuhan yang belum terpenuhi dengan mencari dan mengklaim donasi makanan berlebih dari mitra provider kita.
        </p>
      </div>

      {/* List of Shelter Requests */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">Permintaan Panti Terbuka</h2>
        
        {shelterRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Tidak ada permintaan panti saat ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelterRequests.map((req) => (
              <Card key={req.id} className="border-slate-200 shadow-xs hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white flex flex-col">
                <CardBody className="p-0 flex flex-col h-full">
                   <div className="p-4 sm:p-5 flex-grow space-y-4">
                     <div className="flex items-start justify-between gap-3">
                       <div>
                         <h3 className="font-black text-base text-slate-800">{req.shelterName}</h3>
                         <div className="flex items-center gap-1 text-slate-500 mt-1">
                           <MapPin size={12} />
                           <span className="text-[11px] truncate">{req.address}</span>
                         </div>
                       </div>
                       {req.urgency === 'HIGH' && (
                         <span className="shrink-0 px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg border border-red-200 flex items-center gap-1">
                           <AlertCircle size={10} /> Mendesak
                         </span>
                       )}
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                         <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Dibutuhkan</span>
                         <span className="text-sm font-black text-[#1B3A5C]">{req.quantityNeeded} {req.quantityUnit}</span>
                         <span className="block text-[10px] text-slate-600 truncate mt-0.5">{req.foodType}</span>
                       </div>
                       <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                         <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Tenggat Waktu</span>
                         <span className="text-sm font-black text-slate-800">{req.timeReq}</span>
                         <span className="block text-[10px] text-slate-600 truncate mt-0.5">{req.date}</span>
                       </div>
                     </div>
                     
                     <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                       &quot;{req.notes}&quot;
                     </div>
                   </div>
                   
                   <div className="p-4 bg-slate-50 border-t border-slate-100">
                     <Button 
                       variant="primary"
                       className="w-full font-black text-xs h-10 rounded-xl bg-[#1B3A5C] text-white hover:bg-[#122842] shadow-sm flex items-center justify-center gap-2"
                       onClick={() => openMatchModal(req)}
                     >
                       <Search size={14} /> Sanggupi & Cari Donasi
                     </Button>
                   </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MatchModal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih Donasi Tersedia"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
               <p className="text-xs font-bold text-blue-900 mb-1">Permintaan: {selectedRequest?.shelterName}</p>
               <p className="text-[11px] text-blue-700">Mencari donasi yang cocok dengan: <strong>{selectedRequest?.quantityNeeded} {selectedRequest?.quantityUnit} {selectedRequest?.foodType}</strong></p>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
            {providerSurplus.length === 0 ? (
               <div className="text-center py-8 text-sm text-slate-500">
                 Sayang sekali, tidak ada donasi provider yang tersedia saat ini.
               </div>
            ) : (
               providerSurplus.map((donation) => {
                 // Simple matching highlight
                 const isQuantityMatch = donation.quantity >= selectedRequest?.quantityNeeded;
                 
                 return (
                   <div key={donation.id} className="border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-[#1B3A5C] transition-colors bg-white">
                     <div className="flex gap-3">
                       <img src={donation.photoUrl} alt={donation.foodName} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0" />
                       <div className="flex-grow space-y-1">
                         <div className="flex justify-between items-start gap-2">
                           <h4 className="font-black text-sm text-slate-800 line-clamp-1">{donation.foodName}</h4>
                           {donation.halal && (
                             <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded-md flex items-center gap-1">
                               <ShieldCheck size={10} /> Halal
                             </span>
                           )}
                         </div>
                         <p className="text-[11px] text-slate-500 line-clamp-1">{donation.providerName}</p>
                         
                         <div className="flex items-center gap-3 pt-1">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Stok Tersedia</span>
                              <span className={`text-xs font-black ${isQuantityMatch ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {donation.quantity} {donation.quantityUnit}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Batas Waktu</span>
                              <span className="text-xs font-bold text-slate-700">
                                {donation.expTime}
                              </span>
                            </div>
                         </div>
                       </div>
                     </div>
                     
                     <div className="mt-4 flex items-center justify-between gap-3">
                       <span className="text-[10px] text-slate-500 italic">
                         Lokasi: {donation.providerAddress.split(',')[0]}
                       </span>
                       <Button 
                         variant="gold"
                         size="sm"
                         className="font-black text-xs py-1.5 px-4 rounded-xl flex items-center gap-1 shadow-xs"
                         onClick={() => handleClaimDonation(donation)}
                       >
                         Klaim Donasi <Check size={14} />
                       </Button>
                     </div>
                   </div>
                 );
               })
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
}
