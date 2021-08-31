const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe('create',()=>{
    let job = {
        title:'test_job3',
        salary:4000,
        equity:"0",
        company_handle:'c2'
    }
    test('works',async()=>{
        let result = await Job.create(job);
        expect(result).toEqual(job);
        let data_job= await Job.get('test_job3');
        expect(data_job).toEqual(job);
    })
    test('duplicate job',async()=>{
        try{
            await Job.create(job)
            await Job.create(job)
            fail();
        }catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    })

})
describe('update',()=>{
    const updateData ={
        salary:500,
        equity:0.5,
    }
    test('works', async()=>{
        let results = await Job.update('test_job1',updateData)
        expect(results).toEqual({title:'test_job1',salary:500,equity:"0.5",company_handle:'c1'})

        let job = await Job.get('test_job1')
        expect(job).toEqual({title:'test_job1',salary:500,equity:"0.5",company_handle:'c1'})

    })
})
describe('.findall',()=>{
    test('works', async function(){
        let results = await Job.findAll();
        expect(results).toEqual( [{"company_handle": "c1", "equity": "0", "salary": 1000, "title": "test_job1", "id":expect.any(Number)},
         {"company_handle": "c2", "equity": "0", "salary": 1000, "title": "test_job2","id":expect.any(Number)}])
    })
})
describe('get',()=>{
    test('works', async function(){
        let results = await Job.get('test_job1')
        expect(results).toEqual({
            title: 'test_job1',
            salary:1000,
            equity:"0",
            company_handle: 'c1',
    })
    })
    test('not found error invalid title',async function(){
        try{
            await Job.get('not real')
        }catch(e){
            expect(e instanceof NotFoundError).toBeTruthy()
        }
    })
})