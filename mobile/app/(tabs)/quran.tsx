import { StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

export default function QuranScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header} variant="primary" rounded="md">
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          Al-Qur'an
        </ThemedText>
        <ThemedText lightColor="#fff" darkColor="#fff">
          Bacaan dan Hafalan
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Surah Terakhir Dibaca</ThemedText>
        <ThemedView style={styles.surahCard} variant="quran" rounded="sm">
          <ThemedText type="quranVerse" lightColor="#fff" darkColor="#fff">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </ThemedText>
          <ThemedText style={styles.translation}>
            "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Hafalan Terbaru</ThemedText>
        <ThemedView style={styles.hafalanCard} variant="hafalan" rounded="sm">
          <ThemedText type="hafalan" lightColor="#fff" darkColor="#fff">
            قُلْ هُوَ اللَّهُ أَحَدٌ
          </ThemedText>
          <ThemedText style={styles.translation}>
            "Katakanlah (Muhammad), 'Dialah Allah, Yang Maha Esa.'"
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Jadwal Mengaji</ThemedText>
        <ThemedView style={styles.scheduleCard} rounded="sm">
          <ThemedView style={styles.scheduleItem}>
            <ThemedText type="defaultSemiBold">Senin</ThemedText>
            <ThemedText>16:00 - 17:30</ThemedText>
          </ThemedView>
          <ThemedView style={styles.scheduleItem}>
            <ThemedText type="defaultSemiBold">Selasa</ThemedText>
            <ThemedText>16:00 - 17:30</ThemedText>
          </ThemedView>
          <ThemedView style={styles.scheduleItem}>
            <ThemedText type="defaultSemiBold">Rabu</ThemedText>
            <ThemedText>16:00 - 17:30</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section} variant="card" withShadow="md" rounded="md">
        <ThemedText type="subtitle">Doa Harian</ThemedText>
        <ThemedView style={styles.prayerCard} variant="prayer" rounded="sm">
          <ThemedText type="prayer" lightColor="#fff" darkColor="#fff">
            رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
          </ThemedText>
          <ThemedText style={styles.translation}>
            "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka."
          </ThemedText>
        </ThemedView>
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
  surahCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  hafalanCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  prayerCard: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  translation: {
    marginTop: Theme.spacing.sm,
    fontStyle: 'italic',
  },
  scheduleCard: {
    marginTop: Theme.spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
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