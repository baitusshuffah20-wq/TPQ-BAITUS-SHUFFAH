import { NextRequest, NextResponse } from "next/server";
import {
  ComponentData,
  ExportOptions,
} from "@/components/mobile-app-builder/types";

interface GenerateRequest {
  components: ComponentData[];
  options: ExportOptions;
  templateName: string;
}

// React Native Code Generator
function generateReactNativeCode(
  components: ComponentData[],
  templateName: string,
): string {
  const imports = new Set([
    "import React from 'react';",
    "import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';",
  ]);

  const componentCode = components
    .map((component) => {
      switch (component.type) {
        case "text":
          return `<Text style={styles.text_${component.id}}>${component.props.text}</Text>`;

        case "heading":
          return `<Text style={styles.heading_${component.id}}>${component.props.text}</Text>`;

        case "button":
          return `<TouchableOpacity style={styles.button_${component.id}}>
          <Text style={styles.buttonText_${component.id}}>${component.props.text}</Text>
        </TouchableOpacity>`;

        case "input":
          return `<TextInput 
          style={styles.input_${component.id}}
          placeholder="${component.props.placeholder}"
          ${component.props.type === "password" ? "secureTextEntry={true}" : ""}
        />`;

        case "container":
          const containerChildren = component.children || [];
          return `<View style={styles.container_${component.id}}>
          ${containerChildren.map(child => renderComponent(child)).join('\n          ')}
        </View>`;

        case "attendance-card":
          return `<View style={styles.attendanceCard_${component.id}}>
          <View>
            <Text style={styles.studentName}>${component.props.studentName}</Text>
            <Text style={styles.dateTime}>${component.props.date} • ${component.props.time}</Text>
          </View>
          <View style={styles.statusBadge_${component.id}}>
            <Text style={styles.statusText}>${component.props.status}</Text>
          </View>
        </View>`;

        case "attendance-summary-card":
          return `<View style={styles.attendanceSummaryCard_${component.id}}>
          <View>
            <Text style={styles.studentName}>${component.props.studentName}</Text>
            <Text style={styles.dateTime}>${component.props.date} • ${component.props.time}</Text>
          </View>
          <View style={styles.statusBadge_${component.id}}>
            <Text style={styles.statusText}>${component.props.status}</Text>
          </View>
        </View>`;

        case "menu-grid":
          return `<View style={styles.menuGrid_${component.id}}>
          ${component.props.menuItems.map((item: any, index: number) => `
            <TouchableOpacity key={${index}} style={styles.menuItem_${component.id}}>
              <Text style={styles.menuIcon}>${item.icon}</Text>
              ${component.props.showLabels ? `<Text style={styles.menuLabel}>${item.label}</Text>` : ''}
            </TouchableOpacity>
          `).join('')}
        </View>`;

        case "bottom-navigation":
          return `<View style={styles.bottomNavigation_${component.id}}>
          ${component.props.items.map((item: any, index: number) => `
            <TouchableOpacity key={${index}} style={styles.navItem_${component.id}}>
              <Text style={[styles.navIcon, { color: '${item.active ? component.props.activeColor : component.props.inactiveColor}' }]}>${item.icon}</Text>
              ${component.props.showLabels ? `<Text style={[styles.navLabel, { color: '${item.active ? component.props.activeColor : component.props.inactiveColor}' }]}>${item.label}</Text>` : ''}
            </TouchableOpacity>
          `).join('')}
        </View>`;

        case "header-menu":
          return `<View style={styles.headerMenu_${component.id}}>
          <View style={styles.headerLeft}>
            ${component.props.showLogo ? `<Text style={styles.logoIcon}>${component.props.logoIcon}</Text>` : ''}
            <Text style={styles.headerTitle}>${component.props.title}</Text>
          </View>
          <View style={styles.headerRight}>
            ${component.props.showNotification ? `<TouchableOpacity><Text style={styles.headerIcon}>🔔</Text></TouchableOpacity>` : ''}
            ${component.props.showProfile ? `<TouchableOpacity><Text style={styles.headerIcon}>👤</Text></TouchableOpacity>` : ''}
          </View>
        </View>`;

        case "icon-button":
          return `<TouchableOpacity style={styles.iconButton_${component.id}}>
          <Text style={styles.buttonIcon}>${component.props.icon}</Text>
          ${component.props.showLabel ? `<Text style={styles.buttonLabel}>${component.props.label}</Text>` : ''}
        </TouchableOpacity>`;

        case "floating-action-button":
          return `<TouchableOpacity style={styles.floatingActionButton_${component.id}}>
          <Text style={styles.fabIcon}>${component.props.icon}</Text>
        </TouchableOpacity>`;

        case "wallet-card":
          return `<View style={styles.walletCard_${component.id}}>
          <Text style={styles.walletTitle}>${component.props.cardTitle}</Text>
          <Text style={styles.walletBalance}>${component.props.currency} ${component.props.balance?.toLocaleString()}</Text>
          <View style={styles.walletButtons}>
            ${component.props.showTopUp ? `<TouchableOpacity style={styles.walletButton_${component.id}}><Text style={styles.walletButtonText}>Top Up</Text></TouchableOpacity>` : ''}
            ${component.props.showWithdraw ? `<TouchableOpacity style={styles.walletButton_${component.id}}><Text style={styles.walletButtonText}>Withdraw</Text></TouchableOpacity>` : ''}
          </View>
        </View>`;

        case "donation-card":
          const progress = (component.props.currentAmount / component.props.targetAmount) * 100;
          return `<View style={styles.donationCard_${component.id}}>
          <Text style={styles.donationTitle}>${component.props.title}</Text>
          <Text style={styles.donationDescription}>${component.props.description}</Text>
          ${component.props.showProgress ? `
          <View style={styles.donationProgress}>
            <View style={styles.donationProgressBar}>
              <View style={[styles.donationProgressFill, { width: '${Math.min(progress, 100)}%' }]} />
            </View>
            <Text style={styles.donationProgressText}>${progress.toFixed(1)}% tercapai</Text>
          </View>
          ` : ''}
          <TouchableOpacity style={styles.donationButton_${component.id}}>
            <Text style={styles.donationButtonText}>Donasi Sekarang</Text>
          </TouchableOpacity>
        </View>`;

        case "progress-tracker":
          return `<View style={styles.progressTracker_${component.id}}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>${component.props.title}</Text>
            <Text style={styles.progressPercentage}>${Math.round((component.props.current / component.props.total) * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '${Math.round((component.props.current / component.props.total) * 100)}%' }]} />
          </View>
          <Text style={styles.progressText}>${component.props.current} / ${component.props.total} ${component.props.unit}</Text>
        </View>`;

        default:
          return `<View style={styles.unknown_${component.id}}>
          <Text>Unknown component: ${component.type}</Text>
        </View>`;
      }
    })
    .join("\n      ");

  const styles = components
    .map((component) => {
      switch (component.type) {
        case "text":
          return `  text_${component.id}: {
    fontSize: ${component.props.fontSize || 16},
    color: '${component.props.color || "#000000"}',
    fontWeight: '${component.props.fontWeight || "normal"}',
    textAlign: '${component.props.textAlign || "left"}',
    lineHeight: ${(component.props.fontSize || 16) * (component.props.lineHeight || 1.5)},
  },`;

        case "heading":
          return `  heading_${component.id}: {
    fontSize: ${24 - component.props.level * 2},
    color: '${component.props.color || "#000000"}',
    fontWeight: 'bold',
    textAlign: '${component.props.textAlign || "left"}',
    marginBottom: 8,
  },`;

        case "button":
          return `  button_${component.id}: {
    backgroundColor: '${component.props.backgroundColor || "#3b82f6"}',
    borderRadius: ${component.props.borderRadius || 8},
    padding: ${component.props.padding || 12},
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonText_${component.id}: {
    color: '${component.props.color || "#ffffff"}',
    fontSize: ${component.props.fontSize || 16},
    fontWeight: '600',
  },`;

        case "input":
          return `  input_${component.id}: {
    borderWidth: 1,
    borderColor: '${component.props.borderColor || "#d1d5db"}',
    borderRadius: ${component.props.borderRadius || 8},
    padding: ${component.props.padding || 12},
    fontSize: 14,
    marginVertical: 4,
  },`;

        case "container":
          return `  container_${component.id}: {
    backgroundColor: '${component.props.backgroundColor || "#ffffff"}',
    padding: ${component.props.padding || 16},
    margin: ${component.props.margin || 8},
    borderRadius: ${component.props.borderRadius || 8},
    ${component.props.borderWidth ? `borderWidth: ${component.props.borderWidth},` : ""}
    ${component.props.borderColor ? `borderColor: '${component.props.borderColor}',` : ""}
  },`;

        case "attendance-card":
          return `  attendanceCard_${component.id}: {
    backgroundColor: '${component.props.backgroundColor || "#f0fdf4"}',
    borderWidth: 2,
    borderColor: '${component.props.borderColor || "#22c55e"}',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  studentName: {
    fontWeight: '600',
    fontSize: 16,
  },
  dateTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge_${component.id}: {
    backgroundColor: '${component.props.status === "Present" ? "#22c55e" : component.props.status === "Absent" ? "#ef4444" : "#f59e0b"}',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },`;

        case "attendance-summary-card":
          return `  attendanceSummaryCard_${component.id}: {
    backgroundColor: '${component.props.backgroundColor || "#ffffff"}',
    borderRadius: ${component.props.borderRadius || 12},
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentName: {
    fontWeight: '600',
    fontSize: 16,
  },
  dateTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge_${component.id}: {
    backgroundColor: '${component.props.status === "Hadir" ? "#22c55e" : component.props.status === "Tidak Hadir" ? "#ef4444" : "#f59e0b"}',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },`;

        case "menu-grid":
          return `  menuGrid_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    borderRadius: ${component.props.borderRadius},
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem_${component.id}: {
    width: '${100 / component.props.columns - 2}%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: ${component.props.spacing},
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: ${component.props.showLabels ? 8 : 0},
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },`;

        case "bottom-navigation":
          return `  bottomNavigation_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    height: ${component.props.height},
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
  },
  navItem_${component.id}: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: ${component.props.showLabels ? 4 : 0},
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '400',
  },`;

        case "header-menu":
          return `  headerMenu_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    height: ${component.props.height},
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '${component.props.textColor}',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '${component.props.textColor}',
  },
  headerIcon: {
    fontSize: 20,
    color: '${component.props.textColor}',
    marginLeft: 16,
  },`;

        case "icon-button":
          const sizeMap = {
            small: { padding: '8px 12px', fontSize: 14, iconSize: 16 },
            medium: { padding: '12px 16px', fontSize: 16, iconSize: 18 },
            large: { padding: '16px 20px', fontSize: 18, iconSize: 20 },
          };
          const buttonSize = sizeMap[component.props.size as keyof typeof sizeMap] || sizeMap.medium;
          return `  iconButton_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    borderRadius: ${component.props.borderRadius},
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: ${buttonSize.iconSize},
    color: '${component.props.textColor}',
    marginRight: ${component.props.showLabel ? 8 : 0},
  },
  buttonLabel: {
    fontSize: ${buttonSize.fontSize},
    fontWeight: '500',
    color: '${component.props.textColor}',
  },`;

        case "floating-action-button":
          return `  floatingActionButton_${component.id}: {
    position: 'absolute',
    bottom: 16,
    ${component.props.position === 'bottom-right' ? 'right: 16,' :
      component.props.position === 'bottom-left' ? 'left: 16,' :
      'alignSelf: "center",'}
    width: ${component.props.size},
    height: ${component.props.size},
    backgroundColor: '${component.props.backgroundColor}',
    borderRadius: ${component.props.size / 2},
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
    color: '#ffffff',
  },`;

        case "progress-tracker":
          return `  progressTracker_${component.id}: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginVertical: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '${component.props.color || "#22c55e"}',
    height: '100%',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },`;

        case "wallet-card":
          return `  walletCard_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    minHeight: 120,
  },
  walletTitle: {
    fontSize: 14,
    color: '${component.props.textColor}',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '${component.props.textColor}',
    marginBottom: 16,
  },
  walletButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  walletButton_${component.id}: {
    backgroundColor: '${component.props.buttonColor}',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  walletButtonText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },`;

        case "donation-card":
          return `  donationCard_${component.id}: {
    backgroundColor: '${component.props.backgroundColor}',
    borderWidth: 1,
    borderColor: '${component.props.borderColor}',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    minHeight: 140,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  donationDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  donationProgress: {
    marginBottom: 12,
  },
  donationProgressBar: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  donationProgressFill: {
    backgroundColor: '${component.props.progressColor}',
    height: '100%',
  },
  donationProgressText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  donationButton_${component.id}: {
    backgroundColor: '${component.props.progressColor}',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  donationButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },`;

        default:
          return `  unknown_${component.id}: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginVertical: 4,
  },`;
      }
    })
    .join("\n");

  return `${Array.from(imports).join("\n")}

const ${templateName.replace(/[^a-zA-Z0-9]/g, "")}Screen = () => {
  return (
    <ScrollView style={styles.container}>
      ${componentCode}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
${styles}
});

export default ${templateName.replace(/[^a-zA-Z0-9]/g, "")}Screen;`;
}

// Flutter Code Generator
function generateFlutterCode(
  components: ComponentData[],
  templateName: string,
): string {
  const widgets = components
    .map((component) => {
      switch (component.type) {
        case "text":
          return `Text(
          '${component.props.text}',
          style: TextStyle(
            fontSize: ${component.props.fontSize || 16},
            color: Color(0xFF${component.props.color?.replace("#", "") || "000000"}),
            fontWeight: FontWeight.${component.props.fontWeight === "bold" ? "bold" : "normal"},
          ),
        )`;

        case "button":
          return `ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: Color(0xFF${component.props.backgroundColor?.replace("#", "") || "3b82f6"}),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(${component.props.borderRadius || 8}),
            ),
            padding: EdgeInsets.all(${component.props.padding || 12}),
          ),
          child: Text(
            '${component.props.text}',
            style: TextStyle(
              color: Color(0xFF${component.props.color?.replace("#", "") || "ffffff"}),
              fontSize: ${component.props.fontSize || 16},
            ),
          ),
        )`;

        default:
          return `Container(
          child: Text('Unknown component: ${component.type}'),
        )`;
      }
    })
    .join(",\n        ");

  return `import 'package:flutter/material.dart';

class ${templateName.replace(/[^a-zA-Z0-9]/g, "")}Screen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${templateName}'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            ${widgets}
          ],
        ),
      ),
    );
  }
}`;
}

// PWA Code Generator
function generatePWACode(
  components: ComponentData[],
  templateName: string,
): string {
  const htmlElements = components
    .map((component) => {
      switch (component.type) {
        case "text":
          return `<p class="text-${component.id}">${component.props.text}</p>`;

        case "heading":
          return `<h${component.props.level} class="heading-${component.id}">${component.props.text}</h${component.props.level}>`;

        case "button":
          return `<button class="button-${component.id}">${component.props.text}</button>`;

        case "input":
          return `<input type="${component.props.type}" placeholder="${component.props.placeholder}" class="input-${component.id}" />`;

        default:
          return `<div class="unknown-${component.id}">Unknown component: ${component.type}</div>`;
      }
    })
    .join("\n    ");

  const cssStyles = components
    .map((component) => {
      switch (component.type) {
        case "text":
          return `.text-${component.id} {
  font-size: ${component.props.fontSize || 16}px;
  color: ${component.props.color || "#000000"};
  font-weight: ${component.props.fontWeight || "normal"};
  text-align: ${component.props.textAlign || "left"};
  line-height: ${component.props.lineHeight || 1.5};
}`;

        case "button":
          return `.button-${component.id} {
  background-color: ${component.props.backgroundColor || "#3b82f6"};
  color: ${component.props.color || "#ffffff"};
  border: none;
  border-radius: ${component.props.borderRadius || 8}px;
  padding: ${component.props.padding || 12}px;
  font-size: ${component.props.fontSize || 16}px;
  cursor: pointer;
  margin: 4px 0;
}`;

        default:
          return `.unknown-${component.id} {
  padding: 16px;
  background-color: #fee2e2;
  border-radius: 8px;
  margin: 4px 0;
}`;
      }
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background-color: #ffffff;
    }
    
    .container {
      max-width: 375px;
      margin: 0 auto;
    }
    
    ${cssStyles}
  </style>
</head>
<body>
  <div class="container">
    ${htmlElements}
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { components, options, templateName } = body;

    if (!components || !Array.isArray(components)) {
      return NextResponse.json(
        { success: false, error: "Invalid components data" },
        { status: 400 },
      );
    }

    let generatedCode: string;
    let fileName: string;
    let mimeType: string;

    switch (options.platform) {
      case "react-native":
        generatedCode = generateReactNativeCode(components, templateName);
        fileName = `${templateName.replace(/[^a-zA-Z0-9]/g, "")}Screen.tsx`;
        mimeType = "text/typescript";
        break;

      case "flutter":
        generatedCode = generateFlutterCode(components, templateName);
        fileName = `${templateName.replace(/[^a-zA-Z0-9]/g, "")}_screen.dart`;
        mimeType = "text/dart";
        break;

      case "pwa":
        generatedCode = generatePWACode(components, templateName);
        fileName = `${templateName.replace(/[^a-zA-Z0-9]/g, "")}.html`;
        mimeType = "text/html";
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unsupported platform" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: generatedCode,
        fileName,
        mimeType,
        platform: options.platform,
      },
      message: "Code generated successfully",
    });
  } catch (error) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate code" },
      { status: 500 },
    );
  }
}
