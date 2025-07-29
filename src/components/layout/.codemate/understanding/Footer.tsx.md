## High-Level Documentation: Footer Component

### **Overview**

This React component renders the footer section of a website, specifically for "TPQ Baitus Shuffah", an Islamic educational institution focused on Quran memorization. The component is styled using modern Tailwind CSS classes and utilizes iconography from `lucide-react`. It is intended to be used in a Next.js application.

---

### **Main Features**

1. **Branding & Description**
   - Displays the institution's logo and name.
   - Brief description of the organization's mission.
   - Contact information including address, phone, and email, each with representative icons.

2. **Navigation Links**
   - **Quick Links:** Provides a list of important site pages (About, Programs, Registration, News, Gallery, Contact).
   - **Programs:** Lists the available educational programs with navigation links.

3. **Statistics & Social Media**
   - Shows key statistics (number of active students, graduates, years of experience) using icons.
   - Social media buttons (Facebook, Instagram, YouTube) provided as icon buttons with hover effects.

4. **Legal Links & Copyright**
   - Displays the current year dynamically.
   - Offers links to Privacy Policy, Terms & Conditions, and Sitemap.
   - Styled separation between main content and legal/navigation links.

---

### **Implementation Details**

- **Responsive Design:**  
  Uses a responsive grid layout for desktop, tablet, and mobile.
- **Iconography:**  
  Icons are imported from `"lucide-react"` for visual clarity and consistency.
- **Next.js Routing:**  
  Internal navigation uses Next.js `<Link>` component for client-side navigation.
- **Styling:**  
  Tailwind CSS used extensively for spacing, coloring, layout, and responsive design.

---

### **Usage**

- **Import:**  
  Place `<Footer />` at the bottom of your layout or page.
- **Customization:**
  - Update organizational info, program offerings, statistical data, or social media links as needed.
  - Adjust Tailwind classes for custom visual styles.

---

### **Extensibility**

- Additional links, contact details, or social networks can easily be added.
- The quick links, programs, and social links are all data-driven, allowing for simple updates or modifications.
- All text and links are easily localizable to other languages.

---

### **Summary**

This is a modular, easily maintainable, and visually consistent footer component suitable for educational websites, featuring organization branding, navigational aids, statistics, and accessible contact information.
