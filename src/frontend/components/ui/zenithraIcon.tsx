type ZenithraIconProps = {
  className?: string;
  size?: number;
  alt?: string;
};

export function ZenithraIcon({ className = "", size = 48, alt = "Zenithra" }: ZenithraIconProps) {
  return (
    <img
      className={className}
      height={size}
      src="/public/zenithra.png"
      width={size}
      alt={alt}
    />
  );
}
