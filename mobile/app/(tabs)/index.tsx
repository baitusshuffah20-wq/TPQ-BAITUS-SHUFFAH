import { Image } from 'expo-image';
import { Platform, StyleSheet, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header} variant="primary" rounded="md">
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          TPQ Baitus Shuffah
        </ThemedText>
        <ThemedText lightColor="#fff" darkColor="#fff">
          Selamat Datang di Aplikasi Mobile
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Pengumuman Terbaru</ThemedText>
        <ThemedView style={styles.announcementCard} rounded="sm">
          <ThemedText type="defaultSemiBold">Jadwal Ujian Hafalan</ThemedText>
          <ThemedText>
            Ujian hafalan akan dilaksanakan pada tanggal 15 Juli 2025. Harap mempersiapkan hafalan surah Al-Mulk sampai Al-Mursalat.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Kegiatan Mendatang</ThemedText>
        <ThemedView style={styles.eventCard} variant="accent" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Peringatan Maulid Nabi Muhammad SAW
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Tanggal: 12 Oktober 2025
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Tempat: Masjid Baitus Shuffah
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Prestasi Santri</ThemedText>
        <ThemedView style={styles.achievementCard} variant="secondary" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Juara 1 Lomba Tahfidz Tingkat Kota
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Selamat kepada Santri Ahmad Fauzi yang telah meraih juara 1 dalam lomba Tahfidz Qur'an tingkat kota.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Fitur Aplikasi</ThemedText>
        <ThemedView style={styles.featureList}>
          <ThemedView style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">Al-Qur'an Digital</ThemedText>
            <ThemedText>Baca dan dengarkan Al-Qur'an kapan saja</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">Tracking Hafalan</ThemedText>
            <ThemedText>Pantau perkembangan hafalan Qur'an</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">Jadwal Kegiatan</ThemedText>
            <ThemedText>Informasi jadwal mengaji dan kegiatan</ThemedText>
          </ThemedView>
        </ThemedView>
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
    marginBottom: Theme.spacing.lg,
  },
  announcementCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.warning,
  },
  eventCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  achievementCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  featureList: {
    marginTop: Theme.spacing.sm,
  },
  featureItem: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  patternImage: {
    width: '100%',
    height: 100,
    opacity: 0.2,
    marginVertical: Theme.spacing.lg,
  },
});