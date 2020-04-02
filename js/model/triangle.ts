import Line from "./line"
import Particle from "./particle"
import Sketch from "./delaunaySketch"
import Config from "../config"
import {RGBColor} from "./gradient"

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
    const o1 = this.getOrientationResult(this.p1.x, this.p1.y, this.p2.x, this.p2.y, p.x, p.y)
    const o2 = this.getOrientationResult(this.p2.x, this.p2.y, this.p3.x, this.p3.y, p.x, p.y)
    const o3 = this.getOrientationResult(this.p3.x, this.p3.y, this.p1.x, this.p1.y, p.x, p.y)

    return (o1 == o2) && (o2 == o3);
  }

  getOrientationResult(x1: number, y1: number, x2: number, y2: number, px: number, py: number) {
    const orientation = ((x2 - x1) * (py - y1)) - ((px - x1) * (y2 - y1))
    if (orientation > 0) {
      return 1
    } else if (orientation < 0) {
      return -1
    } else {
      return 0
    }
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

    let fillColorRGB: RGBColor
    if (Config.colors.fill) {
      if (Config.imageMesh.enabled && sketch.mesher.loaded) {
        const pixelData = sketch.mesher.getPixel(center.x, center.y)
        fillColorRGB = [pixelData[0], pixelData[1], pixelData[2]]

        const pixelsToAverage = []
        pixelsToAverage.push(sketch.mesher.getPixel(center.x, center.y))
        pixelsToAverage.push(sketch.mesher.getPixel(this.p1.x, this.p1.y))
        pixelsToAverage.push(sketch.mesher.getPixel(this.p2.x, this.p2.y))
        pixelsToAverage.push(sketch.mesher.getPixel(this.p3.x, this.p3.y))

        const squared = pixelsToAverage.reduce((previous, current) => {
          return [previous[0] + current[0]**2, previous[1] + current[1]**2, previous[2] + current[2]**2, previous[3] + current[3]**2]
        }, [0,0,0,0])

        const averageColor = [Math.sqrt(squared[0]/ pixelsToAverage.length), Math.sqrt(squared[1]/ pixelsToAverage.length), Math.sqrt(squared[2]/ pixelsToAverage.length), Math.sqrt(squared[3]/ pixelsToAverage.length)]
        fillColorRGB = [averageColor[0], averageColor[1], averageColor[2]]
      } else {
        fillColorRGB = Config.colors.gradient.colorFor(center.x)
      }
      ctx.fillStyle = "rgb(" + fillColorRGB[0] + "," + fillColorRGB[1] + "," + fillColorRGB[2] + ")"
      ctx.fill()
    } else {
      ctx.lineWidth = 2
      ctx.strokeStyle = Config.colors.lines
      ctx.stroke()
    }
  }
}
