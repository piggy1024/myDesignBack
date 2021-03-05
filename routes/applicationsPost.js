var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var PostStatus = require('./applicationPostStatusSchema');
var PostApplication = require('./applicationPostSchema');

router.get('/', function (req, res, next) {
    ejs.renderFile('../views/index.ejs', {}, (err, data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html;charset="utf-8'
        });
        res.end(data)
    })
});


// 根据学生id查询申请进度列表
router.get('/applyPostProcess', function (req, res, next) {
    // 子表关联主表查询， populate里面为子表外键
    PostStatus.find({
        stu_status_id: req.query.user_id
    }).populate('app_id').exec(function (err, docs) {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs.reverse()
        });
    })

});

// 未审批列表
router.get('/auditPostList', function (req, res, next) {
    // 根据不同部门的人筛选出不同部门未审批的申请
    if (req.query.apartment === "部门") {
        PostStatus.find({
            department_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "宣传部") {
        PostStatus.find({
            propagandaDepartment_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            docs = docs.filter(item => {
                if (item.department_status !== '1') {
                    return false
                }
                return true

            })
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    }
});

// 已审批列表
router.get('/auditedPostList', function (req, res, next) {

    // 根据不同部门的人筛选出不同部门已审批的申请
    if (req.query.apartment === "部门") {
        PostStatus.$where('this.department_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "宣传部") {
        PostStatus.$where('this.propagandaDepartment_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    }
});

//  增加申请
router.post('/addPost', function (req, res, next) {
    // console.log(req.query);
    var isConflict = false;
    PostApplication.find({
        "app_end_time": {
            "$gt": new Date()
        }
    }, (err, docs) => {
        if (err) {
            console.log(err);
        }
        docs.forEach(item => {
            if (validTime(item.app_start_time, item.app_end_time, new Date(req.query.app_start_time), new Date(req.query.app_end_time))) {
                console.log(item.app_start_time, item.app_end_time, new Date(req.query.app_start_time), new Date(req.query.app_end_time));
                console.log("不冲突!");
            } else {
                isConflict = true
                console.log("冲突!");
            }

        })
        if (isConflict) {
            // 如果冲突
            res.send({
                code: 10000,
                message: '时间冲突添加失败!'
            })
        } else {
            // 如果不冲突
            PostApplication.create(req.query, (err, docs) => {
                if (err) {
                    console.log(err);
                }
                // 增加一个申请上来 要对应增加该申请的各部门审批状态（各部门状态是独立的collection）
                PostStatus.create({
                    app_id: docs._id,
                    department_reason: '',
                    propagandaDepartment_reason: '',
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
        }
    })
    // 判断两个时间段是否冲突的js方法
    function validTime(a, b, x, y) {
        if (y <= a || b <= x) {
            // console.log("true不");
            // 不冲突返回true
            return true
        } else {
            // console.log("false冲突");
            // 冲突返回false
            return false
        }
    }
})

// 取消申请
router.post('/deletePostApply', function (req, res, next) {
    // 取消一个申请要分别删除申请表和状态表的文档
    PostApplication.deleteOne({
            '_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            // console.log(docs);
        }
    )
    PostStatus.deleteOne({
            'app_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            // console.log(docs);
        }
    )
    res.send({
        code: 20000,
        msg: '取消成功!'
    })
})

// 审批通过
router.post('/resolvePostApply', function (req, res, next) {
    // 部门审批 宣传部审批
    if (req.query.apartment === '部门') {
        PostApplication.updateOne({
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
            PostStatus.updateOne({
                "app_id": req.query._id
            }, {
                "department_reason": req.query.reason,
                "department_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "宣传部") {
        PostApplication.updateOne({
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
            PostStatus.updateOne({
                "app_id": req.query._id
            }, {
                "propagandaDepartment_reason": req.query.reason,
                "propagandaDepartment_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    }
})

// 审批驳回
router.post('/rejectPostApply', function (req, res, next) {
    // 部门审批 宣传部审批
    if (req.query.apartment === '部门') {
        PostApplication.updateOne({
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
            PostStatus.updateOne({
                "app_id": req.query._id
            }, {
                "department_reason": req.query.reason,
                "department_status": "2" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "宣传部") {
        PostApplication.updateOne({
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
            PostStatus.updateOne({
                "app_id": req.query._id
            }, {
                "propagandaDepartment_reason": req.query.reason,
                "propagandaDepartment_status": "2" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    }
})

// 撤回审批
router.post('/withdrawPostApply', function (req, res, next) {
    // 无论哪个部门撤回审批后,审批结果都是 审批中
    PostApplication.updateOne({
        "_id": req.query._id
    }, {
        "app_passTime": new Date(),
        "reason": "暂时撤回审批",
        "status": 0
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }

    })

    if (req.query.apartment === '部门') {
        PostStatus.updateOne({
            "app_id": req.query._id
        }, {
            "department_reason": "",
            "department_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    } else if (req.query.apartment === "宣传部") {
        PostStatus.updateOne({
            "app_id": req.query._id
        }, {
            "propagandaDepartment_reason": "",
            "propagandaDepartment_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    }
})

module.exports = router;