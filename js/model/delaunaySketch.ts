import Particle from "./particle"
import Line from "./line"
import Triangle from "./triangle"
import Random from "../random"
import Config from "../config"
import ImageMesher from "./imageMesher"
import Circle from "./circle"

const CIRCLE_RADIUS = 200

export default class DelaunaySketch {
  container: HTMLElement
  N_PARTICLES: number
  minDist2: number
  containerHeight: any
  containerWidth: any

  particles: Particle[]
  lines: Line[]
  triangles: Triangle[]
  initialTriangle?: Triangle

  context?: CanvasRenderingContext2D
  urlParams: URLSearchParams
  state: {
    mouseXPx: number,
    mouseYPx: number
  }
  mesher: ImageMesher
  private onTriangulateCallback?: () => void
  random: Random
  private mouseCircleEl: HTMLElement

  constructor(container: HTMLCanvasElement, mesher: ImageMesher) {
    this.random = new Random()
    this.container = container
    this.setupCanvas(container)
    this.containerWidth = container.clientWidth
    this.containerHeight = container.clientHeight
    this.mesher = mesher

    this.urlParams = new URLSearchParams(window.location.search)

    this.mouseCircleEl = document.getElementById("mouse-circle")
    this.mouseCircleEl.style.height = (CIRCLE_RADIUS * 2).toString()
    this.mouseCircleEl.style.width = (CIRCLE_RADIUS * 2).toString()
    this.mouseCircleEl.style.borderRadius = CIRCLE_RADIUS.toString() + "px"

    this.state = {
      mouseXPx: 0,
      mouseYPx: 0
    }
    container.addEventListener("mousemove", this.onMouseMove.bind(this))
    container.addEventListener("click", this.onMouseClick.bind(this))
    document.addEventListener("keydown", this.onKeyDown.bind(this))
    document.addEventListener("keyup", this.onKeyUp.bind(this))
  }

  calculateParametersFromCanvasSize() {
    const area = this.containerHeight * this.containerWidth
    const factor = Math.sqrt(area)
    const minDist2 = (factor * (Config.parameters.minDistFactor / 1000)) ** 2
    const nParticles = Math.floor(area * Config.parameters.density / 1e6)
    return {minDist2, nParticles}
  }

  setupCanvas(container: HTMLCanvasElement) {
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    const rect = container.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    container.width = rect.width * dpr
    container.height = rect.height * dpr

    const ctx = this.context = container.getContext("2d") as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = true
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr)
    return ctx
  }

  onMouseClick(ev: MouseEvent) {
    const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect()
    const mouseX = ev.clientX - rect.left //x position within the element.
    const mouseY = ev.clientY - rect.top

    const circle = new Circle(mouseX, mouseY, CIRCLE_RADIUS)
    const addParticles = (numberOfNewParticles: number) => {
      for (let i = 0; i < numberOfNewParticles; i++) {
        const particleToAdd = circle.getRandomPoint(this.random)
        this.particles.push(particleToAdd)
      }
    }

    if (ev.shiftKey) {
      this.particles = this.particles.filter(p => !circle.contains(p) || this.random.max(1) > 0.5)
    } else {
      if (ev.altKey) {
        const includedInCircle = this.particles.filter(p => circle.contains(p)).length
        const numberOfNewParticles = Math.max(Math.min(includedInCircle, 1), 200)
        addParticles(numberOfNewParticles)
      } else {
        this.particles.push(new Particle(mouseX, mouseY))
      }
    }

    this.calculateAndDraw()
  }

  onMouseMove(ev: MouseEvent) {
    const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect()
    const mouseX = ev.clientX - rect.left //x position within the element.
    const mouseY = ev.clientY - rect.top

    this.state = {
      ...this.state,
      mouseXPx: mouseX,
      mouseYPx: mouseY
    }

    this.mouseCircleEl.style.left = (mouseX - this.mouseCircleEl.clientWidth / 2).toString()
    this.mouseCircleEl.style.top = (mouseY - this.mouseCircleEl.clientHeight / 2).toString()

    this.toggleMouseCircle(ev)
  }

  reset() {
    this.random.setSeed()

    Config.colors.gradient.precalculate(this.containerWidth)

    const {minDist2, nParticles} = this.calculateParametersFromCanvasSize()
    this.minDist2 = minDist2
    this.N_PARTICLES = nParticles

    this.particles = [] as Particle[]
    this.lines = [] as Line[]
    this.triangles = [] as Triangle[]

    this.createParticles()

    this.calculateAndDraw()

    return this
  }

  calculateAndDraw() {
    this.triangulate()
    this.draw()
  }

  private createParticles() {
    let found = 0
    let it = 0
    while (found < this.N_PARTICLES && it < 1e6) {
      const x = this.random.max(this.containerWidth)
      const y = this.random.max(this.containerHeight)
      const particle = new Particle(x, y)

      if (this.validParticle(found, particle)) {
        this.particles[found] = particle
        found++
      }
      it++
    }
    if (found < this.N_PARTICLES) {
      console.log(`Not enough points found (${found}/${this.N_PARTICLES})`)
    } else {
      console.log(`Found all ${found} points`)
    }
  }

  validParticle(foundParticles: number, potentialParticle: Particle) {
    for (let i = 0; i < foundParticles; i++) {
      const particle = this.particles[i]
      const isEnoughDistance = (potentialParticle.x - particle.x) ** 2 + (potentialParticle.y - particle.y) ** 2 >= this.minDist2
      if (!isEnoughDistance) {
        return false
      }
    }
    return true
  }

  triangulate() {
    console.log(`Triangulating ${this.particles.length} points`)
    this.lines = []
    this.triangles = []

    if (!Config.parameters.delaunay) {
      this.triangulateNoDelaunay()
      return
    }

    const p1 = new Particle(0, 0)
    const p2 = new Particle(0, this.containerHeight * 2)
    const p3 = new Particle(this.containerWidth * 2, 0)

    const l1 = new Line(p1, p2)
    const l2 = new Line(p1, p3)
    const l3 = new Line(p2, p3)

    this.lines.push(l1)
    this.lines.push(l2)
    this.lines.push(l3)


    const triangle = new Triangle(l1, l2, l3)
    const initialFakePoints = [p1, p2, p3]
    this.triangles.push(triangle)
    this.initialTriangle = triangle

    const maxParticlesToAdd = parseInt(this.urlParams.get("upTo") || this.particles.length.toString())

    const particlesToRemove = [] as Particle[]

    for (let partIx = 0; partIx < maxParticlesToAdd; partIx++) {
      const newPoint = this.particles[partIx]
      let potentialIllegalLines = [] as Line[]

      const containingTriangles = this.triangles.filter(t => t.contains(newPoint))
      if (containingTriangles.length != 1) {
        particlesToRemove.push(newPoint)
        console.error("New point not contained in only one triangle", newPoint, containingTriangles)
        // throw new Error("New point not contained in only one triangle")
      } else {
        const containingTriangle = containingTriangles[0]

        const containingTrianglePoints = containingTriangle.points()
        const newLineA = new Line(newPoint, containingTrianglePoints[0])
        const newLineB = new Line(newPoint, containingTrianglePoints[1])
        const newLineC = new Line(newPoint, containingTrianglePoints[2])
        const newLines = [newLineA, newLineB, newLineC]

        const newTriangles = [] as Triangle[]

        containingTriangle.lines().map(containingTriangleLine => {
          const linesThatArePartOfNewTriangle = newLines.filter(newL => newL.shareParticle(containingTriangleLine))
          const newTriangle = new Triangle(containingTriangleLine, linesThatArePartOfNewTriangle[0], linesThatArePartOfNewTriangle[1])
          newTriangles.push(newTriangle)
        })

        this.triangles = this.triangles.filter(t => t != containingTriangle).concat(...newTriangles)
        this.lines = this.lines.concat(...newLines)

        potentialIllegalLines.push(...containingTriangle.lines())

        let potentialIllegalLine = potentialIllegalLines.pop()
        while (potentialIllegalLine) {
          const newLinesToAnalyze = this.flipIfNecessary(potentialIllegalLine, newPoint)
          potentialIllegalLines.push(...newLinesToAnalyze)
          potentialIllegalLine = potentialIllegalLines.pop()
        }
      }
    }

    this.particles = this.particles.filter(p => !particlesToRemove.includes(p))
    this.lines = this.lines.filter(l => !initialFakePoints.includes(l.a) && !initialFakePoints.includes(l.b))
    this.triangles = this.triangles.filter(t => !initialFakePoints.find(fp => t.points().includes(fp)))

    this.onTriangulateCallback?.()
  }

  flipIfNecessary(potentialIllegalEdge: Line, newPoint: Particle) {
    const triangles = this.triangles.filter(t => {
      const points = t.points()
      return points.includes(potentialIllegalEdge.a) && points.includes(potentialIllegalEdge.b)
    })
    if (triangles.length != 2) {
      return []
    }


    const trianglesToAdd = [] as Triangle[]
    const trianglesToRemove = [] as Triangle[]
    const linesToAdd = [] as Line[]
    const linesToRemove = [] as Line[]

    const opposingTriangle = triangles[0].points().includes(newPoint) ? triangles[1] : triangles[0]

    const opposingPoint = opposingTriangle.points().find(p => p != potentialIllegalEdge.a && p != potentialIllegalEdge.b)!

    const potentialAngle = this.findAngle(potentialIllegalEdge.a, opposingPoint, potentialIllegalEdge.b)
    const newAngle = this.findAngle(potentialIllegalEdge.a, newPoint, potentialIllegalEdge.b)

    const hasToFlip = potentialAngle + newAngle > 180

    if (!hasToFlip) {
      return []
    }

    const potentialNewEdge = new Line(opposingPoint, newPoint)
    linesToAdd.push(potentialNewEdge)
    linesToRemove.push(potentialIllegalEdge)
    trianglesToRemove.push(...triangles)

    const linesThatRemain = opposingTriangle.lines().filter(l => l.a == opposingPoint || l.b == opposingPoint)
    linesThatRemain.forEach(lineThatRemains => {
      const otherPoint = lineThatRemains.a == opposingPoint ? lineThatRemains.b : lineThatRemains.a
      const newLine = new Line(newPoint, otherPoint)

      const newTriangle = new Triangle(newLine, lineThatRemains, potentialNewEdge)

      trianglesToAdd.push(newTriangle)
      linesToAdd.push(newLine)
    })

    this.triangles = this.triangles.filter(t => !trianglesToRemove.includes(t)).concat(...trianglesToAdd)
    this.lines = this.lines.filter(l => !linesToRemove.find(ltr => ltr.equal(l))).concat(...linesToAdd)

    return linesThatRemain
  }

  findAngle(a: Particle, b: Particle, c: Particle) {
    const AB = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
    const BC = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2))
    const AC = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2))
    return (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI
  }

  draw() {
    this.mesher.draw()

    const ctx = this.context!
    ctx.clearRect(0, 0, this.containerWidth, this.containerHeight)

    // console.debug("Gonna render triangles", this.triangles)
    this.triangles.forEach(t => t.draw(ctx, this))
    // this.lines.forEach(t => t.draw(ctx, this))

    if (!Config.colors.fill) {
      // console.debug("Gonna render particles")
      this.particles.forEach(p => p.draw(ctx, this))
    }

    ctx.fillStyle = Config.colors.lines
    ctx.font = "20px Comic Sans MS"

    // ctx.fillText(`${this.state.mouseXPx},${this.state.mouseYPx}`, 20, 20)
  }

  triangulateNoDelaunay() {
    const sorted = [...this.particles.sort((p1, p2) => p1.x > p2.x ? 1 : -1)]
    const visited = [] as Particle[]

    const p1 = sorted.shift()!
    const p2 = sorted.shift()!
    const p3 = sorted.shift()!

    const l1 = new Line(p1, p2)
    const l2 = new Line(p1, p3)
    const l3 = new Line(p2, p3)

    this.lines.push(l1)
    this.lines.push(l2)
    this.lines.push(l3)

    const triangle = new Triangle(l1, l2, l3)
    this.triangles.push(triangle)

    visited.push(p1)
    visited.push(p3)
    visited.push(p2)

    let p: Particle | undefined
    while (p = sorted.shift()) {
      this.addLinesFor(p, visited)
      visited.push(p)
    }
  }

  addLinesFor(p: Particle, visited: Particle[]) {
    const linesToAdd = [] as Line[]
    const trianglesToAdd = [] as Triangle[]
    visited.forEach(p2 => {
      const lineToAdd = new Line(p, p2)
      const anyIntersects = this.lines.find(l => l.intersect(lineToAdd))
      if (!anyIntersects) {
        linesToAdd.forEach(previousLineToAdd => {
          const otherParticle = previousLineToAdd.otherParticle(p)
          const requiredLine = new Line(p2, otherParticle)
          const closingLine = this.lines.find(l => l.equal(requiredLine))
          if (closingLine) {
            const triangleToAdd = new Triangle(lineToAdd, closingLine, previousLineToAdd)
            trianglesToAdd.push(triangleToAdd)
          }
        })
        linesToAdd.push(lineToAdd)
      }
    })
    this.lines = this.lines.concat(linesToAdd)
    this.triangles = this.triangles.concat(trianglesToAdd)
  }

  onTriangulate(callback: () => void) {
    this.onTriangulateCallback = callback
  }

  onKeyDown(event: KeyboardEvent) {
    this.toggleMouseCircle(event)
  }

  onKeyUp(event: KeyboardEvent) {
    this.toggleMouseCircle(event)
  }

  private toggleMouseCircle(event: KeyboardEvent | MouseEvent) {
    if (event.shiftKey || event.altKey) {
      this.mouseCircleEl.style.visibility = "inherit"
    } else {
      this.mouseCircleEl.style.visibility = "hidden"
    }
  }
}
