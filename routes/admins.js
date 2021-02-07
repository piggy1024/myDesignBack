var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Admin = require('./adminsSchema');


// // 建立数据库连接
// mongoose.connect('mongodb://127.0.0.1:27017/applySystem', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, (err) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log("数据库连接成功");

// });

// //  定义一个schema  对象的字段应该与数据库表一一对应
// var AdminsSchema = mongoose.Schema({
//     apartment: String,
//     admin_email: String,
//     admin_name: String,
//     admin_phone: String,
//     admin_number: String,
//     admin_password: {
//         type: String,
//         default: '123456'
//     }
// })

// // 定义数据库模型 来操作数据库
// var Admin = mongoose.model('Admin', AdminsSchema);


router.get('/', function (req, res, next) {
    res.send('respond with a resource! Admin!');
});

// 列表
router.get('/list', function (req, res, next) {
    Admin.find({}, async (err, doc) => {
        if (err) {
            console.log(err);
            return;
        }

        res.send({
            code: 20000,
            data: doc
        });
    })

});

// 查找账号
router.post('/findAccount', function (req, res, next) {
    Admin.findById({
        '_id': req.query.id
    }, (err, docs) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs
        })
    })

})

// 增加账号 或者 编辑账号
router.post('/addAccount', function (req, res, next) {
    // req.query 请求传过的对象
    // 操作数据库admins集合新增一条数据或修改一条数据


    // 若传过的id为空,则新增
    if (!req.query._id) {
        // 删掉属性_id才能新增成功
        delete req.query._id
        Admin.create(req.query, err => {
            console.log(err);
        })
        res.send({
            code: 20000,
            msg: '新增成功!'
        })
    } else {
        // 带id过来就修改
        Admin.updateOne({
            '_id': req.query._id
        }, req.query, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(response);
            res.send({
                code: 20000,
                data: {
                    msg: '编辑修改成功!'
                }
            })
        })
    }

})


// 删除账号
router.post('/deleteAccount', function (req, res, next) {
    // 操作数据库删除操作
    Admin.deleteOne({
            '_id': req.query.id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        })
    res.send({
        code: 20000,
        msg: '删除成功!'
    })
})



// 重置密码或者修改密码
router.post('/resetAdminPassword', function (req, res, next) {

    // 请求传入{id: id}  或者 {id: id, admin_new_password}
    Admin.updateOne({
        '_id': req.query.id
    }, {
        'admin_password': req.query.admin_new_password || '123456'
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(response);
        res.send({
            code: 20000,
            data: {
                msg: '重置密码成功!'
            }
        })
    })

})
module.exports = router;