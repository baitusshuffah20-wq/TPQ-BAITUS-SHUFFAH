import React from 'react';
import { StyleSheet, Pressable, Share } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

export default function SuccessScreen() {
  const { amount, campaign, method } = useLocalSearchParams();
  
  // Format angka ke format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Generate nomor invoice
  const invoiceNumber = `DON${Date.now().toString().slice(-8)}`;
  
  // Tanggal transaksi
  const transactionDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Bagikan bukti donasi
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Alhamdulillah, saya telah berdonasi sebesar ${formatRupiah(amount)} untuk kampanye "${campaign}" di TPQ Baitus Shuffah. Mari berbagi kebaikan!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Kembali ke halaman donasi
  const handleBackToDonasi = () => {
    router.push('/donasi');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Donasi Berhasil', headerBackVisible: false }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.successCard} variant="card" withShadow="md" rounded="md">
          <Image
            source={require('@/assets/images/success-check.png')}
            style={styles.successIcon}
            contentFit="contain"
          />
          
          <ThemedText type="title" style={styles.successTitle}>
            Donasi Berhasil!
          </ThemedText>
          
          <ThemedText style={styles.successMessage}>
            Terima kasih atas donasi Anda. Semoga menjadi amal jariyah yang berkah.
          </ThemedText>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Kampanye</ThemedText>
            <ThemedText type="defaultSemiBold">{campaign}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Nominal Donasi</ThemedText>
            <ThemedText type="defaultSemiBold">{formatRupiah(amount)}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Metode Pembayaran</ThemedText>
            <ThemedText type="defaultSemiBold">{method}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Nomor Invoice</ThemedText>
            <ThemedText type="defaultSemiBold">{invoiceNumber}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Tanggal Transaksi</ThemedText>
            <ThemedText type="defaultSemiBold">{transactionDate}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.receiptItem}>
            <ThemedText>Status</ThemedText>
            <ThemedView style={styles.statusBadge} variant="success" rounded="sm">
              <ThemedText lightColor="#fff" darkColor="#fff">BERHASIL</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.actionsContainer}>
          <Pressable onPress={handleShare}>
            <ThemedView style={styles.shareButton} variant="secondary" rounded="sm">
              <ThemedText lightColor="#fff" darkColor="#fff">
                Bagikan
              </ThemedText>
            </ThemedView>
          </Pressable>
          
          <Pressable onPress={handleBackToDonasi}>
            <ThemedView style={styles.backButton} variant="accent" rounded="sm">
              <ThemedText lightColor="#fff" darkColor="#fff">
                Kembali ke Donasi
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
        
        <ThemedText style={styles.footerText}>
          Bukti pembayaran telah dikirim ke email Anda. Terima kasih telah berpartisipasi dalam program donasi TPQ Baitus Shuffah.
        </ThemedText>
        
        <Image
          source={Theme.patterns.arabesque}
          style={styles.patternImage}
          contentFit="contain"
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  successCard: {
    width: '100%',
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: Theme.spacing.md,
  },
  successTitle: {
    color: Theme.colors.success,
    marginBottom: Theme.spacing.sm,
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: Theme.spacing.md,
  },
  receiptItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  statusBadge: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  shareButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  backButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  footerText: {
    marginTop: Theme.spacing.xl,
    textAlign: 'center',
    color: Theme.colors.textLight,
  },
  patternImage: {
    width: '100%',
    height: 100,
    opacity: 0.2,
    marginTop: Theme.spacing.xl,
  },
});