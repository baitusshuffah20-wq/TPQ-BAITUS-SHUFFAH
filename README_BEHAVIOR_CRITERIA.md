# 🎯 Behavior Criteria Management System - Quick Start

## 🚀 **Quick Setup (5 Minutes)**

### **Prerequisites:**

- ✅ XAMPP dengan MySQL running
- ✅ Node.js dan npm installed
- ✅ Next.js project sudah setup

### **Step 1: Install Dependencies**

```bash
# Install required packages
npm install mysql2 zod

# Install test dependencies (optional)
npm install node-fetch
```

### **Step 2: Setup Database**

```bash
# Run automated setup
scripts\setup-behavior-tables.bat

# Or manual setup:
# 1. Start XAMPP MySQL
# 2. Create database: tpq_baitus_shuffahh
# 3. Run: database\migrations\create_behavior_tables_clean.sql
```

### **Step 3: Test System**

```bash
# Test database connection
node scripts\test-database-connection.js

# Test API endpoints (server must be running)
npm run dev
node scripts\test-behavior-api.js
```

### **Step 4: Access Interface**

1. Start server: `npm run dev`
2. Login as Admin
3. Navigate to: **Dashboard → Kriteria Perilaku**
4. URL: `http://localhost:3000/dashboard/admin/behavior/criteria`

---

## 📋 **Features Overview**

### **✨ What You Can Do:**

- 📝 **Create** new behavior criteria with Islamic references
- 👁️ **View** detailed criteria information
- ✏️ **Edit** existing criteria
- 🗑️ **Delete** unused criteria
- 🔍 **Search** criteria by name/description
- 🏷️ **Filter** by category, type, status
- 📊 **Track** usage statistics
- 🔄 **Toggle** active/inactive status

### **🎨 Categories Available:**

- 🌟 **AKHLAQ** - Moral character
- 🕌 **IBADAH** - Worship practices
- 📚 **ACADEMIC** - Learning behavior
- 👥 **SOCIAL** - Social interactions
- ⚖️ **DISCIPLINE** - Rules and order
- 👑 **LEADERSHIP** - Leadership qualities

### **📊 Types Available:**

- ✅ **POSITIVE** - Good behaviors (with rewards)
- ❌ **NEGATIVE** - Bad behaviors (with consequences)
- ➖ **NEUTRAL** - Observational behaviors

---

## 🧪 **Testing Checklist**

### **✅ Quick Test (2 minutes):**

```bash
# 1. Test database
node scripts\test-database-connection.js

# 2. Test API (server running)
node scripts\test-behavior-api.js

# 3. Open browser
# http://localhost:3000/dashboard/admin/behavior/criteria
```

### **✅ Full Test (5 minutes):**

```bash
# Comprehensive test suite
node scripts\test-full-functionality.js
```

---

## 🔧 **Common Issues & Solutions**

### **❌ "Table behavior_criteria does not exist"**

```bash
# Solution:
scripts\setup-behavior-tables.bat
```

### **❌ "Cannot connect to MySQL"**

```bash
# Solution:
# 1. Start XAMPP MySQL service
# 2. Check port 3306 is free
# 3. Verify database credentials
```

### **❌ "API endpoints not working"**

```bash
# Solution:
# 1. Start Next.js server: npm run dev
# 2. Check http://localhost:3000/api/behavior-criteria
# 3. Check console for errors
```

### **❌ "Form validation errors"**

```bash
# Solution:
# 1. Fill all required fields (marked with *)
# 2. Add at least one example behavior
# 3. Check console for detailed errors
```

---

## 📁 **File Structure**

```
src/
├── app/api/behavior-criteria/
│   ├── route.ts                 # Main API endpoints
│   └── [id]/route.ts           # Single criteria API
├── app/dashboard/admin/behavior/criteria/
│   └── page.tsx                # Admin interface
├── components/behavior/
│   ├── BehaviorCriteriaForm.tsx    # Add/Edit form
│   └── BehaviorCriteriaDetail.tsx  # Detail modal
scripts/
├── setup-behavior-tables.bat      # Database setup
├── test-database-connection.js    # DB test
├── test-behavior-api.js          # API test
├── test-full-functionality.js    # Full test
└── run-all-tests.bat            # All tests
database/migrations/
└── create_behavior_tables_clean.sql # DB schema
docs/
└── BEHAVIOR_CRITERIA_MANAGEMENT.md  # Full documentation
```

---

## 🎯 **Usage Examples**

### **Creating a Positive Criteria:**

```json
{
  "name": "Jujur",
  "nameArabic": "الصدق",
  "description": "Berkata dan bertindak dengan jujur",
  "category": "AKHLAQ",
  "type": "POSITIVE",
  "points": 5,
  "examples": ["Mengakui kesalahan", "Tidak berbohong"],
  "rewards": ["Pujian", "Sticker bintang"],
  "islamicReference": {
    "hadith": "عليكم بالصدق فإن الصدق يهدي إلى البر",
    "explanation": "Hendaklah kalian berlaku jujur..."
  }
}
```

### **Creating a Negative Criteria:**

```json
{
  "name": "Terlambat",
  "nameArabic": "التأخير",
  "description": "Datang terlambat ke TPQ",
  "category": "DISCIPLINE",
  "type": "NEGATIVE",
  "points": -2,
  "examples": ["Datang > 15 menit terlambat"],
  "consequences": ["Teguran", "Membersihkan kelas"]
}
```

---

## 🆘 **Need Help?**

### **📚 Documentation:**

- **Full Guide:** `docs/BEHAVIOR_CRITERIA_MANAGEMENT.md`
- **API Reference:** Available in documentation
- **Database Schema:** Included in migration files

### **🧪 Testing:**

- **Quick Test:** `node scripts\test-database-connection.js`
- **API Test:** `node scripts\test-behavior-api.js`
- **Full Test:** `node scripts\test-full-functionality.js`

### **🔍 Debugging:**

- Check browser console for errors
- Check server console for API logs
- Use network tab to inspect API calls
- Verify database connection and data

---

## 🎉 **Success!**

If you can:

- ✅ Access the admin page without errors
- ✅ Create a new criteria successfully
- ✅ Search and filter criteria
- ✅ Edit and delete criteria

**Congratulations! Your Behavior Criteria Management System is working perfectly! 🎊**

---

**Happy managing! 🚀**
