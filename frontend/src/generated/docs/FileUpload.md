
# FileUpload


## Properties

Name | Type
------------ | -------------
`activityId` | number
`fileName` | string
`fileUrl` | string
`fileType` | string
`fileSize` | number
`id` | number
`uploadedAt` | Date

## Example

```typescript
import type { FileUpload } from ''

// TODO: Update the object below with actual values
const example = {
  "activityId": null,
  "fileName": null,
  "fileUrl": null,
  "fileType": null,
  "fileSize": null,
  "id": null,
  "uploadedAt": null,
} satisfies FileUpload

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FileUpload
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


