/**
 * A native file type enclosing an array buffer.
 * To be used for uploading files via an `ArrayBuffer`.
 */
export interface NativeFile {
  arrayBuffer: ArrayBuffer
  name: string
  mimeType: string
  size: number
}
