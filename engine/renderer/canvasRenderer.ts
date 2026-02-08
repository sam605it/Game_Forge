import { GameSpec, Entity } from "../spec/gameSpec";

const drawEntityShape = (ctx: CanvasRenderingContext2D, entity: Entity) => {
  ctx.fillStyle = entity.color ?? "#94a3b8";
  if (entity.shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(entity.pos.x, entity.pos.y, entity.shape.r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const x = entity.pos.x - entity.shape.w / 2;
  const y = entity.pos.y - entity.shape.h / 2;
  ctx.fillRect(x, y, entity.shape.w, entity.shape.h);
};

const drawEntityIcon = (ctx: CanvasRenderingContext2D, entity: Entity) => {
  const icon = entity.meta?.iconEmoji;
  if (!icon) {
    return;
  }

  const base =
    entity.shape.type === "circle"
      ? entity.shape.r * 2
      : Math.max(entity.shape.w, entity.shape.h);
  const size = Math.max(14, Math.floor(base * 1.2));

  ctx.save();
  ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, entity.pos.x, entity.pos.y);
  ctx.restore();
};

export const renderGameSpec = (
  ctx: CanvasRenderingContext2D,
  spec: GameSpec
) => {
  ctx.clearRect(0, 0, spec.world.w, spec.world.h);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, spec.world.w, spec.world.h);

  spec.entities.forEach((entity) => {
    drawEntityShape(ctx, entity);
    drawEntityIcon(ctx, entity);
  });
};
