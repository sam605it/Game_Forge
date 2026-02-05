import { ICONS } from "@/app/shared/icons/iconRegistry";

const ICON_SIZE = 64;

export function drawIcon(
  ctx: CanvasRenderingContext2D,
  spriteSheet: HTMLImageElement,
  iconId: string,
  x: number,
  y: number,
  size = ICON_SIZE,
) {
  const icon = ICONS[iconId];
  if (!icon) return;

  ctx.drawImage(
    spriteSheet,
    icon.col * ICON_SIZE,
    icon.row * ICON_SIZE,
    ICON_SIZE,
    ICON_SIZE,
    x,
    y,
    size,
    size,
  );
}
