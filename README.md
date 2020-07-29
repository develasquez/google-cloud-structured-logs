# Google Cloud Structured Logs

This is a little package to simplify structured logging in Google Cloud Platform. 

This package helps to track usefull information from operation context and all the informatins needed to track not only one service operation else the hability to track intaraction between services using a trackId to follow every each log generated during consecutive services comunications.

## Instalation


```sh
npm install --save google-cloud-structured-logs
```

## Simple Example

A simple implementatios can be like this, you need to call the librarie, create a log Object with the process or service name and set a new context. After that you can log something passing this context and your logs will be beautiful.

```js

const logger = require('google-cloud-structured-logs');
const log = logger('My Service Name');

const ctx = log.newCtx('Task Name');
const exampleOperationResult = {foo: 'bar'};
log.info(ctx, 'Log message, it can be an object', exampleOperationResult);

```

This simple example will generate this output in console and in stackdriver logging.

```json
{
    "name": "My Service Name",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 98231,
    "level": 30,
    "trackId": "0e6efb4f-d7bb-4cbb-9161-2147537cc9b7",
    "startAt": "2020-07-28T20:38:27.261Z",
    "time": "2020-07-28T20:38:27.261Z",
    "task": "Task Name",
    "message": "Start Process",
    "parameters": null,
    "error": null,
    "result": null,
    "ms": "0ms",
    "msg": "",
    "v": 0
}
{
    "name": "My Service Name",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 98231,
    "level": 30,
    "trackId": "0e6efb4f-d7bb-4cbb-9161-2147537cc9b7",
    "startAt": "2020-07-28T20:38:27.261Z",
    "time": "2020-07-28T20:38:27.264Z",
    "task": "Task Name",
    "message": "Log message, it can be an object",
    "parameters": null,
    "error": null,
    "result": {
        "foo": "bar"
    },
    "ms": "3ms",
    "msg": "",
    "v": 0
}

```

In this example we can see the **ms** value calculated between the startAt time and the current log time.

```js
setTimeout(() => {
    log.info(ctx, '300 ms after');
}, 300)
```
The previous log wil generate this output, please see **ms** value, that metric can be very usefull to get insigths from some external services requests o bd queries.

```json
{
    "name": "My Service Name",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 98231,
    "level": 30,
    "trackId": "0e6efb4f-d7bb-4cbb-9161-2147537cc9b7",
    "startAt": "2020-07-28T20:38:27.261Z",
    "time": "2020-07-28T20:38:27.568Z",
    "task": "Task Name",
    "message": "300 ms after",
    "parameters": null,
    "error": null,
    "result": null,
    "ms": "307ms",
    "msg": "",
    "v": 0
}
```
## Passing trackId

When you want to trace the excecution between your services, you can pass as parameter the trackId. To do this we only need to pass the trackId in the context creation with **newCtx**

```js
const ctx = log.newCtx('Task Name', trackId);
log.info(ctx, 'This log will reuse a receibed trackId');
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
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trackId": "9d130cdb-5413-422e-867e-f2205f66d9ac",
    "startAt": "2020-07-28T22:09:34.923Z",
    "time": "2020-07-28T22:09:34.923Z",
    "task": "Task Name",
    "message": "Hi",
    "parameters": null,
    "error": null,
    "result": {
        "foo": "bar"
    },
    "ms": "0ms",
    "msg": "",
    "v": 0
}
{
    "name": "My Service Name",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trackId": "9d130cdb-5413-422e-867e-f2205f66d9ac",
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
    "ms": "0ms",
    "msg": "",
    "v": 0
}
{
    "name": "My Service Name",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 1499,
    "level": 30,
    "trackId": "9d130cdb-5413-422e-867e-f2205f66d9ac",
    "startAt": "2020-07-28T22:09:34.923Z",
    "time": "2020-07-28T22:09:34.929Z",
    "task": "Task Name",
    "message": "And the result is......",
    "parameters": null,
    "error": null,
    "result": 20,
    "ms": "6ms",
    "msg": "",
    "v": 0
}
```

## Managing uncaught Exceptions

When your code generate an uncaughtException it will be captured automaticaly by the logger and logged in the structured format and bring to you some additional information about CPU and RAM usage, the ejecution/service uptime and some more.

```json
{
    "name": "uncaughtException",
    "hostname": "Felipes-MacBook-Pro.local",
    "pid": 1853,
    "level": 60,
    "trackId": "c2c156e8-0427-458c-87dc-5d7392d7ed7d",
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
        "stack": "Error: Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.\n    at GoogleAuth.getApplicationDefaultAsync (/Users/felipevelasquez/Desarrollo/XB/google-cloud-structured-logs/node_modules/google-gax/node_modules/google-auth-library/build/src/auth/googleauth.js:160:19)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)\n    at async GoogleAuth.getClient (/Users/felipevelasquez/Desarrollo/XB/google-cloud-structured-logs/node_modules/google-gax/node_modules/google-auth-library/build/src/auth/googleauth.js:502:17)\n    at async GrpcClient._getCredentials (/Users/felipevelasquez/Desarrollo/XB/google-cloud-structured-logs/node_modules/google-gax/build/src/grpc.js:92:24)\n    at async GrpcClient.createStub (/Users/felipevelasquez/Desarrollo/XB/google-cloud-structured-logs/node_modules/google-gax/build/src/grpc.js:213:23)",
        "name": "Error"
    },
    "result": null,
    "ms": "1ms",
    "msg": "",
    "v": 0
}
```