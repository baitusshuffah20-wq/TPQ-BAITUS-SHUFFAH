"use client";

import { CanvasElement, GeneratedCode, ExportOptions } from "./types";

export class TemplateGenerator {
  static generateReactNativeCode(
    elements: CanvasElement[],
    options: ExportOptions = {
      format: "react-native",
      includeAssets: true,
      includeStyles: true,
      minify: false,
      typescript: true,
    },
  ): GeneratedCode {
    const files: GeneratedCode["files"] = [];
    const dependencies: string[] = [
      "react",
      "react-native",
      "@react-navigation/native",
      "@react-navigation/bottom-tabs",
    ];

    // Generate main screen component
    const screenCode = this.generateScreenComponent(elements, options);
    files.push({
      path: "src/screens/GeneratedScreen.tsx",
      content: screenCode,
      type: "screen",
    });

    // Generate styles
    if (options.includeStyles) {
      const stylesCode = this.generateStyles(elements);
      files.push({
        path: "src/styles/GeneratedStyles.ts",
        content: stylesCode,
        type: "style",
      });
    }

    // Generate individual components
    const componentCodes = this.generateComponents(elements, options);
    componentCodes.forEach(({ name, code }) => {
      files.push({
        path: `src/components/${name}.tsx`,
        content: code,
        type: "component",
      });
    });

    // Generate app configuration
    const configCode = this.generateAppConfig(elements);
    files.push({
      path: "app.json",
      content: configCode,
      type: "config",
    });

    return {
      files,
      dependencies,
      instructions: [
        "Install dependencies: npm install",
        "Copy generated files to your React Native project",
        "Import and use GeneratedScreen in your navigation",
        "Customize styles and components as needed",
      ],
    };
  }

  private static generateScreenComponent(
    elements: CanvasElement[],
    options: ExportOptions,
  ): string {
    const imports = [
      "import React from 'react';",
      "import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';",
    ];

    // Add component-specific imports
    const componentTypes = new Set(elements.map((el) => el.type));
    if (componentTypes.has("button")) {
      imports.push("import { TouchableOpacity } from 'react-native';");
    }
    if (componentTypes.has("textinput")) {
      imports.push("import { TextInput } from 'react-native';");
    }
    if (componentTypes.has("image")) {
      imports.push("import { Image } from 'react-native';");
    }

    const componentJSX = elements
      .map((element) => this.generateElementJSX(element, 0))
      .join("\n");

    return `${imports.join("\n")}

const GeneratedScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
${componentJSX}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
${this.generateElementStyles(elements)}
});

export default GeneratedScreen;`;
  }

  private static generateElementJSX(
    element: CanvasElement,
    depth: number,
  ): string {
    const indent = "  ".repeat(depth + 2);
    const { type, props } = element;

    switch (type) {
      case "container":
        return `${indent}<View style={styles.container_${element.id}}>
${element.children.map((child) => this.generateElementJSX(child, depth + 1)).join("\n")}
${indent}</View>`;

      case "header":
        return `${indent}<View style={styles.header_${element.id}}>
${indent}  {${props.showBackButton} && <TouchableOpacity><Text>←</Text></TouchableOpacity>}
${indent}  <Text style={styles.headerText_${element.id}}>${props.title || "Header"}</Text>
${indent}  {${props.showMenuButton} && <TouchableOpacity><Text>☰</Text></TouchableOpacity>}
${indent}</View>`;

      case "card":
        return `${indent}<View style={styles.card_${element.id}}>
${element.children.map((child) => this.generateElementJSX(child, depth + 1)).join("\n")}
${indent}</View>`;

      case "button":
        return `${indent}<TouchableOpacity 
${indent}  style={styles.button_${element.id}}
${indent}  disabled={${props.disabled || false}}
${indent}  onPress={() => console.log('Button pressed')}
${indent}>
${indent}  <Text style={styles.buttonText_${element.id}}>${props.text || "Button"}</Text>
${indent}</TouchableOpacity>`;

      case "text":
        return `${indent}<Text style={styles.text_${element.id}}>${props.content || "Sample Text"}</Text>`;

      case "image":
        return `${indent}<Image 
${indent}  source={{ uri: '${props.source || "https://via.placeholder.com/300x200"}' }}
${indent}  style={styles.image_${element.id}}
${indent}  resizeMode="${props.resizeMode || "cover"}"
${indent}/>`;

      case "textinput":
        return `${indent}<TextInput
${indent}  style={styles.textInput_${element.id}}
${indent}  placeholder="${props.placeholder || "Enter text..."}"
${indent}  multiline={${props.multiline || false}}
${indent}  numberOfLines={${props.numberOfLines || 1}}
${indent}/>`;

      case "switch":
        return `${indent}<Switch
${indent}  style={styles.switch_${element.id}}
${indent}  value={${props.value || false}}
${indent}  trackColor={{ false: '${props.inactiveColor || "#d1d5db"}', true: '${props.activeColor || "#2563eb"}' }}
${indent}/>`;

      default:
        return `${indent}<View style={styles.unknown_${element.id}}>
${indent}  <Text>Unknown Component: ${type}</Text>
${indent}</View>`;
    }
  }

  private static generateElementStyles(elements: CanvasElement[]): string {
    return elements
      .map((element) => {
        const { type, props } = element;
        const baseId = `${type}_${element.id}`;

        switch (type) {
          case "container":
            return `  ${baseId}: {
    backgroundColor: '${props.backgroundColor || "#ffffff"}',
    padding: ${props.padding || 16},
    margin: ${props.margin || 8},
    borderRadius: ${props.borderRadius || 8},
    flexDirection: '${props.flexDirection || "column"}',
    justifyContent: '${props.justifyContent || "flex-start"}',
    alignItems: '${props.alignItems || "stretch"}',
  },`;

          case "header":
            return `  ${baseId}: {
    backgroundColor: '${props.backgroundColor || "#2563eb"}',
    height: ${props.height || 60},
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: ${props.elevation || 4},
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText_${element.id}: {
    color: '${props.textColor || "#ffffff"}',
    fontSize: 18,
    fontWeight: '600',
  },`;

          case "card":
            return `  ${baseId}: {
    backgroundColor: '${props.backgroundColor || "#ffffff"}',
    borderRadius: ${props.borderRadius || 12},
    padding: ${props.padding || 16},
    margin: ${props.margin || 8},
    elevation: ${props.elevation || 2},
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ${props.borderWidth ? `borderWidth: ${props.borderWidth},` : ""}
    ${props.borderColor ? `borderColor: '${props.borderColor}',` : ""}
  },`;

          case "button":
            return `  ${baseId}: {
    backgroundColor: '${props.variant === "outline" ? "transparent" : props.backgroundColor || "#2563eb"}',
    borderRadius: ${props.borderRadius || 8},
    paddingVertical: ${props.padding || 12},
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    ${props.variant === "outline" ? `borderWidth: 2, borderColor: '${props.backgroundColor || "#2563eb"}',` : ""}
    ${props.fullWidth ? 'width: "100%",' : ""}
    ${props.disabled ? "opacity: 0.5," : ""}
  },
  buttonText_${element.id}: {
    color: '${props.variant === "outline" ? props.backgroundColor || "#2563eb" : props.textColor || "#ffffff"}',
    fontSize: ${props.fontSize || 16},
    fontWeight: '${props.fontWeight || "600"}',
  },`;

          case "text":
            return `  ${baseId}: {
    fontSize: ${props.fontSize || 16},
    fontWeight: '${props.fontWeight || "400"}',
    color: '${props.color || "#374151"}',
    textAlign: '${props.textAlign || "left"}',
    lineHeight: ${(props.fontSize || 16) * (props.lineHeight || 1.5)},
    marginTop: ${props.marginTop || 0},
    marginBottom: ${props.marginBottom || 0},
    marginLeft: ${props.marginLeft || 0},
    marginRight: ${props.marginRight || 0},
    padding: 8,
  },`;

          case "image":
            return `  ${baseId}: {
    width: '${typeof props.width === "string" ? props.width : props.width + "px"}',
    height: ${props.height || 200},
    borderRadius: ${props.borderRadius || 8},
    opacity: ${props.opacity || 1},
    margin: 4,
  },`;

          case "textinput":
            return `  ${baseId}: {
    borderWidth: ${props.borderWidth || 1},
    borderColor: '${props.borderColor || "#d1d5db"}',
    borderRadius: ${props.borderRadius || 8},
    padding: ${props.padding || 12},
    fontSize: ${props.fontSize || 16},
    backgroundColor: '${props.backgroundColor || "#ffffff"}',
    color: '${props.textColor || "#374151"}',
    margin: 4,
    ${props.multiline ? `minHeight: ${(props.numberOfLines || 3) * 24},` : ""}
  },`;

          case "switch":
            return `  ${baseId}: {
    margin: 8,
  },`;

          default:
            return `  ${baseId}: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    margin: 4,
  },`;
        }
      })
      .join("\n");
  }

  private static generateComponents(
    elements: CanvasElement[],
    options: ExportOptions,
  ): Array<{ name: string; code: string }> {
    // Generate reusable components for complex elements
    const components: Array<{ name: string; code: string }> = [];

    // Example: Generate a custom header component if multiple headers exist
    const headers = elements.filter((el) => el.type === "header");
    if (headers.length > 0) {
      const headerComponent = this.generateHeaderComponent(headers[0]);
      components.push({
        name: "CustomHeader",
        code: headerComponent,
      });
    }

    return components;
  }

  private static generateHeaderComponent(headerElement: CanvasElement): string {
    const { props } = headerElement;

    return `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = '${props.title || "Header"}',
  showBackButton = ${props.showBackButton || false},
  showMenuButton = ${props.showMenuButton || true},
  onBackPress,
  onMenuPress,
  backgroundColor = '${props.backgroundColor || "#2563eb"}',
  textColor = '${props.textColor || "#ffffff"}',
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      {showBackButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.button}>
          <Text style={[styles.buttonText, { color: textColor }]}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {showMenuButton && (
        <TouchableOpacity onPress={onMenuPress} style={styles.button}>
          <Text style={[styles.buttonText, { color: textColor }]}>☰</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: ${props.height || 60},
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: ${props.elevation || 4},
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  button: {
    padding: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomHeader;`;
  }

  private static generateStyles(elements: CanvasElement[]): string {
    return `import { StyleSheet } from 'react-native';

export const generatedStyles = StyleSheet.create({
${this.generateElementStyles(elements)}
});

export default generatedStyles;`;
  }

  private static generateAppConfig(elements: CanvasElement[]): string {
    return JSON.stringify(
      {
        expo: {
          name: "Generated TPQ App",
          slug: "generated-tpq-app",
          version: "1.0.0",
          orientation: "portrait",
          icon: "./assets/icon.png",
          splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
          },
          updates: {
            fallbackToCacheTimeout: 0,
          },
          assetBundlePatterns: ["**/*"],
          ios: {
            supportsTablet: true,
          },
          android: {
            adaptiveIcon: {
              foregroundImage: "./assets/adaptive-icon.png",
              backgroundColor: "#FFFFFF",
            },
          },
          web: {
            favicon: "./assets/favicon.png",
          },
        },
      },
      null,
      2,
    );
  }
}

export default TemplateGenerator;
