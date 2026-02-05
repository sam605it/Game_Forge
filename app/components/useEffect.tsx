let ball = { x: hole.start.x, y: hole.start.y, vx: 0, vy: 0 }

canvas.onclick = (e) => {
  const dx = e.offsetX - ball.x
  const dy = e.offsetY - ball.y
  ball.vx = dx * 0.05
  ball.vy = dy * 0.05
}

setInterval(() => {
  ball.x += ball.vx
  ball.y += ball.vy
  ball.vx *= 0.98
  ball.vy *= 0.98
}, 16)

const renderers = {
  miniGolf: MiniGolfRenderer,
  platformer: PlatformerRenderer,
  shooter: ShooterRenderer,
}

const Renderer = renderers[game.type]
return <Renderer game={game} />
