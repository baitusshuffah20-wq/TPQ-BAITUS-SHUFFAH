import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile App Generator | Admin Dashboard",
  description:
    "Generate aplikasi mobile terpisah untuk Wali dan Musyrif dengan kustomisasi penuh",
};

export default function MobileAppGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
