const resultOutput = require('../utils/Utils')['resultOutput']
const {CRMUSERSGROUPS, CRMUSERS} = require('../models');

const crm = {
    addUserGroup: async function (payload) {
        const {groupname, groupid, status} = payload;
        try {
            if (!groupname)
                throw new Error('Field groupname is required.');
            if (!groupid)
                throw new Error('Field groupid is required.');
            if (!status)
                throw new Error('Field status is required.');
                
            let usersgroup = new CRMUSERSGROUPS();
            usersgroup.groupname = groupname;
            usersgroup.groupid = groupid;
            usersgroup.status = status;

            const test = await usersgroup.save(true)

            if (test) {
                console.log(true)
            } else {
                console.log(false)
            }
        } catch (error) {
            return resultOutput.resultOutputError(error.message);
        }
        return resultOutput.resultOutputSuccess('ok');
    }, 
    deleteUserGroup: function () {},
    findUserGroup: function () {},
    allUserGroup: async function () {
      
        var queryres = await CRMUSERSGROUPS.find({});
        var result = [];
        queryres.forEach(element => {
            result.push({
                id:element.id,
                groupid:element.groupid,
                groupname:element.groupname,
                status:element.status
            });
        });

        return resultOutput.resultOutputDataOk({allUserGroup: result});

        
        
    },
    addUser: function () {},
    deleteUser: function () {},
    findUser: function () {},
    listAllUsers: function () {}
}

module.exports = crm