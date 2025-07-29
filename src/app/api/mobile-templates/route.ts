import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface MobileTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  elements: any[];
  settings: any;
  thumbnail?: string;
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES_DIR = path.join(process.cwd(), "data", "mobile-templates");

// Ensure templates directory exists
async function ensureTemplatesDir() {
  if (!existsSync(TEMPLATES_DIR)) {
    await mkdir(TEMPLATES_DIR, { recursive: true });
  }
}

// GET - Fetch all templates or specific template
export async function GET(request: NextRequest) {
  try {
    await ensureTemplatesDir();

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");
    const category = searchParams.get("category");

    if (templateId) {
      // Get specific template
      const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);

      if (!existsSync(templatePath)) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 },
        );
      }

      const templateData = await readFile(templatePath, "utf-8");
      const template = JSON.parse(templateData);

      return NextResponse.json({
        success: true,
        template,
      });
    } else {
      // Get all templates
      const fs = require("fs");
      const templateFiles = fs
        .readdirSync(TEMPLATES_DIR)
        .filter((file: string) => file.endsWith(".json"));

      const templates: MobileTemplate[] = [];

      for (const file of templateFiles) {
        try {
          const templateData = await readFile(
            path.join(TEMPLATES_DIR, file),
            "utf-8",
          );
          const template = JSON.parse(templateData);

          // Filter by category if specified
          if (!category || template.category === category) {
            templates.push(template);
          }
        } catch (error) {
          console.error(`Error reading template ${file}:`, error);
        }
      }

      // Sort by updatedAt descending
      templates.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return NextResponse.json({
        success: true,
        templates,
      });
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    await ensureTemplatesDir();

    const body = await request.json();
    const {
      name,
      description,
      category,
      elements,
      settings,
      tags = [],
      author = "Admin",
    } = body;

    if (!name || !elements) {
      return NextResponse.json(
        { success: false, error: "Name and elements are required" },
        { status: 400 },
      );
    }

    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const template: MobileTemplate = {
      id: templateId,
      name,
      description: description || "",
      category: category || "custom",
      elements,
      settings: settings || {},
      tags,
      author,
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
    };

    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    await writeFile(templatePath, JSON.stringify(template, null, 2));

    return NextResponse.json({
      success: true,
      template,
      message: "Template created successfully",
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update existing template
export async function PUT(request: NextRequest) {
  try {
    await ensureTemplatesDir();

    const body = await request.json();
    const { id, name, description, category, elements, settings, tags } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 },
      );
    }

    const templatePath = path.join(TEMPLATES_DIR, `${id}.json`);

    if (!existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 },
      );
    }

    // Read existing template
    const existingData = await readFile(templatePath, "utf-8");
    const existingTemplate = JSON.parse(existingData);

    // Update template
    const updatedTemplate: MobileTemplate = {
      ...existingTemplate,
      name: name || existingTemplate.name,
      description:
        description !== undefined ? description : existingTemplate.description,
      category: category || existingTemplate.category,
      elements: elements || existingTemplate.elements,
      settings: settings || existingTemplate.settings,
      tags: tags || existingTemplate.tags,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(templatePath, JSON.stringify(updatedTemplate, null, 2));

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 },
      );
    }

    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);

    if (!existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 },
      );
    }

    const fs = require("fs");
    fs.unlinkSync(templatePath);

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
