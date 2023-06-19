const bunyan = require('bunyan');
const { v4: uuidv4 } = require('uuid');
let logger;
const severity = {
    DEFAULT: 0,
    DEBUG: 100,
    INFO: 200,
    NOTICE: 300,
    WARNING: 400,
    ERROR: 500,
    CRITICAL: 600,
    ALERT: 700,
    EMERGENCY: 800,
}
const _genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const _getStructure = ({ severity, trace, spanId, task, parameters, result, message, error, startAt, httpRequest }) => {
    const ctx = {
        severity,
        trace: trace || null,
        spanId: spanId || null,
        startAt: startAt || new Date(),
        time: new Date(),
        task: task || null,
        message: message || null,
        parameters: parameters || null,
        error: error || null,
        result: result || null,
        duration: startAt ? (new Date() - new Date(startAt)) : null,
        httpRequest,
    };

    if (httpRequest) {
        ctx.httpRequest.latency = (ctx.duration / 1000).toFixed(2) + "s"
    }
    return ctx;
};

const _getHttp = (req, res, registerIP, registerParams) => {
    return {
        "requestMethod": req.method,
        "requestUrl": registerParams ? req.originalUrl : null,
        "requestSize": req.get('Content-Length') || '',
        "status": res.statusCode || 0,
        "responseSize": res.get('Content-Length') || '',
        "userAgent": req.get('User-Agent') || '',
        "remoteIp": registerIP ? req.ip : null,
        "serverIp": registerIP ? req.hostname : null,
        "referer": req.get('Referer') || '',
        "latency": null,
        "cacheLookup": null,
        "cacheHit": null,
        "cacheValidatedWithOriginServer": null,
        "cacheFillBytes": '',
        "protocol": req.protocol
    }
}

const Log = (processName) => {
    logger = bunyan.createLogger({
        name: processName,
        serviceContext: {
            service: process.env.npm_package_name || processName,
            version: process.env.npm_package_version || ""
        },
        streams: [
            { stream: process.stdout, level: 'info', src: true },
        ],
    });
    const l = {
        registerIP: false,
        registerParams: false,
        trace: null,
        logger,
        newCtx: ({ task, registerIP, registerParams, trace }) => {
            this.trace = trace ? trace : uuidv4();
            this.registerIP = registerIP;
            this.registerParams = registerParams;
            const spanId = _genRanHex(16);
            const structure = _getStructure({ trace, task, startAt: new Date(), spanId });
            return structure;
        },
        setTrace: (trace) => {
            this.trace = trace;
        },
        setCtx: (c, task, parameters, request, response) => {
            const ctx = { ...c };
            ctx.trace = this.trace;
            ctx.task = task || 'Not Set';
            ctx.parameters = parameters || null;
            ctx.startAt = new Date();
            ctx.message = null;
            ctx.result = null;
            ctx.httpRequest = request ? _getHttp(request, response, this.registerIP, this.registerParams) : null;
            return ctx;
        },
        catch: (ctx, exception) => {
            return {
                task: ctx.task,
                ex: exception
            };
        },
        info: (c, message, result) => {
            const ctx = { ...c };
            ctx.message = message || '';
            ctx.result = result || null;
            ctx.severity = severity.INFO;
            logger.info(_getStructure(ctx));
        },
        error: (c, error) => {
            const ctx = { ...c };
            ctx.error = error ? (error.message ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error) : null;
            ctx.severity = severity.ERROR;
            logger.error(_getStructure(ctx));
        },
        fatal: (c, error) => {
            const ctx = { ...c };
            ctx.error = error ? (error.message ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error) : null;
            ctx.severity = severity.CRITICAL;
            logger.fatal(_getStructure(ctx));
        }
    };
    return l;
};

process.on('uncaughtException', (err) => {
    const log = Log('uncaughtException');
    const ctx = log.setCtx(log.newCtx(), 'uncaughtException', {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        resourceUsage: process.resourceUsage()
    });
    log.fatal(ctx, err ? (err.message ? {
        message: err.message,
        stack: err.stack,
        name: err.name
    } : err) : null);
    process.exit(1);
});
module.exports = Log;