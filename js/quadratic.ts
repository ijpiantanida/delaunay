export default {}

const Config = {
  PARTICLES_PER_ROW: 30,
  STRENGTH_IN_POINTS: 30,
  DISTURBANCE: 60,
  FPS: 30,
  colors: {
    background: "#000",
    lines: "#444444"
  }
}

class Sketch {
  container: HTMLElement
  PARTICLES_PER_ROW: number
  containerHeight: any
  containerWidth: any
  particles: Particle[]
  context: CanvasRenderingContext2D
  nOfX: number
  nOfY: number
  xGap: number
  yGap: number
  state: {
    mouseXPx: number,
    mouseYPx: number,
    mouseX: number,
    mouseY: number
  }

  static draw(container: HTMLCanvasElement) {
    return new Sketch(container)
  }

  constructor(container: HTMLCanvasElement) {
    this.container = container
    this.PARTICLES_PER_ROW = Config.PARTICLES_PER_ROW
    this.particles = [] as Particle[]

    this.state = {
      mouseX: 0,
      mouseY: 0,
      mouseXPx: 0,
      mouseYPx: 0
    }

    container.addEventListener("mousemove", this.onMouseMove.bind(this))

    this.context = this.setupCanvas(container)

    this.containerWidth = container.clientWidth
    this.containerHeight = container.clientHeight

    const {nOfX, nOfY, xGap, yGap} = this.set()
    this.nOfX = nOfX
    this.nOfY = nOfY
    this.xGap = xGap
    this.yGap = yGap
  }

  setupCanvas(container: HTMLCanvasElement) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    var rect = container.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    container.width = rect.width * dpr
    container.height = rect.height * dpr

    const ctx = container.getContext("2d") as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = true
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr)
    return ctx
  }

  onMouseMove(ev: MouseEvent) {
    const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect()
    const mouseX = ev.clientX - rect.left //x position within the element.
    const mouseY = ev.clientY - rect.top

    const x = Math.floor(mouseX / this.xGap)
    const y = Math.floor(mouseY / this.yGap)

    this.state = {
      ...this.state,
      mouseX: x,
      mouseY: y,
      mouseXPx: mouseX,
      mouseYPx: mouseY
    }
  }

  set() {
    const nOfX = this.PARTICLES_PER_ROW
    const xGap = this.containerWidth / (this.PARTICLES_PER_ROW - 1)
    const nOfY = Math.round(this.containerHeight / xGap)
    const yGap = this.containerHeight / (nOfY - 1)

    for (let yI = 0; yI < nOfY; yI++) {
      for (let xI = 0; xI < this.PARTICLES_PER_ROW; xI++) {
        const x = xI * xGap
        const y = yI * yGap
        const particle = new Particle(xI, yI, x, y)

        this.particles.push(particle)
      }
    }
    this.draw()

    return {nOfX, nOfY, xGap, yGap}
  }

  draw() {
    const ctx = this.context

    ctx.clearRect(0, 0, this.containerWidth, this.containerHeight)

    const DISTURBANCE = Config.DISTURBANCE
    const STRENGTH_IN_POINTS = Config.STRENGTH_IN_POINTS

    this.particles.forEach(p => {
      p.x = p.xI * this.xGap
      p.y = p.yI * this.yGap

      const gapSqrt = Math.sqrt(Math.sqrt(Math.pow(this.xGap, 2) * Math.pow(this.yGap, 2)))

      if (p.xI >= this.state.mouseX - (STRENGTH_IN_POINTS - 1) &&
        p.xI <= this.state.mouseX + STRENGTH_IN_POINTS &&
        p.yI >= this.state.mouseY - (STRENGTH_IN_POINTS - 1) &&
        p.yI <= this.state.mouseY + STRENGTH_IN_POINTS
      ) {
        const distanceX = this.state.mouseXPx - p.x
        const distanceY = this.state.mouseYPx - p.y

        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))

        const ratio = (1 - Math.sqrt(Math.abs(distance)) / gapSqrt)
        const disturbanceX = DISTURBANCE * ratio * distanceX / distance
        p.x = p.x - disturbanceX

        const disturbanceY = DISTURBANCE * ratio * distanceY / distance
        p.y = p.y - disturbanceY
      }

      p.draw(ctx, this)
    })
  }

  findParticle(x: number, y: number) {
    if (x < 0 || y < 0 || x > this.nOfX - 1 || y > this.nOfY - 1) {
      return null
    }

    const ix = x + this.nOfX * y
    return this.particles[ix]
  }
}

class Particle {
  xI: number
  yI: number
  x: number
  y: number
  radius: number

  constructor(xI: number, yI: number, x: number, y: number) {
    this.xI = xI
    this.yI = yI
    this.x = x
    this.y = y
    this.radius = 5
  }

  draw(ctx: CanvasRenderingContext2D, sketch: Sketch) {
    this.drawLines(ctx, sketch)

    ctx.beginPath()

    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = Config.colors.background
    ctx.fill()
    ctx.lineWidth = 1 // I'd like to set with CSS
    ctx.strokeStyle = Config.colors.lines
    // ctx.shadowColor = "black";
    // ctx.shadowBlur = 6;
    // ctx.shadowOffsetX = 2;
    // ctx.shadowOffsetY = 2;

    ctx.stroke()
  }

  drawLines(ctx: CanvasRenderingContext2D, sketch: Sketch) {
    const nextPointX = sketch.findParticle(this.xI - 1, this.yI)
    if (nextPointX) {
      this.drawLine(ctx, nextPointX)
    }

    const nextPointY = sketch.findParticle(this.xI, this.yI - 1)
    if (nextPointY) {
      this.drawLine(ctx, nextPointY)
    }
  }

  drawLine(ctx: CanvasRenderingContext2D, target: Particle) {
    ctx.beginPath()
    ctx.lineWidth = 1 // I'd like to set with CSS
    ctx.strokeStyle = Config.colors.lines
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(target.x, target.y)
    ctx.stroke()
  }
}

function randomMax(max: number) {
  return Math.random() * max
}


window.onload = () => {
  const container = document.getElementById("container") as HTMLCanvasElement
  const sketch = Sketch.draw(container)

  const stop = false
  const frameCount = 0
  const fps = 60

  let then = Date.now()
  let startTime = then
  let now = then
  let elapsed = now - then

  animate()

  function animate() {
    const fpsInterval = 1000 / Config.FPS

    // request another frame

    requestAnimationFrame(animate)

    // calc elapsed time since last loop

    now = Date.now()
    elapsed = now - then

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval)

      sketch.draw()
    }
  }
}


