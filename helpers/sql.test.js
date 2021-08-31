const {sqlForPartialUpdate}=require('./sql')



describe('Sql formatter',()=>{
    let data,change;
    beforeEach(function(){
        data={
            name:'jerry',
            age:17,
            familyMembers:7,
            hobby:'art'
        }
        change={familyMembers:'family_members'}
    })
    test('basic function works',()=>{
        let result = sqlForPartialUpdate(data,change)
        expect(result).toEqual({
            setCols:'"name"=$1, "age"=$2, "family_members"=$3, "hobby"=$4',
            values:['jerry',17,7,'art']
        })
    })
})