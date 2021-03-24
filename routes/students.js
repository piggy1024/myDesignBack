var express = require('express');
var router = express.Router();
var Student = require('./studentsSchema');


router.get('/', function (req, res, next) {
    res.send('respond with a resource! students!');
});

// 学生列表
router.get('/list', function (req, res, next) {
    Student.find({}, async (err, doc) => {
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

// 用stu_number查找学生信息
router.post('/getStudentInfo', function (req, res, next) {
    Student.find({
        'stu_number': req.query.id
    }, (err, docs) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs[0]
        })
    })

})

// 查找账号
router.post('/findAccount', function (req, res, next) {
    Student.findById({
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
    // 操作数据库Students集合新增一条数据或修改一条数据


    // 若传过的id为空,则新增
    if (!req.query._id) {
        // 删掉属性_id才能新增成功
        delete req.query._id
        Student.create(req.query, err => {
            console.log(err);
        })
        res.send({
            code: 20000,
            msg: '新增成功!'
        })
    } else {
        // 带id过来就修改
        Student.updateOne({
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
    Student.deleteOne({
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
router.post('/resetStudentPassword', function (req, res, next) {

    // 请求传入{id: id}  或者 {id: id, student_new_password}
    Student.updateOne({
        '_id': req.query.id
    }, {
        'stu_password': req.query.stu_new_password || '123456'
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