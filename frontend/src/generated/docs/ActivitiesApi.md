# ActivitiesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createActivityApiV1ActivitiesPost**](ActivitiesApi.md#createactivityapiv1activitiespost) | **POST** /api/v1/activities/ | Create Activity |
| [**deleteActivityApiV1ActivitiesActivityIdDelete**](ActivitiesApi.md#deleteactivityapiv1activitiesactivityiddelete) | **DELETE** /api/v1/activities/{activity_id} | Delete Activity |
| [**listActivitiesForDayApiV1ActivitiesByDayDayIdGet**](ActivitiesApi.md#listactivitiesfordayapiv1activitiesbydaydayidget) | **GET** /api/v1/activities/by-day/{day_id} | List Activities For Day |
| [**updateActivityApiV1ActivitiesActivityIdPut**](ActivitiesApi.md#updateactivityapiv1activitiesactivityidput) | **PUT** /api/v1/activities/{activity_id} | Update Activity |



## createActivityApiV1ActivitiesPost

> Activity createActivityApiV1ActivitiesPost(activityCreate)

Create Activity

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { CreateActivityApiV1ActivitiesPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // ActivityCreate
    activityCreate: ...,
  } satisfies CreateActivityApiV1ActivitiesPostRequest;

  try {
    const data = await api.createActivityApiV1ActivitiesPost(body);
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
| **activityCreate** | [ActivityCreate](ActivityCreate.md) |  | |

### Return type

[**Activity**](Activity.md)

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


## deleteActivityApiV1ActivitiesActivityIdDelete

> deleteActivityApiV1ActivitiesActivityIdDelete(activityId)

Delete Activity

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { DeleteActivityApiV1ActivitiesActivityIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // number
    activityId: 56,
  } satisfies DeleteActivityApiV1ActivitiesActivityIdDeleteRequest;

  try {
    const data = await api.deleteActivityApiV1ActivitiesActivityIdDelete(body);
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
| **activityId** | `number` |  | [Defaults to `undefined`] |

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


## listActivitiesForDayApiV1ActivitiesByDayDayIdGet

> Array&lt;Activity&gt; listActivitiesForDayApiV1ActivitiesByDayDayIdGet(dayId)

List Activities For Day

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { ListActivitiesForDayApiV1ActivitiesByDayDayIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // number
    dayId: 56,
  } satisfies ListActivitiesForDayApiV1ActivitiesByDayDayIdGetRequest;

  try {
    const data = await api.listActivitiesForDayApiV1ActivitiesByDayDayIdGet(body);
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
| **dayId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;Activity&gt;**](Activity.md)

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


## updateActivityApiV1ActivitiesActivityIdPut

> Activity updateActivityApiV1ActivitiesActivityIdPut(activityId, activityUpdate)

Update Activity

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { UpdateActivityApiV1ActivitiesActivityIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // number
    activityId: 56,
    // ActivityUpdate
    activityUpdate: ...,
  } satisfies UpdateActivityApiV1ActivitiesActivityIdPutRequest;

  try {
    const data = await api.updateActivityApiV1ActivitiesActivityIdPut(body);
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
| **activityId** | `number` |  | [Defaults to `undefined`] |
| **activityUpdate** | [ActivityUpdate](ActivityUpdate.md) |  | |

### Return type

[**Activity**](Activity.md)

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

