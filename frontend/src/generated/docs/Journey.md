
# Journey


## Properties

Name | Type
------------ | -------------
`title` | string
`price` | string
`startDate` | Date
`endDate` | Date
`description` | string
`id` | number
`days` | [Array&lt;Day&gt;](Day.md)

## Example

```typescript
import type { Journey } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "price": null,
  "startDate": null,
  "endDate": null,
  "description": null,
  "id": null,
  "days": null,
} satisfies Journey

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Journey
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


