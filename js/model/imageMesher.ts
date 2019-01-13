export default class ImageMesher {
  private canvas?: any
  loaded: boolean
  onLoadFn?: () => void

  constructor(path: string, container: HTMLElement) {
    this.loaded = false
    const imgTag = document.createElement("IMG") as HTMLImageElement
    imgTag.width = container.clientWidth
    imgTag.height = container.clientHeight
    imgTag.setAttribute("src", path)
    imgTag.addEventListener("load", () => {
      console.log("FINISHED LOADING")
      const canvas = document.createElement("canvas")
      this.canvas = canvas
      canvas.width = imgTag.width
      canvas.height = imgTag.height
      canvas.getContext("2d").drawImage(imgTag, 0, 0, imgTag.width, imgTag.height)
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
