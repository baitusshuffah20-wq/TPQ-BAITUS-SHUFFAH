"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestButtonPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Test Button Colors - Teal Primary #008080
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button (Default)</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🎯</Button>
              </div>
            </div>

            {/* Loading States */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loading States</h3>
              <div className="flex flex-wrap gap-4">
                <Button loading={true}>Loading Button</Button>
                <Button loading={false}>Normal Button</Button>
                <Button disabled>Disabled Button</Button>
              </div>
            </div>

            {/* Tailwind Classes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Direct Tailwind Classes</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  bg-primary
                </button>
                <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">
                  bg-teal-500
                </button>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                  bg-teal-600
                </button>
                <button className="bg-[#008080] text-white px-4 py-2 rounded-md hover:bg-[#006666]">
                  bg-[#008080]
                </button>
              </div>
            </div>

            {/* CSS Variables */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">CSS Variables</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  var(--primary)
                </button>
                <button
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: "hsl(var(--primary))" }}
                >
                  hsl(var(--primary))
                </button>
              </div>
            </div>

            {/* Color Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div
                    className="w-20 h-20 mx-auto rounded-lg"
                    style={{ backgroundColor: "#008080" }}
                  ></div>
                  <p className="mt-2 text-sm">#008080</p>
                  <p className="text-xs text-gray-500">Target Teal</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-lg bg-primary"></div>
                  <p className="mt-2 text-sm">bg-primary</p>
                  <p className="text-xs text-gray-500">CSS Variable</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-lg bg-teal-500"></div>
                  <p className="mt-2 text-sm">bg-teal-500</p>
                  <p className="text-xs text-gray-500">Tailwind Teal</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-lg bg-secondary"></div>
                  <p className="mt-2 text-sm">bg-secondary</p>
                  <p className="text-xs text-gray-500">Secondary Color</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
