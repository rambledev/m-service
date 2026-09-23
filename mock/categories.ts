import { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "electric", label: "งานไฟฟ้า", icon: "⚡", colorVar: "--cat-electric" },
  { id: "plumbing", label: "งานประปา", icon: "🚰", colorVar: "--cat-plumbing" },
  { id: "aircon", label: "เครื่องปรับอากาศ", icon: "❄️", colorVar: "--cat-aircon" },
  { id: "building", label: "อาคารสถานที่", icon: "🏢", colorVar: "--cat-building" },
  { id: "computer", label: "คอมพิวเตอร์", icon: "💻", colorVar: "--cat-computer" },
  { id: "elevator", label: "ลิฟต์", icon: "🛗", colorVar: "--cat-elevator" },
  { id: "equipment", label: "ครุภัณฑ์", icon: "📦", colorVar: "--cat-equipment" },
  { id: "other", label: "อื่น ๆ", icon: "❓", colorVar: "--cat-other" },
];

export function getCategory(id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[categories.length - 1];
}
