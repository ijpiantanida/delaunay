import Config from "../config"

export default class ImageMesher {
  private canvas?: any
  loaded: boolean
  onLoadFn?: () => void
  private imgTag: HTMLImageElement

  constructor(path: string, container: HTMLElement) {
    this.loaded = false
    this.imgTag = document.createElement("IMG") as HTMLImageElement
    const canvas = document.createElement("canvas")
    container.parentElement.appendChild(this.imgTag)

    this.imgTag.setAttribute("id", "mesher-img")
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    this.imgTag.width = container.clientWidth
    this.imgTag.height = container.clientHeight
    this.imgTag.setAttribute("src", path)
    this.imgTag.style.objectFit = "contain"
    this.imgTag.addEventListener("load", () => {
      console.log("ImageMesher: Finished loading image")
      this.canvas = canvas
      drawImageInCanvas(canvas, this.imgTag)

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
    const pixelData = this.canvas!.getContext("2d").getImageData(x, y, 1, 1).data
    return pixelData
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
}

function drawImageInCanvas(canvas: HTMLCanvasElement, imageObj: HTMLImageElement) {
  console.log("drawImageInCanvas")
  const context = canvas.getContext("2d")
  context.clearRect(0, 0, canvas.width, canvas.height)
  const imageAspectRatio = imageObj.naturalWidth / imageObj.naturalHeight
  const canvasAspectRatio = canvas.width / canvas.height
  let renderableHeight, renderableWidth, xStart, yStart

  // If image's aspect ratio is less than canvas's we fit on height
  // and place the image centrally along width
  if (imageAspectRatio < canvasAspectRatio) {
    renderableHeight = canvas.height
    renderableWidth = imageObj.naturalWidth * (renderableHeight / imageObj.naturalHeight)
    xStart = (canvas.width - renderableWidth) / 2
    yStart = 0
  }

    // If image's aspect ratio is greater than canvas's we fit on width
  // and place the image centrally along height
  else if (imageAspectRatio > canvasAspectRatio) {
    renderableWidth = canvas.width
    renderableHeight = imageObj.naturalHeight * (renderableWidth / imageObj.naturalWidth)
    xStart = 0
    yStart = (canvas.height - renderableHeight) / 2
  }

  // Happy path - keep aspect ratio
  else {
    renderableHeight = canvas.height
    renderableWidth = canvas.width
    xStart = 0
    yStart = 0
  }
  context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight)
}


