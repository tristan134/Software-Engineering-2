# DaysApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createDayApiV1DaysPost**](DaysApi.md#createdayapiv1dayspost) | **POST** /api/v1/days/ | Create Day |
| [**deleteDayApiV1DaysDayIdDelete**](DaysApi.md#deletedayapiv1daysdayiddelete) | **DELETE** /api/v1/days/{day_id} | Delete Day |
| [**listDaysForJourneyApiV1DaysByJourneyJourneyIdGet**](DaysApi.md#listdaysforjourneyapiv1daysbyjourneyjourneyidget) | **GET** /api/v1/days/by-journey/{journey_id} | List Days For Journey |
| [**updateDayApiV1DaysDayIdPut**](DaysApi.md#updatedayapiv1daysdayidput) | **PUT** /api/v1/days/{day_id} | Update Day |



## createDayApiV1DaysPost

> any createDayApiV1DaysPost(dayCreate)

Create Day

### Example

```ts
import {
  Configuration,
  DaysApi,
} from '';
import type { CreateDayApiV1DaysPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DaysApi();

  const body = {
    // DayCreate
    dayCreate: ...,
  } satisfies CreateDayApiV1DaysPostRequest;

  try {
    const data = await api.createDayApiV1DaysPost(body);
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
| **dayCreate** | [DayCreate](DayCreate.md) |  | |

### Return type

**any**

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


## deleteDayApiV1DaysDayIdDelete

> deleteDayApiV1DaysDayIdDelete(dayId)

Delete Day

### Example

```ts
import {
  Configuration,
  DaysApi,
} from '';
import type { DeleteDayApiV1DaysDayIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DaysApi();

  const body = {
    // number
    dayId: 56,
  } satisfies DeleteDayApiV1DaysDayIdDeleteRequest;

  try {
    const data = await api.deleteDayApiV1DaysDayIdDelete(body);
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


## listDaysForJourneyApiV1DaysByJourneyJourneyIdGet

> any listDaysForJourneyApiV1DaysByJourneyJourneyIdGet(journeyId)

List Days For Journey

### Example

```ts
import {
  Configuration,
  DaysApi,
} from '';
import type { ListDaysForJourneyApiV1DaysByJourneyJourneyIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DaysApi();

  const body = {
    // number
    journeyId: 56,
  } satisfies ListDaysForJourneyApiV1DaysByJourneyJourneyIdGetRequest;

  try {
    const data = await api.listDaysForJourneyApiV1DaysByJourneyJourneyIdGet(body);
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

**any**

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


## updateDayApiV1DaysDayIdPut

> Day updateDayApiV1DaysDayIdPut(dayId, dayUpdate)

Update Day

### Example

```ts
import {
  Configuration,
  DaysApi,
} from '';
import type { UpdateDayApiV1DaysDayIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DaysApi();

  const body = {
    // number
    dayId: 56,
    // DayUpdate
    dayUpdate: ...,
  } satisfies UpdateDayApiV1DaysDayIdPutRequest;

  try {
    const data = await api.updateDayApiV1DaysDayIdPut(body);
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
| **dayUpdate** | [DayUpdate](DayUpdate.md) |  | |

### Return type

[**Day**](Day.md)

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

