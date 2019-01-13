import Config from "../config"
import DelaunaySketch from "./delaunaySketch"

export default class Particle {
  x: number
  y: number
  radius: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.radius = 6
  }

  draw(ctx: CanvasRenderingContext2D, sketch: DelaunaySketch) {
    ctx.beginPath()

    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = Config.colors.lines
    ctx.fill()
    ctx.lineWidth = 1 // I'd like to set with CSS
    ctx.strokeStyle = Config.colors.lines
    ctx.stroke()
  }
}
