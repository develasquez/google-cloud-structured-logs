const sinon = require('sinon');
const JSONReporter = require('jasmine-json-test-reporter');
jasmine.getEnv().addReporter(new JSONReporter({
    file: 'jasmine-test-results.json',
    beautify: true,
    indentationLevel: 4
}));
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);
const logger = require('../index');

const { v4: uuidv4 } = require('uuid');

let stubLog, stubError;

describe('Looger functions Test', function () {
    afterEach(function () {
        try {
            stubLog.restore();
            stubError.restore();
        }catch(ex){

        }  
    });
    it('Should create a new context passing UUID', () => {
        const proc = 'Test Process';
        const newUuid = uuidv4();
        const log = logger(proc);
        const ctx = log.newCtx('This will bee logged', newUuid);
        expect(ctx.trackId).toEqual(newUuid);
    });
    it('Should create a new context with out passing UUID', () => {
        const proc = 'Test Process';
        const uuidPattern = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        
        const log = logger(proc);
        stubLog = sinon.stub(log.logger, 'info');
        stubError = sinon.stub(log.logger, 'error');
        const ctx = log.newCtx('This will bee logged');
        expect(ctx.trackId).toMatch(uuidPattern);
    });
    it('Should set a new context correctly', () => {
        const task = 'Task in Set Context';
        const param = 123;
        const proc = 'Test Process';
        const log = logger(proc);
        stubLog = sinon.stub(log.logger, 'info');
        stubError = sinon.stub(log.logger, 'error');
        const prevCtx = log.newCtx('this message doesnt matter');
        const newCtx = log.setCtx(prevCtx, task, param);
        expect(newCtx.task).toEqual(task);
        expect(newCtx.parameters).toEqual(param);
        expect(typeof new Date(newCtx.startAt)).toEqual('object');
    });
    it('Should call console log on info', () => {
        const log = logger('Test Process');
        stubLog = sinon.stub(log.logger, 'info');
        stubError = sinon.stub(log.logger, 'error');
        const ctx = log.newCtx('this message doesnt matter');
        log.info(ctx, 'calling log info', {ok: 200});
        expect(stubLog.called).toBe(true);
        expect(stubError.called).toBe(false); 
    });
    
    it('Should log a specific structure', function(done) {
        const log = logger('Test Process');
        stubLog = sinon.stub(log.logger, 'info');
        stubError = sinon.stub(log.logger, 'error');
        const ctx = log.newCtx('this message doesnt matter');
        stubLog.callsFake((l) => {
            expect(l.result).toEqual({ok:200});
            done();
        });
        log.info(ctx, 'calling log info', {ok: 200});
    });
    it('Should log an error', function (done) {
        const msg = 'Error 300';
        const log = logger('Test Process');
        stubLog = sinon.stub(log.logger, 'info');
        stubError = sinon.stub(log.logger, 'error');
        const ctx = log.newCtx('this message doesnt matter');
        stubError.callsFake((l) => {
            expect(l.error).toEqual(msg);
            done();
        });
        log.error(ctx, msg);
    });
});