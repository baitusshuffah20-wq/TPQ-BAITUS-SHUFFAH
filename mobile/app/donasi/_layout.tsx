import { Stack } from 'expo-router';
import React from 'react';

export default function DonasiLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="detail"
        options={{
          title: 'Detail Donasi',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Pembayaran',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: 'Donasi Berhasil',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}