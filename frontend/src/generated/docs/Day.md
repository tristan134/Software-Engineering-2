
# Day


## Properties

Name | Type
------------ | -------------
`title` | string
`journeyId` | number
`date` | Date
`id` | number
`activities` | [Array&lt;Activity&gt;](Activity.md)

## Example

```typescript
import type { Day } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "journeyId": null,
  "date": null,
  "id": null,
  "activities": null,
} satisfies Day

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Day
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


