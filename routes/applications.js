var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var Status = require('./applicationStatusSchema');
var Application = require('./applicationSchema');

router.get('/', function (req, res, next) {
    ejs.renderFile('../views/index.ejs', {}, (err, data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html;charset="utf-8'
        });
        res.end(data)
    })
});


// 根据学生id查询申请进度列表
router.get('/applyProcess', function (req, res, next) {
    // Application.find({
    //     "stu_id": req.query.user_id
    // }).populate('_id').exec(function (err, docs) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: docs
    //     });
    // })

    //子表关联主表查询，populate里面为子表外键
    Status.find({
        stu_status_id: '17251106123'
    }).populate('app_id').exec(function (err, docs) {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs
        });
    })

});

// 未审批列表
router.get('/auditList', function (req, res, next) {
    Application.find({
        "status": 0
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



    // Application.aggregate([{
    //     $match: {
    //         "stu_id": '17251106123'
    //     }
    // }, {
    //     $lookup: {
    //         from: 'applications_status',
    //         localField: '_id',
    //         foreignField: 'app_id',
    //         as: 'itemCollect'
    //     }
    // }], (err, doc) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: doc
    //     });
    // })

});

// 已审批列表
router.get('/auditedList', function (req, res, next) {

    // 0是未审批  1是审批通过  2是审批驳回
    Application.$where('this.status !== 0').exec((err, docs) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs
        });
    })

});

//  增加申请
router.post('/add', function (req, res, next) {
    Application.create(req.query, (err, docs) => {
        if (err) {
            console.log(err);
        }
        // 增加一个申请上来 要对应增加该申请的各部门审批状态（各部门状态是独立的collection）
        Status.create({
            app_id: docs._id,
            department_reason: '',
            logistics_reason: '',
            school_dean_reason: '',
            technology_center_reason: '',
            stu_status_id: req.query.stu_id
        }, (err, docs) => {
            if (err) {
                console.log(err);
            }
        })
    })
    res.send({
        code: 20000,
        msg: '添加成功!'
    })
})

// 取消申请
router.post('/deleteApply', function (req, res, next) {
    // 取消一个申请要分别删除申请表和状态表的文档
    Application.deleteOne({
            '_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        }
    )
    Status.deleteOne({
            'app_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        }
    )
    res.send({
        code: 20000,
        msg: '取消成功!'
    })
})

// 审批通过
router.post('/resolveApply', function (req, res, next) {
    console.log("resolveApply" + res.query);
    Application.updateOne({
        "_id": req.query._id
    }, {
        "reason": req.query.reason,
        "app_passTime": req.query.app_passTime,
        "status": 1
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
        "app_passTime": req.query.app_passTime,
        "status": 2
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
        "reason": "",
        "app_passTime": "",
        "status": 0
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