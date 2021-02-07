var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var ejs = require('ejs');


// 建立数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/applySystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("数据库连接成功");

});

//  定义一个schema  对象的字段应该与数据库表一一对应
var ApplicationSchema = mongoose.Schema({
    app_theme: String, // 主题
    // stu_id : String,  // 申请人id
    app_phone: String, // 申请人电话
    app_type: String, // 申请活动类型
    app_roomType: { // 申请教室类型
        type: Boolean,
        default: false
    },
    applicant: String, // 申请单位
    app_size: String, // 申请教室大小
    app_start_time: Date, // 申请开始使用时间
    app_end_time: Date, // 申请结束使用时间
    app_content: String, // 活动内容
    app_passTime: Date, // 申请通过时间
    status: { // 通过状态
        type: Boolean,
        default: false
    },
    c_id: String, // 教室id
    reason: String // 审批理由
})

// 定义数据库模型 来操作数据库
var Application = mongoose.model('Application', ApplicationSchema);


router.get('/', function (req, res, next) {
    ejs.renderFile('../views/index.ejs', {}, (err, data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html;charset="utf-8'
        });
        res.end(data)
    })
    // res.send('respond with a resource! Application');
});

// 未审批列表
router.get('/auditList', function (req, res, next) {
    Application.find({
        "status": false
    }, async (err, doc) => {
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

// 已审批列表
router.get('/auditedList', function (req, res, next) {
    Application.find({
        "status": true
    }, async (err, doc) => {
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

//  增加申请
router.post('/add', function (req, res, next) {
    Application.create(req.query, err => {
        console.log(err);
    })
    res.send({
        code: 20000,
        msg: '添加成功!'
    })
})

// 审批通过
router.post('/resolveApply', function (req, res, next) {
    console.log("resolveApply" + res.query);
    Application.updateOne({
        "_id": req.query._id
    }, {
        "reason": req.query.reason,
        "status": "true"
    }, (err, response) => {
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
})

// 审批驳回
router.post('/rejectApply', function (req, res, next) {
    Application.updateOne({
        "_id": req.query._id
    }, {
        "reason": req.query.reason,
        "status": "true"
    }, (err, response) => {
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
})

// 撤回审批
router.post('/withdrawApply', function (req, res, next) {
    Application.updateOne({
        "_id": req.query._id
    }, {
        "reason": req.query.reason,
        "status": "false"
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(response);
        res.send({
            code: 20000,
            data: {
                msg: '撤回成功!'
            }
        })
    })
})

module.exports = router;