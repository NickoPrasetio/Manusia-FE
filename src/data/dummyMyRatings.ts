import { Review } from '@/types';

// Placeholder photos from picsum.photos — seed-based so they're consistent
const p = (seed: string, w = 600, h = 450) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const dummyMyRatings: Review[] = [
  {
    id: 'rev-001',
    userId: 'usr-101',
    userName: 'Budi Santoso',
    rating: 5,
    comment:
      'Sangat puas dengan hasilnya! Pengerjaan rapi, tepat waktu, dan bersih. Tidak perlu banyak arahan, sudah tahu apa yang harus dilakukan. Pasti akan pakai jasa ini lagi.',
    photos: [p('cat1'), p('cat2'), p('cat3')],
    date: '2026-05-20T10:30:00Z',
    editCount: 0,
    createdAt: '2026-05-20T10:30:00Z',
  },
  {
    id: 'rev-002',
    userId: 'usr-102',
    userName: 'Siti Rahayu',
    rating: 5,
    comment:
      'Kerja cepat dan hasil memuaskan. Kamar mandi sekarang jadi kinclong lagi. Terima kasih banyak!',
    photos: [p('bathroom1'), p('bathroom2')],
    date: '2026-05-18T14:00:00Z',
    editCount: 0,
    createdAt: '2026-05-18T14:00:00Z',
  },
  {
    id: 'rev-003',
    userId: 'usr-103',
    userName: 'Andi Kurniawan',
    rating: 4,
    comment:
      'Hasil pekerjaan bagus dan memuaskan. Hanya sedikit telat dari jadwal awal, tapi komunikasi lancar dan hasilnya tidak mengecewakan.',
    date: '2026-05-15T09:00:00Z',
    editCount: 0,
    createdAt: '2026-05-15T09:00:00Z',
  },
  {
    id: 'rev-004',
    userId: 'usr-104',
    userName: 'Dewi Lestari',
    rating: 5,
    comment:
      'Profesional banget! Datang tepat waktu, bawa alat sendiri, dan pengerjaannya sangat rapi. Harga juga sangat sepadan.',
    photos: [p('house1'), p('house2'), p('house3'), p('house4')],
    date: '2026-05-12T11:45:00Z',
    editCount: 0,
    createdAt: '2026-05-12T11:45:00Z',
  },
  {
    id: 'rev-005',
    userId: 'usr-105',
    userName: 'Hendra Gunawan',
    rating: 3,
    comment:
      'Hasilnya lumayan, tapi ada beberapa bagian yang perlu diperbaiki ulang. Komunikasi kurang responsif, tapi akhirnya selesai dengan baik.',
    date: '2026-05-10T16:20:00Z',
    editCount: 0,
    createdAt: '2026-05-10T16:20:00Z',
  },
  {
    id: 'rev-006',
    userId: 'usr-106',
    userName: 'Rina Marlina',
    rating: 5,
    comment:
      'Luar biasa! Pagar besinya kokoh dan desainnya persis seperti yang saya minta. Sangat detail dan teliti dalam bekerja.',
    photos: [p('fence1'), p('fence2')],
    date: '2026-05-08T08:30:00Z',
    editCount: 0,
    createdAt: '2026-05-08T08:30:00Z',
  },
  {
    id: 'rev-007',
    userId: 'usr-107',
    userName: 'Doni Prasetyo',
    rating: 4,
    comment:
      'Kerja bagus, bersih, dan tidak banyak bicara yang tidak perlu. Saya suka cara kerjanya yang fokus. Sedikit lebih lama dari estimasi, tapi hasil akhirnya memuaskan.',
    photos: [p('tile1')],
    date: '2026-05-05T13:00:00Z',
    editCount: 0,
    createdAt: '2026-05-05T13:00:00Z',
  },
  {
    id: 'rev-008',
    userId: 'usr-108',
    userName: 'Yanti Purnama',
    rating: 2,
    comment:
      'Hasil pekerjaan di bawah ekspektasi. Cat tidak rata di beberapa bagian dinding dan harus diperbaiki ulang. Semoga ke depannya lebih teliti.',
    photos: [p('wall1'), p('wall2')],
    date: '2026-05-02T10:15:00Z',
    editCount: 0,
    createdAt: '2026-05-02T10:15:00Z',
  },
  {
    id: 'rev-009',
    userId: 'usr-109',
    userName: 'Fajar Nugraha',
    rating: 5,
    comment:
      'Sangat rekomendasikan! Plafon PVC terpasang dengan rapi dan bersih. Sampah bekas bongkaran juga langsung dirapikan. Pelayanan prima!',
    photos: [p('ceiling1'), p('ceiling2'), p('ceiling3')],
    date: '2026-04-28T15:30:00Z',
    editCount: 0,
    createdAt: '2026-04-28T15:30:00Z',
  },
  {
    id: 'rev-010',
    userId: 'usr-110',
    userName: 'Mega Wulandari',
    rating: 4,
    comment:
      'Instalasi AC berjalan lancar, tidak ada kebocoran freon, dan pendingin bekerja dengan baik. Hanya ada beberapa kabel yang kurang rapi.',
    date: '2026-04-25T09:45:00Z',
    editCount: 0,
    createdAt: '2026-04-25T09:45:00Z',
  },
  {
    id: 'rev-011',
    userId: 'usr-111',
    userName: 'Rizky Aditya',
    rating: 5,
    comment:
      'Masalah pipa bocor selesai dalam hitungan jam! Cepat, bersih, dan tukangnya sangat ramah. Harga juga sangat wajar.',
    photos: [p('pipe1')],
    date: '2026-04-22T11:00:00Z',
    editCount: 0,
    createdAt: '2026-04-22T11:00:00Z',
  },
  {
    id: 'rev-012',
    userId: 'usr-112',
    userName: 'Tono Wijaya',
    rating: 3,
    comment:
      'Hasil pemasangan keramik oke, tapi nat-nya kurang rata di beberapa sudut. Perlu sedikit sentuhan akhir lagi.',
    date: '2026-04-18T14:30:00Z',
    editCount: 0,
    createdAt: '2026-04-18T14:30:00Z',
  },
  {
    id: 'rev-013',
    userId: 'usr-113',
    userName: 'Lina Agustina',
    rating: 5,
    comment:
      'Taman saya jadi cantik lagi! Pemangkasan dilakukan dengan sangat rapi dan penanaman ulang tanamannya berhasil. Terima kasih!',
    photos: [p('garden1'), p('garden2')],
    date: '2026-04-15T08:00:00Z',
    editCount: 0,
    createdAt: '2026-04-15T08:00:00Z',
  },
  {
    id: 'rev-014',
    userId: 'usr-114',
    userName: 'Agus Setiawan',
    rating: 1,
    comment:
      'Kecewa dengan hasil pekerjaan. Atap masih bocor setelah dikerjakan dan tidak ada follow-up sama sekali ketika saya komplain.',
    photos: [p('roof1')],
    date: '2026-04-10T17:00:00Z',
    editCount: 0,
    createdAt: '2026-04-10T17:00:00Z',
  },
  {
    id: 'rev-015',
    userId: 'usr-115',
    userName: 'Putri Handayani',
    rating: 4,
    comment:
      'Pekerjaan selesai tepat waktu dan hasilnya bagus. Tukangnya sopan dan tidak meninggalkan sampah. Sedikit minor di finishing tapi secara keseluruhan puas.',
    date: '2026-04-07T10:00:00Z',
    editCount: 0,
    createdAt: '2026-04-07T10:00:00Z',
  },
];
