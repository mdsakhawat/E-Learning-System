const bcrypt = require("bcryptjs");
const userModel = require("../models/user-model");
const nodemailer = require("nodemailer");
const wishlistModel = require("../models/wishlist-model");
const courseModel = require("../models/course-model");
const { nodeName } = require("jquery");

var transporter = nodemailer.createTransport(({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
    tls: { 
      rejectUnauthorized: false 
    }
  }));

module.exports = {
    getRegister: async(req, res) => {
        res.render("viewAccount/register",{
            layout: false,
        });
    },
    postRegister: async(req, res) => {

        const permission = req.body.permission;
        let biography = req.body.biography || "";
        const hash = bcrypt.hashSync(req.body.password, 10);
        const user = {
            FullName: req.body.fullName,
            Email: req.body.email,
            isInstructor: 0,
            Permission: "student",
            UserName: req.body.username,
            password: hash,
        };
        if (permission == "teacher") {
            user.biography = biography;
            user.Permission = "teacher";
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationObject = {
            email: req.body.email,
            otp: otp,
        };
        let nmb= await userModel.delVerifyCode(verificationObject);
        let xncb = await userModel.createVerifyCode(verificationObject);
    
        console.log("verify obj ",verificationObject);
        var mailOptions = {
            from: "E-Learning",
            to: req.body.email,
            subject: "Email verification",
            html: `<h3>Welcome To E-Learning</h3><div><h3>Your verification code is : ${otp}</h3>
            </div>`,
        };
      
        transporter.sendMail(mailOptions, function(error, info) {
                 console.log("Run in transporter");
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        res.redirect("/account/verify");
    },
    isAvailableAccount: async(req, res) => {
        const username = req.query.user;
        const user = await userModel.singleByUserName(username);
        if (user === null) {
            return res.json(true);
        }
        res.json(false);
    },
    isAvailableEmail: async(req, res) => {
        const email = req.query.email;
        console.log("Isavailable email : ",email);
        const user = await userModel.singleByEmail(email);
        if (user==null) {
            return res.json(true);
        }
        res.json(false);
    },
    getVerifyPage: async(req, res) => {
        console.log("email : ",req.body.email)
        res.render("viewAccount/otp-confirm",{
            layout:false,
        });
    },
    postVerifyAccount: async(req, res) => {

        //console.log(req.body.password);
        //console.log(req.body.code);
        const hash = bcrypt.hashSync(req.body.password, 10);
        //console.log("run here")
        const code = req.body.code;
        const Permission = req.body.permission;
        const email = req.body.email;
        let biography = req.body.biography;
        if (code == null) {
            res.sendStatus(404);
        }
        let user = {
            FullName: req.body.fullname,
            Email: req.body.email,
            isInstructor: 0,
            Permission: "student",
            UserName: req.body.username,
            password: hash,
        };
        
        console.log("User",user);

        if (Permission == "teacher") {
            user.Permission = "teacher";
            if (!biography) {
                biography = "";
                //console.log("permission: ", Permission, "biography:", biography);
            }
        }
        let isAvailableCode = await userModel.isAvailableCode(email);

        console.log("code from db ",isAvailableCode," code from web ",code);

        if ( isAvailableCode == null) {
            res.status(400).send();
        }
            else{
            if(isAvailableCode.otp==code){
            //console.log("Run here");
            await userModel.add(user);
            if (user.Permission == "teacher") {
                let idUser = await userModel.singleByUserName(user.UserName);
                const teachProfile = {
                    IdUser: idUser.IdUser,
                    Biography: biography,
                    status: "Processing",
                };
                await userModel.addTeachProfile(teachProfile);
            }
            res.status(200).send();
            return;
        }
        else
        {
            res.status(400).send();
        }
        }
      
        
    },
    getLogin: async(req, res) => {
        // console.log("run here ",req.headers.referer);
        if (req.headers.referer) {
           
            req.session.retUrl = req.headers.referer;
        }
        res.render("viewAccount/login", {
            layout: false,
        });
    },
    postLogin: async(req, res) => {
        const user = await userModel.singleByUserName(req.body.username);
       // console.log(user);
        //console.log(user)
        if (user === null) {
            return res.render("viewAccount/login", {
                err_message: "Invalid username !",
                layout:false
            });
        }
        const ret = bcrypt.compareSync(req.body.password, user.password);
        if (ret === false) {
            return res.render("viewAccount/login", {
                err_message: "Invalid password !",
                layout:false
            });
        }
        if(user.isInstructor==0 && user.Permission=='teacher')
        {
            return res.render("viewAccount/login", {
                err_message: "Your permission is not granted as Instructor, yet !",
                layout:false
            });
        }
        if(user.isBlocked==1 && user.Permission=='student')
        {
            return res.render("viewAccount/login", {
                err_message: "You are blocked by admin !",
                layout:false
            });
        }


        req.session.isAuth = true;
        req.session.authUser = user;
          //console.log(String(req.session.authUser.Permission));
        if (String(req.session.authUser.Permission) === "teacher") {
            res.redirect("/teacher");
        } else if (String(req.session.authUser.Permission) === "admin") {
           
            res.redirect("/admin");
        } else {
            let url = req.session.retUrl || "/";
            if (
                String(req.session.retUrl).indexOf("/account/register") != -1 ||
                String(req.session.retUrl).indexOf("/account/login") != -1
            ) {
                url = "/";
            }
            res.redirect(url);
        }
    },
    postLogout: async(req, res) => {
        let url = "/";
        // if (req.session.authUser.Permission != "student") {
        //     url = "/";
        // } else {
        //     url = req.headers.referer;
        // }
        req.session.isAuth = false;
        req.session.authUser = null;
        req.session.cart = [];

        res.redirect(url);
    },
    getForgotpassword: async(req,res)=>{
        res.render("viewAccount/forgot-password",{
            layout:false,
        });
    },
    postForgotpassword: async(req,res)=>{
        console.log("Email : ",req.body.email);
        const Email = req.body.email;
        const user = await userModel.singleByEmail(Email);
        console.log(user);
        if(user == null)
        {
            console.log("Run here !");
            return res.render("viewAccount/forgot-password", {
                err_message: "You are not registered , please register first !",
                layout:false
            });
        }
        else{
            const pass = Math.floor(100000 + Math.random() * 900000).toString();
            const hash = bcrypt.hashSync(pass, 10);
            const ret = await userModel.updatePassword(
                Email,
                hash
            );
            var mailOptions = {
                from: "E-Learning",
                to: Email,
                subject: "Forgot Password",
                html: `<h1>Your E-Learning new password is : ${pass}</h1>`           
            };
               transporter.sendMail(mailOptions, function(error, info) {
                        console.log("Run in transporter");
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
            return res.render("viewAccount/forgot-password", {
                err_message: "New password was sent to your email !",
                layout:false
            });

            
        }
    },
    getListCourse: async function(req, res) {
        const listCourse = await courseModel.getListCourseByIdUser(
            req.session.authUser.IdUser
        );
       
        res.render("viewAccount/list-course", {
            user: req.session.authUser,
            listCourse: listCourse,
            empty: listCourse.length === 0,
        });
    },
    getProfile: async(req, res) => {
        res.render("viewAccount/profile", { user: req.session.authUser });
    },
    getEditPassword: async(req, res) => {
        res.render("viewAccount/edit-password", { user: req.session.authUser });
    },
    postEditProfile: async(req, res) => {
        if (req.body.FullName === "") {
            return res.render("viewAccount/profile", {
                err_message: "Invalid full name data.",
                user: req.session.authUser,
            });
        }
        const ret = await userModel.editName(req.body.Username, req.body.FullName);
        req.session.authUser = await userModel.singleByUserName(req.body.Username);
        res.render("viewAccount/profile", { user: req.session.authUser });
    },

    postEditPassword: async(req, res) => {
        
        if (
            req.body.CurrentPassword === "" ||
            req.body.NewPassword === "" ||
            req.body.RetypeNewPassword === ""
        ) {
            return res.render("viewAccount/edit-password", {
                err_message: "Invalid password data.",
            });
        }
        const hashNewPw = bcrypt.hashSync(req.body.NewPassword, 10);
        const compare = bcrypt.compareSync(
            req.body.CurrentPassword,
            req.session.authUser.password
        );
        if (compare === false) {
            return res.render("viewAccount/edit-password", {
                err_message: "Your password was incorrect.",
            });
        }
        if (req.body.NewPassword != req.body.RetypeNewPassword) {
            return res.render("viewAccount/edit-password", {
                err_message: "Your new password does not match confirmation.",
            });
        }
        const ret = await userModel.changePassword(
            req.session.authUser.UserName,
            hashNewPw
        );
        req.session.authUser = await userModel.singleByUserName(req.session.authUser.UserName);
        console.log('before', req.session)
        res.render("viewAccount/edit-password", { user: req.session.authUser });
    },


    getListWishList: async function(req, res) {
        const wishlist = await wishlistModel.getWishListByIdUser(
            req.session.authUser.IdUser
        );
        res.render("viewAccount/wishlist", {
            user: req.session.authUser,
            wishlist: wishlist,
            empty: wishlist.length === 0,
        });
    },
};



