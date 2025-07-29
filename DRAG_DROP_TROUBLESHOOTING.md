# 🔧 Drag & Drop Troubleshooting Guide

## 🐛 Masalah yang Diperbaiki

### 1. **Tidak Ada Device Android**

**Masalah**: Hanya tersedia iPhone, iPad, dan Desktop
**Solusi**: Menambahkan device Android ke DEVICE_PRESETS

```typescript
const DEVICE_PRESETS = [
  { name: "iPhone SE", width: 375, height: 667, icon: Smartphone },
  { name: "iPhone 12", width: 390, height: 844, icon: Smartphone },
  { name: "iPhone 12 Pro Max", width: 428, height: 926, icon: Smartphone },
  { name: "Android", width: 360, height: 640, icon: Smartphone }, // ✅ BARU
  { name: "Android Large", width: 412, height: 732, icon: Smartphone }, // ✅ BARU
  { name: "iPad", width: 768, height: 1024, icon: Tablet },
  { name: "iPad Pro", width: 1024, height: 1366, icon: Tablet },
  { name: "Desktop", width: 1200, height: 800, icon: Monitor },
];
```

### 2. **Drag & Drop Tidak Berfungsi**

**Masalah**: Komponen tidak bisa di-drag ke canvas
**Penyebab**: Canvas tidak memiliki droppable area yang benar

**Solusi yang Diterapkan**:

#### A. Menambahkan useDroppable Import

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
  useDroppable, // ✅ DITAMBAHKAN
} from "@dnd-kit/core";
```

#### B. Implementasi Droppable di Canvas

```typescript
const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  components,
  selectedComponentId,
  onComponentSelect,
  onComponentDelete,
  canvasSize,
  zoom
}) => {
  // ✅ DITAMBAHKAN: useDroppable hook
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
    data: {
      type: 'canvas'
    }
  });

  return (
    <div className="h-full bg-gray-100 p-4 overflow-auto">
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <motion.div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Canvas Content */}
          <div
            ref={setNodeRef}  // ✅ DITAMBAHKAN: droppable ref
            className={`p-4 min-h-[500px] relative transition-colors ${
              isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''  // ✅ Visual feedback
            }`}
            onClick={() => onComponentSelect('')}
          >
            {/* Canvas content */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
```

#### C. Perbaikan handleDragEnd Logic

```typescript
const handleDragEnd = useCallback(
  (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setBuilderState((prev) => ({
        ...prev,
        draggedComponent: null,
      }));
      return;
    }

    // ✅ DIPERBAIKI: Pastikan drop hanya terjadi di canvas
    if (active.data.current?.definition && over.id === "canvas") {
      const definition = active.data.current.definition as ComponentDefinition;
      const newComponent: ComponentData = {
        id: `${definition.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: definition.type,
        props: { ...definition.defaultProps },
      };

      const newComponents = [...builderState.components, newComponent];
      setBuilderState((prev) => ({
        ...prev,
        components: newComponents,
        selectedComponentId: newComponent.id,
      }));
      addToHistory(newComponents);
    }

    setBuilderState((prev) => ({
      ...prev,
      draggedComponent: null,
    }));
  },
  [builderState.components],
);
```

## 🎯 Fitur yang Ditambahkan

### 1. **Visual Feedback**

- Border biru dashed saat drag over canvas
- Background biru muda saat hover
- Transisi smooth untuk perubahan visual

### 2. **Device Android Support**

- Android standar (360x640)
- Android Large (412x732)
- Icon smartphone yang konsisten

### 3. **Improved Drop Logic**

- Validasi drop area (hanya canvas)
- Error handling untuk drop gagal
- Auto-select komponen baru setelah drop

## 🧪 Testing

### Cara Test Drag & Drop:

1. Buka halaman builder: `/dashboard/admin/mobile-app-generator/builder`
2. Pilih device Android dari toolbar
3. Drag komponen dari library (kiri) ke canvas (tengah)
4. Pastikan visual feedback muncul saat drag over canvas
5. Komponen harus muncul di canvas setelah drop

### Expected Behavior:

- ✅ Komponen bisa di-drag dari library
- ✅ Canvas menampilkan visual feedback saat drag over
- ✅ Komponen muncul di canvas setelah drop
- ✅ Komponen baru otomatis ter-select
- ✅ Device Android tersedia di toolbar

## 📁 File yang Dimodifikasi

1. **src/components/mobile-app-builder/CanvasToolbar.tsx**
   - Menambahkan device Android ke DEVICE_PRESETS

2. **src/components/mobile-app-builder/DragDropBuilder.tsx**
   - Import useDroppable
   - Implementasi droppable di DroppableCanvas
   - Perbaikan handleDragEnd logic
   - Visual feedback untuk drag over

## 🚀 Next Steps

Jika masih ada masalah:

1. Check console untuk error messages
2. Pastikan @dnd-kit dependencies ter-install dengan benar
3. Verify sensor configuration di DndContext
4. Test dengan browser yang berbeda
