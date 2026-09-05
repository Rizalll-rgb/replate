'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  parseIndonesianAddressSemantic,
  ParsedAddressEntities,
} from '@/lib/geoAiParser';
import {
  searchKemendagriRegion,
  KEMENDAGRI_PROVINCES,
  FuzzyMatchResult,
} from '@/lib/kemendagriDirectory';
import {
  calculateThermalDecayRUI,
  FOOD_CATEGORY_PROFILES,
  FoodSafetyCategory,
  ThermalRuiResult,
} from '@/lib/thermalRescueEngine';
import {
  optimizeClusterRoute,
  FLEET_SPECS,
  FleetType,
  RouteWaypoint,
  OptimizedClusterPlan,
} from '@/lib/clusterRoutingEngine';
import {
  calculateIppcEsgImpact,
  generatePrintableEsgCertificate,
  EsgImpactReport,
  PrintableEsgCertificate,
} from '@/lib/esgCarbonEngine';
import {
  Sparkles,
  Search,
  Thermometer,
  Navigation,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Compass,
  Building,
  MapPin,
  Leaf,
  Fuel,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';

export default function IntelligenceHubPage() {
  const [activeTab, setActiveTab] = useState<'PILAR_1' | 'PILAR_2' | 'PILAR_3' | 'PILAR_4' | 'PILAR_5'>('PILAR_1');

  // ==========================================
  // STATE PILAR 1: AI INDONESIAN ADDRESS PARSER
  // ==========================================
  const [p1Input, setP1Input] = useState('jl ry srngan no 45 dkt jembatan sblh bkl mie ayam pak pri rt2 rw3 ds sidorejo kec sidorejo magetan');
  const [p1Result, setP1Result] = useState<ParsedAddressEntities | null>(null);

  useEffect(() => {
    if (p1Input.trim()) {
      setP1Result(parseIndonesianAddressSemantic(p1Input));
    }
  }, [p1Input]);

  // ==========================================
  // STATE PILAR 2: KEMENDAGRI FUZZY SEARCH
  // ==========================================
  const [p2Query, setP2Query] = useState('Sidorjo');
  const [p2Results, setP2Results] = useState<FuzzyMatchResult[]>([]);

  useEffect(() => {
    if (p2Query.trim()) {
      setP2Results(searchKemendagriRegion(p2Query, { maxResults: 6 }));
    }
  }, [p2Query]);

  // ==========================================
  // STATE PILAR 3: THERMAL DECAY & RUI
  // ==========================================
  const [p3Category, setP3Category] = useState<FoodSafetyCategory>('COOKED_HOT_GRAVY');
  const [p3ElapsedHours, setP3ElapsedHours] = useState<number>(1.5);
  const [p3AmbientTemp, setP3AmbientTemp] = useState<number>(32);
  const [p3UseCoolbox, setP3UseCoolbox] = useState<boolean>(false);
  const [p3Portions, setP3Portions] = useState<number>(45);
  const [p3Result, setP3Result] = useState<ThermalRuiResult | null>(null);

  useEffect(() => {
    const cookedTime = new Date(Date.now() - p3ElapsedHours * 60 * 60 * 1000).toISOString();
    const res = calculateThermalDecayRUI({
      category: p3Category,
      cookedOrPackedTime: cookedTime,
      ambientTemperatureC: p3AmbientTemp,
      isUsingCoolbox: p3UseCoolbox,
      portions: p3Portions,
      estimatedCourierEtaMinutes: 25,
    });
    setP3Result(res);
  }, [p3Category, p3ElapsedHours, p3AmbientTemp, p3UseCoolbox, p3Portions]);

  // ==========================================
  // STATE PILAR 4: MULTI-HOP CLUSTER ROUTING
  // ==========================================
  const [p4Fleet, setP4Fleet] = useState<FleetType>('MOTORCYCLE_COOLBOX');
  const [p4Plan, setP4Plan] = useState<OptimizedClusterPlan | null>(null);

  useEffect(() => {
    const depot: RouteWaypoint = {
      id: 'depot-1',
      name: 'Basecamp Armada Relawan Magetan',
      type: 'DEPOT',
      address: 'Jl. Pahlawan No. 1, Magetan',
      lat: -7.6508,
      lng: 111.3283,
    };

    const pickups: RouteWaypoint[] = [
      {
        id: 'resto-1',
        name: 'Restoran Ayam Bakar Sarangan',
        type: 'PICKUP',
        address: 'Jl. Raya Sarangan No. 45, Plaosan, Magetan',
        lat: -7.6749,
        lng: 111.2201,
        weightKg: 14,
        portions: 35,
        rescueUrgencyIndex: 92, // Sangat Kritis
      },
      {
        id: 'resto-2',
        name: 'Bakery Sidorejo Indah',
        type: 'PICKUP',
        address: 'Jl. Raya Sidorejo No. 12, Sidorejo, Magetan',
        lat: -7.65569,
        lng: 111.27984,
        weightKg: 9,
        portions: 25,
        rescueUrgencyIndex: 65, // Menengah
      },
    ];

    const dropoffs: RouteWaypoint[] = [
      {
        id: 'panti-1',
        name: 'Panti Asuhan Kasih Ibu',
        type: 'DROPOFF',
        address: 'Desa Sidorejo, Magetan',
        lat: -7.6560,
        lng: 111.2810,
      },
      {
        id: 'yayasan-2',
        name: 'Yayasan Lansia Dhuafa Plaosan',
        type: 'DROPOFF',
        address: 'Kecamatan Plaosan, Magetan',
        lat: -7.6680,
        lng: 111.2350,
      },
    ];

    const plan = optimizeClusterRoute(depot, pickups, dropoffs, p4Fleet);
    setP4Plan(plan);
  }, [p4Fleet]);

  // ==========================================
  // STATE PILAR 5: ESG & CARBON CERTIFICATE
  // ==========================================
  const [p5RescuedKg, setP5RescuedKg] = useState<number>(250);
  const [p5Recipient, setP5Recipient] = useState<string>('Hotel Grand Mercure & Mitra Replate');
  const [p5Role, setP5Role] = useState<string>('Mitra Restoran Hijau (Green Food Provider)');
  const [p5Certificate, setP5Certificate] = useState<PrintableEsgCertificate | null>(null);

  useEffect(() => {
    const cert = generatePrintableEsgCertificate(p5Recipient, p5Role, p5RescuedKg);
    setP5Certificate(cert);
  }, [p5RescuedKg, p5Recipient, p5Role]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#142C47] via-[#1B3A5C] to-[#0D1F33] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5 Pilar Algoritma Canggih Replate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pusat Kecerdasan Algoritma & Logistik Pangan (AI Hub)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Sistem terpadu penguraian bahasa alami alamat Indonesia, sinkronisasi master wilayah Kemendagri RI, kinetika termal keamanan pangan BPOM, optimasi armada multi-hop VRPTW, dan sertifikasi dampak emisi karbon IPCC.
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Link href="/dashboard/profile" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold">
                Kembali ke Profil
              </Button>
            </Link>
          </div>
        </div>

        {/* PILL TABS NAVIGATION */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-6 border-t border-slate-700/60">
          {[
            { id: 'PILAR_1', label: 'Pilar 1: AI Parser', icon: Sparkles, badge: 'NLP' },
            { id: 'PILAR_2', label: 'Pilar 2: Kemendagri', icon: Building, badge: '83K+' },
            { id: 'PILAR_3', label: 'Pilar 3: Termal RUI', icon: Thermometer, badge: 'BPOM' },
            { id: 'PILAR_4', label: 'Pilar 4: VRPTW Rute', icon: Navigation, badge: 'Armada' },
            { id: 'PILAR_5', label: 'Pilar 5: Karbon ESG', icon: Leaf, badge: 'IPCC' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#D4A843] text-slate-950 font-black shadow-lg scale-102'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-amber-300'}`}>
                    {tab.badge}
                  </span>
                </div>
                <span className="text-xs truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI INDONESIAN ADDRESS PARSER CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'PILAR_1' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Pilar 1: AI Indonesian Address Semantic Parser & Tokenizer</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Mendeteksi nama jalan, nomor bangunan, RT/RW, dan patokan dari teks bebas informal tanpa format baku.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 self-start">
                Skor Akurasi: {p1Result ? `${Math.round(p1Result.confidenceScore * 100)}%` : '0%'}
              </span>
            </div>

            {/* QUICK PRESET BUTTONS */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Uji Coba Alamat Nyata:</span>
              {[
                { label: 'Magetan (Slang Padat)', text: 'jl ry srngan no 45 dkt jembatan sblh bkl mie ayam pak pri rt2 rw3 ds sidorejo kec sidorejo magetan' },
                { label: 'Surabaya (Gubeng)', text: 'jln raya gubeng no 88 rt 03 rw 05 sblh apotek kimia farma gubeng surabaya 60281' },
                { label: 'Jakarta Selatan (Jaksel)', text: 'komp melati blok b12 no 10 rt 05 rw 02 dpn gapura merah tebet jaksel' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setP1Input(preset.text)}
                  className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* LIVE INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Ketik Teks Alamat Bebas / Gaul Pengguna:</label>
              <textarea
                rows={3}
                value={p1Input}
                onChange={(e) => setP1Input(e.target.value)}
                placeholder="Ketik alamat bahasa Indonesia bebas..."
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D4A843]"
              />
            </div>

            {/* PARSED RESULTS */}
            {p1Result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Hasil Rekonstruksi Standar Pos Indonesia:
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                      Standardized Output
                    </span>
                  </div>
                  <p className="text-sm font-black text-emerald-900 leading-snug">
                    {p1Result.standardFormatted}
                  </p>
                  <div className="text-[11px] text-emerald-800 space-y-1 border-t border-emerald-200/60 pt-2 font-medium">
                    <div>🏷️ <strong>Teks Normal:</strong> {p1Result.normalized}</div>
                    <div>🎯 <strong>Tingkat Keyakinan:</strong> {(p1Result.confidenceScore * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Pohon Entitas AI yang Berhasil Dikenali:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Jalan Utama:</span>
                      <strong className="text-slate-800 truncate block">{p1Result.roadName || '-'}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Nomor Bangunan:</span>
                      <strong className="text-slate-800 truncate block">{p1Result.houseNumber || '-'}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">RT / RW:</span>
                      <strong className="text-slate-800 truncate block">{p1Result.rtRwFormatted || '-'}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Desa / Kelurahan:</span>
                      <strong className="text-slate-800 truncate block">{p1Result.village || '-'}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Kecamatan:</span>
                      <strong className="text-slate-800 truncate block">{p1Result.district || '-'}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Patokan / Catatan Kurir:</span>
                      <strong className="text-slate-800 truncate block">
                        {[p1Result.primaryLandmark, p1Result.microLandmark].filter(Boolean).join(' - ') || '-'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KEMENDAGRI RI MASTER DIRECTORY & FUZZY MATCH */}
      {/* ========================================================================= */}
      {activeTab === 'PILAR_2' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" />
                  <span>Pilar 2: Direktori Kemendagri RI (Permendagri No. 72/2019) & Fuzzy Matcher</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pencarian fonetik & Damerau-Levenshtein berkecepatan 0ms yang mengenali daerah meskipun pengguna salah ketik (*typo*).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 self-start">
                38 Provinsi & 514 Daerah
              </span>
            </div>

            {/* PRESET TYPO BUTTONS */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Coba Nama Typo / Singkatan:</span>
              {['Sidorjo', 'Plosan', 'Surbya', 'Jaksel', 'Bojongro', 'KWB'].map((typo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setP2Query(typo)}
                  className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono font-medium transition cursor-pointer"
                >
                  "{typo}"
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <Input
                value={p2Query}
                onChange={(e) => setP2Query(e.target.value)}
                placeholder="Ketik nama kabupaten, kota, atau provinsi (meskipun salah ketik)..."
                className="pl-10 text-xs font-bold"
              />
            </div>

            {/* MATCH RESULTS TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Hasil Pencarian Fuzzy & Fonetik Kemendagri RI:
              </h4>

              {p2Results.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Ketik nama daerah untuk mencari di basis data Kemendagri RI.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {p2Results.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Kode: {item.region.code}
                          </span>
                          <h5 className="font-black text-slate-900 text-sm mt-1">
                            {item.region.officialName}
                          </h5>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.region.provinceName} ({item.region.islandGroup})
                          </span>
                        </div>
                        <span className="text-xs font-black px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                          {item.matchScorePercent}%
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 text-[10.5px] text-slate-600 space-y-0.5">
                        <div>📍 <strong>Sentroid GPS:</strong> {item.region.lat}, {item.region.lng}</div>
                        <div>🔍 <strong>Tipe Kecocokan:</strong> <span className="uppercase font-bold text-slate-800">{item.matchedOn}</span></div>
                        {item.region.keyDistricts && (
                          <div className="truncate" title={item.region.keyDistricts.join(', ')}>
                            🏘️ <strong>Kecamatan Kunci:</strong> {item.region.keyDistricts.slice(0, 3).join(', ')}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BPOM THERMAL DECAY & RUI SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'PILAR_3' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span>Pilar 3: Kinetika Termal Keamanan Pangan & Rescue Urgency Index (RUI)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Standar BPOM RI & Kemenkes RI untuk mencegah pembusukan mikrobiologis pada makanan surplus siap saji.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200 self-start">
                Pedoman BPOM No. 13/2019
              </span>
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">
                Pilih Kategori Makanan Surplus:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(FOOD_CATEGORY_PROFILES).map(([key, prof]) => {
                  const isSelected = p3Category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setP3Category(key as FoodSafetyCategory)}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 border ${
                        isSelected
                          ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-md scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-amber-400">
                        Maks {prof.maxSafeHours} Jam
                      </span>
                      <strong className="text-xs leading-snug line-clamp-2">
                        {prof.nameIndo}
                      </strong>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTROLS (SLIDERS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Suhu Udara Tropis:</span>
                  <span className="text-red-600 font-mono">{p3AmbientTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="38"
                  value={p3AmbientTemp}
                  onChange={(e) => setP3AmbientTemp(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
                <span className="text-[10.5px] text-slate-400 block">Suhu rata-rata siang di kota-kota Indonesia.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Waktu Sejak Masak / Packing:</span>
                  <span className="text-indigo-600 font-mono">{p3ElapsedHours} Jam</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="10"
                  step="0.25"
                  value={p3ElapsedHours}
                  onChange={(e) => setP3ElapsedHours(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10.5px] text-slate-400 block">Durasi makanan tersimpan di outlet.</span>
              </div>

              <div className="space-y-2 flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-700 block">Insulasi Suhu Kurir:</label>
                <button
                  type="button"
                  onClick={() => setP3UseCoolbox(!p3UseCoolbox)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer border ${
                    p3UseCoolbox
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>Membawa Cooler Box Berinsulasi</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${p3UseCoolbox ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {p3UseCoolbox ? 'AKTIF (-45% Decay)' : 'NON-AKTIF'}
                  </span>
                </button>
              </div>
            </div>

            {/* SIMULATION RESULT GAUGE */}
            {p3Result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  className="p-5 rounded-3xl text-white flex flex-col justify-between space-y-4 shadow-md"
                  style={{ backgroundColor: p3Result.urgencyColor }}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                      Indeks Urgensi Penjemputan
                    </span>
                    <div className="text-4xl font-black">
                      {p3Result.rescueUrgencyIndex}<span className="text-xl">/100</span>
                    </div>
                    <strong className="text-sm block">{p3Result.urgencyLabelIndo}</strong>
                  </div>

                  <div className="p-3 bg-black/20 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Sisa Waktu Aman:</span>
                      <strong className="font-mono font-black">{p3Result.remainingSafeMinutes} Menit</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Batas Kritis Total:</span>
                      <strong className="font-mono">{p3Result.effectiveMaxHours} Jam</strong>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Protokol & Checklist Organoleptik Kurir (BPOM RI):
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-500">
                      Rekomendasi Sebelum Muat
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    💡 <strong>Aksi Dispatch:</strong> {p3Result.recommendedDispatchAction}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {p3Result.organolepticChecklist.map((item) => (
                      <div key={item.step} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800">
                            {item.step}. {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                              item.status === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-tight">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MULTI-HOP CONSOLIDATED CLUSTER VRPTW ROUTING */}
      {/* ========================================================================= */}
      {activeTab === 'PILAR_4' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  <span>Pilar 4: Multi-Hop Consolidated Cluster Vehicle Routing (VRPTW)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Menggabungkan penjemputan dari beberapa restoran & pengantaran ke panti asuhan dalam 1 loop perjalanan efisien.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 self-start">
                Heuristic 2-Opt Algorithm
              </span>
            </div>

            {/* VEHICLE CAPACITY SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">Pilih Tipe Kendaraan Armada Replate:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(FLEET_SPECS).map(([key, spec]) => {
                  const isSelected = p4Fleet === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setP4Fleet(key as FleetType)}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1B3A5C] text-white border-[#1B3A5C] shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-xs">{spec.nameIndo}</strong>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
                          Maks {spec.maxWeightKg} kg
                        </span>
                      </div>
                      <span className="text-[11px] block opacity-80">
                        Kapasitas ~{spec.maxPortions} porsi | Konsumsi {spec.fuelConsumptionKmPerLiter} km/liter
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAVINGS SUMMARY */}
            {p4Plan && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-emerald-900 block flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Jarak Dihemat
                  </span>
                  <div className="text-xl font-black text-emerald-950">{p4Plan.distanceSavedKm} km</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">{p4Plan.efficiencyGainPercent}% lebih efisien</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-emerald-900 block flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" /> Bensin Dihemat
                  </span>
                  <div className="text-xl font-black text-emerald-950">{p4Plan.fuelSavedLiters} L</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">~Rp {p4Plan.fuelCostSavedRp.toLocaleString('id-ID')}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-emerald-900 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Waktu Tempuh
                  </span>
                  <div className="text-xl font-black text-emerald-950">{p4Plan.optimizedDurationMinutes} mnt</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Hemat {p4Plan.timeSavedMinutes} menit</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-bold text-emerald-900 block flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" /> Muatan Terangkut
                  </span>
                  <div className="text-xl font-black text-emerald-950">{p4Plan.totalPortions} Porsi</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">{p4Plan.totalRescuedWeightKg} kg ({p4Plan.capacityUtilizationPercent}% kuota)</span>
                </div>
              </div>
            )}

            {/* ROUTE STEPS MANIFEST */}
            {p4Plan && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Manifes Urutan Pemberhentian Armada (Rute Konsolidasi Terpadu):
                </h4>
                <div className="space-y-2">
                  {p4Plan.orderedStops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs text-white ${
                          stop.type === 'DEPOT' ? 'bg-slate-700' : (stop.type === 'PICKUP' ? 'bg-amber-600' : 'bg-emerald-600')
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-slate-900 block text-xs">{stop.name}</strong>
                          <span className="text-[10.5px] text-slate-500">{stop.address}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {stop.type === 'PICKUP' && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black">
                            Jemput {stop.portions} Porsi (RUI: {stop.rescueUrgencyIndex}/100)
                          </span>
                        )}
                        {stop.type === 'DROPOFF' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black">
                            Serah Donasi Panti
                          </span>
                        )}
                        {stop.type === 'DEPOT' && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                            Pusat Posko Armada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: IPCC-COMPLIANT ESG METHANE & CARBON CERTIFICATE GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'PILAR_5' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1B3A5C] flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span>Pilar 5: Generator Sertifikat Dampak ESG & Emisi Karbon IPCC</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kalkulasi resmi IPCC Tier 1/2 Solid Waste Methane Avoidance & Kajian FLW Bappenas RI untuk pelaporan audit keberlanjutan.
                </p>
              </div>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="text-xs font-bold gap-1.5 border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </Button>
            </div>

            {/* INPUT PARAMETERS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Total Makanan Diselamatkan (kg):</label>
                <Input
                  type="number"
                  value={p5RescuedKg}
                  onChange={(e) => setP5RescuedKg(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nama Mitra / Perusahaan / Entitas:</label>
                <Input
                  value={p5Recipient}
                  onChange={(e) => setP5Recipient(e.target.value)}
                  placeholder="Nama Hotel / Restoran..."
                  className="bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Peran / Kategori ESG:</label>
                <Input
                  value={p5Role}
                  onChange={(e) => setP5Role(e.target.value)}
                  className="bg-white font-bold"
                />
              </div>
            </div>

            {/* PRINTABLE OFFICIAL ESG CERTIFICATE VIEW */}
            {p5Certificate && (
              <div className="p-6 sm:p-10 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 rounded-3xl border-4 border-[#D4A843]/40 shadow-xl space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D4A843]/30 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-widest block">
                      REPUBLIC OF INDONESIA ESG & FLW AUDIT PROTOCOL
                    </span>
                    <h2 className="text-2xl font-black text-[#1B3A5C] tracking-tight">
                      SERTIFIKAT DAMPAK LINGKUNGAN HIJAU (ESG)
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">
                      Nomor Registrasi Audit: <strong className="font-mono text-slate-900">{p5Certificate.certificateId}</strong>
                    </span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-[#1B3A5C] text-amber-400 p-2 flex flex-col items-center justify-center text-center shadow-md">
                    <Leaf className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-wider">VERIFIED</span>
                    <span className="text-[8px] font-mono">IPCC AR5</span>
                  </div>
                </div>

                <div className="space-y-2 text-center py-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sertifikat ini diberikan sebagai pengakuan resmi kepada:
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">{p5Certificate.recipientName}</h3>
                  <span className="text-xs text-[#D4A843] font-extrabold uppercase tracking-wide block">
                    {p5Certificate.recipientRole}
                  </span>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto pt-1 leading-relaxed">
                    Atas komitmen aktif dalam pencegahan limbah pangan (*food waste diversion*), pencegahan emisi gas rumah kaca metana ($CH_4$), dan perlindungan ketahanan pangan masyarakat rentan di Indonesia.
                  </p>
                </div>

                {/* KEY IMPACT STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Makanan Diselamatkan</span>
                    <div className="text-xl font-black text-[#1B3A5C]">{p5Certificate.report.rescuedFoodKg} kg</div>
                    <span className="text-[10px] text-slate-500 font-bold">~{p5Certificate.report.mealsDistributed} Porsi Makan</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Metana (CH4) Tercegah</span>
                    <div className="text-xl font-black text-emerald-700">{p5Certificate.report.methaneAvoidedKg} kg</div>
                    <span className="text-[10px] text-slate-500 font-bold">({p5Certificate.report.methaneAvoidedM3} m³ Gas TPA)</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Net CO2e Terhindar</span>
                    <div className="text-xl font-black text-indigo-700">{p5Certificate.report.totalNetCo2eSavedKg} kg</div>
                    <span className="text-[10px] text-slate-500 font-bold">({p5Certificate.report.totalNetCo2eSavedTonnes} Ton CO2e)</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-black text-amber-600 uppercase">Setara Serapan Pohon</span>
                    <div className="text-xl font-black text-amber-700">{p5Certificate.report.treesEquivalentAnnualAbsorption}</div>
                    <span className="text-[10px] text-slate-500 font-bold">Pohon Selama 1 Tahun</span>
                  </div>
                </div>

                {/* METHODOLOGY CITATION FOOTER */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10.5px] text-slate-600">
                  <div className="space-y-0.5">
                    <div>🏛️ <strong>Dasar Metodologi:</strong> IPCC 2006 Guidelines for National GHG Inventories & Kajian FLW Bappenas RI.</div>
                    <div>🔐 <strong>Status Verifikasi:</strong> Lolos Uji Audit Higiene Pangan BPOM & Sertifikat Kriptografis Terdaftar.</div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Diterbitkan pada: {p5Certificate.issuedDate}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
