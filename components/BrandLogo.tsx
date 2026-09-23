import Image from "next/image";

export default function BrandLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-service.png"
      alt="โลโก้ระบบแจ้งซ่อม ฝ่ายงานอาคารและสถานที่ มหาวิทยาลัยราชภัฏมหาสารคาม"
      width={size}
      height={size}
      priority
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
