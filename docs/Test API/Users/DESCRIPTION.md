# Users

Users use your product.

## Get All Users
This endpoint is used to retrieve a list of all users.
```GET https://copper.com/users?test=test_value```

### Parameters

You can include the following parameters in a search request.

Key | Value | Description
--- | --- | ---
test | test_value | Does this support `markdown`?
### Headers

Key | Value | Description | Type
--- | --- | --- | ---
test_header | test | this is a test header | text
Content-Type | application/json | undefined | text
### Body

```
{
	"test a": "body"
}
```
### Example Responses

Fail to get users
500: Internal Server Error
```json
{
	"failed": "yup"
}
```
Get All Users
undefined: undefined
```json
{
	"this": "is what came back"
}
```

## Create User
This is how you create a `user`.
```POST https://copper.com/users```

### Headers

Key | Value | Description | Type
--- | --- | --- | ---
Content-Type | application/json | undefined | text
### Body

```
{
	"some": "raw json"
}
```