export type ClientId = 'platinum' | 'steve-giralt' | 'deliverables'

export type MediaType = 'image' | 'video' | 'embed' | 'poster'

export type MediaItem = {
  id: string
  client: ClientId
  title: string
  category: string
  description?: string
  // `src` is the resolved best-source for rendering (local path if downloaded, otherwise remote).
  src: string
  remoteUrl?: string
  localPath?: string
  filename?: string
  extension?: string
  videoSrc?: string
  poster?: string
  alt: string
  pageUrl?: string
  width?: number
  height?: number
  aspectRatio?: number | null
  mediaType: MediaType
  priority: number
  ctaLabel?: string
  embed?: 'vimeo' | 'youtube' | null
  embedId?: string | null
  source?: 'dom' | 'css' | 'network' | 'link' | 'iframe'
}

export type ClientGroup = {
  id: ClientId
  name: string
  base: string
  category: string
  pages: number
  imagesCount: number
  videosCount: number
  items: MediaItem[]
}
