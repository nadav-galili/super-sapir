import { APP_NAME, BRAND_LOGO_SRC } from "@/lib/branding";

interface BrandLogoProps {
  /** Rendered logo height in pixels. Width follows the image's aspect ratio. */
  size?: number;
  /**
   * When false, crops to a square showing only the icon (left) portion
   * of the wide logo. Used by the collapsed sidebar.
   */
  showName?: boolean;
  /** Kept for API compatibility; the wordmark is baked into the image. */
  compact?: boolean;
  className?: string;
}

export function BrandLogo({
  size = 48,
  showName = true,
  className = "",
}: BrandLogoProps) {
  if (!showName) {
    // Icon-only: square box that frames the leftmost icon area of the
    // wide logo. The image is height-scaled and shifted so the icon
    // sits centered in the square.
    return (
      <div
        dir="ltr"
        className={`shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label={APP_NAME}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt={APP_NAME}
          className="block max-w-none"
          style={{
            height: size,
            width: "auto",
            transform: `translateX(-${Math.round(size * 0.18)}px)`,
          }}
        />
      </div>
    );
  }

  // Wrap the img in an inline-flex container so a flex-col parent
  // (e.g. SidebarHeader) doesn't stretch the image horizontally and
  // smear the wordmark out of proportion.
  return (
    <div
      dir="ltr"
      className={`inline-flex shrink-0 items-center self-start ${className}`}
      style={{ height: size }}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt={APP_NAME}
        className="block max-w-none"
        style={{ height: size, width: "auto" }}
      />
    </div>
  );
}
