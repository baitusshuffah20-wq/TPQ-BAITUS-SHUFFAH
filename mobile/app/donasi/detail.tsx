import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

// Data kampanye donasi (sama dengan di halaman donasi.tsx)
const donasiCampaigns = [
  {
    id: 1,
    title: 'Pembangunan Gedung Baru',
    description: 'Bantu kami membangun gedung baru untuk menampung lebih banyak santri. Gedung baru ini akan memiliki 10 ruang kelas, perpustakaan, dan aula serbaguna yang dapat digunakan untuk berbagai kegiatan TPQ.',
    target: 500000000,
    collected: 325000000,
    image: require('@/assets/images/campaign-building.jpg'),
    deadline: '31 Desember 2025',
    updates: [
      {
        date: '15 Juni 2025',
        content: 'Alhamdulillah, pembangunan fondasi gedung telah dimulai.'
      },
      {
        date: '1 Mei 2025',
        content: 'Desain gedung telah difinalisasi dan disetujui oleh dewan pengurus.'
      }
    ]
  },
  {
    id: 2,
    title: 'Beasiswa Santri Yatim',
    description: 'Bantu santri yatim untuk mendapatkan pendidikan Al-Quran yang berkualitas. Dana yang terkumpul akan digunakan untuk biaya pendidikan, perlengkapan belajar, dan kebutuhan sehari-hari santri yatim.',
    target: 100000000,
    collected: 78500000,
    image: require('@/assets/images/campaign-scholarship.jpg'),
    deadline: '30 September 2025',
    updates: [
      {
        date: '10 Juni 2025',
        content: '15 santri yatim telah menerima beasiswa untuk semester ini.'
      }
    ]
  },
  {
    id: 3,
    title: 'Wakaf Al-Quran',
    description: 'Sediakan Al-Quran untuk santri dan masyarakat sekitar. Setiap Al-Quran yang diwakafkan akan diberikan kepada santri yang membutuhkan dan masjid-masjid di sekitar TPQ.',
    target: 50000000,
    collected: 32750000,
    image: require('@/assets/images/campaign-quran.jpg'),
    deadline: '15 Oktober 2025',
    updates: [
      {
        date: '5 Juni 2025',
        content: '200 Al-Quran telah dibagikan kepada santri dan 5 masjid di sekitar TPQ.'
      }
    ]
  },
  {
    id: 4,
    title: 'Santunan Guru Tahfidz',
    description: 'Berikan apresiasi kepada guru-guru tahfidz yang telah mendedikasikan hidupnya. Dana yang terkumpul akan digunakan untuk memberikan tunjangan tambahan kepada para guru tahfidz.',
    target: 75000000,
    collected: 45250000,
    image: require('@/assets/images/campaign-teacher.jpg'),
    deadline: '20 November 2025',
    updates: [
      {
        date: '1 Juni 2025',
        content: '10 guru tahfidz telah menerima santunan untuk bulan ini.'
      }
    ]
  },
];

// Nominal donasi yang tersedia
const nominalOptions = [
  { value: 50000, label: 'Rp 50.000' },
  { value: 100000, label: 'Rp 100.000' },
  { value: 250000, label: 'Rp 250.000' },
  { value: 500000, label: 'Rp 500.000' },
  { value: 1000000, label: 'Rp 1.000.000' },
];

export default function DonasiDetailScreen() {
  const { campaignId } = useLocalSearchParams();
  const [campaign, setCampaign] = useState(null);
  const [selectedNominal, setSelectedNominal] = useState(null);
  const [customNominal, setCustomNominal] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Format angka ke format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hitung persentase progress
  const calculateProgress = (collected, target) => {
    return (collected / target) * 100;
  };

  // Ambil data kampanye berdasarkan ID
  useEffect(() => {
    if (campaignId) {
      const foundCampaign = donasiCampaigns.find(c => c.id === parseInt(campaignId));
      if (foundCampaign) {
        setCampaign(foundCampaign);
      }
    }
  }, [campaignId]);

  // Pilih nominal donasi
  const handleSelectNominal = (value) => {
    setSelectedNominal(value);
    setCustomNominal('');
  };

  // Handle custom nominal
  const handleCustomNominalChange = (text) => {
    // Hanya izinkan angka
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomNominal(numericValue);
    setSelectedNominal(null);
  };

  // Lanjut ke halaman pembayaran
  const handleProceedToPayment = () => {
    // Validasi form
    if (!selectedNominal && !customNominal) {
      Alert.alert('Error', 'Silakan pilih atau masukkan nominal donasi');
      return;
    }

    if (!isAnonymous && !name) {
      Alert.alert('Error', 'Silakan masukkan nama Anda');
      return;
    }

    if (!isAnonymous && !email) {
      Alert.alert('Error', 'Silakan masukkan email Anda');
      return;
    }

    // Siapkan data donasi
    const donasiData = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      nominal: selectedNominal || parseInt(customNominal),
      name: isAnonymous ? 'Hamba Allah' : name,
      email: isAnonymous ? 'anonymous@example.com' : email,
      message: message,
      isAnonymous: isAnonymous,
    };

    // Navigasi ke halaman pembayaran
    router.push({
      pathname: '/donasi/payment',
      params: { 
        data: JSON.stringify(donasiData)
      }
    });
  };

  if (!campaign) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: campaign.title }} />
      <ScrollView style={styles.container}>
        <Image
          source={campaign.image}
          style={styles.campaignImage}
          contentFit="cover"
        />

        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title">{campaign.title}</ThemedText>
          
          <ThemedView style={styles.progressContainer}>
            <ThemedView style={styles.progressBar}>
              <ThemedView 
                style={[
                  styles.progressFill, 
                  { width: `${calculateProgress(campaign.collected, campaign.target)}%` }
                ]} 
              />
            </ThemedView>
            <ThemedView style={styles.progressInfo}>
              <ThemedText type="defaultSemiBold">
                {formatRupiah(campaign.collected)}
              </ThemedText>
              <ThemedText>
                dari {formatRupiah(campaign.target)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.deadlineText}>
            Berakhir: {campaign.deadline}
          </ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Deskripsi</ThemedText>
            <ThemedText>{campaign.description}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Update Terbaru</ThemedText>
            {campaign.updates.map((update, index) => (
              <ThemedView key={index} style={styles.updateItem}>
                <ThemedText type="defaultSemiBold">{update.date}</ThemedText>
                <ThemedText>{update.content}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="subtitle">Form Donasi</ThemedText>
            
            <ThemedView style={styles.nominalContainer}>
              <ThemedText>Pilih Nominal Donasi</ThemedText>
              <ThemedView style={styles.nominalOptions}>
                {nominalOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelectNominal(option.value)}
                  >
                    <ThemedView 
                      style={[
                        styles.nominalOption,
                        selectedNominal === option.value && styles.selectedNominal
                      ]}
                      variant={selectedNominal === option.value ? "accent" : "card"}
                      rounded="sm"
                    >
                      <ThemedText 
                        lightColor={selectedNominal === option.value ? "#fff" : undefined}
                        darkColor={selectedNominal === option.value ? "#fff" : undefined}
                      >
                        {option.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.customNominalContainer}>
              <ThemedText>Atau Masukkan Nominal Lainnya</ThemedText>
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.inputPrefix}>Rp</ThemedText>
                <TextInput
                  style={styles.customNominalInput}
                  placeholder="Contoh: 200000"
                  keyboardType="numeric"
                  value={customNominal}
                  onChangeText={handleCustomNominalChange}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.formGroup}>
              <Pressable onPress={() => setIsAnonymous(!isAnonymous)}>
                <ThemedView style={styles.checkboxContainer}>
                  <ThemedView 
                    style={[
                      styles.checkbox,
                      isAnonymous && styles.checkboxChecked
                    ]}
                  />
                  <ThemedText>Donasi sebagai Hamba Allah (anonim)</ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>

            {!isAnonymous && (
              <>
                <ThemedView style={styles.formGroup}>
                  <ThemedText>Nama</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Masukkan nama Anda"
                    value={name}
                    onChangeText={setName}
                  />
                </ThemedView>

                <ThemedView style={styles.formGroup}>
                  <ThemedText>Email</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Masukkan email Anda"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </ThemedView>
              </>
            )}

            <ThemedView style={styles.formGroup}>
              <ThemedText>Pesan (opsional)</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Masukkan pesan atau doa Anda"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </ThemedView>

            <Pressable onPress={handleProceedToPayment}>
              <ThemedView style={styles.submitButton} variant="accent" rounded="sm">
                <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
                  Lanjutkan ke Pembayaran
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: Theme.spacing.md,
  },
  progressContainer: {
    marginTop: Theme.spacing.md,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  deadlineText: {
    marginTop: Theme.spacing.xs,
    color: Theme.colors.textLight,
  },
  section: {
    marginTop: Theme.spacing.lg,
  },
  updateItem: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.sm,
  },
  formSection: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  nominalContainer: {
    marginTop: Theme.spacing.md,
  },
  nominalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.xs,
  },
  nominalOption: {
    margin: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedNominal: {
    backgroundColor: Theme.colors.accent,
  },
  customNominalContainer: {
    marginTop: Theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: Theme.borderRadius.sm,
  },
  inputPrefix: {
    paddingHorizontal: Theme.spacing.sm,
    color: Theme.colors.textLight,
  },
  customNominalInput: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  formGroup: {
    marginTop: Theme.spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
    borderRadius: 4,
    marginRight: Theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.accent,
  },
  textInput: {
    marginTop: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
});