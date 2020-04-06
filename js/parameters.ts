import Config from "./config"
import DelaunaySketch from "./model/delaunaySketch"
import VideoFeed from "./model/videoFeed"

export default class Parameters {
  private parametersEl: HTMLDivElement
  private densityInputEl: HTMLInputElement
  private distanceInputEl: HTMLInputElement
  private fillInputEl: HTMLInputElement
  private sketch: DelaunaySketch
  private pointsCount: HTMLSpanElement
  private trianglesCount: HTMLSpanElement
  private mesherImageOpacityEl: HTMLInputElement
  private seedInputEl: HTMLInputElement
  private mesherImageSrcEl: HTMLInputElement
  private delaunayInputEl: HTMLInputElement
  private mesherEnabledInputEl: HTMLInputElement
  private currentMesherImageSrc: string
  private videoFeed: VideoFeed
  private openButtonEl: HTMLElement
  private closeButtonEl: HTMLElement

  constructor(sketch: DelaunaySketch, videoFeed: VideoFeed) {
    this.sketch = sketch
    this.videoFeed = videoFeed
    this.parametersEl = document.querySelector("#parameters")

    this.openButtonEl = document.getElementById("open-parameters-button")
    this.closeButtonEl = document.getElementById("close-parameters-button")
    this.openButtonEl.addEventListener("click", this.toggleParametersOpen.bind(this))
    this.closeButtonEl.addEventListener("click", this.toggleParametersOpen.bind(this))

    this.densityInputEl = this.parametersEl.querySelector("#density")
    this.distanceInputEl = this.parametersEl.querySelector("#distance")
    this.fillInputEl = this.parametersEl.querySelector("#fill")
    this.seedInputEl = this.parametersEl.querySelector("#seed")
    this.delaunayInputEl = this.parametersEl.querySelector("#delaunay")
    this.mesherEnabledInputEl = this.parametersEl.querySelector("#mesher-enabled")

    this.densityInputEl.value = Config.parameters.density.toString()
    this.distanceInputEl.value = Config.parameters.minDistFactor.toString()
    this.fillInputEl.checked = Config.colors.fill
    this.seedInputEl.placeholder = sketch.random.seed

    this.delaunayInputEl.checked = Config.parameters.delaunay
    this.mesherEnabledInputEl.checked = Config.imageMesh.enabled

    this.mesherImageOpacityEl = this.parametersEl.querySelector("#mesher-image-opacity")
    this.mesherImageSrcEl = this.parametersEl.querySelector("#mesher-image-src")
    this.mesherImageOpacityEl.value = (Config.imageMesh.sourceOpacity * 100).toString()
    this.currentMesherImageSrc = Config.imageMesh.sourcePath

    this.pointsCount = this.parametersEl.querySelector("#count-points") as HTMLSpanElement
    this.trianglesCount = this.parametersEl.querySelector("#count-triangles") as HTMLSpanElement

    this.parametersEl.querySelector("#redraw").addEventListener("click", this.onSetClick.bind(this))
    this.parametersEl.querySelector("#reset").addEventListener("click", this.onResetClick.bind(this))
    this.parametersEl.querySelector("#toggle-video").addEventListener("click", this.onToggleVideoClick.bind(this))

    sketch.onTriangulate(this.onSketchRender.bind(this))
  }

  onSetClick() {
    Config.colors.fill = this.fillInputEl.checked
    Config.imageMesh.sourceOpacity = parseInt(this.mesherImageOpacityEl.value) / 100
    Config.imageMesh.enabled = this.mesherEnabledInputEl.checked

    this.sketch.draw()

    if (this.mesherImageSrcEl.value && this.currentMesherImageSrc != this.mesherImageSrcEl.value) {
      this.currentMesherImageSrc = this.mesherImageSrcEl.value
      this.sketch.mesher.loadImage(this.mesherImageSrcEl.files[0])
    }
  }

  onResetClick() {
    Config.parameters.delaunay = this.delaunayInputEl.checked
    this.sketch.random.setSeed(this.seedInputEl.value)
    this.seedInputEl.placeholder = this.sketch.random.seed

    const density = parseInt(this.densityInputEl.value)
    if (density > 0) {
      Config.parameters.density = density
    }
    const distance = parseInt(this.distanceInputEl.value)
    if (distance > 0) {
      Config.parameters.minDistFactor = distance
    }

    this.sketch.reset()
  }

  onSketchRender() {
    this.pointsCount.textContent = this.sketch.particles.length.toString()
    this.trianglesCount.textContent = this.sketch.triangles.length.toString()
  }

  onToggleVideoClick() {
    this.videoFeed.toggleRecording()
    this.fillInputEl.checked = true
    this.mesherEnabledInputEl.checked = true
    Config.colors.fill = true
    Config.imageMesh.enabled = true
  }

  toggleParametersOpen() {
    if (this.parametersEl.style.visibility == "hidden") {
      this.parametersEl.style.visibility = "inherit"
      this.openButtonEl.style.visibility = "hidden"
    } else {
      this.parametersEl.style.visibility = "hidden"
      this.openButtonEl.style.visibility = "inherit"
    }
  }
}
