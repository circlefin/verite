import type { DescriptorMap } from "./DescriptorMap"

export type PresentationSubmission = {
  id: string
  definition_id: string
  descriptor_map: DescriptorMap[]
}
