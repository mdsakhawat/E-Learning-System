const db = require("../utils/db");
const config = require('../config/default.json');
const TBL_USERS = "user_profile";
const TBL_VERIFICATION = "verification";
const TBL_Teach_profile = "Instructor_profile";
const TBL_ENROLLED_COURSE = "enrolledcourse";
module.exports = {
    all() {
        return db.load(`select * from ${TBL_USERS}`);
    },
    async single(id) {
        const rows = await db.load(`select * from ${TBL_USERS} where IdUser = ${id}`);
        if (rows.length === 0) return null;
        return rows[0];
    },
    async singleByUserName(username) {
        let rows =[];
        rows= await db.load(
            `select * from ${TBL_USERS} where UserName = '${username}'`
        );
        if (rows.length === 0) return null;
        else
        return rows[0];
    },
    async singleByEmail(email) {
        const rows = await db.load(
            `select * from ${TBL_USERS} where Email = '${email}'`
        );
        if (rows.length === 0) return null;
        return rows[0];
    },
           add(entity) {
        return db.add(entity, TBL_USERS);
    },
         editName(Username, fullName) {
        const condition = { Username: Username };
        const entity = { FullName: fullName };
        return db.patch(entity, condition, TBL_USERS);
    },
         changePassword(Username, NewPassword) {
        const condition = { Username: Username };
        const entity = { password: NewPassword };
        // var sql = `UPDATE ${TBL_USERS} SET FullName = '${fullName}' WHERE UserName = '${Username}'`
        return db.patch(entity, condition, TBL_USERS);
    },
         updatePassword(email, NewPassword) {
        const condition = { Email: email };
        const entity = { password: NewPassword };
        return db.patch(entity, condition, TBL_USERS);
    },
    
    async createVerifyCode(entity) {
      let  condition={
        email: entity.email,
        }
        //db.del(condition,TBL_VERIFICATION);
        return db.add(entity, TBL_VERIFICATION);
    },
    delVerifyCode(entity) {
        let  condition={
          email: entity.email,
          }
          return db.del(condition,TBL_VERIFICATION);
         
      },
    async isAvailableCode(email) {
        let rows = await db.load(`select * from verification where email = '${email}'`);
      
        return rows[0];
    },
    async getAllTeacher() {
        return await db.load(`select * from ${TBL_USERS} where isTeacher = 1`);
    },
    changeTeacherAvailability(UserId,Isteacher,Isblocked)
    {
        const condition = { IdUser : UserId };
        const entity = {  isInstructor : Isteacher,
                          isBlocked: Isblocked,
                         };
        return db.patch(entity, condition, TBL_USERS);
    },
    async pageByAllTeacher(offset) {
        return await db.load(`select * from ${TBL_USERS} 
    left join instructor_profile
    on user_profile.IdUser = instructor_profile.IdUser
    where instructor_profile.status != "Processing"
    limit ${config.pagination.limit} offset ${offset}`);
    },
    async countAllTeacher() {
        let rows = await db.load(`select count(*) as total from ${TBL_USERS} 
    where isInstructor = 1`);
        return rows[0].total;
    },
    async blockTeacher(id) {
        const condition = { IdUser: id };
        const entity = { status: "Block" };
        return await db.patch(entity, condition,TBL_Teach_profile);
    },
    async unblockTeacher(id) {
        const condition = { IdUser: id };
        const entity = { status: "Accept" };
        return await db.patch(entity, condition, TBL_Teach_profile);
    },
    async getPendingTeacher() {
        return await db.load(`select * from ${TBL_USERS} 
    left join instructor_profile
    on user_profile.IdUser = instructor_profile.IdUser
    where user_profile.isInstructor = 0 and instructor_profile.status = "Processing"`);
    },
    async approvePendingTeacher(id) {
        const condition = { IdUser: id };
        const entity = { status: "Accept" };
        const isTeacher = { isInstructor: 1, Permission: "teacher" };
        await db.patch(entity, condition, TBL_Teach_profile);
        return await db.patch(isTeacher, condition, TBL_USERS);
    },
    async singleTeacher(id) {
        const rows = await db.load(`select * from ${TBL_USERS}
    left join instructor_profile
    on user_profile.IdUser = instructor_profile.IdUser
    where user_profile.IdUser = ${id}`);
        if (rows.length === 0) return null;
        return rows[0];
    },
    async declinePendingTeacher(id) {
        const condition = { IdUser: id };
        await db.del(condition, TBL_Teach_profile);
    },
     addTeachProfile(entity) {
        return db.add(entity, TBL_Teach_profile);
    },
    async getTeachProfileById(id) {
        return await db.load(`select * from ${TBL_Teach_profile} where IdUser= ${id}`);
    },
          editBio(IdUser, Biography) {
        const condition = { IdUser: IdUser };
        const entity = { Biography: Biography };
        return db.patch(entity, condition, TBL_Teach_profile);
    },
    async allUser() {
        return db.load(`select * from ${TBL_USERS} where isInstructor != 1 and UserName != 'admin'`);
    },
    async pageByAllUser(offset) {
        return await db.load(`select * from ${TBL_USERS} 
    where Permission = 'student'
    limit ${config.pagination.limit} offset ${offset}`);
    },
    async countAllUser() {
        let rows = await db.load(`select count(*) as total from ${TBL_USERS} 
    where isInstructor != 1 and UserName != 'admin'`);
        return rows[0].total;
    },
    async countCoursesOfUser(userId) {
        let rows = await db.load(`SELECT count(*) as total FROM ${TBL_ENROLLED_COURSE}
    where IDUser = ${userId}`);
        return rows[0].total;
    },
    async getAdminProfile() {
        let rows = await db.load(`select* from ${TBL_USERS} where UserName='admin'`);
        return rows[0];
    },
    async blockStudent(id) {
        const condition = { IdUser: id };
        const entity = { isBlocked: true };
        return await db.patch(entity, condition,TBL_USERS);
    },
    async unblockStudent(id) {
        const condition = { IdUser: id };
        const entity = { isBlocked: false };
        return await db.patch(entity, condition,TBL_USERS);
    }
};