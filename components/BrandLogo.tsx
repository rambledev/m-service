import Image from "next/image";

export default function BrandLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo_rmu.png"
      alt="ตราสัญลักษณ์มหาวิทยาลัยราชภัฏมหาสารคาม"
      width={size}
      height={size}
      priority
      className={`shrink-0 rounded-full object-cover shadow-sm ${className}`}
    />
  );
}
