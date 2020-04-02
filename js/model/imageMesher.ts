import Config from "../config"

export default class ImageMesher {
  canvas: HTMLCanvasElement
  loaded: boolean
  onLoadFn?: () => void
  private imgTag: HTMLImageElement
  private canvasCtx: CanvasRenderingContext2D

  constructor(path: string, container: HTMLElement) {
    this.loaded = false
    this.imgTag = document.createElement("IMG") as HTMLImageElement
    this.canvas = document.createElement("canvas")
    container.parentElement.appendChild(this.imgTag)
    this.canvasCtx = this.canvas.getContext("2d")
    this.canvasCtx.scale(-1, 1)

    this.imgTag.setAttribute("id", "mesher-img")
    this.canvas.width = container.clientWidth
    this.canvas.height = container.clientHeight
    this.imgTag.width = container.clientWidth
    this.imgTag.height = container.clientHeight
    this.imgTag.setAttribute("src", path)
    this.imgTag.style.objectFit = "contain"
    this.imgTag.addEventListener("load", () => {
      console.log("ImageMesher: Finished loading image")
      this.drawImageInCanvas(this.imgTag)

      this.loaded = true
      if (this.onLoadFn) {
        this.onLoadFn()
      }
    })
  }

  onLoad(callback: () => void) {
    this.onLoadFn = callback
    if (this.loaded) {
      callback()
    }
  }

  getPixel(x: number, y: number) {
    return this.canvasCtx.getImageData(x, y, 1, 1).data
  }

  draw() {
    let opacity = 0
    if (Config.imageMesh.enabled) {
      opacity = Config.imageMesh.sourceOpacity
    }
    this.imgTag.style.opacity = opacity.toString()
  }

  loadImage(newSrc: File) {
    const reader = new FileReader()

    reader.onloadend = () => {
      this.imgTag.src = reader.result as any
    }

    reader.readAsDataURL(newSrc)
  }

  drawInCanvas(videoEl: HTMLVideoElement) {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvasCtx.drawImage(videoEl, 0, 0, this.canvas.width, this.canvas.height)
    this.onLoadFn?.()
  }

  drawImageInCanvas(imageObj: HTMLImageElement) {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const imageAspectRatio = imageObj.naturalWidth / imageObj.naturalHeight
    const canvasAspectRatio = this.canvas.width / this.canvas.height
    let renderableHeight, renderableWidth, xStart, yStart

    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if (imageAspectRatio < canvasAspectRatio) {
      renderableHeight = this.canvas.height
      renderableWidth = imageObj.naturalWidth * (renderableHeight / imageObj.naturalHeight)
      xStart = (this.canvas.width - renderableWidth) / 2
      yStart = 0
    }

      // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if (imageAspectRatio > canvasAspectRatio) {
      renderableWidth = this.canvas.width
      renderableHeight = imageObj.naturalHeight * (renderableWidth / imageObj.naturalWidth)
      xStart = 0
      yStart = (this.canvas.height - renderableHeight) / 2
    }

    // Happy path - keep aspect ratio
    else {
      renderableHeight = this.canvas.height
      renderableWidth = this.canvas.width
      xStart = 0
      yStart = 0
    }
    this.canvasCtx.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight)
  }
}
