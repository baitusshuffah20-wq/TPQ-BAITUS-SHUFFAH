import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

// Data kampanye donasi
const donasiCampaigns = [
  {
    id: 1,
    title: 'Pembangunan Gedung Baru',
    description: 'Bantu kami membangun gedung baru untuk menampung lebih banyak santri',
    target: 500000000,
    collected: 325000000,
    image: require('@/assets/images/campaign-building.jpg'),
    deadline: '31 Desember 2025',
  },
  {
    id: 2,
    title: 'Beasiswa Santri Yatim',
    description: 'Bantu santri yatim untuk mendapatkan pendidikan Al-Quran yang berkualitas',
    target: 100000000,
    collected: 78500000,
    image: require('@/assets/images/campaign-scholarship.jpg'),
    deadline: '30 September 2025',
  },
  {
    id: 3,
    title: 'Wakaf Al-Quran',
    description: 'Sediakan Al-Quran untuk santri dan masyarakat sekitar',
    target: 50000000,
    collected: 32750000,
    image: require('@/assets/images/campaign-quran.jpg'),
    deadline: '15 Oktober 2025',
  },
  {
    id: 4,
    title: 'Santunan Guru Tahfidz',
    description: 'Berikan apresiasi kepada guru-guru tahfidz yang telah mendedikasikan hidupnya',
    target: 75000000,
    collected: 45250000,
    image: require('@/assets/images/campaign-teacher.jpg'),
    deadline: '20 November 2025',
  },
];

export default function DonasiScreen() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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

  // Navigasi ke halaman detail donasi
  const navigateToDonasiDetail = (campaign) => {
    router.push({
      pathname: '/donasi/detail',
      params: { campaignId: campaign.id }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header} variant="accent" rounded="md">
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          Donasi
        </ThemedText>
        <ThemedText lightColor="#fff" darkColor="#fff">
          Bantu TPQ Baitus Shuffah Berkembang
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Kampanye Donasi Aktif</ThemedText>
        <ThemedText>Pilih kampanye donasi yang ingin Anda dukung</ThemedText>
      </ThemedView>

      {donasiCampaigns.map((campaign) => (
        <Pressable 
          key={campaign.id} 
          onPress={() => navigateToDonasiDetail(campaign)}
        >
          <ThemedView style={styles.campaignCard} variant="card" withShadow="md" rounded="md">
            <Image
              source={campaign.image}
              style={styles.campaignImage}
              contentFit="cover"
            />
            <ThemedView style={styles.campaignContent}>
              <ThemedText type="defaultSemiBold">{campaign.title}</ThemedText>
              <ThemedText>{campaign.description}</ThemedText>
              
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
              
              <ThemedView style={styles.campaignFooter}>
                <ThemedText style={styles.deadlineText}>
                  Berakhir: {campaign.deadline}
                </ThemedText>
                <ThemedView style={styles.donasiButton} variant="accent" rounded="sm">
                  <ThemedText lightColor="#fff" darkColor="#fff">
                    Donasi Sekarang
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Pressable>
      ))}

      <ThemedView style={styles.infoSection} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Informasi Donasi</ThemedText>
        <ThemedText>
          Semua donasi yang terkumpul akan digunakan sesuai dengan tujuan kampanye. 
          Laporan penggunaan dana akan dipublikasikan secara berkala di website resmi TPQ Baitus Shuffah.
        </ThemedText>
        <ThemedText style={styles.contactInfo}>
          Untuk informasi lebih lanjut, silakan hubungi kami di:
        </ThemedText>
        <ThemedText>Email: donasi@tpqbaitusshuffah.com</ThemedText>
        <ThemedText>Telp: 0812-3456-7890</ThemedText>
      </ThemedView>

      <Image
        source={Theme.patterns.geometric}
        style={styles.patternImage}
        contentFit="contain"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  header: {
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.md,
  },
  campaignCard: {
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
  },
  campaignImage: {
    width: '100%',
    height: 180,
  },
  campaignContent: {
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
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  deadlineText: {
    color: Theme.colors.textLight,
  },
  donasiButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
  },
  infoSection: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  contactInfo: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  patternImage: {
    width: '100%',
    height: 100,
    opacity: 0.2,
    marginVertical: Theme.spacing.lg,
  },
});