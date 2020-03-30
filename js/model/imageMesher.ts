export default class ImageMesher {
  private canvas?: any
  loaded: boolean
  onLoadFn?: () => void

  constructor(path: string, container: HTMLElement) {
    this.loaded = false
    const imgTag = document.createElement("IMG") as HTMLImageElement
    const canvas = document.createElement("canvas")

    // imgTag.width = container.clientWidth
    // imgTag.height = container.clientHeight
    // canvas.width = imgTag.width
    // canvas.height = imgTag.height
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    imgTag.setAttribute("src", path)
    imgTag.style.objectFit = "contain"
    imgTag.addEventListener("load", () => {
      console.log("ImageMesher: Finished loading image")
      this.canvas = canvas
      drawImageInCanvas(canvas, imgTag)

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
}

function drawImageInCanvas(canvas: HTMLCanvasElement, imageObj: HTMLImageElement) {
  const imageAspectRatio = imageObj.width / imageObj.height
  const canvasAspectRatio = canvas.width / canvas.height
  let renderableHeight, renderableWidth, xStart, yStart

  // If image's aspect ratio is less than canvas's we fit on height
  // and place the image centrally along width
  if (imageAspectRatio < canvasAspectRatio) {
    renderableHeight = canvas.height
    renderableWidth = imageObj.width * (renderableHeight / imageObj.height)
    xStart = (canvas.width - renderableWidth) / 2
    yStart = 0
  }

    // If image's aspect ratio is greater than canvas's we fit on width
  // and place the image centrally along height
  else if (imageAspectRatio > canvasAspectRatio) {
    renderableWidth = canvas.width
    renderableHeight = imageObj.height * (renderableWidth / imageObj.width)
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
  canvas.getContext("2d").drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight)
}


