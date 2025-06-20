import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Theme } from '@/constants/Theme';

// Data metode pembayaran
const paymentMethods = [
  {
    id: 'bank_transfer',
    name: 'Transfer Bank',
    options: [
      { id: 'bca', name: 'BCA', logo: require('@/assets/images/payment/bca.png') },
      { id: 'mandiri', name: 'Mandiri', logo: require('@/assets/images/payment/mandiri.png') },
      { id: 'bni', name: 'BNI', logo: require('@/assets/images/payment/bni.png') },
      { id: 'bri', name: 'BRI', logo: require('@/assets/images/payment/bri.png') },
    ]
  },
  {
    id: 'e_wallet',
    name: 'E-Wallet',
    options: [
      { id: 'gopay', name: 'GoPay', logo: require('@/assets/images/payment/gopay.png') },
      { id: 'ovo', name: 'OVO', logo: require('@/assets/images/payment/ovo.png') },
      { id: 'dana', name: 'DANA', logo: require('@/assets/images/payment/dana.png') },
      { id: 'shopeepay', name: 'ShopeePay', logo: require('@/assets/images/payment/shopeepay.png') },
    ]
  },
  {
    id: 'qris',
    name: 'QRIS',
    options: [
      { id: 'qris', name: 'QRIS', logo: require('@/assets/images/payment/qris.png') },
    ]
  }
];

export default function PaymentScreen() {
  const { data } = useLocalSearchParams();
  const [donasiData, setDonasiData] = useState(null);
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState('bank_transfer');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format angka ke format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Parse data donasi dari parameter
  useEffect(() => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setDonasiData(parsedData);
      } catch (error) {
        console.error('Error parsing donasi data:', error);
        Alert.alert('Error', 'Terjadi kesalahan saat memuat data donasi');
      }
    }
  }, [data]);

  // Pilih kategori pembayaran
  const handleSelectPaymentCategory = (categoryId) => {
    setSelectedPaymentCategory(categoryId);
    setSelectedPaymentMethod(null);
  };

  // Pilih metode pembayaran
  const handleSelectPaymentMethod = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  // Proses pembayaran
  const handleProcessPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Silakan pilih metode pembayaran');
      return;
    }

    setIsProcessing(true);

    // Simulasi proses pembayaran
    setTimeout(() => {
      setIsProcessing(false);
      
      // Navigasi ke halaman sukses
      router.push({
        pathname: '/donasi/success',
        params: { 
          amount: donasiData.nominal,
          campaign: donasiData.campaignTitle,
          method: selectedPaymentMethod
        }
      });
    }, 2000);
  };

  if (!donasiData) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pembayaran Donasi' }} />
      <ScrollView style={styles.container}>
        <ThemedView style={styles.summaryCard} variant="card" withShadow="md" rounded="md">
          <ThemedText type="subtitle">Ringkasan Donasi</ThemedText>
          
          <ThemedView style={styles.summaryItem}>
            <ThemedText>Kampanye</ThemedText>
            <ThemedText type="defaultSemiBold">{donasiData.campaignTitle}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryItem}>
            <ThemedText>Nominal Donasi</ThemedText>
            <ThemedText type="defaultSemiBold">{formatRupiah(donasiData.nominal)}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryItem}>
            <ThemedText>Nama Donatur</ThemedText>
            <ThemedText type="defaultSemiBold">{donasiData.name}</ThemedText>
          </ThemedView>
          
          {donasiData.message && (
            <ThemedView style={styles.summaryItem}>
              <ThemedText>Pesan</ThemedText>
              <ThemedText>{donasiData.message}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.paymentSection}>
          <ThemedText type="subtitle">Pilih Metode Pembayaran</ThemedText>
          
          <ThemedView style={styles.paymentCategories}>
            {paymentMethods.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleSelectPaymentCategory(category.id)}
              >
                <ThemedView 
                  style={[
                    styles.paymentCategoryTab,
                    selectedPaymentCategory === category.id && styles.selectedPaymentCategory
                  ]}
                >
                  <ThemedText 
                    type={selectedPaymentCategory === category.id ? "defaultSemiBold" : "default"}
                    style={selectedPaymentCategory === category.id ? styles.selectedCategoryText : null}
                  >
                    {category.name}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
          
          <ThemedView style={styles.paymentOptions}>
            {paymentMethods
              .find(category => category.id === selectedPaymentCategory)
              ?.options.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => handleSelectPaymentMethod(method.id)}
                >
                  <ThemedView 
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                    ]}
                    variant="card"
                    withShadow="sm"
                    rounded="sm"
                  >
                    <Image
                      source={method.logo}
                      style={styles.paymentLogo}
                      contentFit="contain"
                    />
                    <ThemedText>{method.name}</ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.totalSection} variant="card" withShadow="md" rounded="md">
          <ThemedView style={styles.totalRow}>
            <ThemedText>Total Pembayaran</ThemedText>
            <ThemedText type="title" style={styles.totalAmount}>
              {formatRupiah(donasiData.nominal)}
            </ThemedText>
          </ThemedView>
          
          <Pressable onPress={handleProcessPayment} disabled={isProcessing}>
            <ThemedView 
              style={[styles.payButton, isProcessing && styles.disabledButton]} 
              variant="accent" 
              rounded="sm"
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
                  Bayar Sekarang
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.securityInfo}>
          <ThemedText style={styles.securityText}>
            Pembayaran Anda aman dan terenkripsi. Dengan melanjutkan pembayaran, 
            Anda menyetujui Syarat & Ketentuan kami.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentSection: {
    marginBottom: Theme.spacing.lg,
  },
  paymentCategories: {
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentCategoryTab: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
  },
  selectedPaymentCategory: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.accent,
  },
  selectedCategoryText: {
    color: Theme.colors.accent,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.md,
  },
  paymentMethodCard: {
    width: 150,
    height: 100,
    margin: Theme.spacing.xs,
    padding: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: Theme.colors.accent,
  },
  paymentLogo: {
    width: 80,
    height: 40,
    marginBottom: Theme.spacing.sm,
  },
  totalSection: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  totalAmount: {
    color: Theme.colors.accent,
  },
  payButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  securityInfo: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  securityText: {
    textAlign: 'center',
    color: Theme.colors.textLight,
    fontSize: 12,
  },
});