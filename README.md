# Google Cloud Structured Logs 

# Release V2!!!

This is a little package to simplify structured logging in Google Cloud Platform. 

This package helps to track useful information from operation context and all the information needed to track not only one service operation else the ability to track interactions between services using a trace to follow every each log generated during consecutive services communications. 

## Installation


```sh
npm install --save google-cloud-structured-logs
```

## Simple Example

A simple implementation can be like this, you need to call the library, create a log Object with the process or service name and set a new context. After that you can log something passing this context and your logs will be beautiful.



```js

const logger = require('google-cloud-structured-logs');
const log = logger('My Service Name');

const ctx = log.newCtx({ task: 'Task Name'});
const exampleOperationResult = {foo: 'bar'};
log.info(ctx, 'Log message, it can be an object', exampleOperationResult);

```

This simple example will generate this output in console and in stackdriver logging.

```json
{
    "name": "ms-boilerplate",
    "hostname": "MacBook-Air-de-user.local",
    "pid": 38126,
    "level": 50,
    "severity": 500,
    "trace": null,
    "spanId": "f985523941070851",
    "startAt": "2023-06-19T03:21:49.712Z",
    "time": "2023-06-19T03:21:49.720Z",
    "task": "validaIdentidad",
    "message": null,
    "parameters": [],
    "error": null,
    "result": null,
    "duration": 8,
    "httpRequest": null,
    "msg": "",
    "v": 0
}
```


The following example illustrate how the logger interpret the request and response parameters generated by express.js 4.x

```json
{
    "name": "ms-boilerplate",
    "hostname": "MacBook-Air-de-user.local",
    "pid": 38126,
    "level": 50,
    "severity": 500,
    "trace": null,
    "spanId": "f985523941070851",
    "startAt": "2023-06-19T03:21:49.712Z",
    "time": "2023-06-19T03:21:49.720Z",
    "task": "validaIdentidad",
    "message": null,
    "parameters": [],
    "error": {
        "code": 400,
        "success": false,
        "errors": [
            {
                "detail": "param1",
                "description": "Is Required"
            },
            {
                "detail": "param2",
                "description": "Is Required"
            }
        ]
    },
    "result": null,
    "duration": 8,
    "httpRequest": {
        "requestMethod": "GET",
        "requestUrl": "/validaIdentidad/161358533?key=123",
        "requestSize": "",
        "status": 400,
        "responseSize": "",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "remoteIp": null,
        "serverIp": null,
        "referer": "",
        "latency": "0.01s",
        "cacheLookup": null,
        "cacheHit": null,
        "cacheValidatedWithOriginServer": null,
        "cacheFillBytes": "",
        "protocol": "http"
    },
    "msg": "",
    "v": 0
}
```

In this example we can see the **duration** value calculated between the startAt time and the current log time.

```js
setTimeout(() => {
    log.info(ctx, '300 ms after');
}, 300)
```
The previous log will generate this output, please see **duration** value, that metric can be very useful to get insights from some external services requests o bd queries.

```json
{
    "name": "My Service Name",
    "hostname": "user-MacBook-Pro.local",
    "pid": 98231,
    "level": 30,
    "severity": 200,
    "trace": "0e6efb4f-d7bb-4cbb-9161-2147537cc9b7",
    "spanId": "f985523941070851",
    "startAt": "2020-07-28T20:38:27.261Z",
    "time": "2020-07-28T20:38:27.568Z",
    "task": "Task Name",
    "message": "300 ms after",
    "parameters": null,
    "error": null,
    "result": null,
    "duration": 307,
    "httpRequest": null,
    "msg": "",
    "v": 0
}
```
## Passing trace

When you want to trace the execution between your services, you can pass as parameter the trace. To do this we only need to pass the trace in the context creation with **newCtx**

```js
const ctx = log.newCtx({ task: 'Task Name', trace: 'some trace vealue'} );
log.info(ctx, 'This log will reuse a receibed trace');
```

if you want to set **trace** after to create the new Context use the **setTrace** method.

```js
log.setTrace("Some Trace Value");
```

## Using context

As you can see in previous examples the context is very important to log with simplicity and it can enable you to extend your tracing between functions, methods even to other services.

### Creating context in sub functions or Promises

```js
const logger = require('google-cloud-structured-logs');
const log = logger('My Service Name');

const ctx = log.newCtx('Task Name');
const res = {foo: 'bar'};
log.info(ctx,"Hi", res);

const addPromise = (prevCtx, val1 , val2 ) => new Promise((resolve) => {
    let _ctx = log.setCtx(prevCtx , 'addPromise', [val1, val2]);
    const result = val1 + val2;
    log.info(_ctx, 'The result is', result);
    resolve(result);
    // Please in the real world you must implement reject 
});

addPromise(ctx, 5, 15).then((result) => {
    log.info(ctx,"And the result is......", result);
});
```

```json
{
    "name": "My Service Name",
    "hostname": "user-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trace": "9d130cdb-5413-422e-867e-f2205f66d9ac",
    "spanId": "f985523941070851",
    "startAt": "2020-07-28T22:09:34.923Z",
    "time": "2020-07-28T22:09:34.923Z",
    "task": "Task Name",
    "message": "Hi",
    "parameters": null,
    "error": null,
    "result": {
        "foo": "bar"
    },
    "duration": 0,
    "msg": "",
    "v": 0
}
{
    "name": "My Service Name",
    "hostname": "user-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trace": "9d130cdb-5413-422e-867e-f2205f66d9ac",
    "spanId": "f985523941070851",
    "startAt": "2020-07-28T22:09:34.925Z",
    "time": "2020-07-28T22:09:34.925Z",
    "task": "addPromise",
    "message": "The result is",
    "parameters": [
        5,
        15
    ],
    "error": null,
    "result": 20,
    "duration": 0,
    "msg": "",
    "v": 0
}
{
    "name": "My Service Name",
    "hostname": "user-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trace": "9d130cdb-5413-422e-867e-f2205f66d9ac",
    "spanId": "f985523941070851",
    "startAt": "2020-07-28T22:09:34.923Z",
    "time": "2020-07-28T22:09:34.929Z",
    "task": "Task Name",
    "message": "And the result is......",
    "parameters": null,
    "error": null,
    "result": 20,
    "duration": 6,
    "msg": "",
    "v": 0
}
```

## Managing Uncaught Exceptions

When your code generate an uncaughtException it will be captured automatically by the logger and logged in the structured format and bring to you some additional information about CPU and RAM usage, the execution/service uptime and some more.

```json
{
    "name": "uncaughtException",
    "hostname": "user-MacBook-Pro.local",
    "pid": 1853,
    "level": 60,
    "trace": "c2c156e8-0427-458c-87dc-5d7392d7ed7d",
    "spanId": "f985523941070851",
    "startAt": "2020-07-28T22:20:47.054Z",
    "time": "2020-07-28T22:20:47.055Z",
    "task": "uncaughtException",
    "message": null,
    "parameters": {
        "cpuUsage": {
            "user": 461223,
            "system": 115246
        },
        "memoryUsage": {
            "rss": 61190144,
            "heapTotal": 33357824,
            "heapUsed": 14655688,
            "external": 1640654,
            "arrayBuffers": 102030
        },
        "uptime": 1.726650084,
        "resourceUsage": {
            "userCPUTime": 461373,
            "systemCPUTime": 115260,
            "maxRSS": 61517824,
            "sharedMemorySize": 0,
            "unsharedDataSize": 0,
            "unsharedStackSize": 0,
            "minorPageFault": 15846,
            "majorPageFault": 4044,
            "swappedOut": 0,
            "fsRead": 0,
            "fsWrite": 0,
            "ipcSent": 7,
            "ipcReceived": 8,
            "signalsCount": 1,
            "voluntaryContextSwitches": 842,
            "involuntaryContextSwitches": 1721
        }
    },
    "error": {
        "message": "Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.",
        "stack": "Error: Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.\n    at GoogleAuth.getApplicationDefaultAsync (/build/src/auth/googleauth.js:160:19)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\n    at async GoogleAuth.getClient (/build/src/auth/googleauth.js:502:17)\n    at async GrpcClient._getCredentials (/node_modules/google-gax/build/src/grpc.js:92:24)\n    at async GrpcClient.createStub (/node_modules/google-gax/build/src/grpc.js:213:23)",
        "name": "Error"
    },
    "result": null,
    "duration": 1,
    "msg": "",
    "v": 0
}
```