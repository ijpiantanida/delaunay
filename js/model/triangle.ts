import Line from "./line"
import Particle from "./particle"
import Sketch from "./delaunaySketch"
import Config from "../config"

export default class Triangle {
  l1: Line
  l2: Line
  l3: Line
  p1: Particle
  p2: Particle
  p3: Particle

  constructor(l1: Line, l2: Line, l3: Line) {
    this.l1 = l1
    this.l2 = l2
    this.l3 = l3

    const points = new Set()
    points.add(l1.a)
    points.add(l1.b)
    points.add(l2.a)
    points.add(l2.b)
    points.add(l3.a)
    points.add(l3.b)

    let ps = points.values()
    this.p1 = ps.next().value
    this.p2 = ps.next().value
    this.p3 = ps.next().value
  }

  contains(p: Particle) {
    const A = 1 / 2 * (-this.p2.y * this.p3.x + this.p1.y * (-this.p2.x + this.p3.x) + this.p1.x * (this.p2.y - this.p3.y) + this.p2.x * this.p3.y)
    const sign = A < 0 ? -1 : 1
    const s = (this.p1.y * this.p3.x - this.p1.x * this.p3.y + (this.p3.y - this.p1.y) * p.x + (this.p1.x - this.p3.x) * p.y) * sign
    const t = (this.p1.x * this.p2.y - this.p1.y * this.p2.x + (this.p1.y - this.p2.y) * p.x + (this.p2.x - this.p1.x) * p.y) * sign

    return s > 0 && t > 0 && (s + t) < 2 * A * sign
  }

  lines() {
    return [this.l1, this.l2, this.l3]
  }

  points() {
    return [this.p1, this.p2, this.p3]
  }

  center() {
    const points = this.points()
    return points.reduce((previous, current) => {
      return {x: previous.x + current.x / points.length, y: previous.y + current.y / points.length}
    }, {x: 0, y: 0})
  }

  draw(ctx: CanvasRenderingContext2D, sketch: Sketch) {
    const points = this.points()
    const center = this.center()

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const p = points[i]
      ctx.lineTo(p.x, p.y)
    }
    ctx.closePath()


    if (Config.colors.fill) {
      const fillColorRGB = Config.colors.gradient.colorFor(center.x)
      const fillColorS = "rgb(" + fillColorRGB[0] + "," + fillColorRGB[1] + "," + fillColorRGB[2] + ")"
      ctx.fillStyle = fillColorS
      ctx.fill()
    } else {
      ctx.lineWidth = 2
      ctx.strokeStyle = Config.colors.lines
      ctx.stroke()
    }

  }
}
