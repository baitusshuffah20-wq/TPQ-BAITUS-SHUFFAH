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
          return `<View style={styles.container_${component.id}}>
          {/* Add child components here */}
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
