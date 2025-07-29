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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            z-index: -1;
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

        .phone-container::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% - 6px);
            height: calc(100% - 6px);
            border-radius: 30px;
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            pointer-events: none;
        }

        .phone-screen {
            background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
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
            position: relative;
        }

        .status-bar::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .app-header {
            background: linear-gradient(135deg, ${config.primaryColor || "#667eea"} 0%, ${config.secondaryColor || "#764ba2"} 100%);
            color: white;
            padding: 40px 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .app-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
            50% { transform: translate(-50%, -50%) rotate(180deg); }
        }

        .app-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: linear-gradient(145deg, #ffffff, #f1f5f9);
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: #667eea;
            position: relative;
            z-index: 2;
            box-shadow:
                0 8px 16px rgba(0,0,0,0.1),
                0 0 0 1px rgba(255,255,255,0.2);
            ${config.icon ? `background-image: url(${config.icon}); background-size: cover;` : ""}
        }

        .app-title {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 8px;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .app-subtitle {
            font-size: 15px;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 500;
        }
        
        .features-container {
            padding: 0;
            flex: 1;
            overflow-y: auto;
            background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        }

        /* Banner Slider Styles */
        .banner-slider {
            position: relative;
            height: 140px;
            margin: 16px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .banner-slide {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            padding: 20px;
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
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
            line-height: 1.2;
        }

        .banner-text p {
            font-size: 12px;
            opacity: 0.9;
            line-height: 1.3;
        }

        .banner-image {
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
            background: rgba(255,255,255,0.4);
            transition: background 0.3s ease;
        }

        .indicator.active {
            background: white;
        }

        /* Section Titles */
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin: 20px 16px 12px 16px;
        }

        /* Menu Grid Styles */
        .menu-section {
            margin-bottom: 24px;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            padding: 0 16px;
        }

        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .menu-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .menu-icon {
            font-size: 24px;
            margin-bottom: 8px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${config.primaryColor || "#667eea"}, ${config.secondaryColor || "#764ba2"});
            border-radius: 10px;
            color: white;
        }

        .menu-label {
            font-size: 10px;
            font-weight: 600;
            color: #475569;
            text-align: center;
            line-height: 1.2;
        }

        /* Donation Section Styles */
        .donation-section {
            margin-bottom: 24px;
        }

        .donation-card {
            margin: 0 16px;
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }

        .donation-image {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
        }

        .donation-content h5 {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
            text-align: center;
        }

        .donation-content p {
            font-size: 12px;
            color: #64748b;
            text-align: center;
            margin-bottom: 16px;
            line-height: 1.4;
        }

        .donation-progress {
            margin-bottom: 16px;
        }

        .progress-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }

        .donate-btn {
            width: 100%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .donate-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        /* News Section Styles */
        .news-section {
            margin-bottom: 24px;
        }

        .news-list {
            padding: 0 16px;
        }

        .news-item {
            display: flex;
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .news-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .news-item:last-child {
            margin-bottom: 0;
        }

        .news-image {
            font-size: 32px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            border-radius: 12px;
            margin-right: 16px;
            flex-shrink: 0;
        }

        .news-content {
            flex: 1;
        }

        .news-content h6 {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .news-content p {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .news-date {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 500;
        }


        
        .bottom-nav {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: linear-gradient(180deg, #ffffff, #f8fafc);
            border-top: 1px solid rgba(226, 232, 240, 0.8);
            display: flex;
            align-items: center;
            justify-content: space-around;
            backdrop-filter: blur(10px);
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #64748b;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .nav-item.active {
            color: ${config.primaryColor || "#667eea"};
        }

        .nav-icon {
            width: 28px;
            height: 28px;
            margin-bottom: 4px;
            background: linear-gradient(135deg, ${config.primaryColor || "#667eea"}, ${config.secondaryColor || "#764ba2"});
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
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
            background: linear-gradient(90deg, ${config.primaryColor || "#667eea"}, ${config.secondaryColor || "#764ba2"});
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
            background: linear-gradient(135deg, ${config.primaryColor ? config.primaryColor + "1A" : "rgba(102, 126, 234, 0.1)"}, ${config.secondaryColor ? config.secondaryColor + "1A" : "rgba(118, 75, 162, 0.1)"});
            border-radius: 16px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid ${config.primaryColor ? config.primaryColor + "33" : "rgba(102, 126, 234, 0.2)"};
        }

        .features-count {
            font-size: 18px;
            font-weight: 800;
            color: ${config.primaryColor || "#667eea"};
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
            
            <div class="app-header">
                <div class="app-icon">
                    ${config.icon ? "" : "📱"}
                </div>
                <div class="app-title">${config.displayName}</div>
                <div class="app-subtitle">${config.description}</div>
            </div>
            
            <div class="features-container">
                <!-- Banner Slider -->
                <div class="banner-slider">
                    <div class="banner-slide active">
                        <div class="banner-content">
                            <div class="banner-text">
                                <h3>Selamat Datang di TPQ Baitus Shuffah</h3>
                                <p>Platform digital untuk wali santri dan musyrif</p>
                            </div>
                            <div class="banner-image">🕌</div>
                        </div>
                    </div>
                    <div class="banner-slide">
                        <div class="banner-content">
                            <div class="banner-text">
                                <h3>Pantau Perkembangan Santri</h3>
                                <p>Lihat progress hafalan dan kehadiran real-time</p>
                            </div>
                            <div class="banner-image">📚</div>
                        </div>
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
                        ${enabledFeatures
                          .slice(0, 8)
                          .map(
                            (feature) => `
                            <div class="menu-item">
                                <div class="menu-icon">${getFeatureIcon(feature)}</div>
                                <span class="menu-label">${getFeatureName(feature)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <!-- Campaign Donasi -->
                <div class="donation-section">
                    <h4 class="section-title">Campaign Donasi</h4>
                    <div class="donation-card">
                        <div class="donation-image">🤲</div>
                        <div class="donation-content">
                            <h5>Bantu Pembangunan Masjid</h5>
                            <p>Mari bersama membangun rumah Allah untuk generasi mendatang</p>
                            <div class="donation-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%"></div>
                                </div>
                                <div class="progress-text">
                                    <span>Terkumpul: Rp 65.000.000</span>
                                    <span>Target: Rp 100.000.000</span>
                                </div>
                            </div>
                            <button class="donate-btn">Donasi Sekarang</button>
                        </div>
                    </div>
                </div>

                <!-- Berita Terkini -->
                <div class="news-section">
                    <h4 class="section-title">Berita Terkini</h4>
                    <div class="news-list">
                        <div class="news-item">
                            <div class="news-image">📰</div>
                            <div class="news-content">
                                <h6>Kegiatan Tahfidz Bulan Ramadan</h6>
                                <p>Program khusus tahfidz intensif selama bulan suci Ramadan</p>
                                <span class="news-date">2 hari yang lalu</span>
                            </div>
                        </div>
                        <div class="news-item">
                            <div class="news-image">🎓</div>
                            <div class="news-content">
                                <h6>Wisuda Santri Angkatan 2024</h6>
                                <p>Selamat kepada 25 santri yang telah menyelesaikan program</p>
                                <span class="news-date">5 hari yang lalu</span>
                            </div>
                        </div>
                        <div class="news-item">
                            <div class="news-image">🏆</div>
                            <div class="news-content">
                                <h6>Juara Lomba Tahfidz Tingkat Kota</h6>
                                <p>Santri TPQ meraih juara 1 dalam lomba tahfidz antar TPQ</p>
                                <span class="news-date">1 minggu yang lalu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
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

    <script>
        // Simulate loading
        setTimeout(() => {
            document.querySelector('.loading-screen').style.display = 'none';
            document.querySelector('.app-container').style.display = 'flex';

            // Start banner slider animation
            startBannerSlider();
        }, 2000);

        function startBannerSlider() {
            const slides = document.querySelectorAll('.banner-slide');
            const indicators = document.querySelectorAll('.indicator');
            let currentSlide = 0;

            function showSlide(index) {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            // Auto-advance slides every 4 seconds
            setInterval(nextSlide, 4000);

            // Add click handlers to indicators
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                });
            });
        }
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
