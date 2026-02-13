# JourneyApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createJourneyApiV1JourneyCreatePost**](JourneyApi.md#createjourneyapiv1journeycreatepost) | **POST** /api/v1/journey/create | Create Journey |
| [**deleteJourneyApiV1JourneyJourneyIdDelete**](JourneyApi.md#deletejourneyapiv1journeyjourneyiddelete) | **DELETE** /api/v1/journey/{journey_id} | Delete Journey |
| [**getAllJourneysApiV1JourneyGet**](JourneyApi.md#getalljourneysapiv1journeyget) | **GET** /api/v1/journey | Get All Journeys |
| [**getJourneyApiV1JourneyJourneyIdGet**](JourneyApi.md#getjourneyapiv1journeyjourneyidget) | **GET** /api/v1/journey/{journey_id} | Get Journey |
| [**updateJourneyApiV1JourneyJourneyIdPut**](JourneyApi.md#updatejourneyapiv1journeyjourneyidput) | **PUT** /api/v1/journey/{journey_id} | Update Journey |



## createJourneyApiV1JourneyCreatePost

> Journey createJourneyApiV1JourneyCreatePost(journeyCreate)

Create Journey

### Example

```ts
import {
  Configuration,
  JourneyApi,
} from '';
import type { CreateJourneyApiV1JourneyCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new JourneyApi();

  const body = {
    // JourneyCreate
    journeyCreate: ...,
  } satisfies CreateJourneyApiV1JourneyCreatePostRequest;

  try {
    const data = await api.createJourneyApiV1JourneyCreatePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **journeyCreate** | [JourneyCreate](JourneyCreate.md) |  | |

### Return type

[**Journey**](Journey.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteJourneyApiV1JourneyJourneyIdDelete

> deleteJourneyApiV1JourneyJourneyIdDelete(journeyId)

Delete Journey

### Example

```ts
import {
  Configuration,
  JourneyApi,
} from '';
import type { DeleteJourneyApiV1JourneyJourneyIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new JourneyApi();

  const body = {
    // number
    journeyId: 56,
  } satisfies DeleteJourneyApiV1JourneyJourneyIdDeleteRequest;

  try {
    const data = await api.deleteJourneyApiV1JourneyJourneyIdDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **journeyId** | `number` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllJourneysApiV1JourneyGet

> Array&lt;ShowJourneySummarize&gt; getAllJourneysApiV1JourneyGet()

Get All Journeys

### Example

```ts
import {
  Configuration,
  JourneyApi,
} from '';
import type { GetAllJourneysApiV1JourneyGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new JourneyApi();

  try {
    const data = await api.getAllJourneysApiV1JourneyGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;ShowJourneySummarize&gt;**](ShowJourneySummarize.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getJourneyApiV1JourneyJourneyIdGet

> Journey getJourneyApiV1JourneyJourneyIdGet(journeyId)

Get Journey

### Example

```ts
import {
  Configuration,
  JourneyApi,
} from '';
import type { GetJourneyApiV1JourneyJourneyIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new JourneyApi();

  const body = {
    // number
    journeyId: 56,
  } satisfies GetJourneyApiV1JourneyJourneyIdGetRequest;

  try {
    const data = await api.getJourneyApiV1JourneyJourneyIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **journeyId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**Journey**](Journey.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateJourneyApiV1JourneyJourneyIdPut

> Journey updateJourneyApiV1JourneyJourneyIdPut(journeyId, journeyUpdate)

Update Journey

### Example

```ts
import {
  Configuration,
  JourneyApi,
} from '';
import type { UpdateJourneyApiV1JourneyJourneyIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new JourneyApi();

  const body = {
    // number
    journeyId: 56,
    // JourneyUpdate
    journeyUpdate: ...,
  } satisfies UpdateJourneyApiV1JourneyJourneyIdPutRequest;

  try {
    const data = await api.updateJourneyApiV1JourneyJourneyIdPut(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **journeyId** | `number` |  | [Defaults to `undefined`] |
| **journeyUpdate** | [JourneyUpdate](JourneyUpdate.md) |  | |

### Return type

[**Journey**](Journey.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

