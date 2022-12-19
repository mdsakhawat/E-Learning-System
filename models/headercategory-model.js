const db = require('../utils/db');

const TBL_USERS = 'headercategory';
const TBL_USERS_2 = 'message_list';

module.exports = {
    all() {
        return db.load(`select * from ${TBL_USERS} where isDeleted = false`);
    },
    all2() {
        return db.load(`select * from ${TBL_USERS_2}`);
    },
    async simpleSearch(text) {
        return await db.load(`select * from ${TBL_USERS} where HeaderNameCategory= '${text}' and isDeleted = false`);
    },
    async getById(id) {
        let rows =  await db.load(`select * from ${TBL_USERS} where Id = ${id}`);
        return rows[0];
    },
    async updateHeaderCategoryById(id, headerCategory) {
        const condition = {Id: id}; 
        const entity = headerCategory;
        return await db.patch(entity, condition, TBL_USERS);
    },
    async deleteHeaderCategory(id) {
        const condition = {Id: id}; 
        const entity = {isDeleted: true}
        return await db.patch(entity, condition,TBL_USERS);
    },
    async addNewHeaderCategory(newHeaderCategory) {
        return db.add(newHeaderCategory, TBL_USERS);
    },
    async deleteMessage(id) {
        const condition = {id: id}; 
      
        return db.del(condition,TBL_USERS_2);
    },
    async getmessageByEmail(id) {
        let rows =  await db.load(`select * from ${TBL_USERS_2} where id = ${id} `);
        return rows[0];
    },

}