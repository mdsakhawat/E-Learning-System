const bcrypt = require("bcryptjs");
var multer = require('multer');
var bodyParser = require('body-parser');
const mkdirp = require('mkdirp');
const fs = require('fs');
const userModel = require("../../models/user-model");
const courseModel = require('../../models/course-model');
const headercategoryModel = require("../../models/headercategory-model");
const categoryModel = require("../../models/category-model");
const config = require("../../config/default.json");
const { countByDomain, countAllCourse } = require('../../models/course-model');



var path = require('path');


module.exports = {
    getHomePage: async(req, res) => {
        let sortBy = req.query.sortBy;
        let page = +req.query.page || 1;
        if (sortBy == "Unpublished first") { sortBy = "status desc"; } else {
            sortBy = "status asc";
        };

        if (page == 0) page = 1;
        let offset = (page - 1) * config.pagination.limit;
        if (!req.session.authUser) {
            console.log("go back guest home, run here")
            res.redirect("/")
        }
        const ID = req.session.authUser.IdUser;
        //console.log("sortby = ",sortBy,"offset = ",offset);
        let listOfCourses = await courseModel.coursePageByTeacherID(ID, sortBy, offset);
        const total = await courseModel.countCourseByTeacherID(ID);
        let nPages = Math.ceil(total / config.pagination.limit);
        let page_items = [];
        for (i = 1; i <= nPages; i++) {
            const item = {
                value: i,
            };
            page_items.push(item);
        }
        res.render("teacher/teacherhomepage", {
            layout: 'teacher',
            listOfCourses: listOfCourses,
            page_items: page_items,
            can_go_next: page < nPages,
            can_go_prev: page > 1,
            prev_value: page - 1,
            next_value: page + 1,
        });
    },
    getProfile: async(req, res) => {
        if (!req.session.authUser) {
            console.log("go back guest home, run here")
            res.redirect("/")
        } else {
            const teachProfile = await userModel.getTeachProfileById(req.session.authUser.IdUser);
            res.render("teacher/profile", {
                layout: 'teacher',
                user: req.session.authUser,
                Biography: teachProfile[0].Biography
            });
        }

    },
    getEditPassword: async(req, res) => {
        res.render("teacher/edit-password", {
            layout: 'teacher',
            user: req.session.authUser
        });
    },
    postEditPassword: async(req, res) => {
        if (
            req.body.CurrentPassword === "" ||
            req.body.NewPassword === "" ||
            req.body.RetypeNewPassword === ""
        ) {
            return res.render("teacher/edit-password", {
                layout: 'teacher',
                user: req.session.authUser,
                err_message: "Password can not be empty !",
            });
        }
        const hashNewPw = bcrypt.hashSync(req.body.NewPassword, 10);
        const compare = bcrypt.compareSync(
            req.body.CurrentPassword,
            req.session.authUser.password
        );
        if (compare === false) {
            return res.render("teacher/edit-password", {
                layout: 'teacher',
                user: req.session.authUser,
                err_message: "Your current password is incorrect.",
            });
        }
        if (req.body.NewPassword != req.body.RetypeNewPassword) {

            return res.render("teacher/edit-password", {
                layout: 'teacher',
                user: req.session.authUser,
                err_message: "Your new password does not match with confirmation.",
            });
        }
        if (req.body.NewPassword.length <6) {

            return res.render("teacher/edit-password", {
                layout: 'teacher',
                user: req.session.authUser,
                err_message: "Password length must be minimum 6 !.",
            });
        }
        
        const ret = await userModel.changePassword(
            req.session.authUser.UserName,
            hashNewPw
        );
        req.session.authUser = await userModel.singleByUserName(req.session.authUser.UserName);
        res.render("teacher/edit-password", {
            layout: 'teacher',
            user: req.session.authUser,
            err_message: "Your password was changed successfully !",
        });
    },
    postEditProfile: async(req, res) => {
        if (req.body.FullName === "") {
            return res.render("teacher/profile", {
                layout: 'teacher',
                err_message: "Full name can't be empty !",
                user: req.session.authUser,
            });
        }
        const ret = await userModel.editName(req.body.Username, req.body.FullName);
        const retBio = await userModel.editBio(req.body.IdUser, req.body.Biography);
        req.session.authUser = await userModel.singleByUserName(req.body.Username);
        res.render("teacher/profile", {
            layout: 'teacher',
            user: req.session.authUser,
            err_message: "Profile updated successfully !",
            Biography: req.body.Biography
        });
    },
    getAddCourse: async(req, res) => {
        const listOfCategory = await categoryModel.all();
        const listOfHeaderCategory = await headercategoryModel.all();
        res.render("teacher/course-add", {
            layout: 'teacher',
            user: req.session.authUser,
            listOfCategory: listOfCategory,
            listOfHeaderCategory: listOfHeaderCategory

        });
    },
    postAddCourse: async(req, res) => {
                   
            let date_ob = new Date();
            var day = ("0" + date_ob.getDate()).slice(-2);
            var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            var year = date_ob.getFullYear();
            
            var date = year + "-" + month + "-" + day;
            //console.log(date);
                
            var hours = date_ob.getHours();
            var minutes = date_ob.getMinutes();
            var seconds = date_ob.getSeconds();
            
            var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            //console.log(dateTime);
    

        const newcourse = {
            nameCourse: req.body.nameCourse,
            title: req.body.title,
            Description: req.body.Description,
            Price: req.body.Price,
            SaleCost: req.body.Price,
            IdCategory: req.body.category,
            avgRate: 0,
            IdInstructor: req.session.authUser.IdUser,
            createdTime: dateTime
        }
        console.log("new course",newcourse);
        const ret = await courseModel.addCourse(newcourse);
        const idNewCourse = await courseModel.getNewCourseByIDTeacher(newcourse.IdInstructor);
        res.redirect('/teacher/course/' + idNewCourse[0].IdCourse);
    },
    getDetailCourse: async(req, res) => {
        const IdCourse = req.params.id;
        const course = await courseModel.single(IdCourse);
        console.log("details of course ",course);
        const teacher = await userModel.singleTeacher(course.IdInstructor);
        if (course === null) {
            return res.redirect("/");
        }
        const isFinish = course.status == "finished" ? true : false;
        var date = new Date(course.updatedTime);
        //console.log("date ",date)
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var str = day + "/" + month + "/" + year;
        course.UpdatedTime = str;
        const listCourse = await courseModel.getCourseByIdCategory(course.IdCategory, IdCourse);
        const listRating = await courseModel.getListRating(IdCourse);
        let numberRating = 0;
        const getNumberRating = await courseModel.getNumberRatingsCourse(IdCourse);
        if (getNumberRating != null) {
            numberRating = getNumberRating.numberRating;
        }
        const getListLesson = await courseModel.getListLessonByCourseId(IdCourse);
        let listLesson = [];
        let listChapter = [];
        let flag = 0;
        for (let i = 0; i < getListLesson.length; i++) {
            for (let j = i; j < getListLesson.length; j++) {
                if (getListLesson[i].IdChapter === getListLesson[j].IdChapter) {
                    listLesson.push(getListLesson[j]);
                    flag = j;
                }
            }

            listChapter.push({
                NameChapter: getListLesson[i].NameChapter,
                IdDiv: "collapse" + getListLesson[i].idChapter,
                dataBsTarget: "#collapse" + getListLesson[i].idChapter,
                ListLesson: listLesson,
            });
            listLesson = [];
            i = flag;
        }

        console.log(teacher.Biography);
        
        res.render("teacher/course-Detail", {
            layout: 'teacher',
            course: course,
            teacher: teacher,
            listCourse: listCourse,
            listRating: listRating,
            isFinish: isFinish,
            numberRating: numberRating,
            listChapter: listChapter,
        });
    },
    getVideoLesson: async function(req, res) {
        const IdCourse = req.params.idCourse;
        const IdChapter = req.params.idChapter;
        const IdLesson = req.params.idLesson;

        const testFolder = `./public/video/IdChapter${IdChapter}/IdLesson${IdLesson}`;
       
        fs.readdir(testFolder, (err, files) => {
        
            const ext =path.extname(`/public/video/IdChapter${IdChapter}/IdLesson${IdLesson}/${files}`);

            console.log(`ext ===== ${ext}`); 
            if (ext ==`.pdf`) {
                console.log("pdf")
                res.render("teacher/pdf", {
                    layout: false,
                    IdChapter: IdChapter,
                    IdLesson: IdLesson,
                });
            }
            else{
                console.log("video")
                
                res.render("teacher/lesson-edit", {
                    layout: false,
                    IdChapter: IdChapter,
                    IdLesson: IdLesson,
                });
            }
        
        });
    
         
      
        
        

    },
    getEditCourse: async function(req, res) {
        const idCourse = req.params.id;
        const course = await courseModel.single(idCourse);
        const listOfCategory = await categoryModel.all();
        const listOfHeaderCategory = await headercategoryModel.all();
        res.render("teacher/course-edit", {
            layout: 'teacher',
            user: req.session.authUser,
            course: course,
            listOfCategory: listOfCategory,
            listOfHeaderCategory: listOfHeaderCategory
        });
    },
    postEditCourse: async function(req, res) {
      
   
       
        var date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        //console.log(date);
        var storage = multer.diskStorage({
            destination: function(req, file, cb) {
                let dir = './public/images/course/' + req.params.id;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                cb(null, dir)
            },
            filename: function(req, file, cb) {
                cb(null, 'thumb.jpg')
            }
        })
        var upload = multer({ storage: storage })
        upload.single('fuImage')(req, res, async function(err) {
            if (err) { console.log(err) } else {
                const edit = {
                    nameCourse: req.body.nameCourse,
                    IdCategory: req.body.category,
                    title: req.body.title,
                    Description: req.body.Description,
                    SaleCost: req.body.SaleCost,
                    status: req.body.status,
                    UpdatedTime: date,
                };
                //console.log("edited course : \n",edit)
                const IdCourse = req.body.IdCourse;
                await courseModel.updateCourse(IdCourse, edit);
                res.redirect("/teacher/course/" + IdCourse);
            }
        })
    },
    getUpload: async function(req, res) {
        const idCourse = req.params.id; //hidden
        const listChapter = await courseModel.getListChapterByCourseId(idCourse);
        const listLession = await courseModel.getListLessonByCourseId(idCourse);
        res.render("teacher/course-upload", {
            layout: 'teacher',
            user: req.session.authUser,
            idCourse: idCourse,
            listLession: listLession,
            listChapter: listChapter
        });
    },
    postUpload: async function(req, res) {
        const idCourse = req.params.id;
        let idChapter = req.query.idChapter;
        let idLesson = req.query.idLesson;
        let newChapter = req.query.newChapter;
        let newLesson = req.query.newLesson;
        if (idChapter == 'new') {
            await courseModel.addChapter({ NameChapter: newChapter, idCourse: idCourse });
            let Chapter = await courseModel.getChapterByCourse(idCourse);
            await courseModel.addLesson({ NameLesson: newLesson, Video: '', idChapter: Chapter[0].IdChapter });
            let Lesson = await courseModel.getLessonByChapter(Chapter[0].IdChapter);
            idChapter = Chapter[0].IdChapter;
            idLesson = Lesson[0].idLesson;
        } else {
            if (idLesson == 'new') {
                await courseModel.addLesson({ NameLesson: newLesson, Video: '', idChapter: idChapter });
                let Lesson = await courseModel.getLessonByChapter(idChapter);
                idLesson = Lesson[0].idLesson;
            }
        }
        const url = './public/video/IdChapter' + idChapter + '/IdLesson' + idLesson;
        const storage = multer.diskStorage({
            destination: function(req, file, cb) {
                const dir = url;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                cb(null, dir)
            },
            filename: function(req, file, cb) {
                cb(null, "video." + file.originalname.split(".")[1]);
            }
        });
        const upload = multer({ storage: storage });
        upload.single('fuVideo')(req, res, function(err) {
            if (err) {
               // console.log('Loi roi', err, req.query)
            } else {
                res.redirect('/teacher/course/upload/' + idCourse)
            }
        });
    },
};