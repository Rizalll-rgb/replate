import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Replate database...');

    // Clean existing data
    await prisma.notification.deleteMany();
    await prisma.foodTracking.deleteMany();
    await prisma.impactLog.deleteMany();
    await prisma.matchResult.deleteMany();
    await prisma.qRCode.deleteMany();
    await prisma.foodClaim.deleteMany();
    await prisma.rescueRequest.deleteMany();
    await prisma.surplusFood.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    // ============================================
    // USERS
    // ============================================

    const admin = await prisma.user.create({
        data: {
            email: 'admin@replate.id',
            name: 'Admin Replate',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'APPROVED',
            phone: '081234567890',
            address: 'Jl. Raya Darmo No. 100, Surabaya',
            latitude: -7.2908,
            longitude: 112.7388,
            city: 'Surabaya',
            bio: 'Administrator platform Replate',
        },
    });

    const providers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'bakso.pak.kumis@replate.id',
                name: 'Pak Kumis',
                password: hashedPassword,
                role: 'PROVIDER',
                status: 'APPROVED',
                phone: '081234567891',
                address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
                latitude: -7.2575,
                longitude: 112.7521,
                city: 'Surabaya',
                organizationType: 'restaurant',
                organizationName: 'Warung Bakso Pak Kumis',
                bio: 'Warung bakso legendaris sejak 1985',
            },
        }),
        prisma.user.create({
            data: {
                email: 'rotiboy.surabaya@replate.id',
                name: 'Manager Roti Boy',
                password: hashedPassword,
                role: 'PROVIDER',
                status: 'APPROVED',
                phone: '081234567892',
                address: 'Tunjungan Plaza Lt. G, Jl. Basuki Rahmat, Surabaya',
                latitude: -7.2614,
                longitude: 112.7385,
                city: 'Surabaya',
                organizationType: 'bakery',
                organizationName: 'Roti Boy - Tunjungan Plaza',
                bio: 'Roti & pastry fresh setiap hari',
            },
        }),
        prisma.user.create({
            data: {
                email: 'hotel.majapahit@replate.id',
                name: 'F&B Manager Majapahit',
                password: hashedPassword,
                role: 'PROVIDER',
                status: 'APPROVED',
                phone: '081234567893',
                address: 'Jl. Tunjungan No. 65, Surabaya',
                latitude: -7.2637,
                longitude: 112.7407,
                city: 'Surabaya',
                organizationType: 'hotel',
                organizationName: 'Hotel Majapahit Surabaya',
                bio: 'Hotel bersejarah dengan restoran buffet',
            },
        }),
        prisma.user.create({
            data: {
                email: 'indomaret.manyar@replate.id',
                name: 'Kepala Toko Manyar',
                password: hashedPassword,
                role: 'PROVIDER',
                status: 'APPROVED',
                phone: '081234567894',
                address: 'Jl. Manyar Kertoadi No. 12, Surabaya',
                latitude: -7.2872,
                longitude: 112.7751,
                city: 'Surabaya',
                organizationType: 'retail',
                organizationName: 'Indomaret Manyar Kertoadi',
                bio: 'Minimarket terdekat, terlengkap',
            },
        }),
        prisma.user.create({
            data: {
                email: 'catering.bu.ida@replate.id',
                name: 'Bu Ida',
                password: hashedPassword,
                role: 'PROVIDER',
                status: 'APPROVED',
                phone: '081234567895',
                address: 'Jl. Rungkut Mejoyo Selatan No. 8, Surabaya',
                latitude: -7.3201,
                longitude: 112.7654,
                city: 'Surabaya',
                organizationType: 'catering',
                organizationName: 'Catering Bu Ida',
                bio: 'Catering rumahan untuk acara & harian',
            },
        }),
    ]);

    const consumers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'budi.santoso@gmail.com',
                name: 'Budi Santoso',
                password: hashedPassword,
                role: 'CONSUMER',
                status: 'APPROVED',
                phone: '081234567900',
                address: 'Jl. Ketintang Baru No. 22, Surabaya',
                latitude: -7.3156,
                longitude: 112.7298,
                city: 'Surabaya',
                bio: 'Mahasiswa ITS',
            },
        }),
        prisma.user.create({
            data: {
                email: 'siti.aminah@gmail.com',
                name: 'Siti Aminah',
                password: hashedPassword,
                role: 'CONSUMER',
                status: 'APPROVED',
                phone: '081234567901',
                address: 'Jl. Wonokromo No. 15, Surabaya',
                latitude: -7.3020,
                longitude: 112.7375,
                city: 'Surabaya',
                bio: 'Ibu rumah tangga',
            },
        }),
        prisma.user.create({
            data: {
                email: 'andi.pratama@gmail.com',
                name: 'Andi Pratama',
                password: hashedPassword,
                role: 'CONSUMER',
                status: 'APPROVED',
                phone: '081234567902',
                address: 'Kos Keputih Gang 3 No. 5, Surabaya',
                latitude: -7.2893,
                longitude: 112.7952,
                city: 'Surabaya',
                bio: 'Anak kos mahasiswa',
            },
        }),
    ]);

    const partners = await Promise.all([
        prisma.user.create({
            data: {
                email: 'panti.kasih.ibu@replate.id',
                name: 'Ibu Margareth',
                password: hashedPassword,
                role: 'YAYASAN',
                status: 'APPROVED',
                phone: '081234567910',
                address: 'Jl. Darmo Permai Selatan No. 30, Surabaya',
                latitude: -7.2895,
                longitude: 112.7201,
                city: 'Surabaya',
                organizationType: 'panti',
                organizationName: 'Panti Asuhan Kasih Ibu',
                bio: 'Menampung 45 anak yatim piatu',
            },
        }),
        prisma.user.create({
            data: {
                email: 'foodbank.surabaya@replate.id',
                name: 'Koordinator Food Bank',
                password: hashedPassword,
                role: 'RESCUE_PARTNER',
                status: 'APPROVED',
                phone: '081234567911',
                address: 'Jl. Raya Gubeng No. 88, Surabaya',
                latitude: -7.2726,
                longitude: 112.7526,
                city: 'Surabaya',
                organizationType: 'food_bank',
                organizationName: 'Food Bank Surabaya',
                bio: 'Garda pangan terdepan Surabaya, melayani 500+ keluarga',
            },
        }),
        prisma.user.create({
            data: {
                email: 'dapur.umum.gotong@replate.id',
                name: 'Pak Harto',
                password: hashedPassword,
                role: 'RESCUE_PARTNER',
                status: 'APPROVED',
                phone: '081234567912',
                address: 'Jl. Kapas Krampung No. 55, Surabaya',
                latitude: -7.2480,
                longitude: 112.7645,
                city: 'Surabaya',
                organizationType: 'community_kitchen',
                organizationName: 'Dapur Umum Gotong Royong',
                bio: 'Dapur umum untuk warga kurang mampu',
            },
        }),
    ]);

    // ============================================
    // SURPLUS FOOD
    // ============================================

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in6hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const in12hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const in3hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const surplusFoods = await Promise.all([
        prisma.surplusFood.create({
            data: {
                providerId: providers[0].id,
                foodName: 'Bakso Sapi Komplit',
                description: 'Bakso sapi dengan mie, bihun, tahu, dan siomay. Kuah kaldu sapi segar.',
                foodCategory: 'MEALS',
                quantity: 15,
                quantityUnit: 'porsi',
                productionDate: now,
                pickupDeadline: in6hours,
                storageCondition: 'ROOM_TEMP',
                packagingType: 'PACKAGED',
                photos: JSON.stringify(['/images/seed/bakso.jpg']),
                latitude: -7.2575,
                longitude: 112.7521,
                address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'BOTH',
                price: 5000,
                remainingQuantity: 15,
                weightPerUnitKg: 0.4,
                rescueReadiness: JSON.stringify({
                    infoComplete: true, notExpired: true, storageProper: true,
                    packagingIntact: true, noSpoilage: true, photoClear: true,
                    pickupRealistic: true, locationAccurate: true,
                }),
            },
        }),
        prisma.surplusFood.create({
            data: {
                providerId: providers[1].id,
                foodName: 'Roti Tawar & Aneka Danish',
                description: 'Roti tawar gandum dan aneka danish pastry. Produksi hari ini, masih sangat fresh.',
                foodCategory: 'BAKERY',
                quantity: 25,
                quantityUnit: 'pcs',
                productionDate: now,
                expiryDate: tomorrow,
                pickupDeadline: in12hours,
                storageCondition: 'ROOM_TEMP',
                packagingType: 'PACKAGED',
                photos: JSON.stringify(['/images/seed/roti.jpg']),
                latitude: -7.2614,
                longitude: 112.7385,
                address: 'Tunjungan Plaza Lt. G, Jl. Basuki Rahmat, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'FREE',
                price: 0,
                remainingQuantity: 25,
                weightPerUnitKg: 0.15,
            },
        }),
        prisma.surplusFood.create({
            data: {
                providerId: providers[2].id,
                foodName: 'Nasi Goreng Buffet + Ayam Bakar',
                description: 'Sisa buffet makan malam. Nasi goreng spesial dan ayam bakar bumbu kecap.',
                foodCategory: 'MEALS',
                quantity: 30,
                quantityUnit: 'porsi',
                productionDate: now,
                pickupDeadline: in3hours,
                storageCondition: 'ROOM_TEMP',
                packagingType: 'UNPACKAGED',
                photos: JSON.stringify(['/images/seed/nasigoreng.jpg']),
                latitude: -7.2637,
                longitude: 112.7407,
                address: 'Jl. Tunjungan No. 65, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'FREE',
                price: 0,
                remainingQuantity: 30,
                weightPerUnitKg: 0.5,
                notes: 'Harap segera diambil, sudah dalam wadah siap angkut',
            },
        }),
        prisma.surplusFood.create({
            data: {
                providerId: providers[3].id,
                foodName: 'Susu Kotak & Yogurt',
                description: 'Susu UHT berbagai rasa dan yogurt cup. Mendekati tanggal best before tapi masih aman.',
                foodCategory: 'DAIRY',
                quantity: 40,
                quantityUnit: 'pcs',
                productionDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                expiryDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                pickupDeadline: tomorrow,
                storageCondition: 'REFRIGERATED',
                packagingType: 'PACKAGED',
                photos: JSON.stringify(['/images/seed/susu.jpg']),
                latitude: -7.2872,
                longitude: 112.7751,
                address: 'Jl. Manyar Kertoadi No. 12, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'SALE',
                price: 3000,
                remainingQuantity: 40,
                weightPerUnitKg: 0.25,
            },
        }),
        prisma.surplusFood.create({
            data: {
                providerId: providers[4].id,
                foodName: 'Tumpeng Mini & Nasi Kotak',
                description: 'Sisa pesanan catering yang batal. Tumpeng mini lengkap dengan lauk pauk.',
                foodCategory: 'MEALS',
                quantity: 20,
                quantityUnit: 'kotak',
                productionDate: now,
                pickupDeadline: in6hours,
                storageCondition: 'ROOM_TEMP',
                packagingType: 'PACKAGED',
                photos: JSON.stringify(['/images/seed/nasikotak.jpg']),
                latitude: -7.3201,
                longitude: 112.7654,
                address: 'Jl. Rungkut Mejoyo Selatan No. 8, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'BOTH',
                price: 8000,
                remainingQuantity: 20,
                weightPerUnitKg: 0.6,
                rescueReadiness: JSON.stringify({
                    infoComplete: true, notExpired: true, storageProper: true,
                    packagingIntact: true, noSpoilage: true, photoClear: true,
                    pickupRealistic: true, locationAccurate: true,
                }),
            },
        }),
        prisma.surplusFood.create({
            data: {
                providerId: providers[0].id,
                foodName: 'Buah Potong Segar',
                description: 'Semangka, melon, dan pepaya potong. Masih segar, dipotong 2 jam lalu.',
                foodCategory: 'PRODUCE',
                quantity: 10,
                quantityUnit: 'porsi',
                productionDate: now,
                pickupDeadline: in3hours,
                storageCondition: 'REFRIGERATED',
                packagingType: 'PARTIAL',
                photos: JSON.stringify(['/images/seed/buah.jpg']),
                latitude: -7.2575,
                longitude: 112.7521,
                address: 'Jl. Genteng Kali No. 45, Genteng, Surabaya',
                status: 'AVAILABLE',
                distributionType: 'FREE',
                price: 0,
                remainingQuantity: 10,
                weightPerUnitKg: 0.3,
            },
        }),
    ]);

    // ============================================
    // SAMPLE CLAIMS & IMPACT LOGS
    // ============================================

    // Create some completed claims for impact data
    for (let i = 0; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const providerIdx = Math.floor(Math.random() * providers.length);
        const consumerIdx = Math.floor(Math.random() * consumers.length);
        const foodWeight = Math.random() * 5 + 0.5;

        await prisma.impactLog.create({
            data: {
                userId: providers[providerIdx].id,
                referenceId: `HIST-${i}`,
                foodWeightKg: parseFloat(foodWeight.toFixed(2)),
                co2SavedKg: parseFloat((foodWeight * 2.5).toFixed(2)),
                peopleFed: Math.floor(Math.random() * 10) + 1,
                createdAt: pastDate,
            },
        });
    }

    // Create some partner impact logs
    for (let i = 0; i < 15; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const partnerIdx = Math.floor(Math.random() * partners.length);
        const foodWeight = Math.random() * 20 + 5;

        await prisma.impactLog.create({
            data: {
                userId: partners[partnerIdx].id,
                referenceId: `HIST-P-${i}`,
                foodWeightKg: parseFloat(foodWeight.toFixed(2)),
                co2SavedKg: parseFloat((foodWeight * 2.5).toFixed(2)),
                peopleFed: Math.floor(Math.random() * 30) + 5,
                createdAt: pastDate,
            },
        });
    }

    console.log('✅ Seeding complete!');
    console.log('');
    console.log('📋 Demo Accounts (password: password123):');
    console.log('  Admin:          admin@replate.id');
    console.log('  Provider 1:     bakso.pak.kumis@replate.id');
    console.log('  Provider 2:     rotiboy.surabaya@replate.id');
    console.log('  Provider 3:     hotel.majapahit@replate.id');
    console.log('  Provider 4:     indomaret.manyar@replate.id');
    console.log('  Provider 5:     catering.bu.ida@replate.id');
    console.log('  Consumer 1:     budi.santoso@gmail.com');
    console.log('  Consumer 2:     siti.aminah@gmail.com');
    console.log('  Consumer 3:     andi.pratama@gmail.com');
    console.log('  Partner 1:      panti.kasih.ibu@replate.id');
    console.log('  Partner 2:      foodbank.surabaya@replate.id');
    console.log('  Partner 3:      dapur.umum.gotong@replate.id');
    console.log('');
    console.log(`📊 Created: ${providers.length} providers, ${consumers.length} consumers, ${partners.length} partners`);
    console.log(`🍱 Created: ${surplusFoods.length} surplus food items`);
    console.log('📈 Created: 40 historical impact logs');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
