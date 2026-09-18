type SignArtwork = {
  title: string;
  subtitle: string;
  width: number;
  height: number;
  color: string;
  background: string;
  border: boolean;
};

export function createSignCanvas({
  title,
  subtitle,
  width,
  height,
  color,
  background,
  border,
}: SignArtwork) {
  const canvas = document.createElement("canvas");
  // Match the physical panel's aspect ratio. Stretching a shared 4:1 image
  // distorts everything from the nearly square kiosks to the thin police tape.
  const aspect = width / height;
  canvas.height = Math.round(Math.min(384, 4096 / aspect));
  canvas.width = Math.round(canvas.height * aspect);
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const inset = h * 0.06;
  const textWidth = w - Math.max(w * 0.12, h * 0.24);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(1, h * 0.006);
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const font = (size: number, weight: number) => {
    ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  };
  const drawLine = (text: string, y: number, size: number, weight: number) => {
    font(size, weight);
    const measuredWidth = ctx.measureText(text).width;
    font(size * Math.min(1, textWidth / Math.max(1, measuredWidth)), weight);
    const metrics = ctx.measureText(text);
    const baseline =
      y +
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    // fillText's maxWidth parameter compresses glyphs horizontally. Change the
    // font size instead, preserving the typeface's natural width and height.
    ctx.fillText(text, w / 2, baseline);
  };

  // Compact laptop/kiosk screens need a short second line, not tiny condensed
  // lettering. Split at the most balanced word boundary when a subtitle wraps.
  let subtitleLines = subtitle ? [subtitle] : [];
  font(h * 0.18, 400);
  if (subtitle && ctx.measureText(subtitle).width > textWidth) {
    const words = subtitle.split(" ");
    let bestWidth = Infinity;
    for (let i = 1; i < words.length; i++) {
      const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
      const widest = Math.max(
        ...lines.map((line) => ctx.measureText(line).width),
      );
      if (widest < bestWidth) {
        subtitleLines = lines;
        bestWidth = widest;
      }
    }
  }
  drawLine(
    title,
    h * (subtitle ? 0.37 : 0.5),
    h * (subtitle ? 0.44 : 0.72),
    600,
  );
  subtitleLines.forEach((line, i) => {
    const y = subtitleLines.length === 1 ? 0.72 : 0.63 + i * 0.19;
    drawLine(line, h * y, h * 0.18, 400);
  });
  return canvas;
}
