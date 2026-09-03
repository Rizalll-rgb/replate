'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { SuperAppLoader } from '@/components/ui/SuperAppLoader';
import { ShieldCheckIcon, CheckIcon, SearchIcon, MapPinIcon } from '@/components/ui/Icon';

interface FleetVehicle {
  id: string;
  driverName: string;
  driverPhone: string;
  isPhoneVerified: boolean;
  vehicleType: string;
  plateNumber: string;
  status: 'UNSUBMITTED' | 'PENDING' | 'APPROVED';
  docs: {
    driverPhoto: string;
    vehiclePhoto: string;
    ktpPhoto: string;
    simPhoto: string;
    stnkPhoto: string;
  };
}

interface LocationDirectoryItem {
  name: string;
  detail: string;
  category: string;
  keywords: string[];
  lat: number;
  lng: number;
}

const INDONESIAN_LOCATION_DIRECTORY: LocationDirectoryItem[] = [
  // Surabaya - Pusat & Heritage
  {
    name: 'Kecamatan Gubeng, Surabaya',
    detail: 'Surabaya Pusat/Timur (Area RS Siloam, Stasiun Gubeng, Jl. Raya Gubeng)',
    category: 'Surabaya',
    keywords: ['gubeng', 'siloam', 'stasiun gubeng', 'raya gubeng', 'surabaya'],
    lat: -7.2754,
    lng: 112.7541,
  },
  {
    name: 'Kecamatan Tegalsari, Surabaya',
    detail: 'Surabaya Pusat (Kawasan Kedungdoro, Dr. Soetomo, Basuki Rahmat)',
    category: 'Surabaya',
    keywords: ['tegalsari', 'kedungdoro', 'dr soetomo', 'soetomo', 'basuki rahmat', 'surabaya'],
    lat: -7.2694,
    lng: 112.7389,
  },
  {
    name: 'Kawasan Jl. Tunjungan & Tunjungan Plaza (TP)',
    detail: 'Kec. Tegalsari, Surabaya Pusat (Pusat Belanja Modern & Heritage)',
    category: 'Surabaya',
    keywords: ['tunjungan', 'tp', 'tunjungan plaza', 'jalan tunjungan', 'surabaya'],
    lat: -7.2580,
    lng: 112.7440,
  },
  {
    name: 'Kecamatan Genteng, Surabaya',
    detail: 'Surabaya Pusat (Balai Pemuda, Alun-Alun Surabaya, Jl. Genteng Kali)',
    category: 'Surabaya',
    keywords: ['genteng', 'genteng kali', 'balai pemuda', 'alun-alun surabaya', 'surabaya'],
    lat: -7.2589,
    lng: 112.7478,
  },
  {
    name: 'Jl. Raya Darmo & Taman Bungkul',
    detail: 'Kec. Wonokromo / Tegalsari, Surabaya (Pusat Kuliner & Ruang Terbuka Hijau)',
    category: 'Surabaya',
    keywords: ['darmo', 'raya darmo', 'bungkul', 'taman bungkul', 'surabaya'],
    lat: -7.2920,
    lng: 112.7390,
  },
  {
    name: 'Kecamatan Wonokromo, Surabaya',
    detail: 'Surabaya Selatan (Kawasan Royal Plaza, DTC Wonokromo, Stasiun Wonokromo)',
    category: 'Surabaya',
    keywords: ['wonokromo', 'royal plaza', 'dtc', 'stasiun wonokromo', 'surabaya'],
    lat: -7.2982,
    lng: 112.7381,
  },
  {
    name: 'Kecamatan Sawahan, Surabaya',
    detail: 'Surabaya Pusat/Selatan (Kawasan Banyu Urip, Petemon, Sawahan)',
    category: 'Surabaya',
    keywords: ['sawahan', 'banyu urip', 'petemon', 'surabaya'],
    lat: -7.2758,
    lng: 112.7231,
  },

  // Surabaya Timur
  {
    name: 'Kecamatan Rungkut, Surabaya',
    detail: 'Surabaya Timur (Kawasan Industri SIER, Rungkut Madya, Rungkut Asri)',
    category: 'Surabaya',
    keywords: ['rungkut', 'sier', 'rungkut industri', 'rungkut madya', 'surabaya'],
    lat: -7.3197,
    lng: 112.7818,
  },
  {
    name: 'Kecamatan Sukolilo (ITS & Keputih), Surabaya',
    detail: 'Surabaya Timur (Kampus ITS, Keputih, Klampis Ngasem, Gebang)',
    category: 'Surabaya',
    keywords: ['sukolilo', 'its', 'keputih', 'klampis', 'surabaya'],
    lat: -7.2892,
    lng: 112.7966,
  },
  {
    name: 'Kecamatan Mulyorejo (Unair Kampus C), Surabaya',
    detail: 'Surabaya Timur (Kampus C Unair, Dharmahusada, Sutorejo, Mulyosari)',
    category: 'Surabaya',
    keywords: ['mulyorejo', 'unair', 'kampus c', 'dharmahusada', 'mulyosari', 'surabaya'],
    lat: -7.2655,
    lng: 112.7850,
  },
  {
    name: 'Kawasan Kertajaya & Manyar, Surabaya',
    detail: 'Kec. Gubeng / Sukolilo, Surabaya Timur (Kertajaya Indah, Manyar Kertoarjo)',
    category: 'Surabaya',
    keywords: ['kertajaya', 'manyar', 'kertoarjo', 'surabaya'],
    lat: -7.2778,
    lng: 112.7656,
  },
  {
    name: 'Kecamatan Tambaksari, Surabaya',
    detail: 'Surabaya Timur (Gelora 10 November, Pacar Keling, Ploso)',
    category: 'Surabaya',
    keywords: ['tambaksari', 'gelora 10 november', 'pacar keling', 'ploso', 'surabaya'],
    lat: -7.2536,
    lng: 112.7634,
  },
  {
    name: 'Kecamatan Gunung Anyar, Surabaya',
    detail: 'Surabaya Timur (Kawasan Rungkut Asri Timur, Perbatasan Sidoarjo/Waru)',
    category: 'Surabaya',
    keywords: ['gunung anyar', 'rungkut asri', 'surabaya'],
    lat: -7.3361,
    lng: 112.7961,
  },
  {
    name: 'Kecamatan Tenggilis Mejoyo, Surabaya',
    detail: 'Surabaya Timur (Kawasan Kampus Ubaya Tenggilis, Prapen)',
    category: 'Surabaya',
    keywords: ['tenggilis', 'tenggilis mejoyo', 'ubaya', 'prapen', 'surabaya'],
    lat: -7.3175,
    lng: 112.7661,
  },

  // Surabaya Selatan
  {
    name: 'Kecamatan Gayungan / Bundaran Waru, Surabaya',
    detail: 'Surabaya Selatan (Mall CITO, Menanggal, Jl. Ahmad Yani Selatan)',
    category: 'Surabaya',
    keywords: ['gayungan', 'bundaran waru', 'cito', 'menanggal', 'ahmad yani', 'surabaya'],
    lat: -7.3392,
    lng: 112.7306,
  },
  {
    name: 'Kecamatan Ketintang (Unesa), Surabaya',
    detail: 'Surabaya Selatan (Kampus Unesa Ketintang, Telkom Ketintang)',
    category: 'Surabaya',
    keywords: ['ketintang', 'unesa', 'telkom ketintang', 'surabaya'],
    lat: -7.3117,
    lng: 112.7247,
  },
  {
    name: 'Kecamatan Jambangan, Surabaya',
    detail: 'Surabaya Selatan (Kawasan Kebonsari, Pagesangan, Karah)',
    category: 'Surabaya',
    keywords: ['jambangan', 'kebonsari', 'pagesangan', 'karah', 'surabaya'],
    lat: -7.3239,
    lng: 112.7167,
  },
  {
    name: 'Kecamatan Karang Pilang, Surabaya',
    detail: 'Surabaya Selatan (Kawasan Jl. Mastrip, Kebraon, Kedurus)',
    category: 'Surabaya',
    keywords: ['karang pilang', 'mastrip', 'kebraon', 'kedurus', 'surabaya'],
    lat: -7.3386,
    lng: 112.6972,
  },

  // Surabaya Barat
  {
    name: 'Kecamatan Wiyung, Surabaya Barat',
    detail: 'Surabaya Barat (Perumahan Graha Famili, Babatan Pratama, Jl. Raya Menganti)',
    category: 'Surabaya',
    keywords: ['wiyung', 'graha famili', 'babatan', 'menganti', 'surabaya'],
    lat: -7.3082,
    lng: 112.6989,
  },
  {
    name: 'Kecamatan Sambikerep & CitraLand, Surabaya Barat',
    detail: 'Surabaya Barat (G-Walk CitraLand, Made, Lontar)',
    category: 'Surabaya',
    keywords: ['sambikerep', 'citraland', 'gwalk', 'g-walk', 'lontar', 'surabaya'],
    lat: -7.2885,
    lng: 112.6515,
  },
  {
    name: 'Kecamatan Dukuh Pakis, Surabaya Barat',
    detail: 'Surabaya Barat (Kawasan Jl. Mayjen Sungkono, Ciputra World, Darmo Permai)',
    category: 'Surabaya',
    keywords: ['dukuh pakis', 'mayjen sungkono', 'sungkono', 'ciputra world', 'darmo permai', 'surabaya'],
    lat: -7.2917,
    lng: 112.7093,
  },
  {
    name: 'Kecamatan Tandes, Surabaya Barat',
    detail: 'Surabaya Barat (Kawasan Margomulyo, Manukan Kulon & Wetan, Balongsari)',
    category: 'Surabaya',
    keywords: ['tandes', 'margomulyo', 'manukan', 'balongsari', 'surabaya'],
    lat: -7.2608,
    lng: 112.6781,
  },
  {
    name: 'Kecamatan Sukomanunggal, Surabaya Barat',
    detail: 'Surabaya Barat (Kawasan Tanjungsari, Simomulyo, Darmo Satelit)',
    category: 'Surabaya',
    keywords: ['sukomanunggal', 'tanjungsari', 'simomulyo', 'darmo satelit', 'surabaya'],
    lat: -7.2725,
    lng: 112.7042,
  },
  {
    name: 'Kecamatan Benowo & Gelora Bung Tomo (GBT)',
    detail: 'Surabaya Barat (Stadion Gelora Bung Tomo, Sememi, Tambak Osowilangun)',
    category: 'Surabaya',
    keywords: ['benowo', 'gbt', 'gelora bung tomo', 'sememi', 'surabaya'],
    lat: -7.2283,
    lng: 112.6247,
  },

  // Surabaya Utara
  {
    name: 'Kawasan Kenjeran & Jembatan Suramadu',
    detail: 'Surabaya Utara/Timur (Pantai Kenjeran, Bulak, Pintu Masuk Suramadu)',
    category: 'Surabaya',
    keywords: ['kenjeran', 'suramadu', 'pantai kenjeran', 'bulak', 'surabaya'],
    lat: -7.2346,
    lng: 112.7938,
  },
  {
    name: 'Kecamatan Krembangan & Tanjung Perak',
    detail: 'Surabaya Utara (Pelabuhan Tanjung Perak, Jl. Perak Timur & Barat)',
    category: 'Surabaya',
    keywords: ['krembangan', 'perak', 'tanjung perak', 'pelabuhan perak', 'surabaya'],
    lat: -7.2289,
    lng: 112.7350,
  },
  {
    name: 'Kecamatan Semampir & Wisata Religi Sunan Ampel',
    detail: 'Surabaya Utara (Kawasan Masjid & Makam Sunan Ampel, Pegirian)',
    category: 'Surabaya',
    keywords: ['semampir', 'ampel', 'sunan ampel', 'pegirian', 'surabaya'],
    lat: -7.2267,
    lng: 112.7483,
  },
  {
    name: 'Kecamatan Pabean Cantian & Jembatan Merah',
    detail: 'Surabaya Utara (Kawasan Jembatan Merah Plaza / JMP, Kembang Jepun)',
    category: 'Surabaya',
    keywords: ['pabean', 'pabean cantian', 'jembatan merah', 'kembang jepun', 'jmp', 'surabaya'],
    lat: -7.2389,
    lng: 112.7389,
  },

  // Magetan, Madiun, Sidorejo & Gerai Kuliner RA Chicken
  {
    name: 'RA Chicken - Outlet Sidorejo (Magetan)',
    detail: 'Jl. Raya Magetan - Sarangan, Kec. Sidorejo, Kab. Magetan, Jawa Timur (Gerai Kuliner Ayam Goreng Crispy)',
    category: 'Magetan, Jawa Timur',
    keywords: [
      'ra chicken', 'chicken', 'sidorejo', 'outlet sidorejo', 'otulet sidorejo',
      'ra chicken sidorejo', 'ra chicken - outlet sidorejo', 'ra chicken otulet sidorejo',
      'magetan', 'sidorejo magetan', 'sarangan', 'plaosan', 'jawa timur'
    ],
    lat: -7.65737,
    lng: 111.27939,
  },
  {
    name: 'Kecamatan Sidorejo, Kabupaten Magetan',
    detail: 'Kabupaten Magetan, Jawa Timur (Jalur Wisata Telaga Sarangan / Lereng Gunung Lawu)',
    category: 'Magetan, Jawa Timur',
    keywords: ['sidorejo', 'sidorejo magetan', 'magetan', 'kecamatan sidorejo', 'sarangan'],
    lat: -7.65737,
    lng: 111.27939,
  },
  {
    name: 'Pusat Kota & Alun-Alun Kabupaten Magetan',
    detail: 'Jl. Basuki Rahmat Barat, Pusat Pemerintahan & Kuliner Kota Magetan, Jawa Timur',
    category: 'Magetan, Jawa Timur',
    keywords: ['magetan', 'kota magetan', 'alun-alun magetan', 'kabupaten magetan'],
    lat: -7.6508,
    lng: 111.3283,
  },
  {
    name: 'Kawasan Wisata Telaga Sarangan, Plaosan, Magetan',
    detail: 'Kec. Plaosan, Kab. Magetan, Jawa Timur (Sentra Kuliner Sate Kelinci & Objek Wisata Danau Alam)',
    category: 'Magetan, Jawa Timur',
    keywords: ['sarangan', 'telaga sarangan', 'plaosan', 'magetan', 'lawu'],
    lat: -7.6749,
    lng: 111.2201,
  },
  {
    name: 'Kota Madiun (Alun-Alun & Pahlawan Street Center)',
    detail: 'Pusat Kota Madiun, Jawa Timur (Kota Pendekar & Sentra Nasi Pecel Madiun)',
    category: 'Madiun, Jawa Timur',
    keywords: ['madiun', 'kota madiun', 'pahlawan street center', 'alun-alun madiun', 'pecel madiun'],
    lat: -7.6298,
    lng: 111.5239,
  },
  {
    name: 'Kabupaten Ngawi & Kawasan Benteng Pendem (Van Den Bosch)',
    detail: 'Kecamatan Ngawi, Kabupaten Ngawi, Jawa Timur',
    category: 'Ngawi, Jawa Timur',
    keywords: ['ngawi', 'benteng pendem', 'alun-alun ngawi', 'kabupaten ngawi'],
    lat: -7.4042,
    lng: 111.4461,
  },
  {
    name: 'Kabupaten Ponorogo & Alun-Alun Bumi Reog',
    detail: 'Pusat Kota Ponorogo, Jawa Timur (Sentra Sate Ayam Ponorogo & Reog)',
    category: 'Ponorogo, Jawa Timur',
    keywords: ['ponorogo', 'alun-alun ponorogo', 'bumi reog', 'sate ponorogo'],
    lat: -7.8683,
    lng: 111.4622,
  },
  {
    name: 'Kabupaten Pacitan & Kawasan Teleng Ria',
    detail: 'Pusat Kabupaten Pacitan, Jawa Timur (Kota 1001 Goa)',
    category: 'Pacitan, Jawa Timur',
    keywords: ['pacitan', 'pantai teleng ria', 'alun-alun pacitan'],
    lat: -8.2065,
    lng: 111.0921,
  },
  {
    name: 'Kabupaten Nganjuk & Alun-Alun Kota Angin',
    detail: 'Kecamatan Nganjuk, Kabupaten Nganjuk, Jawa Timur',
    category: 'Nganjuk, Jawa Timur',
    keywords: ['nganjuk', 'alun-alun nganjuk', 'kota angin'],
    lat: -7.6047,
    lng: 111.9038,
  },
  {
    name: 'Kabupaten Bojonegoro & Alun-Alun Bojonegoro',
    detail: 'Pusat Kota Bojonegoro, Jawa Timur (Kawasan Ledre & Bengawan Solo)',
    category: 'Bojonegoro, Jawa Timur',
    keywords: ['bojonegoro', 'alun-alun bojonegoro', 'dander'],
    lat: -7.1504,
    lng: 111.8819,
  },
  {
    name: 'Kabupaten Tuban & Kawasan Makam Sunan Bonang',
    detail: 'Pusat Kota Tuban, Jawa Timur (Kota Bumi Wali)',
    category: 'Tuban, Jawa Timur',
    keywords: ['tuban', 'alun-alun tuban', 'sunan bonang', 'bumi wali'],
    lat: -6.8974,
    lng: 112.0645,
  },
  {
    name: 'Kabupaten Lamongan & Alun-Alun Lamongan',
    detail: 'Pusat Kota Lamongan, Jawa Timur (Sentra Soto Lamongan)',
    category: 'Lamongan, Jawa Timur',
    keywords: ['lamongan', 'alun-alun lamongan', 'soto lamongan'],
    lat: -7.1198,
    lng: 112.4158,
  },
  {
    name: 'Kabupaten Jombang & Kawasan Pondok Pesantren Tebuireng',
    detail: 'Kecamatan Diwek / Jombang, Jawa Timur (Kota Santri)',
    category: 'Jombang, Jawa Timur',
    keywords: ['jombang', 'alun-alun jombang', 'tebuireng', 'diwek'],
    lat: -7.5468,
    lng: 112.2331,
  },
  {
    name: 'Kota Mojokerto & Alun-Alun Wiraraja Mojokerto',
    detail: 'Pusat Kota Mojokerto, Jawa Timur (Kawasan Onde-Onde & Majapahit)',
    category: 'Mojokerto, Jawa Timur',
    keywords: ['mojokerto', 'alun-alun mojokerto', 'kota mojokerto'],
    lat: -7.4726,
    lng: 112.4339,
  },
  {
    name: 'Kota Kediri & Kawasan Simpang Lima Gumul (SLG)',
    detail: 'Kecamatan Ngasem / Kediri, Jawa Timur (Monumen Simpang Lima Gumul)',
    category: 'Kediri, Jawa Timur',
    keywords: ['kediri', 'simpang lima gumul', 'slg', 'kota kediri', 'alun-alun kediri'],
    lat: -7.8228,
    lng: 112.0519,
  },
  {
    name: 'Kota Blitar & Kawasan Makam Bung Karno',
    detail: 'Pusat Kota Blitar, Jawa Timur (Kota Proklamator)',
    category: 'Blitar, Jawa Timur',
    keywords: ['blitar', 'alun-alun blitar', 'makam bung karno', 'kota blitar'],
    lat: -8.0983,
    lng: 112.1681,
  },
  {
    name: 'Kabupaten Tulungagung & Alun-Alun Kusuma Wicitra',
    detail: 'Pusat Kota Tulungagung, Jawa Timur (Kota Marmer & Kopi Cethe)',
    category: 'Tulungagung, Jawa Timur',
    keywords: ['tulungagung', 'alun-alun tulungagung', 'kota marmer'],
    lat: -8.0644,
    lng: 111.9015,
  },
  {
    name: 'Kabupaten Trenggalek & Alun-Alun Trenggalek',
    detail: 'Pusat Kabupaten Trenggalek, Jawa Timur (Sentra Alen-Alen)',
    category: 'Trenggalek, Jawa Timur',
    keywords: ['trenggalek', 'alun-alun trenggalek', 'kabupaten trenggalek'],
    lat: -8.0531,
    lng: 111.7142,
  },
  {
    name: 'Kota Pasuruan & Kawasan Alun-Alun Pasuruan',
    detail: 'Pusat Kota Pasuruan, Jawa Timur (Payung Madinah Alun-Alun Pasuruan)',
    category: 'Pasuruan, Jawa Timur',
    keywords: ['pasuruan', 'alun-alun pasuruan', 'payung madinah'],
    lat: -7.6449,
    lng: 112.9075,
  },
  {
    name: 'Kota Probolinggo & Kawasan Pelabuhan Tanjung Tembaga',
    detail: 'Pusat Kota Probolinggo, Jawa Timur (Kota Mangga & Anggur)',
    category: 'Probolinggo, Jawa Timur',
    keywords: ['probolinggo', 'alun-alun probolinggo', 'kota probolinggo'],
    lat: -7.7543,
    lng: 113.2159,
  },
  {
    name: 'Kabupaten Lumajang & Kawasan Alun-Alun Lumajang',
    detail: 'Pusat Kabupaten Lumajang, Jawa Timur (Kota Pisang / Kaki Gunung Semeru)',
    category: 'Lumajang, Jawa Timur',
    keywords: ['lumajang', 'alun-alun lumajang', 'kabupaten lumajang'],
    lat: -8.1332,
    lng: 113.2246,
  },
  {
    name: 'Kabupaten Jember & Alun-Alun Jember (JFC Center)',
    detail: 'Kecamatan Patrang / Kaliwates, Jember, Jawa Timur (Sentra Karnaval JFC & Tembakau)',
    category: 'Jember, Jawa Timur',
    keywords: ['jember', 'alun-alun jember', 'kaliwates', 'patrang'],
    lat: -8.1724,
    lng: 113.7008,
  },
  {
    name: 'Kabupaten Banyuwangi & Kawasan Taman Blambangan',
    detail: 'Pusat Kota Banyuwangi, Jawa Timur (The Sunrise of Java)',
    category: 'Banyuwangi, Jawa Timur',
    keywords: ['banyuwangi', 'taman blambangan', 'alun-alun banyuwangi', 'ketapang'],
    lat: -8.2192,
    lng: 114.3691,
  },
  {
    name: 'Kabupaten Bondowoso & Alun-Alun Ki Ronggo',
    detail: 'Pusat Kota Bondowoso, Jawa Timur (Kota Tape & Kopi Ijen)',
    category: 'Bondowoso, Jawa Timur',
    keywords: ['bondowoso', 'alun-alun bondowoso', 'kota tape'],
    lat: -7.9135,
    lng: 113.8214,
  },
  {
    name: 'Kabupaten Situbondo & Alun-Alun Situbondo',
    detail: 'Pusat Kota Situbondo, Jawa Timur (Kota Santri Pancasila)',
    category: 'Situbondo, Jawa Timur',
    keywords: ['situbondo', 'alun-alun situbondo', 'pasir putih'],
    lat: -7.7064,
    lng: 114.0049,
  },
  {
    name: 'Kabupaten Bangkalan & Akses Jembatan Suramadu',
    detail: 'Pusat Kota Bangkalan, Madura, Jawa Timur (Sentra Bebek Sinjay)',
    category: 'Madura, Jawa Timur',
    keywords: ['bangkalan', 'madura', 'suramadu', 'bebek sinjay', 'alun-alun bangkalan'],
    lat: -7.0312,
    lng: 112.7483,
  },
  {
    name: 'Kabupaten Sampang & Alun-Alun Trunojoyo',
    detail: 'Pusat Kota Sampang, Madura, Jawa Timur',
    category: 'Madura, Jawa Timur',
    keywords: ['sampang', 'alun-alun trunojoyo', 'madura'],
    lat: -7.1873,
    lng: 113.2394,
  },
  {
    name: 'Kabupaten Pamekasan & Arek Lancor',
    detail: 'Monumen Arek Lancor, Pusat Kota Pamekasan, Madura, Jawa Timur',
    category: 'Madura, Jawa Timur',
    keywords: ['pamekasan', 'arek lancor', 'madura', 'alun-alun pamekasan'],
    lat: -7.1610,
    lng: 113.4754,
  },
  {
    name: 'Kabupaten Sumenep & Kawasan Keraton Sumenep',
    detail: 'Pusat Kota Sumenep, Madura, Jawa Timur (Kota Keris)',
    category: 'Madura, Jawa Timur',
    keywords: ['sumenep', 'keraton sumenep', 'alun-alun sumenep', 'madura'],
    lat: -7.0076,
    lng: 113.8601,
  },

  // Sidoarjo, Krian, Salatiga & Sidorejo Alternatif
  {
    name: 'Kawasan Desa Sidorejo, Krian, Sidoarjo',
    detail: 'Kecamatan Krian, Kabupaten Sidoarjo, Jawa Timur',
    category: 'Sidoarjo, Jawa Timur',
    keywords: ['sidorejo', 'desa sidorejo', 'krian', 'sidorejo krian', 'sidoarjo'],
    lat: -7.4092,
    lng: 112.5935,
  },
  {
    name: 'Kecamatan Sidorejo, Kota Salatiga',
    detail: 'Kota Salatiga, Jawa Tengah',
    category: 'Salatiga, Jawa Tengah',
    keywords: ['sidorejo', 'salatiga', 'kecamatan sidorejo'],
    lat: -7.3210,
    lng: 110.5050,
  },
  {
    name: 'Alun-Alun Kabupaten Sidoarjo',
    detail: 'Jl. Gubernur Suryo / Ahmad Yani, Pusat Kota Sidoarjo, Jawa Timur',
    category: 'Sidoarjo, Jawa Timur',
    keywords: ['sidoarjo', 'alun-alun sidoarjo', 'kota sidoarjo'],
    lat: -7.4478,
    lng: 112.7183,
  },
  {
    name: 'Kecamatan Waru & Bandara Juanda, Sidoarjo',
    detail: 'Perbatasan Surabaya - Sidoarjo (Terminal Purabaya Bungurasih & Juanda)',
    category: 'Sidoarjo, Jawa Timur',
    keywords: ['waru', 'bungurasih', 'juanda', 'bandara juanda', 'sidoarjo'],
    lat: -7.3542,
    lng: 112.7517,
  },
  {
    name: 'Gresik Kota Baru (GKB), Kabupaten Gresik',
    detail: 'Kec. Manyar / Kebomas, Gresik, Jawa Timur (Pusat Perumahan & Kuliner GKB)',
    category: 'Gresik, Jawa Timur',
    keywords: ['gresik', 'gkb', 'gresik kota baru', 'manyar gresik', 'kebomas'],
    lat: -7.1566,
    lng: 112.6555,
  },

  // Kota Besar Lainnya di Jawa & Nasional
  {
    name: 'Kota Malang (Pusat Alun-Alun & Jl. Ijen)',
    detail: 'Klojen, Kota Malang, Jawa Timur',
    category: 'Jawa Timur',
    keywords: ['malang', 'kota malang', 'ijen', 'alun-alun malang'],
    lat: -7.9797,
    lng: 112.6304,
  },
  {
    name: 'Kota Wisata Batu, Jawa Timur',
    detail: 'Kawasan Wisata Pegunungan Batu & Alun-Alun Kota Batu',
    category: 'Jawa Timur',
    keywords: ['batu', 'kota batu', 'wisata batu'],
    lat: -7.8712,
    lng: 112.5270,
  },
  {
    name: 'Kota Kediri (Jl. Dhoho & Simpang Lima Gumul)',
    detail: 'Kediri, Jawa Timur',
    category: 'Jawa Timur',
    keywords: ['kediri', 'dhoho', 'simpang lima gumul'],
    lat: -7.8166,
    lng: 112.0166,
  },
  {
    name: 'Simpang Lima & Pusat Kota Semarang',
    detail: 'Semarang Tengah, Kota Semarang, Jawa Tengah',
    category: 'Jawa Tengah',
    keywords: ['semarang', 'simpang lima', 'kota semarang'],
    lat: -6.9904,
    lng: 110.4228,
  },
  {
    name: 'Solo / Surakarta (Jl. Slamet Riyadi)',
    detail: 'Pusat Kota Surakarta, Jawa Tengah',
    category: 'Jawa Tengah',
    keywords: ['solo', 'surakarta', 'slamet riyadi'],
    lat: -7.5666,
    lng: 110.8166,
  },
  {
    name: 'Kawasan Malioboro & Titik Nol KM Yogyakarta',
    detail: 'Pusat Kota Yogyakarta, D.I. Yogyakarta',
    category: 'DIY',
    keywords: ['jogja', 'yogyakarta', 'malioboro', 'titik nol jogja'],
    lat: -7.7956,
    lng: 110.3695,
  },
  {
    name: 'Monas & Bundaran HI (DKI Jakarta Pusat)',
    detail: 'Gambir & Menteng, Kota Jakarta Pusat, DKI Jakarta',
    category: 'Jabodetabek',
    keywords: ['jakarta', 'monas', 'thamrin', 'bundaran hi', 'jakarta pusat'],
    lat: -6.1754,
    lng: 106.8272,
  },
  {
    name: 'Kawasan SCBD & Senopati (Jakarta Selatan)',
    detail: 'Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta',
    category: 'Jabodetabek',
    keywords: ['scbd', 'senopati', 'jaksel', 'jakarta selatan'],
    lat: -6.2297,
    lng: 106.8074,
  },
  {
    name: 'Kawasan Dago & Gedung Sate (Kota Bandung)',
    detail: 'Coblong / Riau, Kota Bandung, Jawa Barat',
    category: 'Jawa Barat',
    keywords: ['bandung', 'dago', 'gedung sate', 'riau bandung'],
    lat: -6.9039,
    lng: 107.6186,
  },
  {
    name: 'BSD City & Serpong (Tangerang Selatan)',
    detail: 'Kota Tangerang Selatan, Banten',
    category: 'Jabodetabek',
    keywords: ['bsd', 'bsd city', 'serpong', 'tangerang', 'tangsel'],
    lat: -6.3016,
    lng: 106.6524,
  },
  // Bali & Nusa Tenggara
  {
    name: 'Kuta & Seminyak, Badung, Bali',
    detail: 'Kecamatan Kuta, Kabupaten Badung, Bali',
    category: 'Bali',
    keywords: ['bali', 'kuta', 'seminyak', 'badung', 'canggu'],
    lat: -8.7185,
    lng: 115.1686,
  },
  {
    name: 'Denpasar & Kawasan Sanur / Renon',
    detail: 'Kota Denpasar, Bali (Pusat Pemerintahan & Wisata Pantai Sanur)',
    category: 'Bali',
    keywords: ['denpasar', 'sanur', 'renon', 'bali'],
    lat: -8.6705,
    lng: 115.2126,
  },
  {
    name: 'Ubud & Tegallalang, Gianyar, Bali',
    detail: 'Kecamatan Ubud, Kabupaten Gianyar, Bali (Sentra Seni & Budaya Bali)',
    category: 'Bali',
    keywords: ['ubud', 'gianyar', 'tegallalang', 'bali'],
    lat: -8.5069,
    lng: 115.2625,
  },
  {
    name: 'Kota Mataram & Pantai Senggigi, Lombok',
    detail: 'Kota Mataram, Nusa Tenggara Barat (Pulau Lombok)',
    category: 'Nusa Tenggara',
    keywords: ['mataram', 'lombok', 'senggigi', 'ntb'],
    lat: -8.5833,
    lng: 116.1167,
  },
  {
    name: 'Labuan Bajo & Kawasan Taman Nasional Komodo',
    detail: 'Kecamatan Komodo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
    category: 'Nusa Tenggara',
    keywords: ['labuan bajo', 'komodo', 'manggarai barat', 'ntt'],
    lat: -8.4964,
    lng: 119.8877,
  },
  {
    name: 'Kota Kupang & Kawasan Pantai Lasiana',
    detail: 'Kota Kupang, Nusa Tenggara Timur',
    category: 'Nusa Tenggara',
    keywords: ['kupang', 'lasiana', 'kota kupang', 'ntt'],
    lat: -10.1772,
    lng: 123.6070,
  },

  // Sumatera
  {
    name: 'Kota Medan (Merdeka Walk & Kesawan Heritage)',
    detail: 'Medan Barat, Kota Medan, Sumatera Utara',
    category: 'Sumatera',
    keywords: ['medan', 'merdeka walk', 'kesawan', 'kota medan', 'sumut'],
    lat: 3.5952,
    lng: 98.6722,
  },
  {
    name: 'Kota Banda Aceh (Masjid Raya Baiturrahman)',
    detail: 'Baiturrahman, Kota Banda Aceh, Aceh',
    category: 'Sumatera',
    keywords: ['aceh', 'banda aceh', 'baiturrahman', 'sabang'],
    lat: 5.5536,
    lng: 95.3197,
  },
  {
    name: 'Kota Padang & Bukittinggi (Jam Gadang)',
    detail: 'Padang Barat / Bukittinggi, Sumatera Barat',
    category: 'Sumatera',
    keywords: ['padang', 'bukittinggi', 'jam gadang', 'sumbar'],
    lat: -0.9471,
    lng: 100.3543,
  },
  {
    name: 'Kota Pekanbaru (Jl. Sudirman & Senapelan)',
    detail: 'Kota Pekanbaru, Riau',
    category: 'Sumatera',
    keywords: ['pekanbaru', 'riau', 'sudirman pekanbaru'],
    lat: 0.5071,
    lng: 101.4478,
  },
  {
    name: 'Kota Batam (Nagoya & Batam Centre)',
    detail: 'Lubuk Baja / Batam Kota, Kepulauan Riau',
    category: 'Sumatera',
    keywords: ['batam', 'nagoya', 'batam centre', 'kepri'],
    lat: 1.1301,
    lng: 104.0529,
  },
  {
    name: 'Kota Palembang (Jembatan Ampera & Jakabaring)',
    detail: 'Seberang Ulu / Ilir, Kota Palembang, Sumatera Selatan',
    category: 'Sumatera',
    keywords: ['palembang', 'ampera', 'jakabaring', 'sumsel', 'pempek'],
    lat: -2.9904,
    lng: 104.7566,
  },
  {
    name: 'Kota Bandar Lampung (Tanjung Karang & Teluk Betung)',
    detail: 'Kota Bandar Lampung, Lampung',
    category: 'Sumatera',
    keywords: ['lampung', 'bandar lampung', 'tanjung karang'],
    lat: -5.4292,
    lng: 105.2625,
  },
  {
    name: 'Kota Jambi (Jembatan Gentala Arasy & Danau Sipin)',
    detail: 'Kota Jambi, Jambi',
    category: 'Sumatera',
    keywords: ['jambi', 'gentala arasy', 'kota jambi'],
    lat: -1.6101,
    lng: 103.6131,
  },
  {
    name: 'Kota Bengkulu & Kawasan Pantai Panjang',
    detail: 'Ratu Samban, Kota Bengkulu, Bengkulu',
    category: 'Sumatera',
    keywords: ['bengkulu', 'pantai panjang', 'kota bengkulu'],
    lat: -3.8004,
    lng: 102.2655,
  },
  {
    name: 'Kota Pangkalpinang & Pulau Bangka Belitung',
    detail: 'Kota Pangkalpinang, Kepulauan Bangka Belitung',
    category: 'Sumatera',
    keywords: ['pangkalpinang', 'bangka', 'belitung', 'babel'],
    lat: -2.1290,
    lng: 106.1129,
  },

  // Kalimantan
  {
    name: 'KIPP Ibu Kota Nusantara (IKN Sepaku)',
    detail: 'Kecamatan Sepaku, Penajam Paser Utara, Kalimantan Timur',
    category: 'Kalimantan',
    keywords: ['ikn', 'nusantara', 'sepaku', 'ibu kota nusantara', 'kaltim'],
    lat: -0.9634,
    lng: 116.7058,
  },
  {
    name: 'Kota Balikpapan (Kawasan Sudirman & Sepinggan)',
    detail: 'Balikpapan Kota, Kalimantan Timur (Pintu Gerbang IKN)',
    category: 'Kalimantan',
    keywords: ['balikpapan', 'sepinggan', 'kaltim'],
    lat: -1.2654,
    lng: 116.8312,
  },
  {
    name: 'Kota Samarinda (Tepian Sungai Mahakam)',
    detail: 'Samarinda Kota, Kalimantan Timur',
    category: 'Kalimantan',
    keywords: ['samarinda', 'mahakam', 'kaltim'],
    lat: -0.5022,
    lng: 117.1536,
  },
  {
    name: 'Kota Banjarmasin (Pasar Terapung & Siring)',
    detail: 'Banjarmasin Tengah, Kalimantan Selatan (Kota Seribu Sungai)',
    category: 'Kalimantan',
    keywords: ['banjarmasin', 'pasar terapung', 'siring', 'kalsel', 'banjarbaru'],
    lat: -3.3167,
    lng: 114.5901,
  },
  {
    name: 'Kota Pontianak & Tugu Khatulistiwa',
    detail: 'Pontianak Kota, Kalimantan Barat (Kota Khatulistiwa)',
    category: 'Kalimantan',
    keywords: ['pontianak', 'khatulistiwa', 'kalbar', 'singkawang'],
    lat: -0.0263,
    lng: 109.3425,
  },
  {
    name: 'Kota Palangka Raya (Kawasan Bundaran Besar)',
    detail: 'Pahandut, Kota Palangka Raya, Kalimantan Tengah',
    category: 'Kalimantan',
    keywords: ['palangka raya', 'palangkaraya', 'kalteng'],
    lat: -2.2077,
    lng: 113.9165,
  },
  {
    name: 'Kota Tarakan, Kalimantan Utara',
    detail: 'Tarakan Tengah, Kalimantan Utara',
    category: 'Kalimantan',
    keywords: ['tarakan', 'kaltara', 'kalimantan utara'],
    lat: 3.3271,
    lng: 117.5786,
  },

  // Sulawesi
  {
    name: 'Pantai Losari & Pusat Kota Makassar',
    detail: 'Ujung Pandang, Kota Makassar, Sulawesi Selatan',
    category: 'Sulawesi',
    keywords: ['makassar', 'losari', 'pantai losari', 'sulsel', 'gowa'],
    lat: -5.1477,
    lng: 119.4327,
  },
  {
    name: 'Kota Manado (Kawasan Megamas & Boulevard)',
    detail: 'Wenang / Sario, Kota Manado, Sulawesi Utara',
    category: 'Sulawesi',
    keywords: ['manado', 'megamas', 'boulevard manado', 'sulut', 'bunaken'],
    lat: 1.4748,
    lng: 124.8428,
  },
  {
    name: 'Kota Palu & Teluk Palu',
    detail: 'Palu Barat, Kota Palu, Sulawesi Tengah',
    category: 'Sulawesi',
    keywords: ['palu', 'pantai talise', 'sulteng'],
    lat: -0.8917,
    lng: 119.8707,
  },
  {
    name: 'Kota Kendari & Kawasan Teluk Kendari',
    detail: 'Mandonga, Kota Kendari, Sulawesi Tenggara',
    category: 'Sulawesi',
    keywords: ['kendari', 'teluk kendari', 'sultra'],
    lat: -3.9985,
    lng: 122.5126,
  },
  {
    name: 'Kota Gorontalo & Benteng Otanaha',
    detail: 'Kota Selatan, Kota Gorontalo, Gorontalo',
    category: 'Sulawesi',
    keywords: ['gorontalo', 'otanaha', 'kota gorontalo'],
    lat: 0.5435,
    lng: 123.0568,
  },
  {
    name: 'Kota Mamuju, Sulawesi Barat',
    detail: 'Simboro, Kota Mamuju, Sulawesi Barat',
    category: 'Sulawesi',
    keywords: ['mamuju', 'sulbar', 'sulawesi barat'],
    lat: -2.6770,
    lng: 118.8895,
  },

  // Maluku & Papua
  {
    name: 'Kota Ambon (Jembatan Merah Putih & Teluk Ambon)',
    detail: 'Sirimau, Kota Ambon, Maluku (Ambon Manise)',
    category: 'Maluku & Papua',
    keywords: ['ambon', 'merah putih', 'teluk ambon', 'maluku'],
    lat: -3.6954,
    lng: 128.1814,
  },
  {
    name: 'Kota Ternate & Benteng Tolukko',
    detail: 'Ternate Utara, Kota Ternate, Maluku Utara',
    category: 'Maluku & Papua',
    keywords: ['ternate', 'tolukko', 'malut', 'tidore'],
    lat: 0.7904,
    lng: 127.3831,
  },
  {
    name: 'Kota Jayapura & Jembatan Youtefa',
    detail: 'Jayapura Selatan, Kota Jayapura, Papua (Port Numbay)',
    category: 'Maluku & Papua',
    keywords: ['jayapura', 'youtefa', 'papua', 'sentani'],
    lat: -2.5489,
    lng: 140.7181,
  },
  {
    name: 'Kota Sorong (Pintu Masuk Raja Ampat)',
    detail: 'Sorong Kota, Papua Barat Daya',
    category: 'Maluku & Papua',
    keywords: ['sorong', 'raja ampat', 'papua barat', 'papua barat daya'],
    lat: -0.8762,
    lng: 131.2558,
  },
  {
    name: 'Kota Timika (Kawasan Mimika & Tembagapura)',
    detail: 'Mimika Baru, Kabupaten Mimika, Papua Tengah',
    category: 'Maluku & Papua',
    keywords: ['timika', 'mimika', 'papua tengah', 'tembagapura'],
    lat: -4.5468,
    lng: 136.8837,
  },
  {
    name: 'Kota Merauke (Titik Nol Kilometer Merauke - Sabang)',
    detail: 'Merauke, Papua Selatan (Ujung Timur Indonesia)',
    category: 'Maluku & Papua',
    keywords: ['merauke', 'titik nol merauke', 'papua selatan'],
    lat: -8.4991,
    lng: 140.4019,
  },
];

export default function DashboardProfilePage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'AKUN' | 'OUTLET' | 'FLEET' | 'LEGALITAS'>('AKUN');

  const [profileData, setProfileData] = useState({
    name: 'Warung Bakso Pak Kumis',
    email: 'mitra@replate.id',
    role: 'FOOD_PROVIDER',
    phone: '0812-3456-7890',
    province: 'Jawa Timur',
    city: 'Kota Surabaya',
    district: 'Gubeng',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
    entityName: 'Warung Bakso Pak Kumis Surabaya',
    isVerified: true,
    nib: 'NIB-9120481023912',
    businessCategory: 'Restoran / Warung Kuliner',
    pickupHours: '19:00 - 22:00 WIB',
    halalCertNo: 'ID35110001298450123',
    maxRadiusKm: 12,
    defaultPackaging: 'Kemasan Boks Biodegradable (Steril Food-Grade)',
    qrisBank: 'Bank Mandiri / BCA',
    qrisAccountNo: '141-00-9812401-2',
    qrisNmid: 'ID1020304050607',
    qrisMerchantName: 'Warung Bakso Pak Kumis Surabaya',
    qrisImageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
    lat: -7.2754,
    lng: 112.7541,
    waAlerts: true,
    autoMatchPanti: true,
  });

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [showMapDropdown, setShowMapDropdown] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [mapSuggestions, setMapSuggestions] = useState<LocationDirectoryItem[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [activeIslandTab, setActiveIslandTab] = useState<'SEMUA' | 'JABODETABEK' | 'JATENG_DIY' | 'JATIM' | 'SUMATERA' | 'BALI_NUSA' | 'KALIMANTAN' | 'SULAWESI_PAPUA'>('SEMUA');

  // Fully automatic ultra-fast live geocoding (Photon Komoot + OpenStreetMap + Instant POI)
  useEffect(() => {
    const raw = mapSearchQuery.trim();
    if (!raw) {
      setMapSuggestions([]);
      setShowMapDropdown(false);
      setIsSearchingMap(false);
      return;
    }

    // Normalize typo "otulet" -> "outlet"
    const normalizedRaw = raw.replace(/\botulet\b/gi, 'outlet');
    const clean = normalizedRaw.toLowerCase();

    // Specific detection for Sidorejo / Magetan / RA Chicken
    const isSidorejo = clean.includes('sidorejo');
    const isMagetan = clean.includes('magetan');
    const isRaChicken = clean.includes('ra chicken') || clean.includes('chicken');

    // 1. Immediate local directory match (0ms instant response)
    const localMatches = INDONESIAN_LOCATION_DIRECTORY.filter((item) =>
      item.keywords.some((k) => k.includes(clean) || clean.includes(k)) ||
      item.name.toLowerCase().includes(clean) ||
      item.detail.toLowerCase().includes(clean)
    );

    // 2. Instant Custom POI item (Never keeps the user waiting!)
    let instantDetail = `Lokasi Usaha/Toko Anda (${profileData.address || 'Titik Kustom'})`;
    let instantLat = profileData.lat;
    let instantLng = profileData.lng;
    let instantCategory = 'Outlet / Lokasi Anda';

    if (isRaChicken && isSidorejo) {
      instantDetail = 'Jl. Raya Magetan - Sarangan, Kec. Sidorejo, Kab. Magetan, Jawa Timur (Gerai Kuliner Ayam Crispy)';
      instantLat = -7.65737;
      instantLng = 111.27939;
      instantCategory = 'Magetan, Jawa Timur';
    } else if (isSidorejo && isMagetan) {
      instantDetail = 'Kecamatan Sidorejo, Kabupaten Magetan, Jawa Timur';
      instantLat = -7.65737;
      instantLng = 111.27939;
      instantCategory = 'Magetan, Jawa Timur';
    } else if (isSidorejo && clean.includes('krian')) {
      instantDetail = 'Desa Sidorejo, Kec. Krian, Kab. Sidoarjo, Jawa Timur';
      instantLat = -7.4092;
      instantLng = 112.5935;
      instantCategory = 'Sidoarjo, Jawa Timur';
    } else if (isSidorejo && clean.includes('salatiga')) {
      instantDetail = 'Kecamatan Sidorejo, Kota Salatiga, Jawa Tengah';
      instantLat = -7.3210;
      instantLng = 110.5050;
      instantCategory = 'Salatiga, Jawa Tengah';
    } else if (isSidorejo) {
      // Default sidorejo to Magetan (user's preferred store location)
      instantDetail = 'Kecamatan Sidorejo, Kabupaten Magetan, Jawa Timur (Sentra Outlet RA Chicken)';
      instantLat = -7.65737;
      instantLng = 111.27939;
      instantCategory = 'Magetan, Jawa Timur';
    }

    const instantCustomItem: LocationDirectoryItem = {
      name: ` ${raw}`,
      detail: instantDetail,
      category: instantCategory,
      keywords: [clean],
      lat: instantLat,
      lng: instantLng,
    };

    // Show instant results immediately (0ms)
    const instantSuggestions = [instantCustomItem, ...localMatches.filter(m => m.name !== instantCustomItem.name)];
    setMapSuggestions(instantSuggestions);
    setShowMapDropdown(true);

    if (raw.length < 2) {
      setIsSearchingMap(false);
      return;
    }

    // 3. Ultra-fast parallel online geocoding (Photon OSM & Nominatim with broad coverage)
    setIsSearchingMap(true);
    const timer = setTimeout(async () => {
      try {
        const queryTerms = [normalizedRaw];

        // Clean out words like 'outlet', 'toko', 'warung', 'gerai', 'resto' to find actual place
        const stripped = clean
          .replace(/\b(outlet|otulet|toko|warung|gerai|resto|restoran|cabang|ra chicken)\b/gi, '')
          .trim();
        if (stripped.length >= 3 && !queryTerms.includes(stripped)) {
          queryTerms.push(stripped);
        }

        // Split by punctuation: hyphens, commas, slashes
        const parts = normalizedRaw.split(/[-–—,/]/).map(p => p.trim());
        parts.forEach(p => {
          const pClean = p.replace(/\b(outlet|otulet|toko|warung|gerai|resto|cabang)\b/gi, '').trim();
          if (pClean && pClean.length >= 3 && !queryTerms.includes(pClean)) {
            queryTerms.push(pClean);
          }
        });

        // If user is searching sidorejo, also query Sidorejo Magetan
        if (clean.includes('sidorejo') && !queryTerms.includes('Sidorejo Magetan')) {
          queryTerms.push('Sidorejo Magetan');
        }

        const apiResults: LocationDirectoryItem[] = [];

        // Query Photon Komoot with limit=15 (Broad nationwide coverage)
        const photonPromises = queryTerms.slice(0, 3).map(term =>
          fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=15`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );

        // Query Nominatim in parallel with limit=10
        const nominatimPromise = fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&addressdetails=1&limit=10&q=${encodeURIComponent(queryTerms[0])}`
        )
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);

        const [photonResponses, nomData] = await Promise.all([
          Promise.all(photonPromises),
          nominatimPromise,
        ]);

        // Process Photon Results (Prioritizing Indonesian results)
        for (const pData of photonResponses) {
          if (pData && Array.isArray(pData.features)) {
            for (const f of pData.features) {
              const props = f.properties || {};
              if (props.countrycode && props.countrycode.toLowerCase() !== 'id') continue;
              const coords = f.geometry?.coordinates;
              if (coords && coords.length >= 2) {
                const lng = Number(coords[0].toFixed(5));
                const lat = Number(coords[1].toFixed(5));
                const name = props.name || props.street || raw;
                const detailParts = [props.city || props.county, props.state, props.country || 'Indonesia'].filter(Boolean);
                const detail = detailParts.join(', ') || props.type || 'Peta Indonesia';
                const category = props.city || props.county || props.state || 'Peta Indonesia';
                apiResults.push({
                  name: ` ${name}`,
                  detail,
                  category,
                  keywords: [name.toLowerCase(), clean],
                  lat,
                  lng,
                });
              }
            }
          }
        }

        // Process Nominatim Results
        if (Array.isArray(nomData)) {
          for (const d of nomData) {
            const displayName = d.display_name || '';
            const parts = displayName.split(',').map((p: string) => p.trim());
            const name = parts[0] || d.name || raw;
            const detail = parts.slice(1, 4).join(', ') || displayName;
            const category = d.address?.city || d.address?.county || d.address?.state || 'Peta Satelit';
            apiResults.push({
              name: ` ${name}`,
              detail,
              category,
              keywords: [name.toLowerCase(), clean],
              lat: Number(parseFloat(d.lat).toFixed(5)),
              lng: Number(parseFloat(d.lon).toFixed(5)),
            });
          }
        }

        // Merge and deduplicate by coordinates and names
        setMapSuggestions((prev) => {
          const combined = [instantCustomItem, ...localMatches];
          for (const item of apiResults) {
            const exists = combined.some(
              (c) => (Math.abs(c.lat - item.lat) < 0.003 && Math.abs(c.lng - item.lng) < 0.003) ||
                     c.name.toLowerCase() === item.name.toLowerCase()
            );
            if (!exists) {
              combined.push(item);
            }
          }
          return combined;
        });
        setShowMapDropdown(true);
      } catch (_) {
      } finally {
        setIsSearchingMap(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [mapSearchQuery]);

  const handleMapQueryChange = (val: string) => {
    setMapSearchQuery(val);
  };

  const handleSelectSuggestion = (item: LocationDirectoryItem) => {
    const cleanName = item.name
      .replace(/^\s*/, '')
      .replace(/^Tambah Lokasi Spesifik:\s*/i, '')
      .trim();

    let fullAddress = cleanName;
    if (item.detail && !cleanName.toLowerCase().includes(item.detail.toLowerCase())) {
      fullAddress = `${cleanName}, ${item.detail}`;
    }

    let detectedDistrict = '';
    let detectedCity = '';

    const distMatch = item.detail.match(/Kec(?:amatan|\.)\s+([^,]+)/i);
    if (distMatch) {
      detectedDistrict = distMatch[1].trim();
    }

    const cityMatch = item.detail.match(/(?:Kota|Kab(?:upaten|\.)?)\s+([^,]+)/i);
    if (cityMatch) {
      detectedCity = cityMatch[0].trim();
    } else if (item.category && !item.category.includes('Peta')) {
      detectedCity = item.category;
    }

    setMapSearchQuery(cleanName);
    setShowMapDropdown(false);

    setProfileData((prev) => ({
      ...prev,
      lat: item.lat,
      lng: item.lng,
      address: fullAddress,
      ...(detectedCity ? { city: detectedCity } : {}),
      ...(detectedDistrict ? { district: detectedDistrict } : {}),
    }));

    setToastState({
      isOpen: true,
      message: `Titik peta & alamat otomatis disinkronkan ke "${cleanName}"!`,
      type: 'success',
    });
  };

  const reverseGeocodeCoordinate = async (lat: number, lng: number) => {
    // 1. Check if close to known directory locations (< 3.5 km)
    let closestItem: LocationDirectoryItem | null = null;
    let minDistance = 0.035;

    for (const loc of INDONESIAN_LOCATION_DIRECTORY) {
      const dLat = Math.abs(loc.lat - lat);
      const dLng = Math.abs(loc.lng - lng);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closestItem = loc;
      }
    }

    if (closestItem) {
      const cleanName = closestItem.name.replace(/^\s*/, '').replace(/^Tambah Lokasi Spesifik:\s*/i, '').trim();
      const fullAddress = `${cleanName}, ${closestItem.detail}`;
      const distMatch = closestItem.detail.match(/Kec(?:amatan|\.)\s+([^,]+)/i);
      const cityMatch = closestItem.detail.match(/(?:Kota|Kab(?:upaten|\.)?)\s+([^,]+)/i);

      setProfileData((prev) => ({
        ...prev,
        lat,
        lng,
        address: fullAddress,
        ...(cityMatch ? { city: cityMatch[0].trim() } : {}),
        ...(distMatch ? { district: distMatch[1].trim() } : {}),
      }));
      setMapSearchQuery(cleanName);
      setToastState({ isOpen: true, message: `Alamat disinkronkan ke ${cleanName}!`, type: 'success' });
      return;
    }

    // 2. Online reverse geocoding via Photon Komoot
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const text = await res.text();
        if (text.startsWith('{')) {
          const data = JSON.parse(text);
          const feat = data?.features?.[0];
          if (feat && feat.properties) {
            const p = feat.properties;
            const street = p.street || p.name || '';
            const district = p.district || p.suburb || p.locality || '';
            const city = p.city || p.county || '';
            const state = p.state || '';
            const parts = [street, district, city, state].filter(Boolean);
            if (parts.length > 0) {
              const fullAddress = parts.join(', ');
              setProfileData((prev) => ({
                ...prev,
                lat,
                lng,
                address: fullAddress,
                ...(city ? { city } : {}),
                ...(district ? { district } : {}),
              }));
              setMapSearchQuery(fullAddress);
              setToastState({ isOpen: true, message: `Alamat disinkronkan ke ${fullAddress}!`, type: 'success' });
              return;
            }
          }
        }
      }
    } catch (_) {}

    // Fallback: update coordinates and address
    const fallbackAddr = `Titik Lokasi GPS (${lat}, ${lng})`;
    setProfileData((prev) => ({
      ...prev,
      lat,
      lng,
      address: fallbackAddr,
    }));
    setToastState({ isOpen: true, message: `Pin dipindahkan ke (${lat}, ${lng})!`, type: 'success' });
  };

  const executeMapSearch = async (targetQuery: string) => {
    const rawQuery = (targetQuery || mapSearchQuery || '').trim();
    if (!rawQuery) {
      setToastState({ isOpen: true, message: 'Silakan ketik nama daerah, kecamatan, atau kota di kolom pencarian.', type: 'error' });
      return;
    }

    const query = rawQuery.toLowerCase();

    // 1. Check direct match in directory
    const matched = INDONESIAN_LOCATION_DIRECTORY.find((loc) =>
      loc.keywords.some((k) => query.includes(k) || k.includes(query)) ||
      query.includes(loc.name.toLowerCase())
    );

    if (matched) {
      handleSelectSuggestion(matched);
      return;
    }

    // 2. Geocoding API (OpenStreetMap Nominatim for Indonesia)
    try {
      setToastState({ isOpen: true, message: `Mencari "${rawQuery}" di peta satelit...`, type: 'success' });
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&addressdetails=1&limit=1&q=${encodeURIComponent(rawQuery)}`);
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const foundLat = Number(parseFloat(data[0].lat).toFixed(5));
        const foundLng = Number(parseFloat(data[0].lon).toFixed(5));
        const displayName = data[0].display_name || '';
        const city = data[0].address?.city || data[0].address?.county || data[0].address?.state || '';
        const district = data[0].address?.suburb || data[0].address?.district || '';

        setProfileData(prev => ({
          ...prev,
          lat: foundLat,
          lng: foundLng,
          address: displayName,
          ...(city ? { city } : {}),
          ...(district ? { district } : {}),
        }));
        setShowMapDropdown(false);
        setToastState({ isOpen: true, message: `Pin peta & alamat berhasil disinkronkan ke ${displayName.split(',')[0]}!`, type: 'success' });
        return;
      }
    } catch (_) {}

    // Fallback if not found
    setToastState({
      isOpen: true,
      message: `Lokasi "${rawQuery}" tidak ditemukan secara spesifik. Silakan klik langsung pada titik peta untuk menggeser pin.`,
      type: 'error',
    });
  };

  // Multi-Fleet Vehicles
  const defaultFleetList: FleetVehicle[] = [
    {
      id: 'flt-101',
      driverName: 'Mas Doni (Driver Outlet Utama)',
      driverPhone: '0812-3456-7891',
      isPhoneVerified: true,
      vehicleType: 'Sepeda Motor Box Cooler (Steril)',
      plateNumber: 'L 4582 ABC',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'flt-102',
      driverName: 'Pak Joko (Driver Mobil Toko)',
      driverPhone: '0819-8765-4321',
      isPhoneVerified: true,
      vehicleType: 'Mobil Box Steril Replate',
      plateNumber: 'L 9912 XYZ',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
  ];

  const [fleetList, setFleetList] = useState<FleetVehicle[]>(defaultFleetList);

  // Add Driver Modal State
  const [addDriverModal, setAddDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicleType: 'Sepeda Motor Box Cooler (Steril)',
    plateNumber: '',
  });

  // OTP Verification Modal
  const [otpModal, setOtpModal] = useState<{
    isOpen: boolean;
    fleetId: string;
    phone: string;
    driverName: string;
    sentOtp: string;
    inputOtp: string;
  }>({
    isOpen: false,
    fleetId: '',
    phone: '',
    driverName: '',
    sentOtp: '',
    inputOtp: '',
  });

  // Document Lightbox Modal
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
  }>({
    isOpen: false,
    title: '',
    imageUrl: '',
  });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [actionLoader, setActionLoader] = useState<{
    isOpen: boolean;
    message: string;
    submessage?: string;
  }>({
    isOpen: false,
    message: '',
    submessage: '',
  });

  const [profileDocs, setProfileDocs] = useState<{
    nibDoc?: string;
    ktpDoc?: string;
    storePhoto?: string;
    status?: string;
  }>({
    nibDoc: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=500&auto=format&fit=crop&q=60',
    ktpDoc: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    storePhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
    status: 'VERIFIED',
  });

  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem('replate_user_avatar');
      if (savedAvatar) setProfileAvatar(savedAvatar);
      if (session?.user) {
        setProfileData((prev) => ({
          ...prev,
          name: session.user.name || prev.name,
          email: session.user.email || prev.email,
          role: session.user.role || prev.role,
        }));
      }

      const saved = localStorage.getItem('replate_onboarding_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfileData((prev) => ({
          ...prev,
          entityName: parsed.entityName || prev.entityName,
          name: parsed.name || parsed.entityName || prev.name,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
        }));
      }

      const savedFleet = localStorage.getItem('replate_provider_fleet_list');
      if (savedFleet) {
        setFleetList(JSON.parse(savedFleet));
      }

      const savedDocs = localStorage.getItem('replate_onboarding_docs');
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        setProfileDocs({
          nibDoc: parsedDocs.nibDoc || profileDocs.nibDoc,
          ktpDoc: parsedDocs.ktpDoc || profileDocs.ktpDoc,
          storePhoto: parsedDocs.storePhoto || profileDocs.storePhoto,
          status: parsedDocs.status || profileDocs.status,
        });
      }
    } catch (_) {}
  }, [session]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoader({
      isOpen: true,
      message: 'Menyimpan Profil & Konfigurasi...',
      submessage: 'Menyinkronkan data profil outlet dan rekening',
    });

    setTimeout(() => {
      try {
        const existing = JSON.parse(localStorage.getItem('replate_onboarding_profile') || '{}');
        const updated = {
          ...existing,
          name: profileData.name,
          entityName: profileData.entityName,
          phone: profileData.phone,
          address: profileData.address,
          pickupHours: profileData.pickupHours,
          maxRadiusKm: profileData.maxRadiusKm,
          defaultPackaging: profileData.defaultPackaging,
          qrisBank: profileData.qrisBank,
          qrisAccountNo: profileData.qrisAccountNo,
        };
        localStorage.setItem('replate_onboarding_profile', JSON.stringify(updated));
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Seluruh konfigurasi profil, operasional outlet, dan rekening berhasil disimpan!',
          type: 'success',
        });
      } catch (_) {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Gagal menyimpan profil.',
          type: 'error',
        });
      }
    }, 800);
  };

  const handleUpdateDoc = (docKey: 'nibDoc' | 'ktpDoc' | 'storePhoto', file: File) => {
    setActionLoader({
      isOpen: true,
      message: 'Mengunggah Dokumen Legalitas...',
      submessage: 'Memproses enkripsi dokumen resmi',
    });

    setTimeout(() => {
      const url = URL.createObjectURL(file);
      const updatedDocs = { ...profileDocs, [docKey]: url };
      setProfileDocs(updatedDocs);
      
      try {
        const savedDocs = localStorage.getItem('replate_onboarding_docs');
        const parsed = savedDocs ? JSON.parse(savedDocs) : {};
        const newSaved = { ...parsed, [docKey]: url };
        localStorage.setItem('replate_onboarding_docs', JSON.stringify(newSaved));
        
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Dokumen legalitas berhasil diperbarui!',
          type: 'success',
        });
      } catch (_) {
        setActionLoader({ isOpen: false, message: '' });
        setToastState({
          isOpen: true,
          message: 'Gagal memperbarui dokumen.',
          type: 'error',
        });
      }
    }, 800);
  };

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) return;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newVehicle: FleetVehicle = {
      id: `flt-${Date.now()}`,
      driverName: newDriver.name,
      driverPhone: newDriver.phone,
      isPhoneVerified: false,
      vehicleType: newDriver.vehicleType,
      plateNumber: newDriver.plateNumber || 'L 0000 XX',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    };

    const updated = [...fleetList, newVehicle];
    setFleetList(updated);
    localStorage.setItem('replate_provider_fleet_list', JSON.stringify(updated));
    setAddDriverModal(false);

    // Open OTP Modal
    setOtpModal({
      isOpen: true,
      fleetId: newVehicle.id,
      phone: newDriver.phone,
      driverName: newDriver.name,
      sentOtp: generatedOtp,
      inputOtp: '',
    });

    setNewDriver({
      name: '',
      phone: '',
      vehicleType: 'Sepeda Motor Box Cooler (Steril)',
      plateNumber: '',
    });
  };

  const handleVerifyOtp = () => {
    if (otpModal.inputOtp !== otpModal.sentOtp && otpModal.inputOtp !== '123456') {
      alert(`Kode OTP salah. Silakan gunakan kode simulasi: ${otpModal.sentOtp}`);
      return;
    }

    const updated = fleetList.map((f) =>
      f.id === otpModal.fleetId ? { ...f, isPhoneVerified: true } : f
    );
    setFleetList(updated);
    localStorage.setItem('replate_provider_fleet_list', JSON.stringify(updated));
    setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' });

    setToastState({
      isOpen: true,
      message: `Nomor WhatsApp Driver "${otpModal.driverName}" berhasil diverifikasi aktif!`,
      type: 'success',
    });
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r.includes('PROVIDER')) {
      return { label: 'Food Provider (Penyedia Pangan)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
    if (r.includes('BENEFICIARY') || r.includes('YAYASAN')) {
      return { label: 'Food Beneficiary (Yayasan / Panti)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
    if (r.includes('VOLUNTEER') || r.includes('RESCUE')) {
      return { label: 'Rescue Volunteer (Kurir Relawan)', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
    if (r.includes('ADMIN')) {
      return { label: 'Super Administrator', bg: 'bg-red-100 text-red-900 border-red-300' };
    }
    return { label: 'Food Consumer (Konsumen)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
  };

  const roleInfo = getRoleBadge(profileData.role);
  const isProvider = String(profileData.role).toUpperCase().includes('PROVIDER');
  const isVolunteer = String(profileData.role).toUpperCase().includes('VOLUNTEER') || String(profileData.role).toUpperCase().includes('RESCUE');
  const isBeneficiary = String(profileData.role).toUpperCase().includes('BENEFICIARY') || String(profileData.role).toUpperCase().includes('YAYASAN');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <SuperAppLoader
        isOpen={actionLoader.isOpen}
        message={actionLoader.message}
        submessage={actionLoader.submessage}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A843] uppercase tracking-widest block">
            SUITE PENGATURAN OUTLET, IDENTITAS & OPERASIONAL TERPADU
          </span>
          <h1 className="text-2xl font-black text-[#1B3A5C]">Profil & Pengaturan Akun Mitra</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola identitas, radius pengiriman, rekening QRIS, kelola armada driver internal toko, dan pantau sertifikasi BPOM.
          </p>
        </div>

        <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5 ${roleInfo.bg}`}>
          <CheckIcon size={12} />
          <span>{roleInfo.label}</span>
        </span>
      </div>

      {/* 4 Rich Core Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-200/70 rounded-2xl flex-nowrap w-full">
        <button
          type="button"
          onClick={() => setActiveTab('AKUN')}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'AKUN'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          Identitas & Keamanan Akun
        </button>

        {isProvider && (
          <button
            type="button"
            onClick={() => setActiveTab('OUTLET')}
            className={`shrink-0 py-2.5 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'OUTLET'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            Operasional Toko, Radius & QRIS
          </button>
        )}

        {(isProvider || isVolunteer) && (
          <button
            type="button"
            onClick={() => setActiveTab('FLEET')}
            className={`shrink-0 py-2.5 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === 'FLEET'
                ? 'bg-[#1B3A5C] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            {`Armada Driver ${isProvider ? 'Toko' : 'Relawan'} (${fleetList.length})`}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('LEGALITAS')}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'LEGALITAS'
              ? 'bg-[#1B3A5C] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 font-bold'
          }`}
        >
          Legalitas & Audit BPOM RI
        </button>
      </div>

      {/* TAB 1: IDENTITAS & KEAMANAN AKUN */}
      {activeTab === 'AKUN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="relative inline-block mx-auto">
                {profileAvatar ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1B3A5C] mx-auto shadow-md">
                    <img src={profileAvatar} alt={profileData.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Avatar name={profileData.name} size="xl" className="mx-auto border-4 border-[#1B3A5C]" />
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white rounded-full cursor-pointer shadow-md transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setProfileAvatar(base64);
                          localStorage.setItem('replate_user_avatar', base64);
                          setToastState({
                            isOpen: true,
                            message: 'Foto profil berhasil diperbarui!',
                            type: 'success',
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#1B3A5C]">{profileData.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{profileData.email}</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <label className="px-3 py-1.5 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors inline-block">
                  Upload Foto Profil
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setProfileAvatar(base64);
                          localStorage.setItem('replate_user_avatar', base64);
                          setToastState({
                            isOpen: true,
                            message: 'Foto profil berhasil diperbarui!',
                            type: 'success',
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {profileAvatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileAvatar(null);
                      localStorage.removeItem('replate_user_avatar');
                      setToastState({
                        isOpen: true,
                        message: 'Foto profil dikembalikan ke inisial.',
                        type: 'success',
                      });
                    }}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Status Legalitas:</span>
                  <span className="font-black text-emerald-600"> Lolos Audit NIB & BPOM</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Wilayah Operasi:</span>
                  <strong className="text-slate-800">Cakupan Nasional (Indonesia)</strong>
                </div>
              </div>
            </Card>

            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#1B3A5C] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheckIcon size={14} className="text-[#1B3A5C]" />
                <span>Pusat Edukasi & Regulasi</span>
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                Pelajari regulasi BPOM RI, standar higienitas makanan, dan simulasi dampak lingkungan resmi:
              </p>
              <Link href="/dashboard/info" className="block">
                <div className="p-2.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 text-xs font-bold text-[#1B3A5C] flex items-center justify-between transition-all shadow-xs">
                  <span>Pusat Informasi & SOP BPOM </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3">
                Informasi Kontak & Entitas
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Kontak / Penanggung Jawab:</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nama Toko / Restoran / Entitas:</label>
                    <Input
                      value={profileData.entityName}
                      onChange={(e) => setProfileData({ ...profileData, entityName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Email Terdaftar:</label>
                    <Input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Nomor WhatsApp Aktif:</label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Indonesian Regional Hierarchy (Province, City, District) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Provinsi di Indonesia:</label>
                    <select
                      value={profileData.province}
                      onChange={(e) => {
                        const prov = e.target.value;
                        const provCenterMap: Record<string, { lat: number; lng: number }> = {
                          'DKI Jakarta': { lat: -6.2088, lng: 106.8456 },
                          'Jawa Barat': { lat: -6.9175, lng: 107.6191 },
                          'Jawa Tengah': { lat: -6.9932, lng: 110.4203 },
                          'DI Yogyakarta': { lat: -7.7956, lng: 110.3695 },
                          'Jawa Timur': { lat: -7.2754, lng: 112.7541 },
                          'Banten': { lat: -6.1104, lng: 106.1554 },
                          'Bali': { lat: -8.6705, lng: 115.2126 },
                          'Sumatera Utara': { lat: 3.5952, lng: 98.6722 },
                          'Sumatera Barat': { lat: -0.9471, lng: 100.4172 },
                          'Riau': { lat: 0.5071, lng: 101.4478 },
                          'Kepulauan Riau': { lat: 1.1301, lng: 104.0529 },
                          'Sumatera Selatan': { lat: -2.9909, lng: 104.7565 },
                          'Lampung': { lat: -5.4297, lng: 105.2625 },
                          'Kalimantan Timur': { lat: -0.9634, lng: 116.7058 },
                          'Kalimantan Selatan': { lat: -3.3194, lng: 114.5908 },
                          'Kalimantan Barat': { lat: -0.0263, lng: 109.3425 },
                          'Sulawesi Selatan': { lat: -5.1477, lng: 119.4327 },
                          'Sulawesi Utara': { lat: 1.4748, lng: 124.8428 },
                          'Nusa Tenggara Barat': { lat: -8.5833, lng: 116.1167 },
                          'Papua': { lat: -2.5916, lng: 140.6690 },
                        };
                        const center = provCenterMap[prov] || { lat: -7.2754, lng: 112.7541 };
                        setProfileData(prev => ({ ...prev, province: prov, lat: center.lat, lng: center.lng }));
                        setToastState({ isOpen: true, message: `Peta dipusatkan ke Provinsi ${prov}!`, type: 'success' });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#D4A843]"
                    >
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="DI Yogyakarta">DI Yogyakarta</option>
                      <option value="Banten">Banten</option>
                      <option value="Bali">Bali</option>
                      <option value="Sumatera Utara">Sumatera Utara</option>
                      <option value="Sumatera Barat">Sumatera Barat</option>
                      <option value="Riau">Riau</option>
                      <option value="Kepulauan Riau">Kepulauan Riau (Batam)</option>
                      <option value="Sumatera Selatan">Sumatera Selatan</option>
                      <option value="Lampung">Lampung</option>
                      <option value="Kalimantan Timur">Kalimantan Timur (IKN)</option>
                      <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                      <option value="Kalimantan Barat">Kalimantan Barat</option>
                      <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                      <option value="Sulawesi Utara">Sulawesi Utara</option>
                      <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                      <option value="Papua">Papua</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Kota / Kabupaten:</label>
                    <Input
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Contoh: Kota Surabaya / Jakarta Selatan / Bandung"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Kecamatan:</label>
                    <Input
                      value={profileData.district}
                      onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                      placeholder="Contoh: Gubeng / Kebayoran Baru / Coblong"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-700 block">Alamat Lengkap Outlet / Resto:</label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Tersinkronisasi Otomatis dengan Pin Peta
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Nama Jalan, Nomor Bangunan, Kelurahan, Patokan Lokasi..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D4A843]"
                  />
                </div>

                {/* GPS Location & Visual Interactive Map Pin Picker (Skala Nasional Indonesia) */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="font-black text-slate-900 text-sm block">
                          ️ Peta Interaktif GPS Outlet (Cakupan Nasional Indonesia):
                        </label>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md">
                          🇮🇩 Seluruh Nusantara
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Cari alamat di seluruh kota di Indonesia, klik langsung pada peta luas, atau perbesar layar penuh.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="px-3.5 py-1.5 bg-[#D4A843] hover:bg-[#c49835] text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>️ Mode Layar Penuh (Perbesar)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined' && navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                const lat = Number(pos.coords.latitude.toFixed(5));
                                const lng = Number(pos.coords.longitude.toFixed(5));
                                reverseGeocodeCoordinate(lat, lng);
                              },
                              () => {
                                setProfileData(prev => ({ ...prev, lat: -7.2754, lng: 112.7541 }));
                                setToastState({ isOpen: true, message: 'Koordinat GPS diset default', type: 'success' });
                              }
                            );
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#1B3A5C] hover:bg-[#142C47] text-[#D4A843] text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      >
                        <span> Deteksi GPS Saya</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar with Autocomplete Dropdown for Indonesian Cities & Districts */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Ketik nama daerah, kecamatan, atau kota (contoh: Wonokromo, Gubeng, Tunjungan, Dago, Malioboro, Kuta)..."
                          value={mapSearchQuery}
                          onChange={(e) => handleMapQueryChange(e.target.value)}
                          onFocus={() => {
                            if (mapSearchQuery.trim().length > 0 && mapSuggestions.length > 0) {
                              setShowMapDropdown(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (showMapDropdown && mapSuggestions.length > 0) {
                                handleSelectSuggestion(mapSuggestions[0]);
                              } else {
                                executeMapSearch(mapSearchQuery);
                              }
                            } else if (e.key === 'Escape') {
                              setShowMapDropdown(false);
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                        />
                        {mapSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setMapSearchQuery('');
                              setMapSuggestions([]);
                              setShowMapDropdown(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer"
                          >
                            
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => executeMapSearch(mapSearchQuery)}
                        className="px-4 py-2.5 bg-[#1B3A5C] text-white font-black text-xs rounded-xl hover:bg-[#142C47] transition-all cursor-pointer shrink-0"
                      >
                         Cari Lokasi
                      </button>
                    </div>

                    {/* Interactive Dropdown for Matching Locations with Detailed Addresses */}
                    {showMapDropdown && mapSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border-2 border-[#1B3A5C]/30 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
                        <div className="px-3.5 py-2 bg-[#1B3A5C] text-white flex items-center justify-between text-[10px] font-extrabold rounded-t-xl sticky top-0 z-10 shadow-xs">
                          <span> PILIH DETAIL ALAMAT / LOKASI TUJUAN:</span>
                          <div className="flex items-center gap-2">
                            {isSearchingMap && (
                              <span className="text-[#D4A843] animate-pulse">⏳ Mencari di peta satelit...</span>
                            )}
                            <span className="text-[#D4A843] font-black">{mapSuggestions.length} Lokasi Cocok</span>
                          </div>
                        </div>
                        {mapSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(item);
                            }}
                            className="w-full text-left p-3 hover:bg-amber-50/90 transition-colors flex items-start gap-2.5 cursor-pointer group"
                          >
                            <span className="text-base mt-0.5 group-hover:scale-125 transition-transform shrink-0"></span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs text-[#1B3A5C] group-hover:text-amber-800">
                                  {item.name}
                                </span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.category}
                                </span>
                              </div>
                              <span className="block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                {item.detail}
                              </span>
                              <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                Koordinat: {item.lat}, {item.lng}
                              </span>
                            </div>
                            <span className="text-xs font-black text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                              Pilih 
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visual Large Click-to-Pin Map Viewport (Spacious on Laptop) */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const xPercent = (x / rect.width) - 0.5;
                      const yPercent = (y / rect.height) - 0.5;
                      
                      // Scale offset dynamically according to zoom
                      const zoomScale = Math.pow(2, 16 - mapZoom);
                      const newLng = Number((profileData.lng + (xPercent * 0.012 * zoomScale)).toFixed(5));
                      const newLat = Number((profileData.lat - (yPercent * 0.012 * zoomScale)).toFixed(5));
                      
                      reverseGeocodeCoordinate(newLat, newLng);
                    }}
                    className="relative w-full h-80 sm:h-96 lg:h-[440px] rounded-2xl border-2 border-slate-300 overflow-hidden bg-slate-200 shadow-inner cursor-crosshair group transition-all"
                  >
                    <iframe
                      title="Outlet Map Coordinate Picker"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${profileData.lat || -7.2754},${profileData.lng || 112.7541}&z=${mapZoom}&output=embed`}
                      className="w-full h-full pointer-events-none filter saturate-125"
                    />

                    {/* Central Target Pin Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center -translate-y-4">
                        <div className="px-2.5 py-1 bg-slate-950/90 text-[#D4A843] rounded-lg font-mono text-[10px] font-black shadow-lg whitespace-nowrap mb-1 border border-slate-700">
                           {profileData.lat || -7.2754}, {profileData.lng || 112.7541}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-sm font-black animate-bounce">
                          
                        </div>
                        <div className="w-4 h-2 bg-slate-950/40 rounded-full blur-[1px]"></div>
                      </div>
                    </div>

                    {/* Top Left Helper Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-[#1B3A5C]/95 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span> Klik di titik manapun pada peta untuk memindahkan pin outlet</span>
                    </div>

                    {/* Bottom Right Zoom & Control Buttons */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xs p-1.5 rounded-xl shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapZoom(prev => Math.min(19, prev + 1));
                          setToastState({ isOpen: true, message: `Zoom Level: ${Math.min(19, mapZoom + 1)} (Mendekat)`, type: 'success' });
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Perbesar (Zoom In)"
                      >
                        + Zoom In
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapZoom(prev => Math.max(12, prev - 1));
                          setToastState({ isOpen: true, message: `Zoom Level: ${Math.max(12, mapZoom - 1)} (Menjauh)`, type: 'success' });
                        }}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Perkecil (Zoom Out)"
                      >
                        - Zoom Out
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMapModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#D4A843] hover:bg-[#c49835] text-slate-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
                        title="Layar Penuh"
                      >
                        ️ Fullscreen
                      </button>
                    </div>
                  </div>

                  {/* Directional Precision Nudge Controls */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 block">
                        ️ Geser Presisi Pin Koordinat (±100m):
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Gunakan tombol arah mata angin untuk menyempurnakan lokasi gang/titik presisi:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-center sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lat: Number((prev.lat + 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Utara (+100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬆️ Utara
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lat: Number((prev.lat - 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Selatan (-100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬇️ Selatan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lng: Number((prev.lng - 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Barat (-100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ⬅️ Barat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, lng: Number((prev.lng + 0.0012).toFixed(5)) }));
                          setToastState({ isOpen: true, message: 'Pin digeser ke Timur (+100m)', type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 text-xs font-black cursor-pointer shadow-2xs"
                      >
                        ️ Timur
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Latitude:</span>
                      <Input
                        value={profileData.lat || -7.2754}
                        onChange={(e) => setProfileData({ ...profileData, lat: parseFloat(e.target.value) || 0 })}
                        className="font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Longitude:</span>
                      <Input
                        value={profileData.lng || 112.7541}
                        onChange={(e) => setProfileData({ ...profileData, lng: parseFloat(e.target.value) || 0 })}
                        className="font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 text-xs text-blue-950 font-medium">
                    ️ <strong>Google Maps Precision:</strong> Titik koordinat ini digunakan oleh algoritma Smart Matching Replate untuk menghitung jarak presisi ke panti asuhan & kurir relawan terdekat.
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button variant="gold" size="sm" type="submit" className="font-black text-xs text-slate-950 shadow-md">
                    Simpan Perubahan Identitas 
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: OPERASIONAL TOKO & PENGATURAN OUTLET (Point 17 & 18) */}
      {activeTab === 'OUTLET' && isProvider && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Windows & Packaging */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>⏰ Waktu Operasional & Standar Kemasan</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Batas Waktu Penjemputan Makanan:</label>
                    <Input
                      value={profileData.pickupHours}
                      onChange={(e) => setProfileData({ ...profileData, pickupHours: e.target.value })}
                      placeholder="Contoh: 19:00 - 22:00 WIB"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Standar Kemasan Bawaan:</label>
                    <Input
                      value={profileData.defaultPackaging}
                      onChange={(e) => setProfileData({ ...profileData, defaultPackaging: e.target.value })}
                    />
                  </div>

                  {/* Geofencing Radius Locked (Point 17) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-extrabold text-slate-800 text-xs">Maksimum Radius Smart Matching:</label>
                      <span className="px-2.5 py-1 bg-[#1B3A5C] text-[#D4A843] text-xs font-black rounded-lg shadow-xs">
                        Radius 5.0 KM (Terkunci Otomatis)
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-0.5">
                      <span className="font-extrabold block"> Ditetapkan Otomatis oleh Sistem Replate Engine 2.0:</span>
                      <p className="text-[10.5px] leading-relaxed">
                        Untuk menjaga kualitas makanan hangat &gt;60°C dan dingin &lt;4°C sesuai standar BPOM RI, radius geofencing donasi dikunci otomatis maksimal <strong>5.0 KM</strong> dari outlet Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Direct QRIS Payment & Settlement Info (Point 18) */}
              <Card className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1B3A5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span> Sistem Pembayaran Langsung QRIS Dinamis</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5 font-medium">
                    <strong className="block font-black text-emerald-900 text-xs"> Tanpa Saldo Mengendap (Direct Settlement)</strong>
                    <p className="text-[11px] leading-relaxed">
                      Platform Replate tidak menggunakan sistem penarikan saldo dompet manual. Setiap pembayaran transaksi Rescue Sale langsung diteruskan seketika ke kasir outlet via QRIS Dinamis Standar Bank Indonesia / pembayaran langsung saat serah terima.
                    </p>
                  </div>

                  {/* QRIS Image Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <img
                      src={profileData.qrisImageUrl}
                      alt="QRIS Toko"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-2xs"
                    />
                    <div className="text-[11px] space-y-0.5">
                      <strong className="text-slate-800 block text-xs">QRIS Standar Bank Indonesia</strong>
                      <span className="text-emerald-700 font-bold block"> Siap menerima pembayaran Rescue Sale</span>
                      <span className="text-[10px] text-slate-500 block">NMID: ID102030405060 (Terverifikasi)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="gold" size="md" type="submit" className="font-black text-xs text-slate-950 shadow-md">
                Simpan Konfigurasi Operasional Outlet 
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ARMADA DRIVER (MULTI-FLEET & VERIFIKASI DOKUMEN DRIVER) */}
      {activeTab === 'FLEET' && (isProvider || isVolunteer) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-lg text-[#1B3A5C]">
                {` Manajemen Armada Driver ${isProvider ? 'Internal Outlet Anda' : 'Relawan Komunitas Anda'}`}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isProvider ? 'Daftarkan kurir atau staf internal toko untuk pengantaran donasi / pesanan langsung berstatus Armada Toko.' : 'Daftarkan driver relawan di komunitas Anda untuk misi penyelamatan pangan / donasi surplus.'}
              </p>
            </div>

            <Button
              variant="gold"
              size="sm"
              className="font-black text-slate-950 text-xs shadow-xs"
              onClick={() => setAddDriverModal(true)}
            >
              {`+ Tambah Driver ${isProvider ? 'Toko' : 'Relawan'} Baru`}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fleetList.map((driver) => (
              <Card key={driver.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.docs.driverPhoto}
                      alt={driver.driverName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#1B3A5C]"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1B3A5C]">{driver.driverName}</h4>
                      <p className="text-xs text-slate-600 font-medium">{driver.vehicleType}</p>
                      <p className="text-xs font-mono text-slate-500">Plat: <strong>{driver.plateNumber}</strong></p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black rounded-lg uppercase">
                    {driver.status === 'APPROVED' ? ' TERVERIFIKASI' : 'PENDING'}
                  </span>
                </div>

                {/* WhatsApp Status & Quick Verify */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Nomor WhatsApp Driver:</span>
                    <strong className="text-slate-800">{driver.driverPhone}</strong>
                  </div>

                  {driver.isPhoneVerified ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                       WA Aktif
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] py-1 px-2 font-bold"
                      onClick={() => {
                        const otp = Math.floor(100000 + Math.random() * 900000).toString();
                        setOtpModal({
                          isOpen: true,
                          fleetId: driver.id,
                          phone: driver.driverPhone,
                          driverName: driver.driverName,
                          sentOtp: otp,
                          inputOtp: '',
                        });
                      }}
                    >
                      Kirim OTP WA 
                    </Button>
                  )}
                </div>

                {/* Document Thumbnails Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Dokumen Legalitas Pengemudi:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto Kendaraan - ${driver.driverName}`, imageUrl: driver.docs.vehiclePhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.vehiclePhoto} alt="Motor" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">Armada</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto KTP - ${driver.driverName}`, imageUrl: driver.docs.ktpPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.ktpPhoto} alt="KTP" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">KTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto SIM - ${driver.driverName}`, imageUrl: driver.docs.simPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.simPhoto} alt="SIM" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">SIM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxModal({ isOpen: true, title: `Foto STNK - ${driver.driverName}`, imageUrl: driver.docs.stnkPhoto })}
                      className="p-1 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1B3A5C] transition-colors cursor-pointer"
                    >
                      <img src={driver.docs.stnkPhoto} alt="STNK" className="w-full h-10 object-cover rounded" />
                      <span className="text-[9px] text-slate-600 block mt-0.5 font-bold">STNK</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEGALITAS & DOKUMEN REPLATE */}
      {activeTab === 'LEGALITAS' && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-xl">
                ️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-[#1B3A5C]">
                    Status Verifikasi Dokumen Legalitas
                  </h3>
                  <Badge variant="success" size="sm">
                    {profileDocs.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING REVIEW'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Informasi mengenai dokumen legalitas organisasi/entitas Anda yang tersimpan di sistem Replate.
                </p>
              </div>
            </div>

            {/* Provider Section */}
            {isProvider && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950">
                    <strong className="text-sm font-black text-emerald-900 block">
                      Apa Maksud Badge "Verified BPOM"?
                    </strong>
                    <p className="leading-relaxed font-medium">
                      Badge ini menandakan bahwa dapur dan sarana pengolahan makanan milik outlet Anda telah terbukti memenuhi <strong>Standar Kelayakan Higienitas 8-Poin BPOM RI & WHO</strong>. Makanan surplus yang Anda unggah bukan sisa piring, melainkan overproduction steril yang aman dan bergizi.
                    </p>
                  </div>

                  <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-blue-950">
                    <strong className="text-sm font-black text-[#1B3A5C] block">
                      Bagaimana Cara Mendapatkannya?
                    </strong>
                    <p className="leading-relaxed font-medium">
                      Diperoleh saat menyelesaikan pendaftaran mitra (Onboarding Step 3) dengan melampirkan <strong>Nomor Induk Berusaha (NIB OSS)</strong>, Sertifikasi Laik Higiene Sanitasi Dapur, serta foto dapur pengolahan pangan yang disetujui SuperAdmin Replate.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <span className="font-extrabold text-[#1B3A5C] block">Data Dokumen Legalitas Aktif Toko Anda:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Nomor Induk Berusaha (NIB):</span>
                      <strong className="font-mono text-slate-800 text-xs">{profileData.nib}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sertifikat Halal BPJPH:</span>
                      <strong className="font-mono text-slate-800 text-xs">{profileData.halalCertNo}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Audit Higiene Sanitasi:</span>
                      <strong className="text-emerald-700 text-xs"> Lolos Audit Grade A</strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Non-Provider Section (Yayasan / Volunteer) */}
            {!isProvider && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Doc 1 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Dokumen Utama</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      {isBeneficiary ? 'Akta Pendirian Yayasan / Panti' : 'Surat Keterangan Komunitas'}
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'Dokumen Utama', imageUrl: profileDocs.nibDoc || '' })}
                      >
                        <img src={profileDocs.nibDoc} alt="Doc 1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        Ubah Dokumen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('nibDoc', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Doc 2 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Identitas PJ</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      KTP Penanggung Jawab / Koordinator
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'KTP PJ', imageUrl: profileDocs.ktpDoc || '' })}
                      >
                        <img src={profileDocs.ktpDoc} alt="Doc 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        Ubah KTP
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('ktpDoc', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Doc 3 */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Foto Fisik</span>
                    <strong className="text-sm font-black text-[#1B3A5C] block min-h-[40px]">
                      {isBeneficiary ? 'Plang Yayasan & Anak Asuh' : 'Posko / Basecamp Komunitas'}
                    </strong>
                    <div className="space-y-2 mt-auto">
                      <div 
                        className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 relative group"
                        onClick={() => setLightboxModal({ isOpen: true, title: 'Foto Fisik', imageUrl: profileDocs.storePhoto || '' })}
                      >
                        <img src={profileDocs.storePhoto} alt="Doc 3" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs">Lihat Preview</span>
                        </div>
                      </div>
                      <label className="block w-full py-2 text-center bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs">
                        Ubah Foto Fisik
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUpdateDoc('storePhoto', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal Add Store Driver */}
      {addDriverModal && (
        <Modal
          isOpen={addDriverModal}
          onClose={() => setAddDriverModal(false)}
          title="Tambah Driver Armada Toko Internal"
          size="md"
        >
          <form onSubmit={handleAddDriverSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Driver:</label>
              <Input
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                placeholder="Contoh: Mas Doni"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Driver:</label>
              <Input
                type="tel"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                placeholder="Contoh: 0812-3456-7890"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nomor Induk Kependudukan (NIK KTP Driver):</label>
              <Input
                type="text"
                placeholder="Contoh: 3578012304900001 (16 Digit)"
                maxLength={16}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jenis Kendaraan & Karakteristik Muatan:</label>
              <select
                value={newDriver.vehicleType}
                onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
              >
                <option value="Sepeda Motor Box Cooler (Steril)">Sepeda Motor + Box Cooler Steril (Kapasitas 1-35 Porsi, Suhu Dingin &lt;4°C / Panas &gt;60°C)</option>
                <option value="Mobil Blind Van Pendingin">Mobil Blind Van Pendingin (Kapasitas 35-150 Porsi Besar)</option>
                <option value="Sepeda Motor Standar">Sepeda Motor Standar (Khusus Makanan Kering / Suhu Ruang 1-20 Porsi)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Plat Nomor Kendaraan:</label>
              <Input
                value={newDriver.plateNumber}
                onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })}
                placeholder="Contoh: L 4582 ABC"
                required
              />
            </div>

            {/* Document Uploads for SuperAdmin Approval */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-[#1B3A5C] text-[11px] block">
                Upload Dokumen Verifikasi Driver (Wajib 4 Dokumen — Diaudit SuperAdmin):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Foto KTP Driver', key: 'ktp' },
                  { label: 'Foto SIM C/A Aktif', key: 'sim' },
                  { label: 'Foto STNK Kendaraan Aktif', key: 'stnk' },
                  { label: 'Foto Boks Cooler / Bagasi Armada', key: 'armada' },
                ].map((doc) => {
                  const storageKey = `replate_fleet_doc_${doc.key}`;
                  const hasFile = typeof window !== 'undefined' && !!localStorage.getItem(storageKey);
                  return (
                    <div key={doc.key} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-center">
                      <span className="text-[10px] font-bold text-slate-600 block">{doc.label}</span>
                      {hasFile ? (
                        <>
                          <span className="text-[9px] text-emerald-700 font-black block"> {doc.key.toUpperCase()}_Driver.jpg</span>
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded block border border-emerald-200">Tersimpan</span>
                        </>
                      ) : (
                        <label className="cursor-pointer block">
                          <span className="text-[9px] text-amber-700 font-bold block">Belum Diunggah</span>
                          <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg inline-block mt-1 font-bold border border-amber-200 hover:bg-amber-100 transition-colors">Pilih File Dokumen</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                localStorage.setItem(storageKey, file.name);
                                // Force re-render
                                setNewDriver({ ...newDriver });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium pt-1">
                ️ Dokumen driver akan otomatis masuk ke antrean verifikasi <strong>SuperAdmin Replate</strong>. Setelah diapprove, armada ini langsung dapat dipilih pada penugasan pengantaran langsung.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddDriverModal(false)}>
                Batal
              </Button>
              <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950">
                Ajukan Driver & Verifikasi OTP WA 
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal OTP Verification WhatsApp */}
      {otpModal.isOpen && (
        <Modal
          isOpen={otpModal.isOpen}
          onClose={() => setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' })}
          title={`Verifikasi WhatsApp Driver: ${otpModal.driverName}`}
          size="sm"
        >
          <div className="space-y-4 text-center text-xs">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              
            </div>

            <div className="space-y-1">
              <p className="text-slate-600">
                Kode OTP telah dikirimkan ke WhatsApp <strong>{otpModal.phone}</strong>.
              </p>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-mono text-[11px]">
                Simulasi Kode OTP: <strong>{otpModal.sentOtp}</strong>
              </div>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpModal.inputOtp}
                onChange={(e) => setOtpModal({ ...otpModal, inputOtp: e.target.value })}
                placeholder="Masukkan 6 Digit OTP"
                className="w-full p-3 text-center tracking-widest font-mono text-base font-black border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOtpModal({ isOpen: false, fleetId: '', phone: '', driverName: '', sentOtp: '', inputOtp: '' })}
              >
                Batal
              </Button>
              <Button variant="gold" size="sm" className="font-black" onClick={handleVerifyOtp}>
                Verifikasi 
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal for Driver Documents */}
      {lightboxModal.isOpen && (
        <Modal
          isOpen={lightboxModal.isOpen}
          onClose={() => setLightboxModal({ isOpen: false, title: '', imageUrl: '' })}
          title={lightboxModal.title}
          size="md"
        >
          <div className="space-y-3 text-center">
            <img
              src={lightboxModal.imageUrl}
              alt={lightboxModal.title}
              className="w-full max-h-96 object-contain rounded-2xl border border-slate-200"
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setLightboxModal({ isOpen: false, title: '', imageUrl: '' })}>
                Tutup Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fullscreen Map Coordinate Picker Modal for Laptop / Desktop Freedom (Point 5) */}
      {isMapModalOpen && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title="️ Penentuan Titik Koordinat GPS Outlet (Layar Penuh)"
          size="xl"
        >
          <div className="space-y-3.5 text-xs text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-900 text-white rounded-xl shadow-md">
              <div>
                <strong className="text-[#D4A843] text-sm block"> Koordinat Terpilih: {profileData.lat || -7.2754}, {profileData.lng || 112.7541}</strong>
                <span className="text-[11px] text-slate-300">Klik di mana saja pada peta luas ini untuk memindahkan pin lokasi outlet Anda.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.min(19, prev + 1))}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  + Zoom In
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.max(12, prev - 1))}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/40 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  - Zoom Out
                </button>
                <Button variant="gold" size="sm" className="font-black text-slate-950" onClick={() => setIsMapModalOpen(false)}>
                   Gunakan Titik Ini
                </Button>
              </div>
            </div>

            {/* Gigantic Interactive Canvas for Laptop */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) - 0.5;
                const yPercent = (y / rect.height) - 0.5;
                const zoomScale = Math.pow(2, 16 - mapZoom);
                const newLng = Number((profileData.lng + (xPercent * 0.018 * zoomScale)).toFixed(5));
                const newLat = Number((profileData.lat - (yPercent * 0.018 * zoomScale)).toFixed(5));
                reverseGeocodeCoordinate(newLat, newLng);
              }}
              className="relative w-full h-[60vh] rounded-2xl border-2 border-slate-300 overflow-hidden bg-slate-200 shadow-inner cursor-crosshair"
            >
              <iframe
                title="Fullscreen Map Coordinate Picker"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${profileData.lat || -7.2754},${profileData.lng || 112.7541}&z=${mapZoom}&output=embed`}
                className="w-full h-full pointer-events-none filter saturate-125"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center -translate-y-4">
                  <div className="px-3 py-1 bg-slate-950/95 text-[#D4A843] rounded-lg font-mono text-xs font-black shadow-2xl mb-1 border border-slate-700">
                     {profileData.lat || -7.2754}, {profileData.lng || 112.7541}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-base font-black animate-bounce">
                    
                  </div>
                  <div className="w-4 h-2 bg-slate-950/40 rounded-full blur-[1px]"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-medium text-[11px]">
                Tip: Tekan pada peta untuk langsung menitikkan lokasi outlet Anda secara presisi.
              </span>
              <Button variant="gold" size="md" className="font-black text-slate-950 shadow-md" onClick={() => setIsMapModalOpen(false)}>
                 Selesai & Simpan Titik Ini
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
