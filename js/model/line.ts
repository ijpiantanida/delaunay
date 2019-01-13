import Particle from "./particle"
import Config from "../config"
import Sketch from "./delaunaySketch"

export default class Line {
  a: Particle
  b: Particle

  constructor(a: Particle, b: Particle) {
    this.a = a
    this.b = b
  }

  draw(ctx: CanvasRenderingContext2D, sketch: Sketch) {
    ctx.beginPath()
    ctx.lineWidth = 1 // I'd like to set with CSS
    ctx.strokeStyle = Config.colors.lines
    ctx.moveTo(this.a.x, this.a.y)
    ctx.lineWidth = 2
    ctx.lineTo(this.b.x, this.b.y)
    ctx.stroke()
  }

  shareParticle(other: Line) {
    return this.a == other.a || this.a == other.b || this.b == other.a || this.b == other.b
  }

  equal(other: Line) {
    return (this.a == other.a && this.b == other.b) || (this.a == other.b && this.b == other.a)
  }

  intersect(other: Line) {
    if(this.a == other.a || this.a == other.b || this.b == other.a || this.b == other.b) {
      return false;
    }
    return this.lineIntersect(this.a.x, this.a.y, this.b.x, this.b.y, other.a.x, other.a.y, other.b.x, other.b.y);
  }

  lineIntersect(x1: number,y1: number,x2: number,y2: number, x3: number,y3: number,x4: number,y4: number) {
    var a_dx = x2 - x1;
    var a_dy = y2 - y1;
    var b_dx = x4 - x3;
    var b_dy = y4 - y3;
    var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
    var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
  }
}
