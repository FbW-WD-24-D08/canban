# 🎨 Canban Design System Documentation

## Overview

Canban features a sophisticated dual-design system that seamlessly blends modern dark UI aesthetics with MeisterTask's clean, light interface patterns. This documentation outlines our design philosophy, component architecture, and visual guidelines.

---

## 🌟 Design Philosophy

### **Dual Theme Architecture**

- **Dark Theme Foundation**: Primary interface uses elegant dark zinc palette for reduced eye strain and modern aesthetics
- **MeisterTask Light Cards**: Task cards use clean white/light backgrounds for optimal readability and professional appearance
- **Seamless Integration**: Both themes work harmoniously together, creating visual hierarchy and focus

### **Visual Hierarchy Principles**

1. **Contrast-Driven Focus**: Light task cards against dark backgrounds create natural focal points
2. **Color Psychology**: Meaningful color coding for priorities, statuses, and due dates
3. **Progressive Disclosure**: Information revealed through hover states and contextual interactions

---

## 🎯 MeisterTask Clone Features

### **Priority System**

- **Urgent**: `#F44336` (Red) - Immediate attention required
- **High**: `#FF9800` (Orange) - Important tasks with near-term deadlines
- **Medium**: `#FFC107` (Amber) - Standard priority level
- **Low**: `#4CAF50` (Green) - Nice-to-have or future tasks

### **Due Date Intelligence**

- **Overdue**: Red indicators with alert icons
- **Due Soon**: Orange warnings for tasks due within 24 hours
- **Normal**: Neutral gray for future due dates
- **Completed**: Green checkmarks for finished tasks
- **Smart Formatting**: "Today", "Tomorrow", "Dec 25" for intuitive understanding

### **Progress Visualization**

- **Checklist Progress**: Visual counters (2/4) with completion percentages
- **Progress Bars**: Animated bars showing task completion status
- **Color Transitions**: Green for complete, teal for in-progress

---

## 🎨 Color Palette

### **Primary Dark Theme**

```css
/* Background Layers */
--bg-primary: #18181b /* zinc-900 */ --bg-secondary: #27272a /* zinc-800 */
  --bg-tertiary: #3f3f46 /* zinc-700 */ /* Text Hierarchy */
  --text-primary: #ffffff /* Pure white */ --text-secondary: #a1a1aa
  /* zinc-400 */ --text-muted: #71717a /* zinc-500 */ /* Borders & Dividers */
  --border-primary: #3f3f46 /* zinc-700 */ --border-secondary: #52525b
  /* zinc-600 */;
```

### **MeisterTask Light Cards**

```css
/* Card Backgrounds */
--card-bg-light: #ffffff --card-bg-dark: #27272a /* zinc-800 */ /* Card Text */
  --card-text-light: #18181b /* zinc-900 */ --card-text-dark: #ffffff
  --card-desc: #71717a /* zinc-500 */ /* Card Borders */
  --card-border-light: #e4e4e7 /* zinc-200 */ --card-border-dark: #52525b
  /* zinc-600 */;
```

### **Accent Colors**

```css
/* Primary Actions */
--accent-primary: #14b8a6 /* teal-500 */ --accent-hover: #0d9488 /* teal-600 */
  /* Status Colors */ --status-todo: #3b82f6 /* blue-500 */
  --status-progress: #f59e0b /* amber-500 */ --status-done: #10b981
  /* emerald-500 */;
```

---

## 🧩 Component Architecture

### **TaskCard Component**

The crown jewel of our design system, featuring conditional rendering based on board type:

#### **MeisterTask Enhanced Layout**

```typescript
{isMeisterTask ? (
  <div className="space-y-3">
    {/* Priority Badge + Avatar Row */}
    <div className="flex items-center justify-between">
      <PriorityBadge priority={task.priority} />
      <AvatarGroup assignees={assignees} />
      <DueDateIndicator dueDate={task.dueDate} />
    </div>

    {/* Meta Information */}
    <div className="flex items-center justify-between">
      <ChecklistProgress completed={2} total={4} />
      <AttachmentCount count={3} />
    </div>

    {/* Progress Bar */}
    <ProgressBar completion={50} />
  </div>
) : (
  /* Regular dark theme layout */
)}
```

#### **Visual States**

- **Default**: Clean, minimal appearance with subtle shadows
- **Hover**: Gentle scale transform (1.02x) with enhanced shadow
- **Focus**: Teal ring for keyboard navigation
- **Dragging**: Rotation effect with enhanced shadow and teal border

### **Avatar System**

Colorful, consistent avatar generation with smart fallbacks:

```typescript
// Color hash algorithm ensures consistent colors per user
function getAvatarColor(name: string): string {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1" /* ... */];
  const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

### **Priority Badge System**

Semantic color coding with accessibility considerations:

- **Visual Hierarchy**: Size variants (sm, md, lg) for different contexts
- **Tooltips**: Rich hover information with keyboard support
- **Color Blind Friendly**: Distinct shapes and patterns beyond color

---

## 📱 Responsive Design

### **Breakpoint Strategy**

- **Mobile First**: Base styles optimized for mobile devices
- **Progressive Enhancement**: Desktop features layered on top
- **Touch Targets**: Minimum 44px for interactive elements
- **Readable Text**: Minimum 16px font size on mobile

### **Layout Adaptations**

- **Card Grids**: Responsive column counts based on viewport
- **Avatar Groups**: Collapse to show fewer avatars on small screens
- **Priority Badges**: Maintain readability across all sizes

---

## 🎭 Animation & Interactions

### **Micro-Interactions**

- **Card Hover**: `transform: scale(1.02)` with 200ms ease
- **Button States**: Smooth color transitions (150ms)
- **Progress Bars**: Animated width changes (300ms ease-out)
- **Tooltip Reveals**: Fade in with 300ms delay

### **Drag & Drop Feedback**

- **Dragging State**: 2-degree rotation with enhanced shadow
- **Drop Zones**: Subtle background color changes
- **Success Feedback**: Brief scale pulse on successful drop

---

## ♿ Accessibility Features

### **Keyboard Navigation**

- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: High-contrast teal rings
- **Escape Hatches**: ESC key closes modals and dropdowns

### **Screen Reader Support**

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for complex interactions
- **Live Regions**: Status updates announced to screen readers

### **Color Contrast**

- **WCAG AA Compliance**: 4.5:1 contrast ratio minimum
- **Focus Indicators**: 3:1 contrast ratio for focus states
- **Error States**: Multiple indicators beyond color

---

## 🔧 Implementation Guidelines

### **CSS Architecture**

- **Tailwind CSS 4.1**: Utility-first approach with custom components
- **CSS Variables**: Dynamic theming support
- **Component Variants**: Consistent API across all components

### **TypeScript Integration**

```typescript
interface TaskCardProps {
  task: Task;
  isMeisterTask?: boolean; // Feature flag for enhanced layout
  onUpdated?: () => void;
  isDoneColumn?: boolean;
  isArchived?: boolean;
}
```

### **Performance Considerations**

- **Lazy Loading**: Large lists virtualized for performance
- **Optimistic Updates**: Immediate UI feedback before API response
- **Memoization**: React.memo for expensive components

---

## 🚀 Future Enhancements

### **Phase 2: Tag System**

- Color-coded tag chips with category management
- Smart tag suggestions based on content
- Bulk tagging operations

### **Phase 3: Advanced Due Dates**

- Recurring task patterns
- Smart scheduling suggestions
- Calendar integration

### **Phase 4: Real-time Collaboration**

- Live cursors and selections
- Real-time comment system
- Presence indicators

---

## 📊 Design Metrics

### **Performance Targets**

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### **User Experience Goals**

- **Task Creation**: < 3 seconds from intent to completion
- **Navigation**: < 1 second between board views
- **Search**: < 500ms for results display

---

_This design system represents the culmination of modern web design principles, accessibility best practices, and user-centered design thinking. Every component has been crafted to provide an exceptional user experience while maintaining development efficiency and scalability._
