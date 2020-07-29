const { v4: uuidv4 } = require('uuid');
const bunyan = require('bunyan');
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');
const loggingBunyan = new LoggingBunyan();
let logger;

const _getStructure = ({ trackId, task, parameters, result, message, error, startAt }) => {
    return {
        trackId: trackId || null, //UUID
        startAt: startAt || new Date(),
        time: new Date(), //Automatico
        task: task || null, //Nombre de la funcion
        message: message || null, //mensaje de log si es que existe
        parameters: parameters || null, //Parametros que recibio la funcion si es que sirve
        error: error || null, //mensaje de error si es que existe
        result: result || null, //Resultado de la funcion si es que se necesita
        ms: startAt ? new Date() - new Date(startAt) + "ms" : null, //Tiempo de ejecucion en ms
    }
};

const Log = (processName) => {
    logger = bunyan.createLogger({
        name: processName,
        streams: [
            { stream: process.stdout, level: 'info', src: true },
            loggingBunyan.stream('info'),
        ],
    });
    const l = {
        logger,
        newCtx: (task, uuid) => {
            const trackId = uuid ? uuid : uuidv4();
            const structure = _getStructure({ trackId, task, startAt: new Date(), });
            return structure;
        },
        setCtx: (c, task, parameters) => {
            const ctx = { ...c };
            ctx.task = task || 'Not Set';
            ctx.parameters = parameters || null;
            ctx.startAt = new Date();
            ctx.message = null;
            ctx.result = null;
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
            logger.info(_getStructure(ctx));
        },
        error: (c, error) => {
            const ctx = { ...c };
            ctx.error = error || null;
            logger.error(_getStructure(ctx));
        },
        fatal: (c, error) => {
            const ctx = { ...c };
            ctx.error = error || null;
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
    log.fatal(ctx, {
        message: err.message,
        stack: err.stack,
        name: err.name
    });
    process.exit(1);
});
module.exports = Log;