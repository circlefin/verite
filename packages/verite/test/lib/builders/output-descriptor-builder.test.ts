import { OutputDescriptorBuilder } from "../../../lib"

describe("OutputDescriptorBuilder", () => {
  it("works", async () => {
    const outputDescriptor = new OutputDescriptorBuilder("outputdescriptor123")
      .schema("https://schema.org/EducationalOccupationalCredential")
      .description("Educational and Occupational Credential")
      .build()

    expect(outputDescriptor).toEqual({
      id: "outputdescriptor123",
      schema: "https://schema.org/EducationalOccupationalCredential",
      description: "Educational and Occupational Credential"
    })
  })
})
