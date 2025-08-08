import { NextRequest, NextResponse } from "next/server";

interface AppConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  buildNumber: number;
  icon: string | null;
  splashScreen: string | null;
  primaryColor: string;
  secondaryColor: string;
  features: { [key: string]: boolean };
  template: string;
}

const FEATURE_DESCRIPTIONS = {
  wali: {
    dashboard: "Dashboard dengan ringkasan informasi santri",
    progress: "Melihat perkembangan belajar santri",
    payment: "Sistem pembayaran SPP online",
    messages: "Komunikasi dengan musyrif dan admin",
    profile: "Manajemen profil dan data wali",
    attendance: "Melihat kehadiran santri",
    schedule: "Melihat jadwal pelajaran santri",
    achievements: "Melihat pencapaian dan prestasi",
    donations: "Sistem donasi untuk TPQ",
    events: "Informasi event dan kegiatan TPQ",
  },
  musyrif: {
    dashboard: "Dashboard khusus untuk musyrif",
    students: "Kelola data dan progress santri",
    attendance: "Input kehadiran santri",
    grades: "Input nilai dan penilaian santri",
    schedule: "Melihat dan kelola jadwal mengajar",
    reports: "Generate laporan progress santri",
    messages: "Komunikasi dengan wali dan admin",
    profile: "Manajemen profil musyrif",
    materials: "Kelola materi dan kurikulum",
    assessments: "Sistem penilaian komprehensif",
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appType = searchParams.get("appType") as "wali" | "musyrif";
    const configParam = searchParams.get("config");
    const isInline = searchParams.get("inline") === "true";

    if (!appType || !configParam) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const config: AppConfig = JSON.parse(decodeURIComponent(configParam));
    const enabledFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);

    const html = generatePreviewHTML(
      appType,
      config,
      enabledFeatures,
      isInline,
    );

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Preview error:", error);
    return new NextResponse("Failed to generate preview", { status: 500 });
  }
}

function generatePreviewHTML(
  appType: "wali" | "musyrif",
  config: AppConfig,
  enabledFeatures: string[],
  isInline: boolean = false,
): string {
  const featureDescriptions = FEATURE_DESCRIPTIONS[appType];

  // Generate different templates based on app type
  if (appType === "musyrif") {
    return generateMusyrifPreviewHTML(config, enabledFeatures, isInline);
  }

  return generateWaliPreviewHTML(appType, config, enabledFeatures, isInline, featureDescriptions);
}

function generateWaliPreviewHTML(
  appType: string,
  config: AppConfig,
  enabledFeatures: string[],
  isInline: boolean = false,
  featureDescriptions: Record<string, string> = {},
): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${config.displayName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
        }

        .phone-container {
            max-width: 375px;
            margin: 0 auto;
            background: linear-gradient(145deg, #2c3e50, #34495e);
            border-radius: 35px;
            padding: 12px;
            box-shadow:
                0 25px 50px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255,255,255,0.1),
                inset 0 1px 0 rgba(255,255,255,0.2);
            position: relative;
        }

        .phone-screen {
            background: #f8fafc;
            border-radius: 28px;
            overflow: hidden;
            height: 667px;
            position: relative;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }

        .status-bar {
            height: 44px;
            background: linear-gradient(90deg, #1a202c, #2d3748);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 24px;
            color: white;
            font-size: 14px;
            font-weight: 600;
        }

        .app-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            padding: 20px 16px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-20px, -20px) rotate(180deg); }
        }

        .header-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .app-logo {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            ${config.icon ? `background-image: url(${config.icon}); background-size: cover; background-position: center;` : ""}
        }

        .app-info h1 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 2px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .app-info p {
            font-size: 12px;
            opacity: 0.9;
            font-weight: 500;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .notification-btn, .profile-btn {
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .notification-btn:hover, .profile-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.05);
        }

        .main-content {
            flex: 1;
            overflow-y: auto;
            background: #f8fafc;
            position: relative;
            scroll-behavior: smooth;
            padding-bottom: 20px;
        }

        /* Banner Slider Styles */
        .banner-slider {
            position: relative;
            height: 120px;
            margin: 20px 16px 16px 16px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
                0 8px 24px rgba(0,0,0,0.08),
                0 0 0 1px rgba(0,0,0,0.05);
        }

        .banner-slide {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            display: flex;
            align-items: center;
            padding: 24px;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        .banner-slide.active {
            opacity: 1;
        }

        .banner-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }

        .banner-text {
            flex: 1;
            color: white;
        }

        .banner-text h3 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
            line-height: 1.3;
            letter-spacing: -0.2px;
        }

        .banner-text p {
            font-size: 12px;
            opacity: 0.85;
            line-height: 1.4;
        }

        .banner-image {
            font-size: 36px;
            margin-left: 16px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .banner-indicators {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
        }

        .indicator {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .indicator.active {
            background: white;
            transform: scale(1.2);
        }

        /* Section Titles */
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin: 24px 16px 16px 16px;
            letter-spacing: -0.3px;
        }

        /* Menu Grid Styles */
        .menu-section {
            margin-bottom: 32px;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 0 16px;
        }

        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 12px;
            background: white;
            border-radius: 16px;
            box-shadow:
                0 4px 12px rgba(0,0,0,0.05),
                0 0 0 1px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .menu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, ${config.primaryColor || "#eca825"}, ${config.secondaryColor || "#ffd700"});
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .menu-item:hover {
            transform: translateY(-4px);
            box-shadow:
                0 8px 24px rgba(0,0,0,0.1),
                0 0 0 1px rgba(0,0,0,0.05);
        }

        .menu-item:hover::before {
            transform: scaleX(1);
        }

        .menu-icon {
            font-size: 24px;
            margin-bottom: 12px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            border-radius: 14px;
            color: white;
            box-shadow: 0 4px 12px rgba(236, 168, 37, 0.2);
        }

        .menu-label {
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            text-align: center;
            line-height: 1.3;
        }

        /* Donation Section Styles */
        .donation-section {
            margin-bottom: 32px;
        }

        .donation-card {
            margin: 0 16px;
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 20px;
            padding: 24px;
            box-shadow:
                0 8px 24px rgba(0,0,0,0.06),
                0 0 0 1px rgba(0,0,0,0.02);
            position: relative;
            overflow: hidden;
        }

        .donation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #059669);
        }

        .donation-image {
            font-size: 56px;
            text-align: center;
            margin-bottom: 20px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .donation-content h5 {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
            text-align: center;
            letter-spacing: -0.3px;
        }

        .donation-content p {
            font-size: 13px;
            color: #64748b;
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .donation-progress {
            margin-bottom: 20px;
        }

        .progress-bar {
            height: 10px;
            background: #f1f5f9;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 12px;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            border-radius: 6px;
            transition: width 0.5s ease;
            position: relative;
        }

        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
        }

        .donate-btn {
            width: 100%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .donate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        /* News Section Styles */
        .news-section {
            margin-bottom: 32px;
        }

        .news-list {
            padding: 0 16px;
        }

        .news-item {
            display: flex;
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow:
                0 4px 12px rgba(0,0,0,0.05),
                0 0 0 1px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .news-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(180deg, ${config.primaryColor || "#eca825"}, ${config.secondaryColor || "#ffd700"});
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }

        .news-item:hover {
            transform: translateY(-2px);
            box-shadow:
                0 8px 20px rgba(0,0,0,0.08),
                0 0 0 1px rgba(0,0,0,0.05);
        }

        .news-item:hover::before {
            transform: scaleY(1);
        }

        .news-item:last-child {
            margin-bottom: 0;
        }

        .news-image {
            font-size: 28px;
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 14px;
            margin-right: 16px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .news-content {
            flex: 1;
        }

        .news-content h6 {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 6px;
            line-height: 1.3;
            letter-spacing: -0.2px;
        }

        .news-content p {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .news-date {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
        }



        .bottom-nav {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(180deg, #ffffff, #f8fafc);
            border-top: 1px solid rgba(226, 232, 240, 0.5);
            display: flex;
            align-items: center;
            justify-content: space-around;
            backdrop-filter: blur(20px);
            box-shadow: 0 -4px 16px rgba(0,0,0,0.05);
            z-index: 10;
            margin: 0;
            padding: 0 8px;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #9ca3af;
            font-size: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
            padding: 8px 12px;
            border-radius: 12px;
            cursor: pointer;
            gap: 4px;
            flex: 1;
            min-width: 0;
        }

        .nav-item.active {
            color: ${config.primaryColor || "#eca825"};
            background: rgba(236, 168, 37, 0.08);
        }

        .nav-item:hover:not(.active) {
            color: #6b7280;
            background: rgba(0,0,0,0.02);
        }

        .nav-icon {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"}, ${config.secondaryColor || "#ffd700"});
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(236, 168, 37, 0.2);
            transition: all 0.3s ease;
        }

        .nav-item.active .nav-icon {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(236, 168, 37, 0.3);
        }

        /* Responsive adjustments */
        @media (max-width: 320px) {
            .menu-grid {
                gap: 16px;
            }

            .menu-item {
                padding: 16px 8px;
            }

            .menu-icon {
                width: 44px;
                height: 44px;
                font-size: 22px;
            }

            .menu-label {
                font-size: 10px;
            }

            .donation-card {
                padding: 20px;
            }

            .news-item {
                padding: 16px;
            }
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            color: white;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
            padding: 20px;
            max-height: calc(80vh - 80px);
            overflow-y: auto;
        }

        .all-menus-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .menu-item-full {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
        }

        .menu-item-full:hover {
            background: #e2e8f0;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .menu-icon-full {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 16px;
            flex-shrink: 0;
        }

        .menu-content-full {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .menu-label-full {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
        }

        .menu-desc-full {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.3;
        }

        /* Smooth scrolling */
        .features-container {
            scroll-behavior: smooth;
        }

        /* Loading animation for images */
        .menu-icon, .news-image, .donation-image {
            animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Hover effects for touch devices */
        @media (hover: none) {
            .menu-item:hover {
                transform: none;
                box-shadow:
                    0 4px 12px rgba(0,0,0,0.05),
                    0 0 0 1px rgba(0,0,0,0.02);
            }

            .news-item:hover {
                transform: none;
                box-shadow:
                    0 4px 12px rgba(0,0,0,0.05),
                    0 0 0 1px rgba(0,0,0,0.02);
            }
        }

        .template-${config.template} {
            ${getTemplateStyles(config.template, config.primaryColor, config.secondaryColor)}
        }

        .info-panel {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow:
                0 8px 24px rgba(0,0,0,0.08),
                0 0 0 1px rgba(255,255,255,0.5);
            position: relative;
            overflow: hidden;
        }

        .info-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${config.primaryColor || "#eca825"}, ${config.secondaryColor || "#ffd700"});
        }

        .info-title {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 20px;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-title::before {
            content: '📱';
            font-size: 24px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .info-item {
            background: linear-gradient(145deg, #f8fafc, #e2e8f0);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .info-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-value {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
        }

        .features-summary {
            background: linear-gradient(135deg, ${config.primaryColor ? config.primaryColor + "1A" : "rgba(236, 168, 37, 0.1)"}, ${config.secondaryColor ? config.secondaryColor + "1A" : "rgba(255, 215, 0, 0.1)"});
            border-radius: 16px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid ${config.primaryColor ? config.primaryColor + "33" : "rgba(236, 168, 37, 0.2)"};
        }

        .features-count {
            font-size: 18px;
            font-weight: 800;
            color: ${config.primaryColor || "#eca825"};
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .features-count::before {
            content: '✨';
            font-size: 20px;
        }

        .features-list {
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
            font-weight: 500;
        }
    </style>
</head>
<body class="template-${config.template}">
    ${
      !isInline
        ? `
    <div class="info-panel">
        <div class="info-title">Informasi Aplikasi</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Nama Aplikasi</div>
                <div class="info-value">${config.displayName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tipe</div>
                <div class="info-value">${appType.toUpperCase()}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Versi</div>
                <div class="info-value">${config.version}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Template</div>
                <div class="info-value">${config.template}</div>
            </div>
        </div>
        <div class="features-summary">
            <div class="features-count">${enabledFeatures.length} Fitur Aktif</div>
            <div class="features-list">
                ${enabledFeatures.map((feature) => featureDescriptions[feature] || feature).join(", ")}
            </div>
        </div>
    </div>
    `
        : ""
    }

    <div class="phone-container">
        <div class="phone-screen">
            <div class="status-bar">
                <span>9:41</span>
                <span>📶 📶 📶 🔋</span>
            </div>

            <div class="app-container">
                <div class="header">
                    <div class="header-content">
                        <div class="header-left">
                            <div class="app-logo">
                                ${config.icon ? "" : "📱"}
                            </div>
                            <div class="app-info">
                                <h1>${config.displayName}</h1>
                                <p>${config.description}</p>
                            </div>
                        </div>
                        <div class="header-right">
                            <div class="notification-btn">🔔</div>
                            <div class="profile-btn">👤</div>
                        </div>
                    </div>
                </div>

                <div class="main-content">
                <!-- Banner Slider -->
                <div class="banner-slider">
                    <div class="banner-slide active">
                        <div class="banner-content">
                            <div class="banner-text">
                                <h3>Selamat Datang di TPQ Baitus Shuffah</h3>
                                <p>Platform digital terpadu untuk wali santri</p>
                            </div>
                            <div class="banner-image">🕌</div>
                        </div>
                    </div>
                    <div class="banner-slide">
                        <div class="banner-content">
                            <div class="banner-text">
                                <h3>Pantau Progress Hafalan Santri</h3>
                                <p>Lihat perkembangan hafalan dan kehadiran real-time</p>
                            </div>
                            <div class="banner-image">📚</div>
                        </div>
                    </div>
                    <div class="banner-slide">
                        <div class="banner-content">
                            <div class="banner-text">
                                <h3>Donasi untuk Kemajuan TPQ</h3>
                                <p>Berpartisipasi dalam pembangunan fasilitas TPQ</p>
                            </div>
                            <div class="banner-image">💝</div>
                        </div>
                    </div>
                    <div class="banner-indicators">
                        <span class="indicator active"></span>
                        <span class="indicator"></span>
                        <span class="indicator"></span>
                    </div>
                </div>

                <!-- Menu Grid -->
                <div class="menu-section">
                    <h4 class="section-title">Menu Utama</h4>
                    <div class="menu-grid">
                        ${enabledFeatures
                          .slice(0, 7)
                          .map(
                            (feature) => `
                            <div class="menu-item" onclick="showScreen('${feature}')">
                                <div class="menu-icon">${getFeatureIcon(feature)}</div>
                                <span class="menu-label">${getFeatureName(feature)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                        <div class="menu-item" onclick="showAllMenus()">
                            <div class="menu-icon">📋</div>
                            <span class="menu-label">Lainnya</span>
                        </div>
                    </div>
                </div>

                <!-- All Menus Modal (Hidden by default) -->
                <div id="allMenusModal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Semua Menu</h3>
                            <button onclick="hideAllMenus()" class="close-btn">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="all-menus-grid">
                                ${enabledFeatures
                                  .map(
                                    (feature) => `
                                    <div class="menu-item-full" onclick="showScreen('${feature}')">
                                        <div class="menu-icon-full">${getFeatureIcon(feature)}</div>
                                        <div class="menu-content-full">
                                            <span class="menu-label-full">${getFeatureName(feature)}</span>
                                            <span class="menu-desc-full">${getFeatureDescription(feature)}</span>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Campaign Donasi -->
                <div class="donation-section">
                    <h4 class="section-title">💝 Campaign Donasi</h4>
                    <div class="donation-card">
                        <div class="donation-image">🕌</div>
                        <div class="donation-content">
                            <h5>Bantu Pembangunan Masjid TPQ</h5>
                            <p>Mari bersama membangun rumah Allah untuk generasi santri yang lebih baik</p>
                            <div class="donation-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 68%"></div>
                                </div>
                                <div class="progress-text">
                                    <span>Terkumpul: Rp 68.500.000</span>
                                    <span>Target: Rp 100.000.000</span>
                                </div>
                            </div>
                            <button class="donate-btn">💝 Donasi Sekarang</button>
                        </div>
                    </div>
                </div>

                    <!-- Informasi Terkini & Kegiatan TPQ -->
                    <div class="news-section">
                        <h4 class="section-title">📰 Informasi Terkini & Kegiatan TPQ</h4>
                        <div class="news-list">
                            <div class="news-item">
                                <div class="news-image">📚</div>
                                <div class="news-content">
                                    <h6>Program Tahfidz Intensif Ramadan 2024</h6>
                                    <p>Pendaftaran dibuka untuk program tahfidz intensif selama bulan Ramadan dengan target hafalan 2 juz</p>
                                    <span class="news-date">2 hari yang lalu</span>
                                </div>
                            </div>
                            <div class="news-item">
                                <div class="news-image">🎓</div>
                                <div class="news-content">
                                    <h6>Wisuda Santri Angkatan 2024</h6>
                                    <p>Alhamdulillah 28 santri berhasil menyelesaikan program tahfidz dengan hafalan 30 juz</p>
                                    <span class="news-date">1 minggu yang lalu</span>
                                </div>
                            </div>
                            <div class="news-item">
                                <div class="news-image">🏆</div>
                                <div class="news-content">
                                    <h6>Juara 1 Lomba Tahfidz Tingkat Kota</h6>
                                    <p>Santri TPQ Baitus Shuffah meraih prestasi gemilang dalam lomba tahfidz antar TPQ se-kota</p>
                                    <span class="news-date">2 minggu yang lalu</span>
                                </div>
                            </div>
                            <div class="news-item">
                                <div class="news-image">🎪</div>
                                <div class="news-content">
                                    <h6>Festival Seni Islami TPQ 2024</h6>
                                    <p>Acara tahunan menampilkan bakat santri dalam seni kaligrafi, nasyid, dan drama islami</p>
                                    <span class="news-date">3 minggu yang lalu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Navigation -->
                <div class="bottom-nav">
                    ${enabledFeatures
                      .slice(0, 5)
                      .map(
                        (feature, index) => `
                        <div class="nav-item ${index === 0 ? "active" : ""}">
                            <div class="nav-icon">${getFeatureIcon(feature)}</div>
                            <span>${getFeatureName(feature)}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    </div>

    <script>
        // Simulate loading - reduced timeout for better UX
        function hideLoadingScreen() {
            const loadingScreen = document.querySelector('.loading-screen');
            const appContainer = document.querySelector('.app-container');

            if (loadingScreen) loadingScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';
        }

        // Primary loading timeout
        setTimeout(hideLoadingScreen, 1000);

        // Fallback timeout in case something goes wrong
        setTimeout(hideLoadingScreen, 3000);

        // Modal functions
        function showAllMenus() {
            const modal = document.getElementById('allMenusModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        function hideAllMenus() {
            const modal = document.getElementById('allMenusModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('allMenusModal');
            if (event.target === modal) {
                hideAllMenus();
            }
        });

        // Screen navigation function
        function showScreen(screenName) {
            console.log('Navigating to:', screenName);
            // In a real app, this would navigate to the actual screen
            alert('Navigasi ke: ' + screenName);
            hideAllMenus();
        }

    </script>
</body>
</html>
`;
}

function generateMusyrifPreviewHTML(
  config: AppConfig,
  enabledFeatures: string[],
  isInline: boolean = false,
): string {
  // Helper function for menu descriptions
  const getMenuDescription = (route: string) => {
    const descriptions: { [key: string]: string } = {
      'santri': 'Kelola data santri, lihat profil, dan pantau perkembangan hafalan setiap santri.',
      'halaqah': 'Atur jadwal halaqah, kelola kelas, dan pantau kehadiran santri.',
      'hafalan': 'Pantau progress hafalan santri, berikan penilaian, dan catat pencapaian.',
      'attendance': 'Catat kehadiran santri, lihat statistik absensi, dan buat laporan.',
      'assessment': 'Berikan penilaian kepada santri, input nilai, dan evaluasi kemajuan.',
      'behavior': 'Catat perilaku santri, berikan reward atau teguran, dan pantau akhlak.',
      'reports': 'Lihat berbagai laporan seperti progress hafalan, kehadiran, dan penilaian.',
      'profile': 'Kelola profil Anda, ubah password, dan atur preferensi aplikasi.',
      'schedule': 'Lihat jadwal mengajar, atur waktu halaqah, dan kelola kalender kegiatan.',
      'communication': 'Berkomunikasi dengan wali santri, kirim pesan, dan buat pengumuman.',
      'achievements': 'Catat prestasi santri, berikan penghargaan, dan pantau pencapaian.',
      'settings': 'Atur pengaturan aplikasi, notifikasi, dan preferensi tampilan.',
      'help': 'Panduan penggunaan aplikasi, FAQ, dan bantuan teknis.',
      'notifications': 'Kelola notifikasi, pengingat, dan pemberitahuan penting.'
    };
    return descriptions[route] || 'Fitur ini sedang dalam pengembangan.';
  };

  // Use custom menu grid from config or default
  const musyrifMenus = (config as any).customMenuGrid || [
    { id: 1, title: "Data Santri", icon: "👥", color: "#3B82F6", route: "santri" },
    { id: 2, title: "Halaqah", icon: "📖", color: config.primaryColor || "#eca825", route: "halaqah" },
    { id: 3, title: "Hafalan", icon: "📚", color: "#DC2626", route: "hafalan" },
    { id: 4, title: "Absensi", icon: "✅", color: "#F59E0B", route: "attendance" },
    { id: 5, title: "Penilaian", icon: "⭐", color: "#8B5CF6", route: "assessment" },
    { id: 6, title: "Perilaku", icon: "❤️", color: "#EC4899", route: "behavior" },
    { id: 7, title: "Laporan", icon: "📊", color: "#06B6D4", route: "reports" },
    { id: 8, title: "Profil", icon: "👤", color: "#84CC16", route: "profile" },
    { id: 9, title: "Jadwal", icon: "📅", color: "#10B981", route: "schedule" },
    { id: 10, title: "Komunikasi", icon: "💬", color: "#F97316", route: "communication" },
    { id: 11, title: "Prestasi", icon: "🏆", color: "#EAB308", route: "achievements" },
    { id: 12, title: "Pengaturan", icon: "⚙️", color: "#6B7280", route: "settings" },
    { id: 13, title: "Bantuan", icon: "❓", color: "#14B8A6", route: "help" },
    { id: 14, title: "Notifikasi", icon: "🔔", color: "#F43F5E", route: "notifications" },
  ];

  // Use custom bottom tabs from config or default
  const bottomTabs = (config as any).customBottomTabs || [
    { name: "Dashboard", icon: "🏠", active: true },
    { name: "Santri", icon: "👥", active: false },
    { name: "Hafalan", icon: "📚", active: false },
    { name: "Wallet", icon: "💰", active: false },
    { name: "Profil", icon: "👤", active: false },
  ];


  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${config.displayName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        .phone-container {
            max-width: 375px;
            margin: 0 auto;
            background: linear-gradient(145deg, #2c3e50, #34495e);
            border-radius: 35px;
            padding: 12px;
            box-shadow:
                0 25px 50px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255,255,255,0.1),
                inset 0 1px 0 rgba(255,255,255,0.2);
            position: relative;
        }

        .phone-screen {
            background: #f8fafc;
            border-radius: 28px;
            overflow: hidden;
            height: 667px;
            position: relative;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .status-bar {
            height: 44px;
            background: linear-gradient(90deg, #1a202c, #2d3748);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 24px;
            color: white;
            font-size: 14px;
            font-weight: 600;
        }

        .app-content {
            height: calc(100% - 44px - 80px);
            overflow-y: auto;
            background: #f1f5f9;
            padding-bottom: 20px;
        }

        /* Header with Logo */
        .app-header {
            background: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .app-logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: bold;
            ${config.icon ? `background-image: url(${config.icon}); background-size: cover; background-position: center;` : ""}
        }

        .app-info h1 {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }

        .app-info p {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .message-icon {
            width: 40px;
            height: 40px;
            background: #f3f4f6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease;
            position: relative;
        }

        .message-icon:hover {
            background: #e5e7eb;
        }

        .message-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 18px;
            height: 18px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: 600;
        }

        /* Wallet Card */
        .wallet-card {
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            margin: 20px 16px;
            border-radius: 20px;
            padding: 24px;
            color: white;
            position: relative;
            overflow: hidden;
            box-shadow:
                0 8px 24px rgba(16, 185, 129, 0.2),
                0 0 0 1px rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .wallet-card:hover {
            transform: translateY(-2px);
            box-shadow:
                0 12px 32px rgba(236, 168, 37, 0.3),
                0 0 0 1px rgba(255,255,255,0.2);
        }

        .wallet-card::before {
            content: '';
            position: absolute;
            top: -40px;
            right: -40px;
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }

        .wallet-card::after {
            content: '';
            position: absolute;
            bottom: -30px;
            left: -30px;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
            border-radius: 50%;
        }

        .wallet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            position: relative;
            z-index: 2;
        }

        .wallet-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
            font-weight: 600;
        }

        .wallet-title span:first-child {
            font-size: 20px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .wallet-balance {
            margin-bottom: 16px;
            position: relative;
            z-index: 2;
        }

        .balance-label {
            font-size: 13px;
            opacity: 0.85;
            margin-bottom: 6px;
            font-weight: 500;
        }

        .balance-amount {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }

        .wallet-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
            gap: 16px;
        }

        .stat-item {
            text-align: center;
            flex: 1;
        }

        .stat-value {
            font-size: 16px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
        }

        .stat-label {
            font-size: 11px;
            opacity: 0.8;
            line-height: 1.3;
            font-weight: 500;
        }

        .wallet-actions {
            display: flex;
            gap: 8px;
            position: relative;
            z-index: 2;
        }

        .wallet-action {
            flex: 1;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 10px 8px;
            color: white;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .wallet-action:hover {
            background: rgba(255,255,255,0.25);
            border-color: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }

        /* Banner Slider */
        .banner-slider {
            margin: 16px;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            height: 140px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .banner-slide {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            display: flex;
            align-items: center;
            padding: 24px;
            color: white;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        .banner-slide.active {
            opacity: 1;
        }

        .banner-content {
            flex: 1;
        }

        .banner-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .banner-subtitle {
            font-size: 14px;
            opacity: 0.9;
        }

        .banner-icon {
            font-size: 40px;
            margin-left: 16px;
        }

        .banner-indicators {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 6px;
        }

        .indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .indicator.active {
            background: white;
        }

        /* Menu Grid */
        .menu-section {
            margin: 20px 20px 40px 20px;
            background: white;
            border-radius: 20px;
            padding: 24px;
            box-shadow:
                0 4px 16px rgba(0,0,0,0.06),
                0 0 0 1px rgba(0,0,0,0.02);
            min-height: 250px; /* Ensure enough space for menu grid */
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            letter-spacing: -0.3px;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 0 4px;
            min-height: 200px; /* Ensure enough height for 2 rows */
        }

        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 12px 8px;
            border-radius: 16px;
        }

        .menu-item:hover {
            transform: translateY(-3px);
            background: rgba(0,0,0,0.02);
        }

        .menu-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            font-size: 28px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .menu-item:hover .menu-icon {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }

        .menu-label {
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            line-height: 1.3;
            max-width: 60px;
            word-wrap: break-word;
        }

        /* Donation Section */
        .donation-section {
            margin: 20px 20px 24px 20px;
            background: white;
            border-radius: 20px;
            padding: 24px;
            box-shadow:
                0 4px 16px rgba(0,0,0,0.06),
                0 0 0 1px rgba(0,0,0,0.02);
        }

        .donation-cards {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .donation-card {
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }

        .donation-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .donation-image {
            position: relative;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            border-radius: 12px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            overflow: hidden;
        }

        .donation-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255,255,255,0.9);
            color: ${config.primaryColor || "#eca825"};
            font-size: 10px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 6px;
        }

        .donation-placeholder {
            font-size: 32px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .donation-content {
            flex: 1;
        }

        .donation-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 6px;
            line-height: 1.3;
        }

        .donation-desc {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 12px;
            line-height: 1.4;
        }

        .donation-progress {
            margin-bottom: 16px;
        }

        .progress-bar {
            background: #e5e7eb;
            border-radius: 8px;
            height: 8px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-fill {
            background: linear-gradient(90deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            height: 100%;
            border-radius: 8px;
            transition: width 0.3s ease;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .progress-text {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }

        .progress-amount {
            font-size: 12px;
            color: ${config.primaryColor || "#eca825"};
            font-weight: 700;
        }

        .donation-btn {
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .donation-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        /* News Section */
        .news-section {
            margin: 20px 20px 24px 20px;
            background: white;
            border-radius: 20px;
            padding: 24px;
            box-shadow:
                0 4px 16px rgba(0,0,0,0.06),
                0 0 0 1px rgba(0,0,0,0.02);
        }

        .news-cards {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .news-card {
            display: flex;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .news-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .news-image {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .news-placeholder {
            font-size: 24px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .news-content {
            flex: 1;
            min-width: 0;
        }

        .news-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .news-date {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 500;
        }

        .news-category {
            background: #eff6ff;
            color: #3b82f6;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 6px;
        }

        .news-title {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 6px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .news-excerpt {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        /* Bottom Navigation */
        .bottom-nav {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 80px;
            background: linear-gradient(180deg, #ffffff, #f8fafc);
            border-top: 1px solid rgba(226, 232, 240, 0.5);
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 8px 16px;
            box-shadow:
                0 -4px 16px rgba(0,0,0,0.05),
                0 0 0 1px rgba(0,0,0,0.02);
            backdrop-filter: blur(20px);
            z-index: 1000;
            border-radius: 0 0 28px 28px;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px 6px;
            border-radius: 12px;
            flex: 1;
            max-width: 65px;
        }

        .nav-item.active {
            color: ${config.primaryColor || "#eca825"};
            background: rgba(236, 168, 37, 0.12);
            transform: scale(1.05);
        }

        .nav-item:not(.active) {
            color: #9ca3af;
        }

        .nav-item:hover:not(.active) {
            color: #6b7280;
            background: rgba(0,0,0,0.03);
        }

        .nav-icon {
            font-size: 22px;
            line-height: 1;
            transition: transform 0.3s ease;
        }

        .nav-item.active .nav-icon {
            transform: scale(1.1);
        }

        .nav-label {
            font-size: 10px;
            font-weight: 600;
            line-height: 1.2;
            text-align: center;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 300px;
            width: 90%;
            text-align: center;
            position: relative;
        }

        .modal-close {
            position: absolute;
            top: 12px;
            right: 12px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
        }

        .modal-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }

        .modal-button {
            background: ${config.primaryColor || "#eca825"};
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }

        /* Active Screen Styles */
        .screen {
            display: none;
            padding-bottom: 100px;
        }

        .screen.active {
            display: block;
        }

        #dashboard-screen {
            padding-bottom: 100px;
        }

        /* Responsive Design for Musyrif Template */
        @media (max-width: 320px) {
            .wallet-card {
                margin: 16px 12px;
                padding: 20px;
            }

            .wallet-actions {
                gap: 6px;
            }

            .wallet-action {
                padding: 8px 6px;
                font-size: 10px;
            }

            .bottom-nav {
                height: 75px;
                padding: 6px 12px;
            }

            .nav-item {
                padding: 6px 4px;
                max-width: 55px;
            }

            .nav-icon {
                font-size: 20px;
            }

            .nav-label {
                font-size: 9px;
            }

            .menu-section,
            .donation-section,
            .news-section {
                margin: 16px 16px 20px 16px;
                padding: 20px;
            }

            .menu-grid {
                gap: 16px;
            }

            .menu-icon {
                width: 48px;
                height: 48px;
                font-size: 24px;
            }

            .donation-image {
                height: 70px;
            }

            .donation-placeholder {
                font-size: 28px;
            }

            .news-image {
                width: 50px;
                height: 50px;
            }

            .news-placeholder {
                font-size: 20px;
            }
        }

        /* Ensure proper stacking and positioning */
        .phone-screen {
            position: relative;
            z-index: 1;
            overflow: hidden;
        }

        .bottom-nav {
            z-index: 1000;
            border-radius: 0 0 28px 28px;
            margin: 0;
        }

        /* Ensure content doesn't overlap with bottom nav */
        .news-section:last-child {
            margin-bottom: 100px;
        }

        /* Modal Styles for Musyrif */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, ${config.primaryColor || "#eca825"} 0%, ${config.secondaryColor || "#ffd700"} 100%);
            color: white;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
            padding: 20px;
            max-height: calc(80vh - 80px);
            overflow-y: auto;
        }

        .all-menus-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .menu-item-full {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
        }

        .menu-item-full:hover {
            background: #e2e8f0;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .menu-icon-full {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 16px;
            flex-shrink: 0;
            color: white;
        }

        .menu-content-full {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .menu-label-full {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
        }

        .menu-desc-full {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.3;
        }

        /* Smooth scrolling for musyrif template */
        #dashboard-screen {
            scroll-behavior: smooth;
            overflow-y: auto;
        }

        /* Add click feedback for news cards */
        .news-card:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .donation-card:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Fix wallet card overflow */
        .wallet-card {
            word-wrap: break-word;
            overflow: hidden;
        }

        .wallet-stats {
            min-height: 40px;
        }

        .stat-item {
            min-width: 0;
            overflow: hidden;
        }

        .stat-value, .stat-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Page Content Styles */
        .page-content {
            padding: 20px;
            background: white;
            margin: 16px;
            border-radius: 12px;
            min-height: 200px;
        }

        .page-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }

        .page-description {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }

        /* Info Panel */
        .info-panel {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .info-title {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
        }

        .info-item {
            text-align: center;
        }

        .info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }

        .features-summary {
            text-align: center;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }

        .features-count {
            font-size: 16px;
            font-weight: 600;
            color: ${config.primaryColor || "#eca825"};
            margin-bottom: 8px;
        }

        .features-list {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    ${!isInline ? `
    <div class="info-panel">
        <div class="info-title">Informasi Aplikasi</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Nama Aplikasi</div>
                <div class="info-value">${config.displayName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tipe</div>
                <div class="info-value">MUSYRIF</div>
            </div>
            <div class="info-item">
                <div class="info-label">Versi</div>
                <div class="info-value">${config.version}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Template</div>
                <div class="info-value">${config.template}</div>
            </div>
        </div>
        <div class="features-summary">
            <div class="features-count">${enabledFeatures.length} Fitur Aktif</div>
            <div class="features-list">
                Dashboard Musyrif, Data Santri, Halaqah, Hafalan, Penilaian, Wallet, dan lainnya
            </div>
        </div>
    </div>
    ` : ""}

    <div class="phone-container">
        <div class="phone-screen">
            <div class="status-bar">
                <span>9:41</span>
                <span>📶 📶 📶 🔋</span>
            </div>

            <div class="app-content">
                <!-- App Header -->
                <div class="app-header">
                    <div class="header-left">
                        <div class="app-logo">${config.icon ? "" : "🕌"}</div>
                        <div class="app-info">
                            <h1>${config.displayName || config.name || "TPQ BAITUS SHUFFAH"}</h1>
                            <p>Aplikasi Musyrif</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <div class="message-icon" onclick="showModal('Pesan', 'Fitur pesan akan segera hadir!')">
                            💬
                            <div class="message-badge">3</div>
                        </div>
                    </div>
                </div>

                <!-- Dashboard Screen -->
                <div id="dashboard-screen" class="screen active">
                    <!-- Wallet Card -->
                    <div class="wallet-card" onclick="showModal('Wallet', 'Saldo Anda: Rp 1.500.000')">
                        <div class="wallet-header">
                        <div class="wallet-title">
                            <span>💰</span>
                            <span>Wallet Saya</span>
                        </div>
                        <button style="background: none; border: none; color: white; font-size: 18px;">👁️</button>
                    </div>

                    <div class="wallet-balance">
                        <div class="balance-label">Saldo Tersedia</div>
                        <div class="balance-amount">Rp 1.500.000</div>
                    </div>

                    <div class="wallet-stats">
                        <div class="stat-item">
                            <div class="stat-value">Rp 750.000</div>
                            <div class="stat-label">Penghasilan Bulan Ini</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">Rp 200.000</div>
                            <div class="stat-label">Penarikan Pending</div>
                        </div>
                    </div>

                    <div class="wallet-actions">
                        <button class="wallet-action">Tarik Dana</button>
                        <button class="wallet-action">Riwayat</button>
                        <button class="wallet-action">Transfer</button>
                        <button class="wallet-action">Top Up</button>
                    </div>
                </div>

                <!-- Banner Slider -->
                <div class="banner-slider">
                    <div class="banner-slide active">
                        <div class="banner-content">
                            <div class="banner-title">Selamat Datang Ustadz!</div>
                            <div class="banner-subtitle">Kelola santri dengan mudah</div>
                        </div>
                        <div class="banner-icon">🕌</div>
                    </div>
                    <div class="banner-slide">
                        <div class="banner-content">
                            <div class="banner-title">Fitur Wallet Terbaru</div>
                            <div class="banner-subtitle">Kelola penghasilan lebih praktis</div>
                        </div>
                        <div class="banner-icon">💰</div>
                    </div>
                    <div class="banner-indicators">
                        <span class="indicator active"></span>
                        <span class="indicator"></span>
                    </div>
                </div>

                <!-- Menu Grid -->
                <div class="menu-section">
                    <h4 class="section-title">Menu Utama</h4>
                    <div class="menu-grid">
                        ${musyrifMenus.slice(0, 7).map(menu => `
                            <div class="menu-item" onclick="showScreen('${menu.route}')">
                                <div class="menu-icon" style="background-color: ${menu.color}20; color: ${menu.color};">
                                    ${menu.icon}
                                </div>
                                <div class="menu-label">${menu.title}</div>
                            </div>
                        `).join('')}
                        <div class="menu-item" onclick="showAllMenusMusyrif()">
                            <div class="menu-icon" style="background-color: #6B728020; color: #6B7280;">
                                📋
                            </div>
                            <div class="menu-label">Lainnya</div>
                        </div>
                    </div>
                </div>

                <!-- All Menus Modal (Hidden by default) -->
                <div id="allMenusModalMusyrif" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Semua Menu</h3>
                            <button onclick="hideAllMenusMusyrif()" class="close-btn">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="all-menus-grid">
                                ${musyrifMenus.map(menu => `
                                    <div class="menu-item-full" onclick="showScreen('${menu.route}')">
                                        <div class="menu-icon-full" style="background: linear-gradient(135deg, ${menu.color} 0%, ${menu.color}CC 100%);">
                                            ${menu.icon}
                                        </div>
                                        <div class="menu-content-full">
                                            <span class="menu-label-full">${menu.title}</span>
                                            <span class="menu-desc-full">${getMenuDescription(menu.route)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Donation Campaign Section -->
                <div class="donation-section">
                    <h4 class="section-title">Campaign Donasi</h4>
                    <div class="donation-cards">
                        <div class="donation-card">
                            <div class="donation-image">
                                <div class="donation-badge">Urgent</div>
                                <div class="donation-placeholder">🕌</div>
                            </div>
                            <div class="donation-content">
                                <h5 class="donation-title">Renovasi Masjid TPQ</h5>
                                <p class="donation-desc">Bantuan untuk renovasi masjid dan fasilitas TPQ</p>
                                <div class="donation-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 65%"></div>
                                    </div>
                                    <div class="progress-info">
                                        <span class="progress-text">65% tercapai</span>
                                        <span class="progress-amount">Rp 32.500.000</span>
                                    </div>
                                </div>
                                <button class="donation-btn" onclick="showModal('Donasi', 'Fitur donasi akan segera tersedia!')">
                                    Donasi Sekarang
                                </button>
                            </div>
                        </div>

                        <div class="donation-card">
                            <div class="donation-image">
                                <div class="donation-badge">Aktif</div>
                                <div class="donation-placeholder">📚</div>
                            </div>
                            <div class="donation-content">
                                <h5 class="donation-title">Buku Al-Quran Santri</h5>
                                <p class="donation-desc">Pengadaan Al-Quran dan buku pembelajaran</p>
                                <div class="donation-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 40%"></div>
                                    </div>
                                    <div class="progress-info">
                                        <span class="progress-text">40% tercapai</span>
                                        <span class="progress-amount">Rp 8.000.000</span>
                                    </div>
                                </div>
                                <button class="donation-btn" onclick="showModal('Donasi', 'Fitur donasi akan segera tersedia!')">
                                    Donasi Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- News & Information Section -->
                <div class="news-section">
                    <h4 class="section-title">Berita & Informasi Terkini</h4>
                    <div class="news-cards">
                        <div class="news-card">
                            <div class="news-image">
                                <div class="news-placeholder">📢</div>
                            </div>
                            <div class="news-content">
                                <div class="news-meta">
                                    <span class="news-date">2 hari yang lalu</span>
                                    <span class="news-category">Pengumuman</span>
                                </div>
                                <h5 class="news-title">Jadwal Ujian Hafalan Semester Genap</h5>
                                <p class="news-excerpt">Ujian hafalan untuk semester genap akan dilaksanakan mulai tanggal 15 Februari 2024...</p>
                            </div>
                        </div>

                        <div class="news-card">
                            <div class="news-image">
                                <div class="news-placeholder">🎉</div>
                            </div>
                            <div class="news-content">
                                <div class="news-meta">
                                    <span class="news-date">5 hari yang lalu</span>
                                    <span class="news-category">Kegiatan</span>
                                </div>
                                <h5 class="news-title">Peringatan Maulid Nabi Muhammad SAW</h5>
                                <p class="news-excerpt">TPQ Baitus Shuffah mengadakan peringatan Maulid Nabi dengan berbagai kegiatan menarik...</p>
                            </div>
                        </div>

                        <div class="news-card">
                            <div class="news-image">
                                <div class="news-placeholder">🏆</div>
                            </div>
                            <div class="news-content">
                                <div class="news-meta">
                                    <span class="news-date">1 minggu yang lalu</span>
                                    <span class="news-category">Prestasi</span>
                                </div>
                                <h5 class="news-title">Santri TPQ Juara Lomba Tahfidz</h5>
                                <p class="news-excerpt">Alhamdulillah, santri TPQ Baitus Shuffah meraih juara 1 dalam lomba tahfidz tingkat kecamatan...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Individual Screens for Each Menu -->
                ${musyrifMenus.map(menu => `
                    <div id="${menu.route}-screen" class="screen">
                        <div class="page-content">
                            <div class="page-title">${menu.title}</div>
                            <div class="page-description">
                                ${getMenuDescription(menu.route)}
                            </div>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>

            <!-- Bottom Navigation -->
            <div class="bottom-nav">
                ${bottomTabs.map((tab, index) => `
                    <div class="nav-item ${tab.active ? 'active' : ''}" onclick="switchTab('${tab.name.toLowerCase()}', ${index})">
                        <div class="nav-icon">${tab.icon}</div>
                        <div class="nav-label">${tab.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-title" id="modal-title">Title</div>
            <div class="modal-text" id="modal-text">Content</div>
            <button class="modal-button" onclick="closeModal()">OK</button>
        </div>
    </div>
        </div>
    </div>

    <script>
        // Menu descriptions
        function getMenuDescription(route) {
            const descriptions = {
                'santri': 'Kelola data santri, lihat profil, dan pantau perkembangan hafalan setiap santri.',
                'halaqah': 'Atur jadwal halaqah, kelola kelas, dan pantau kehadiran santri.',
                'hafalan': 'Pantau progress hafalan santri, berikan penilaian, dan catat pencapaian.',
                'attendance': 'Catat kehadiran santri, lihat statistik absensi, dan buat laporan.',
                'assessment': 'Berikan penilaian kepada santri, input nilai, dan evaluasi kemajuan.',
                'behavior': 'Catat perilaku santri, berikan reward atau teguran, dan pantau akhlak.',
                'reports': 'Lihat berbagai laporan seperti progress hafalan, kehadiran, dan penilaian.',
                'profile': 'Kelola profil Anda, ubah password, dan atur preferensi aplikasi.',
                'schedule': 'Lihat jadwal mengajar, atur waktu halaqah, dan kelola kalender kegiatan.',
                'communication': 'Berkomunikasi dengan wali santri, kirim pesan, dan buat pengumuman.',
                'achievements': 'Catat prestasi santri, berikan penghargaan, dan pantau pencapaian.',
                'settings': 'Atur pengaturan aplikasi, notifikasi, dan preferensi tampilan.',
                'help': 'Panduan penggunaan aplikasi, FAQ, dan bantuan teknis.',
                'notifications': 'Kelola notifikasi, pengingat, dan pemberitahuan penting.'
            };
            return descriptions[route] || 'Fitur ini sedang dalam pengembangan.';
        }

        // Modal functions
        function showModal(title, text) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-text').textContent = text;
            document.getElementById('modal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('modal').classList.remove('active');
        }

        // Screen navigation
        function showScreen(screenId) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.getElementById(screenId + '-screen');
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        }

        // Tab switching
        function switchTab(tabName, index) {
            // Update active tab
            document.querySelectorAll('.nav-item').forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });

            // Show appropriate screen
            if (tabName === 'dashboard') {
                showScreen('dashboard');
            } else {
                showModal(tabName.charAt(0).toUpperCase() + tabName.slice(1),
                         'Halaman ' + tabName + ' akan segera tersedia!');
            }
        }

        // Banner slider functionality
        function startBannerSlider() {
            const slides = document.querySelectorAll('.banner-slide');
            const indicators = document.querySelectorAll('.indicator');
            let currentSlide = 0;

            if (slides.length === 0 || indicators.length === 0) return;

            function showSlide(index) {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
            }

            function nextSlide() {
                if (slides.length === 0) return;
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            // Auto-advance slides every 3 seconds only if there are multiple slides
            if (slides.length > 1) {
                setInterval(nextSlide, 3000);
            }

            // Add click handlers to indicators
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                });
            });
        }

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            try {
                startBannerSlider();
            } catch (error) {
                console.error('Error initializing banner slider:', error);
            }

            // Add click handlers to wallet actions
            try {
                document.querySelectorAll('.wallet-action').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.stopPropagation();
                        try {
                            showModal('Wallet Action', 'Fitur ' + this.textContent + ' akan segera tersedia!');
                        } catch (modalError) {
                            alert('Fitur ' + this.textContent + ' akan segera tersedia!');
                        }
                    });
                });
            } catch (error) {
                console.error('Error setting up wallet actions:', error);
            }
        });

        // Modal functions for all menus
        function showAllMenusMusyrif() {
            const modal = document.getElementById('allMenusModalMusyrif');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        function hideAllMenusMusyrif() {
            const modal = document.getElementById('allMenusModalMusyrif');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('allMenusModalMusyrif');
            if (event.target === modal) {
                hideAllMenusMusyrif();
            }
        });

        // Add global function to window for inline onclick handlers
        window.getMenuDescription = getMenuDescription;
        window.showAllMenusMusyrif = showAllMenusMusyrif;
        window.hideAllMenusMusyrif = hideAllMenusMusyrif;
    </script>
</body>
</html>
`;
}

function getTemplateStyles(
  template: string,
  primaryColor: string,
  secondaryColor: string,
): string {
  switch (template) {
    case "dark":
      return `
        .phone-screen {
          background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
          color: white;
        }
        .features-container {
          background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
        }
        .feature-card {
          background: linear-gradient(145deg, #2d3748, #4a5568);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .app-header {
          background: linear-gradient(135deg, ${primaryColor || "#2d3748"}, ${secondaryColor || "#4a5568"}) !important;
        }
        .info-panel {
          background: linear-gradient(145deg, #2d3748, #4a5568);
          color: white;
        }
        .info-item {
          background: linear-gradient(145deg, #4a5568, #718096);
        }
        .info-label { color: #a0aec0; }
        .info-value { color: white; }
      `;
    case "islamic":
      return `
        .app-header {
          background: linear-gradient(135deg, ${primaryColor || "#059669"}, ${secondaryColor || "#10b981"}) !important;
        }
        .feature-card::before {
          background: linear-gradient(90deg, ${primaryColor || "#059669"}, ${secondaryColor || "#10b981"}) !important;
        }
        .feature-icon {
          background: linear-gradient(135deg, ${primaryColor || "#059669"}, ${secondaryColor || "#10b981"}) !important;
        }
        .nav-icon {
          background: linear-gradient(135deg, ${primaryColor || "#059669"}, ${secondaryColor || "#10b981"}) !important;
        }
        .info-panel::before {
          background: linear-gradient(90deg, ${primaryColor || "#059669"}, ${secondaryColor || "#10b981"}) !important;
        }
        .features-summary {
          background: linear-gradient(135deg, ${primaryColor ? primaryColor + "1A" : "rgba(5, 150, 105, 0.1)"}, ${secondaryColor ? secondaryColor + "1A" : "rgba(16, 185, 129, 0.1)"}) !important;
          border-color: ${primaryColor ? primaryColor + "33" : "rgba(5, 150, 105, 0.2)"} !important;
        }
        .features-count { color: ${primaryColor || "#059669"} !important; }
      `;
    case "minimal":
      return `
        .feature-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .app-header {
          background: linear-gradient(135deg, ${primaryColor || "#f8fafc"}, ${secondaryColor || "#e2e8f0"}) !important;
          color: #1e293b !important;
        }
        .feature-icon {
          background: linear-gradient(135deg, ${primaryColor || "#64748b"}, ${secondaryColor || "#94a3b8"}) !important;
        }
        .nav-icon {
          background: linear-gradient(135deg, ${primaryColor || "#64748b"}, ${secondaryColor || "#94a3b8"}) !important;
        }
        .info-panel::before {
          background: linear-gradient(90deg, ${primaryColor || "#64748b"}, ${secondaryColor || "#94a3b8"}) !important;
        }
      `;
    case "classic":
      return `
        .app-header {
          background: linear-gradient(135deg, ${primaryColor || "#1e40af"}, ${secondaryColor || "#3b82f6"}) !important;
        }
        .feature-card::before {
          background: linear-gradient(90deg, ${primaryColor || "#1e40af"}, ${secondaryColor || "#3b82f6"}) !important;
        }
        .feature-icon {
          background: linear-gradient(135deg, ${primaryColor || "#1e40af"}, ${secondaryColor || "#3b82f6"}) !important;
        }
        .nav-icon {
          background: linear-gradient(135deg, ${primaryColor || "#1e40af"}, ${secondaryColor || "#3b82f6"}) !important;
        }
        .info-panel::before {
          background: linear-gradient(90deg, #1e40af, #3b82f6) !important;
        }
      `;
    default:
      return "";
  }
}

function getFeatureIcon(feature: string): string {
  const icons: { [key: string]: string } = {
    dashboard: "📊",
    progress: "📈",
    payment: "💳",
    messages: "💬",
    profile: "👤",
    attendance: "✅",
    schedule: "📅",
    achievements: "🏆",
    donations: "💝",
    events: "🎉",
    students: "👥",
    grades: "📝",
    reports: "📋",
    materials: "📚",
    assessments: "🎯",
  };
  return icons[feature] || "📱";
}

function getFeatureName(feature: string): string {
  const names: { [key: string]: string } = {
    dashboard: "Dashboard",
    progress: "Progress",
    payment: "Pembayaran",
    messages: "Pesan",
    profile: "Profil",
    attendance: "Absensi",
    schedule: "Jadwal",
    achievements: "Prestasi",
    donations: "Donasi",
    events: "Event",
    students: "Santri",
    grades: "Nilai",
    reports: "Laporan",
    materials: "Materi",
    assessments: "Penilaian",
  };
  return names[feature] || feature;
}

function getFeatureDescription(feature: string): string {
  const descriptions: { [key: string]: string } = {
    dashboard: "Dashboard dengan ringkasan informasi santri",
    progress: "Melihat perkembangan belajar santri",
    payment: "Sistem pembayaran SPP online",
    messages: "Komunikasi dengan musyrif dan admin",
    profile: "Manajemen profil dan data wali",
    attendance: "Melihat kehadiran santri",
    schedule: "Melihat jadwal pelajaran santri",
    achievements: "Melihat pencapaian dan prestasi",
    donations: "Sistem donasi untuk TPQ",
    events: "Informasi event dan kegiatan TPQ",
    students: "Kelola data santri binaan",
    grades: "Input dan kelola nilai santri",
    reports: "Generate laporan progress",
    materials: "Kelola materi pelajaran",
    assessments: "Sistem penilaian santri",
  };
  return descriptions[feature] || "Fitur ini sedang dalam pengembangan.";
}
