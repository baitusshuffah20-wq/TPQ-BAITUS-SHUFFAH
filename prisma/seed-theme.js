const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Starting theme seeding...');

  // Get the admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ Admin user not found. Please run the main seed first.');
    return;
  }

  // Create default theme
  const defaultTheme = await prisma.theme.create({
    data: {
      name: 'Default Theme',
      colors: JSON.stringify({
        primary: '#008080',
        secondary: '#fbbf24',
        accent: '#22c55e',
        background: '#ffffff',
        text: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }),
      buttons: JSON.stringify({
        primary: '#008080',
        secondary: '#6B7280',
        accent: '#22c55e',
        danger: '#ef4444',
        info: '#3B82F6',
      }),
      fonts: JSON.stringify({
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
        arabic: 'Amiri, serif',
      }),
      layout: JSON.stringify({
        borderRadius: '0.5rem',
        containerWidth: '1280px',
        sidebarStyle: 'default',
      }),
      logo: JSON.stringify({
        main: '/logo.png',
        alt: '/logo-alt.png',
        favicon: '/favicon.ico',
      }),
      isActive: true,
      userId: admin.id,
    },
  });

  console.log('✅ Default theme created:', defaultTheme.name);

  // Create alternative theme
  const alternativeTheme = await prisma.theme.create({
    data: {
      name: 'Dark Theme',
      colors: JSON.stringify({
        primary: '#3b82f6',
        secondary: '#f59e0b',
        accent: '#10b981',
        background: '#1f2937',
        text: '#f3f4f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }),
      buttons: JSON.stringify({
        primary: '#3b82f6',
        secondary: '#6B7280',
        accent: '#10b981',
        danger: '#ef4444',
        info: '#8b5cf6',
      }),
      fonts: JSON.stringify({
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
        arabic: 'Amiri, serif',
      }),
      layout: JSON.stringify({
        borderRadius: '0.5rem',
        containerWidth: '1280px',
        sidebarStyle: 'compact',
      }),
      logo: JSON.stringify({
        main: '/logo.png',
        alt: '/logo-alt.png',
        favicon: '/favicon.ico',
      }),
      isActive: false,
      userId: admin.id,
    },
  });

  console.log('✅ Alternative theme created:', alternativeTheme.name);

  console.log('🎉 Theme seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding themes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });