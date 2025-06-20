import { Image } from 'expo-image';
import { StyleSheet, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header} variant="secondary" rounded="md">
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          Jelajahi TPQ
        </ThemedText>
        <ThemedText lightColor="#fff" darkColor="#fff">
          Informasi dan Pembelajaran
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Tentang TPQ Baitus Shuffah</ThemedText>
        <ThemedView style={styles.aboutCard} rounded="sm">
          <ThemedText>
            TPQ Baitus Shuffah adalah lembaga pendidikan Al-Qur'an yang didirikan pada tahun 2010. 
            Kami berfokus pada pendidikan Al-Qur'an dan nilai-nilai Islam untuk anak-anak dan remaja.
          </ThemedText>
          <ThemedText style={styles.missionText} type="defaultSemiBold">
            Visi: Menjadi pusat pendidikan Al-Qur'an yang unggul dan berakhlak mulia.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <Collapsible title="Program Pembelajaran">
        <ThemedView style={styles.programCard} variant="quran" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Tahsin Al-Qur'an
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Program perbaikan bacaan Al-Qur'an dengan kaidah tajwid yang benar.
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.programCard} variant="prayer" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Tahfidz Al-Qur'an
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Program menghafal Al-Qur'an dengan metode yang menyenangkan.
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.programCard} variant="hafalan" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Pembelajaran Akhlak
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Pembentukan karakter islami dan akhlak mulia.
          </ThemedText>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Fasilitas">
        <ThemedView style={styles.facilitiesContainer}>
          <ThemedView style={styles.facilityItem}>
            <ThemedText type="defaultSemiBold">Ruang Kelas Nyaman</ThemedText>
            <ThemedText>Dilengkapi dengan AC dan fasilitas belajar modern</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.facilityItem}>
            <ThemedText type="defaultSemiBold">Perpustakaan</ThemedText>
            <ThemedText>Koleksi buku-buku islami dan referensi pembelajaran</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.facilityItem}>
            <ThemedText type="defaultSemiBold">Area Bermain</ThemedText>
            <ThemedText>Tempat rekreasi dan bermain yang aman untuk anak-anak</ThemedText>
          </ThemedView>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Tenaga Pengajar">
        <ThemedText>
          TPQ Baitus Shuffah memiliki tenaga pengajar yang berkualitas dan berpengalaman dalam bidang pendidikan Al-Qur'an. 
          Semua pengajar memiliki sanad keilmuan yang jelas dan telah lulus sertifikasi.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Pendaftaran">
        <ThemedView style={styles.registrationCard} variant="accent" rounded="sm">
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Pendaftaran Santri Baru
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff">
            Pendaftaran dibuka sepanjang tahun. Silakan kunjungi kantor kami atau hubungi nomor berikut:
          </ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
            Telp: 0812-3456-7890
          </ThemedText>
        </ThemedView>
      </Collapsible>

      <ThemedView style={styles.contactSection}>
        <ThemedText type="subtitle">Hubungi Kami</ThemedText>
        <ThemedText>Alamat: Jl. Islamic Center No. 123, Kota Islami</ThemedText>
        <ThemedText>Email: info@tpqbaitusshuffah.com</ThemedText>
        <ThemedText>Website: www.tpqbaitusshuffah.com</ThemedText>
      </ThemedView>

      <Image
        source={Theme.patterns.arabesque}
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
  aboutCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  missionText: {
    marginTop: Theme.spacing.md,
  },
  programCard: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  facilitiesContainer: {
    marginTop: Theme.spacing.sm,
  },
  facilityItem: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  registrationCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  contactSection: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  patternImage: {
    width: '100%',
    height: 100,
    opacity: 0.2,
    marginVertical: Theme.spacing.lg,
  },
});