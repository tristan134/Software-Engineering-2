
# JourneyUpdate


## Properties

Name | Type
------------ | -------------
`title` | string
`price` | [Price](Price.md)
`startDate` | Date
`endDate` | Date
`description` | string

## Example

```typescript
import type { JourneyUpdate } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "price": null,
  "startDate": null,
  "endDate": null,
  "description": null,
} satisfies JourneyUpdate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as JourneyUpdate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


